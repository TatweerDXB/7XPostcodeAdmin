/**
 * 7X Cloud Services Keep-Warm Daemon
 * 
 * Render Free Tier services spin down after 15 minutes of inactivity.
 * When spun down, cold starts take 30-60 seconds, returning 502 Bad Gateway.
 * 
 * This script:
 * 1. Pings all 3 backend services.
 * 2. If any return 502, polls every 10s until they are fully awake.
 * 3. Keeps them warm every 8 minutes (before the 15-minute Render sleep threshold).
 * 
 * Usage:
 *   node scripts/keep-warm.mjs          # Runs continuously as a daemon
 *   node scripts/keep-warm.mjs --once   # Wakes up services and exits
 */

const SERVICES = [
  {
    name: "API Gateway (Grid Health)",
    url: "https://epg-post-dev-gateway.onrender.com/health/grid",
  },
  {
    name: "Identity / Auth Service",
    url: "https://identity-service-qh42.onrender.com/api/auth/me",
  },
  {
    name: "Postcode Grid Microservice",
    url: "https://epg-post-dev-postcodegrid.onrender.com/health",
  },
];

const PING_INTERVAL_MS = 8 * 60 * 1000; // 8 minutes (Render sleeps at 15m)
const RETRY_502_INTERVAL_MS = 10 * 1000; // 10 seconds while waking up
const REQUEST_TIMEOUT_MS = 30 * 1000; // 30 seconds

const isOnce = process.argv.includes("--once");

function log(msg) {
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  console.log(`[${time}] ${msg}`);
}

async function pingUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "7X-KeepWarm-Daemon/1.0",
      },
    });
    clearTimeout(timeout);
    return res.status;
  } catch (err) {
    if (err.name === "AbortError") {
      return 504; // Gateway Timeout
    }
    return 500;
  }
}

async function wakeServices() {
  log("Checking status of backend services on Render...");
  let allAwake = false;
  let attempt = 1;

  while (!allAwake) {
    const results = await Promise.all(
      SERVICES.map(async (svc) => {
        const code = await pingUrl(svc.url);
        return { ...svc, code };
      })
    );

    const has502 = results.some((r) => r.code === 502 || r.code === 504);
    
    // Status report
    results.forEach((r) => {
      const isOk = r.code !== 502 && r.code !== 504;
      const statusLabel = isOk
        ? `\x1b[32m${r.code} OK\x1b[0m`
        : `\x1b[33m${r.code} WAKING UP\x1b[0m`;
      log(`  ${r.name}: ${statusLabel} (${r.url})`);
    });

    if (has502) {
      log(`[Attempt ${attempt}] Services are waking up from sleep. Waiting 10s...`);
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, RETRY_502_INTERVAL_MS));
    } else {
      allAwake = true;
      log("\x1b[32m✔ All 3 backend services are active and ready!\x1b[0m");
    }
  }
}

async function run() {
  console.log("==================================================");
  console.log("  7X Backend Services Keep-Warm Daemon");
  console.log("  Target: Render Cloud Microservices");
  console.log("==================================================");

  await wakeServices();

  if (isOnce) {
    log("Single warmup pass complete. Exiting.");
    process.exit(0);
  }

  log(`Keep-warm active. Pinging every ${PING_INTERVAL_MS / 60000} minutes to prevent sleep.`);
  setInterval(async () => {
    log("Sending keep-alive ping to Render services...");
    await wakeServices();
  }, PING_INTERVAL_MS);
}

run().catch((err) => {
  console.error("Keep-warm daemon encountered an error:", err);
  process.exit(1);
});

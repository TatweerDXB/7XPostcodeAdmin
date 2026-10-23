import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Auth endpoints route to Identity Service
    const authTarget =
      process.env.AUTH_API_TARGET ||
      process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
      "https://identity-service-qh42.onrender.com";

    // All other endpoints route to EPG Post Dev Gateway
    const defaultTarget =
      process.env.API_PROXY_TARGET ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://epg-post-dev-gateway.onrender.com";

    const cleanAuthTarget = authTarget.replace(/\/+$/, "");
    const cleanDefaultTarget = defaultTarget.replace(/\/+$/, "");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${cleanAuthTarget}/api/auth/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${cleanDefaultTarget}/api/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${cleanDefaultTarget}/health/:path*`,
      },
    ];
  },
};

export default nextConfig;

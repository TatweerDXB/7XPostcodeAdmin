"use client";

import React, { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { warmupBackendServices } from "@/services/apiClient";

export default function KeepWarmListener() {
  const [wakingInfo, setWakingInfo] = useState<{
    attempt: number;
    maxAttempts: number;
  } | null>(null);
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    warmupBackendServices().catch(() => null);

    const keepWarmInterval = setInterval(() => {
      warmupBackendServices().catch(() => null);
    }, 8 * 60 * 1000);

    const handleWaking = (e: Event) => {
      const customEvent = e as CustomEvent<{ attempt: number; maxAttempts: number }>;
      setWakingInfo(customEvent.detail || { attempt: 1, maxAttempts: 8 });
      setShowReady(false);
    };

    const handleReady = () => {
      setWakingInfo(null);
      setShowReady(true);
      const timer = setTimeout(() => setShowReady(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleFailed = () => {
      setWakingInfo(null);
    };

    window.addEventListener("render-service-waking", handleWaking);
    window.addEventListener("render-service-ready", handleReady);
    window.addEventListener("render-service-failed", handleFailed);

    return () => {
      clearInterval(keepWarmInterval);
      window.removeEventListener("render-service-waking", handleWaking);
      window.removeEventListener("render-service-ready", handleReady);
      window.removeEventListener("render-service-failed", handleFailed);
    };
  }, []);

  return (
    <>

      <Snackbar
        open={Boolean(wakingInfo)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="info"
          icon={<CircularProgress size={18} sx={{ color: "#1B8CFE" }} />}
          sx={{
            bgcolor: "#0B1528",
            color: "#FFFFFF",
            border: "1px solid rgba(27, 140, 254, 0.4)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            borderRadius: 2,
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
              Backend services waking up...
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block" }}>
              Render free tier container is starting. Auto-retrying (Attempt {wakingInfo?.attempt || 1}/{wakingInfo?.maxAttempts || 8}).
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      <Snackbar
        open={showReady}
        autoHideDuration={3500}
        onClose={() => setShowReady(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          sx={{
            bgcolor: "#062817",
            color: "#4ADE80",
            border: "1px solid rgba(74, 222, 128, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Cloud services connected and ready!
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}

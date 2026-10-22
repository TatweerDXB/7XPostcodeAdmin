"use client";

import React from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const HeatmapView = dynamic(() => import("@/components/heatmap/HeatmapView"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 400,
      }}
    >
      <CircularProgress size={36} sx={{ color: "#0000FF" }} />
    </Box>
  ),
});

export default function HeatmapPage() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        bgcolor: "#F9FBFD",
      }}
    >
      <HeatmapView />
    </Box>
  );
}

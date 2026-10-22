"use client";

import React from "react";
import Box from "@mui/material/Box";
import GoogleMapView from "@/components/map/GoogleMapView";

export default function SearchConsolePage() {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      <GoogleMapView />
    </Box>
  );
}

"use client";

import React from "react";
import Box from "@mui/material/Box";
import GoogleMapViewV2 from "@/components/map/GoogleMapViewV2";

export default function SearchV2Page() {
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      <GoogleMapViewV2 />
    </Box>
  );
}

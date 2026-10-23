"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import PostcodeMiniMap from "@/components/map/PostcodeMiniMap";
import { GridMatrixCell } from "@/data/gridMatrixCells";
import { SAMPLE_POSTCODES_ON_GRID, GridAddressItem } from "@/data/gridEngineData";

interface GridCellInspectorCardProps {
  cell: GridMatrixCell;
  activeTier: 1 | 2 | 3 | 4;
  onExpandMap?: () => void;
}

export default function GridCellInspectorCard({
  cell,
  activeTier,
  onExpandMap,
}: GridCellInspectorCardProps) {
  const [isPostcodesOpen, setIsPostcodesOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [addressTab, setAddressTab] = useState("all");

  const addressFilterTabs = [
    { id: "all", label: "All" },
    { id: "buildings", label: "Buildings" },
    { id: "units", label: "Units" },
    { id: "recipients", label: "Individual Recipients" },
    { id: "makani", label: "Makani/Onwani" },
  ];

  const sampleAddresses: GridAddressItem[] = [
    {
      id: "adr-1",
      type: "Building",
      nameOrIdentifier: "Al Manara Tower 4",
      canonicalAddress: "Plot 46-A, Dubai",
      status: "Verified",
    },
    {
      id: "adr-2",
      type: "Unit",
      nameOrIdentifier: "Suite 1204 - Tech Zone",
      canonicalAddress: "Level 12, Al Manara Tower",
      status: "Verified",
    },
    {
      id: "adr-3",
      type: "Individual Recipient",
      nameOrIdentifier: "Emirates Post Delivery Center",
      canonicalAddress: "Sector 46, Hub 2",
      status: "Verified",
    },
    {
      id: "adr-4",
      type: "Makani",
      nameOrIdentifier: "Makani 12345-67890",
      canonicalAddress: "Downtown District 46",
      status: "Verified",
    },
  ];

  const filteredAddresses = sampleAddresses.filter((adr) => {
    if (addressTab === "all") return true;
    if (addressTab === "buildings") return adr.type === "Building";
    if (addressTab === "units") return adr.type === "Unit";
    if (addressTab === "recipients") return adr.type === "Individual Recipient";
    if (addressTab === "makani") return adr.type === "Makani" || adr.type === "Onwani";
    return true;
  });

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        p: { xs: "16px", md: "20px" },
        boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Header Row: Current Cell & Level Badge */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          sx={{
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            color: "#000000",
          }}
        >
          Current Cell (T{activeTier})
        </Typography>

        {/* Level & Size Badge */}
        <Box
          sx={{
            px: "10px",
            py: "3px",
            borderRadius: "6px",
            bgcolor: "#EFE4FD",
            color: "#0000FF",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "var(--font-cairo)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="#0000FF" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="#0000FF" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="#0000FF" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="#0000FF" />
          </svg>
          T{activeTier} 70 Km
        </Box>
      </Box>

      {/* Large Cell Code */}
      <Typography
        sx={{
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "28px",
          lineHeight: "34px",
          color: "#000000",
        }}
      >
        {cell.code}
      </Typography>

      {/* Mini Interactive Leaflet Map */}
      <PostcodeMiniMap
        latitude={cell.latitude}
        longitude={cell.longitude}
        activeTier={activeTier}
        chipTier4={cell.code}
        onExpandMap={onExpandMap}
      />

      {/* Accordion 1: Postcodes on The Grid */}
      <Box sx={{ border: "1px solid #F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
        <Box
          onClick={() => setIsPostcodesOpen(!isPostcodesOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "12px 14px",
            bgcolor: "#FFFFFF",
            cursor: "pointer",
            userSelect: "none",
            borderBottom: isPostcodesOpen ? "1px solid #F1F5F9" : "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Element-3 / Grid Icon in Royal Blue */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
            </svg>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo)",
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Postcodes on The Grid
            </Typography>

            <Box
              sx={{
                px: "8px",
                py: "1px",
                borderRadius: "10px",
                bgcolor: "rgba(0, 0, 255, 0.08)",
                color: "#0000FF",
                fontSize: "11.5px",
                fontWeight: 700,
                fontFamily: "var(--font-cairo)",
              }}
            >
              {cell.postcodesCount}
            </Box>
          </Box>

          <Box
            sx={{
              transform: isPostcodesOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              display: "flex",
              color: "#1E293B",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        </Box>

        <Collapse in={isPostcodesOpen}>
          <Box sx={{ p: "10px 14px", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
            {SAMPLE_POSTCODES_ON_GRID.map((pc) => (
              <Box
                key={pc.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: "8px 10px",
                  borderRadius: "6px",
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Box sx={{ px: "5px", py: "1px", borderRadius: "2px", bgcolor: "#5B67EA", color: "#FFF", fontSize: "11px", fontWeight: 600 }}>
                    {pc.chips.tier1}
                  </Box>
                  <Box sx={{ px: "5px", py: "1px", borderRadius: "2px", bgcolor: "#4D4D4D", color: "#FFF", fontSize: "11px", fontWeight: 600 }}>
                    {pc.chips.tier2}
                  </Box>
                  <Box sx={{ px: "5px", py: "1px", borderRadius: "2px", bgcolor: "#3F8E50", color: "#FFF", fontSize: "11px", fontWeight: 600 }}>
                    {pc.chips.tier3}
                  </Box>
                  <Box sx={{ px: "5px", py: "1px", borderRadius: "2px", bgcolor: "#2979FF", color: "#FFF", fontSize: "11px", fontWeight: 600 }}>
                    {cell.code}
                  </Box>
                </Box>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#5A5A5A" }}>
                  {pc.area}
                </Typography>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Box>

      {/* Accordion 2: Address on This grid, With Type Filters (4) */}
      <Box sx={{ border: "1px solid #F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
        <Box
          onClick={() => setIsAddressesOpen(!isAddressesOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "12px 14px",
            bgcolor: "#FFFFFF",
            cursor: "pointer",
            userSelect: "none",
            borderBottom: isAddressesOpen ? "1px solid #F1F5F9" : "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Location Pin Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                stroke="#0000FF"
                strokeWidth="1.8"
              />
              <path
                d="M12 21C16 17 20 13.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 13.4183 8 17 12 21Z"
                stroke="#0000FF"
                strokeWidth="1.8"
              />
            </svg>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo)",
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Address on This grid, With Type Filters (4)
            </Typography>

            <Box
              sx={{
                px: "8px",
                py: "1px",
                borderRadius: "10px",
                bgcolor: "rgba(0, 0, 255, 0.08)",
                color: "#0000FF",
                fontSize: "11.5px",
                fontWeight: 700,
                fontFamily: "var(--font-cairo)",
              }}
            >
              {cell.addressesCount.toLocaleString()}
            </Box>
          </Box>

          <Box
            sx={{
              transform: isAddressesOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              display: "flex",
              color: "#1E293B",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        </Box>

        <Collapse in={isAddressesOpen}>
          <Box sx={{ p: "12px 14px", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Filter Tabs */}
            <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {addressFilterTabs.map((t) => {
                const isSel = addressTab === t.id;
                return (
                  <Box
                    key={t.id}
                    onClick={() => setAddressTab(t.id)}
                    sx={{
                      px: "10px",
                      py: "3px",
                      borderRadius: "14px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: isSel ? 700 : 500,
                      fontFamily: "var(--font-cairo)",
                      bgcolor: isSel ? "#0000FF" : "#F8FAFC",
                      color: isSel ? "#FFFFFF" : "#64748B",
                      border: isSel ? "1px solid #0000FF" : "1px solid #E2E8F0",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isSel ? "#0000FF" : "#F1F5F9",
                      },
                    }}
                  >
                    {t.label}
                  </Box>
                );
              })}
            </Box>

            {/* Address Records List */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
              {filteredAddresses.map((adr) => (
                <Box
                  key={adr.id}
                  sx={{
                    p: "8px 10px",
                    borderRadius: "6px",
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 700, color: "#1E293B" }}>
                      {adr.nameOrIdentifier}
                    </Typography>
                    <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#64748B" }}>
                      {adr.canonicalAddress}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: "6px",
                      py: "1px",
                      borderRadius: "4px",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      bgcolor: "#ECFDF5",
                      color: "#047857",
                    }}
                  >
                    {adr.type}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

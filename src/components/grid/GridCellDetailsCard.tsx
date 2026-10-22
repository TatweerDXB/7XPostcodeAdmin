"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import PostcodeMiniMap from "@/components/map/PostcodeMiniMap";
import { GridCellNode } from "@/data/gridEngineData";

interface GridCellDetailsCardProps {
  node: GridCellNode;
  onClose: () => void;
}

export default function GridCellDetailsCard({ node, onClose }: GridCellDetailsCardProps) {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(node.tier || 4);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [selectedAddressTab, setSelectedAddressTab] = useState("all");

  const addressFilterTabs = [
    { id: "all", label: "All" },
    { id: "buildings", label: "Buildings" },
    { id: "units", label: "Units" },
    { id: "recipients", label: "Individual Recipients" },
    { id: "makani", label: "Makani/Onwani" },
  ];

  const filteredAddresses = node.addresses.filter((adr) => {
    if (selectedAddressTab === "all") return true;
    if (selectedAddressTab === "buildings") return adr.type === "Building";
    if (selectedAddressTab === "units") return adr.type === "Unit";
    if (selectedAddressTab === "recipients") return adr.type === "Individual Recipient";
    if (selectedAddressTab === "makani") return adr.type === "Makani" || adr.type === "Onwani";
    return true;
  });

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        p: "20px",
        boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header Container (Frame 9167 in Figma) */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          {/* Cell Badge & Subtitle */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                px: "10px",
                py: "4px",
                borderRadius: "8px",
                bgcolor: "rgba(0, 0, 255, 0.05)",
                width: "fit-content",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "26px",
                  lineHeight: "34px",
                  color: "#000000",
                }}
              >
                {node.cellCode}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "15px",
                color: "#5A5A5A",
                lineHeight: "22px",
              }}
            >
              {node.gridSizeLabel}
            </Typography>
          </Box>

          {/* Close Circle Button */}
          <IconButton
            onClick={onClose}
            sx={{
              p: 0.5,
              color: "#000000",
              flexShrink: 0,
              transition: "transform 0.15s ease",
              "&:hover": { transform: "scale(1.1)", bgcolor: "#F1F5F9" },
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1.5" />
              <path d="M9 9L15 15M15 9L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </IconButton>
        </Box>

        {/* Divider Line */}
        <Box sx={{ width: "100%", height: "1px", bgcolor: "#F0F6FC", my: 0.5 }} />

        {/* 4 Tier Breadcrumbs Tabs */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* Tier 1 */}
          <Box
            onClick={() => setActiveTier(1)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              px: "4px",
              py: "6px",
              borderRadius: "8px",
              bgcolor: activeTier === 1 ? "#0000FF" : "#FFFFFF",
              border: activeTier === 1 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 1 ? "#FFFFFF" : "#000000",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 600, whiteSpace: "nowrap" }}>
              Tier 1 → {node.tierPills.tier1}
            </Typography>
          </Box>

          {/* Tier 2 */}
          <Box
            onClick={() => setActiveTier(2)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              px: "4px",
              py: "6px",
              borderRadius: "8px",
              bgcolor: activeTier === 2 ? "#64748B" : "#FFFFFF",
              border: activeTier === 2 ? "1.5px solid #64748B" : "1px solid #E2E8F0",
              color: activeTier === 2 ? "#FFFFFF" : "#000000",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 600, whiteSpace: "nowrap" }}>
              Tier 2 → {node.tierPills.tier2}
            </Typography>
          </Box>

          {/* Tier 3 */}
          <Box
            onClick={() => setActiveTier(3)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              px: "4px",
              py: "6px",
              borderRadius: "8px",
              bgcolor: activeTier === 3 ? "#10B981" : "#FFFFFF",
              border: activeTier === 3 ? "1.5px solid #10B981" : "1px solid #E2E8F0",
              color: activeTier === 3 ? "#FFFFFF" : "#000000",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 600, whiteSpace: "nowrap" }}>
              Tier 3 → {node.tierPills.tier3}
            </Typography>
          </Box>

          {/* Tier 4 (Orange) */}
          <Box
            onClick={() => setActiveTier(4)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              px: "4px",
              py: "6px",
              borderRadius: "8px",
              bgcolor: activeTier === 4 ? "rgba(235, 134, 31, 0.95)" : "#FFFFFF",
              border: activeTier === 4 ? "1.5px solid rgba(235, 134, 31, 0.95)" : "1px solid #E2E8F0",
              color: activeTier === 4 ? "#FFFFFF" : "#000000",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 600, whiteSpace: "nowrap" }}>
              Tier 4 → {node.tierPills.tier4}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Mini Map */}
      <PostcodeMiniMap
        latitude={node.latitude}
        longitude={node.longitude}
        activeTier={activeTier}
        chipTier4={node.tierPills.tier4}
      />

      {/* Section 1: Postcodes on The Grid */}
      <Box sx={{ border: "1px solid #F0F6FC", borderRadius: "10px", overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "12px 14px",
            bgcolor: "#F8FAFC",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
              color: "#1E293B",
            }}
          >
            Postcodes on The Grid
          </Typography>
        </Box>

        {/* Postcodes Table */}
        <Box sx={{ bgcolor: "#FFFFFF", p: "8px 12px" }}>
          {/* Table Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 100px",
              alignItems: "center",
              height: 38,
              px: "8px",
              borderBottom: "1px solid #F1F5F9",
              color: "#64748B",
              fontFamily: "var(--font-cairo)",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Box>Postcode</Box>
            <Box>Area</Box>
            <Box sx={{ textAlign: "center" }}>Status</Box>
          </Box>

          {/* Table Rows */}
          {node.postcodes.map((pc) => (
            <Box
              key={pc.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 100px",
                alignItems: "center",
                height: 52,
                px: "8px",
                borderBottom: "1px solid #F8FAFC",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              {/* 4 Colored Chips */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "2px",
                    bgcolor: "rgba(0, 0, 255, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#FFFFFF", lineHeight: 1 }}>
                    {pc.chips.tier1}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "2px",
                    bgcolor: "rgba(77, 77, 77, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#FFFFFF", lineHeight: 1 }}>
                    {pc.chips.tier2}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "2px",
                    bgcolor: "rgba(63, 142, 80, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#FFFFFF", lineHeight: 1 }}>
                    {pc.chips.tier3}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "2px",
                    bgcolor: "rgba(235, 134, 31, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#FFFFFF", lineHeight: 1 }}>
                    {pc.chips.tier4}
                  </Typography>
                </Box>
              </Box>

              {/* Area */}
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo)",
                  fontSize: "13.5px",
                  color: "#1E293B",
                  fontWeight: 500,
                }}
              >
                {pc.area}
              </Typography>

              {/* Status */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Box
                  sx={{
                    px: "8px",
                    py: "2px",
                    borderRadius: "3px",
                    bgcolor: pc.status === "Published" ? "#F3FAF4" : "#FEF2F2",
                    color: pc.status === "Published" ? "#3F8E50" : "#D83731",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    fontFamily: "var(--font-cairo)",
                    textAlign: "center",
                    display: "inline-block",
                  }}
                >
                  {pc.status}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Section 2: Address on This grid, With Type Filters */}
      <Box sx={{ border: "1px solid #F0F6FC", borderRadius: "10px", overflow: "hidden" }}>
        <Box
          onClick={() => setIsAddressesOpen(!isAddressesOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "12px 14px",
            bgcolor: "#F8FAFC",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-cairo)",
              fontSize: "15px",
              fontWeight: 700,
              color: "#1E293B",
            }}
          >
            Address on This grid, With Type Filters ({node.addresses.length})
          </Typography>
          <Box
            sx={{
              transform: isAddressesOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              display: "flex",
            }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Box>
        </Box>

        <Collapse in={isAddressesOpen}>
          <Box sx={{ p: "12px", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Filter Pills */}
            <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {addressFilterTabs.map((t) => {
                const isSel = selectedAddressTab === t.id;
                return (
                  <Box
                    key={t.id}
                    onClick={() => setSelectedAddressTab(t.id)}
                    sx={{
                      px: "10px",
                      py: "3px",
                      borderRadius: "20px",
                      bgcolor: isSel ? "rgba(0, 0, 255, 0.08)" : "#F8FAFC",
                      border: isSel ? "1px solid #0000FF" : "1px solid #E2E8F0",
                      color: isSel ? "#0000FF" : "#64748B",
                      fontSize: "12px",
                      fontWeight: isSel ? 600 : 400,
                      fontFamily: "var(--font-cairo)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {t.label}
                  </Box>
                );
              })}
            </Box>

            {/* Addresses Table */}
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "85px 1.1fr 1.1fr 75px",
                  gap: "8px",
                  p: "6px 8px",
                  bgcolor: "#F8FAFC",
                  borderRadius: "4px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#64748B",
                  fontFamily: "var(--font-cairo)",
                }}
              >
                <Box>Type</Box>
                <Box>Name/Identifier</Box>
                <Box>Canonical Address</Box>
                <Box>Status</Box>
              </Box>

              {filteredAddresses.map((adr) => (
                <Box
                  key={adr.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "85px 1.1fr 1.1fr 75px",
                    gap: "8px",
                    p: "8px",
                    borderBottom: "1px solid #F1F5F9",
                    fontSize: "12px",
                    alignItems: "center",
                    fontFamily: "var(--font-cairo)",
                    "&:hover": { bgcolor: "#F8FAFC" },
                  }}
                >
                  <Box sx={{ color: "#0000FF", fontWeight: 500 }}>{adr.type}</Box>
                  <Box sx={{ color: "#1E293B", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {adr.nameOrIdentifier}
                  </Box>
                  <Box sx={{ color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {adr.canonicalAddress}
                  </Box>
                  <Box>
                    <Box
                      sx={{
                        px: "6px",
                        py: "2px",
                        borderRadius: "3px",
                        bgcolor: "#F3FAF4",
                        color: "#3F8E50",
                        fontSize: "11px",
                        fontWeight: 600,
                        textAlign: "center",
                        display: "inline-block",
                      }}
                    >
                      {adr.status}
                    </Box>
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

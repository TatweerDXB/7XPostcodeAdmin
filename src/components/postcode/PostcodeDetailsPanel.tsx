"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { SearchResultItem } from "@/data/portalSearchData";

interface PostcodeDetailsPanelProps {
  item: SearchResultItem;
  onClose: () => void;
}

export default function PostcodeDetailsPanel({ item, onClose }: PostcodeDetailsPanelProps) {
  const [openPostal, setOpenPostal] = useState(true);
  const [openComponents, setOpenComponents] = useState(true);
  const [openLineage, setOpenLineage] = useState(true);

  // Split postcode into 4 tokens if available (e.g. 46-45-65-76)
  const tokens = item.postCode.split("-");
  const chip1 = tokens[0] || item.tiers.tier1 || "46";
  const chip2 = tokens[1] || item.tiers.tier2 || "45";
  const chip3 = tokens[2] || item.tiers.tier3 || "65";
  const chip4 = tokens[3] || item.tiers.tier4 || "76";

  const isVerified = item.status === "Verified";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
        borderRadius: "8px",
        p: "16px 14px",
        boxSizing: "border-box",
        boxShadow: "0 2px 14px rgba(0, 0, 0, 0.05)",
        border: "1px solid #EAEFEF",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: 5,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#D1D5DB",
          borderRadius: 3,
        },
      }}
    >
      {/* Header Row */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "#000000",
            letterSpacing: "-0.2px",
          }}
        >
          PostCode: {item.postCode}
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            p: 0.5,
            color: "#000000",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "#F1F5F9",
              transform: "scale(1.08)",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="1.5" />
            <path d="M9 9L15 15M15 9L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </IconButton>
      </Box>

      {/* Subtitle */}
      <Typography
        sx={{
          fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
          fontSize: "13px",
          color: "#000000",
          lineHeight: 1.4,
          mb: 1.2,
        }}
      >
        {item.addressLine}
      </Typography>

      {/* Verified Status Badge */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1,
          py: 0.3,
          borderRadius: "4px",
          bgcolor: isVerified ? "#F3FAF4" : "#FEF3C7",
          color: isVerified ? "#3F8E50" : "#D97706",
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
          width: "fit-content",
          mb: 2,
        }}
      >
        {isVerified ? "Verified" : "Non Verified"}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Accordion 1: Postal Address */}
        <Box
          sx={{
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            onClick={() => setOpenPostal(!openPostal)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "12px 14px",
              cursor: "pointer",
              userSelect: "none",
              bgcolor: "#F8FAFC",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M3 4H17C17.55 4 18 4.45 18 5V14C18 14.55 17.55 15 17 15H3C2.45 15 2 14.55 2 14V5C2 4.45 2.45 4 3 4Z" stroke="#0000FF" strokeWidth="1.6" />
                <path d="M3 5L10 10.5L17 5" stroke="#0000FF" strokeWidth="1.6" />
              </svg>
              <Typography
                sx={{
                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Postal Address
              </Typography>
            </Box>

            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: openPostal ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M4 6L8 10L12 6" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Box>

          <Collapse in={openPostal}>
            <Box sx={{ p: "14px", display: "flex", flexDirection: "column", gap: 1.2 }}>
              {/* Postcode chips row */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "12.5px", color: "#64748B", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                  Postcode
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                  <Box sx={{ minWidth: 24, height: 24, px: 0.5, borderRadius: "2px", bgcolor: "#0000FF", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {chip1}
                  </Box>
                  <Typography sx={{ color: "#000000", fontSize: "14px", fontWeight: 400, fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>-</Typography>
                  <Box sx={{ minWidth: 24, height: 24, px: 0.5, borderRadius: "2px", bgcolor: "#4D4D4D", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {chip2}
                  </Box>
                  <Typography sx={{ color: "#000000", fontSize: "14px", fontWeight: 400, fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>-</Typography>
                  <Box sx={{ minWidth: 24, height: 24, px: 0.5, borderRadius: "2px", bgcolor: "#3F8E50", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {chip3}
                  </Box>
                  <Typography sx={{ color: "#000000", fontSize: "14px", fontWeight: 400, fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>-</Typography>
                  <Box sx={{ minWidth: 24, height: 24, px: 0.5, borderRadius: "2px", bgcolor: "#1B8CFE", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {chip4}
                  </Box>
                </Box>
              </Box>

              {/* Makani number */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "12.5px", color: "#64748B", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                  Makani number
                </Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0F172A", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                  {item.makaniNumber}
                </Typography>
              </Box>

              {/* Onwani address */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "12.5px", color: "#64748B", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                  Onwani address
                </Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#0F172A", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                  {item.onwaniAddress}
                </Typography>
              </Box>

              {/* Coordinates */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "12.5px", color: "#64748B", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                  Coordinates
                </Typography>
                <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#0F172A", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                  {item.coordinates}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Accordion 2: Address Components */}
        <Box
          sx={{
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            onClick={() => setOpenComponents(!openComponents)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "12px 14px",
              cursor: "pointer",
              userSelect: "none",
              bgcolor: "#F8FAFC",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="#0000FF" strokeWidth="1.6" />
                <circle cx="10" cy="9" r="2.5" stroke="#0000FF" strokeWidth="1.5" />
                <path d="M10 11.5V14" stroke="#0000FF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <Typography
                sx={{
                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Address Components
              </Typography>
            </Box>

            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: openComponents ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M4 6L8 10L12 6" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Box>

          <Collapse in={openComponents}>
            <Box sx={{ p: "14px", display: "flex", flexDirection: "column", gap: 1.1 }}>
              {[
                { label: "Building Name", val: item.buildingName },
                { label: "Address Type", val: item.addressType },
                { label: "Address Identifier", val: item.addressIdentifier },
                { label: "Floors", val: item.floors },
                { label: "Units", val: item.units },
                { label: "Street", val: item.street },
                { label: "Area Locality", val: item.areaLocality },
                { label: "Emirate Admin Area", val: item.emirateAdminArea },
                { label: "Country Code", val: item.countryCode },
                { label: "Country Name", val: item.countryName },
                { label: "Last update", val: item.lastUpdate },
              ].map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 0.2,
                  }}
                >
                  <Typography sx={{ fontSize: "12.5px", color: "#64748B", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
                    {row.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#0F172A",
                      fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                      textAlign: "right",
                    }}
                  >
                    {row.val}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>

        {/* Accordion 3: Grid Lineage */}
        <Box
          sx={{
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            onClick={() => setOpenLineage(!openLineage)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "12px 14px",
              cursor: "pointer",
              userSelect: "none",
              bgcolor: "#F8FAFC",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="#0000FF" strokeWidth="1.5" />
                <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="#0000FF" strokeWidth="1.5" />
                <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="#0000FF" strokeWidth="1.5" />
                <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" stroke="#0000FF" strokeWidth="1.5" />
              </svg>
              <Typography
                sx={{
                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              >
                Grid Lineage
              </Typography>
            </Box>

            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: openLineage ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path d="M4 6L8 10L12 6" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Box>

          <Collapse in={openLineage}>
            <Box sx={{ p: "14px", display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[
                {
                  tierName: "Tier 1",
                  sublabel: "(Emirate Grid)",
                  code: item.gridLineage.tier1.code,
                  desc: item.gridLineage.tier1.desc,
                  icon: (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "6px",
                        bgcolor: "rgba(59, 130, 246, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L8 3L13 8L8 13L3 8Z" stroke="#3B82F6" strokeWidth="1.5" />
                      </svg>
                    </Box>
                  ),
                },
                {
                  tierName: "Tier 2",
                  sublabel: "(Region Grid)",
                  code: item.gridLineage.tier2.code,
                  desc: item.gridLineage.tier2.desc,
                  icon: (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "6px",
                        bgcolor: "rgba(99, 102, 241, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" stroke="#6366F1" strokeWidth="1.5" />
                        <rect x="9" y="2" width="5" height="5" rx="1" stroke="#6366F1" strokeWidth="1.5" />
                        <rect x="2" y="9" width="5" height="5" rx="1" stroke="#6366F1" strokeWidth="1.5" />
                        <rect x="9" y="9" width="5" height="5" rx="1" stroke="#6366F1" strokeWidth="1.5" />
                      </svg>
                    </Box>
                  ),
                },
                {
                  tierName: "Tier 3",
                  sublabel: "(Sector Grid)",
                  code: item.gridLineage.tier3.code,
                  desc: item.gridLineage.tier3.desc,
                  icon: (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "6px",
                        bgcolor: "rgba(16, 185, 129, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="1.5" />
                        <rect x="9" y="2" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="1.5" />
                        <rect x="2" y="9" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="1.5" />
                        <rect x="9" y="9" width="5" height="5" rx="1" stroke="#10B981" strokeWidth="1.5" />
                      </svg>
                    </Box>
                  ),
                },
                {
                  tierName: "Tier 4",
                  sublabel: "(Plot Grid)",
                  code: item.gridLineage.tier4.code,
                  desc: item.gridLineage.tier4.desc,
                  icon: (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "6px",
                        bgcolor: "rgba(6, 182, 212, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="5" height="5" rx="1" stroke="#06B6D4" strokeWidth="1.5" />
                        <rect x="9" y="2" width="5" height="5" rx="1" stroke="#06B6D4" strokeWidth="1.5" />
                        <rect x="2" y="9" width="5" height="5" rx="1" stroke="#06B6D4" strokeWidth="1.5" />
                        <rect x="9" y="9" width="5" height="5" rx="1" stroke="#06B6D4" strokeWidth="1.5" />
                      </svg>
                    </Box>
                  ),
                },
              ].map((tierRow) => (
                <Box
                  key={tierRow.tierName}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tierRow.icon}
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>
                        {tierRow.tierName}
                      </Typography>
                      <Typography sx={{ fontSize: "11px", color: "#64748B", lineHeight: 1.2 }}>
                        {tierRow.sublabel}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Typography
                      sx={{
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "#0F172A",
                        fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                        lineHeight: 1.1,
                      }}
                    >
                      {tierRow.code}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: "#64748B", lineHeight: 1.2 }}>
                      {tierRow.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
}

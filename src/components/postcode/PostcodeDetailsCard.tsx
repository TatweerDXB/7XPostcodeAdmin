"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import PostcodeMiniMap from "@/components/map/PostcodeMiniMap";
import { PostcodeItem } from "@/data/postcodeListData";

interface PostcodeDetailsCardProps {
  item: PostcodeItem;
  onClose: () => void;
}

export default function PostcodeDetailsCard({ item, onClose }: PostcodeDetailsCardProps) {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(4);
  const [isGridInfoOpen, setIsGridInfoOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isLinkedRecordsOpen, setIsLinkedRecordsOpen] = useState(true);
  const [linkedTab, setLinkedTab] = useState("all");

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "buildings", label: "Buildings" },
    { id: "units", label: "Units" },
    { id: "recipients", label: "Individual Recipients" },
    { id: "makani", label: "Makani/Onwani" },
  ];

  const filteredItems = item.linkedRecords.items.filter((rec) => {
    if (linkedTab === "all") return true;
    if (linkedTab === "buildings") return rec.type === "Building";
    if (linkedTab === "units") return rec.type === "Unit";
    if (linkedTab === "recipients") return rec.type === "Individual Recipient";
    if (linkedTab === "makani") return rec.type === "Makani" || rec.type === "Onwani";
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
      {/* Header Container */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
        {/* Title & Badge Row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Typography
                sx={{
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "24px",
                  lineHeight: "32px",
                  color: "#000000",
                }}
              >
                Postcode {item.postcode}
              </Typography>

              {/* Status Badge */}
              <Box
                sx={{
                  px: "10px",
                  py: "2px",
                  borderRadius: "3px",
                  bgcolor: item.status === "Published" ? "#F3FAF4" : "#FEF2F2",
                  color: item.status === "Published" ? "#3F8E50" : "#D83731",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  lineHeight: "20px",
                }}
              >
                {item.status}
              </Box>
            </Box>

            {/* Subtitle */}
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                color: "#5A5A5A",
                lineHeight: "22px",
              }}
            >
              {item.subtitle}
            </Typography>
          </Box>

          {/* Close Button matching Figma close-circle */}
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1.5" />
              <path d="M9 9L15 15M15 9L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </IconButton>
        </Box>

        {/* Divider Line */}
        <Box sx={{ width: "100%", height: "1px", bgcolor: "#F0F6FC", my: 0.5 }} />

        {/* Tier Pills Tabs matching Figma design - Equal 4 columns Grid */}
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
              Tier 1 → {item.chips.tier1}
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
              Tier 2 → {item.chips.tier2}
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
              Tier 3 → {item.chips.tier3}
            </Typography>
          </Box>

          {/* Tier 4 (Active Orange in Figma) */}
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
              Tier 4 → {item.chips.tier4}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Body Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          width: "100%",
        }}
      >
        {/* Interactive Mini Map Box */}
        <PostcodeMiniMap
          latitude={item.latitude}
          longitude={item.longitude}
          activeTier={activeTier}
          chipTier4={item.chips.tier4}
        />

        {/* Section 1: Grid Information (T4-90) */}
        <Box sx={{ border: "1px solid #F0F6FC", borderRadius: "10px", overflow: "hidden" }}>
          <Box
            onClick={() => setIsGridInfoOpen(!isGridInfoOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "10px 14px",
              bgcolor: "#F8FAFC",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo)",
                fontSize: "14.5px",
                fontWeight: 700,
                color: "#1E293B",
              }}
            >
              Grid Information (T4-{item.chips.tier4})
            </Typography>
            <Box
              sx={{
                transform: isGridInfoOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                display: "flex",
              }}
            >
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Box>
          </Box>

          <Collapse in={isGridInfoOpen}>
            <Box sx={{ p: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", bgcolor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Buildings
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.gridInfo.buildingsCount}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Units
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.gridInfo.unitsCount}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Individual Recipients
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.gridInfo.recipientsCount}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Section 2: Location Details */}
        <Box sx={{ border: "1px solid #F0F6FC", borderRadius: "10px", overflow: "hidden" }}>
          <Box
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "10px 14px",
              bgcolor: "#F8FAFC",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo)",
                fontSize: "14.5px",
                fontWeight: 700,
                color: "#1E293B",
              }}
            >
              Location Details
            </Typography>
            <Box
              sx={{
                transform: isLocationOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                display: "flex",
              }}
            >
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Box>
          </Box>

          <Collapse in={isLocationOpen}>
            <Box sx={{ p: "12px 14px", display: "flex", flexDirection: "column", gap: "8px", bgcolor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Location
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.locationDetails.location}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Emirate
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.locationDetails.emirate}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Area
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.locationDetails.area}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Latitude
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.locationDetails.latitude}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Longitude
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#101828" }}>
                  {item.locationDetails.longitude}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Section 3: Linked Records on This Postcode */}
        <Box sx={{ border: "1px solid #F0F6FC", borderRadius: "10px", overflow: "hidden" }}>
          <Box
            onClick={() => setIsLinkedRecordsOpen(!isLinkedRecordsOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "10px 14px",
              bgcolor: "#F8FAFC",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo)",
                fontSize: "14.5px",
                fontWeight: 700,
                color: "#1E293B",
              }}
            >
              Linked Records on This Postcode ({item.linkedRecords.totalCount})
            </Typography>
            <Box
              sx={{
                transform: isLinkedRecordsOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                display: "flex",
              }}
            >
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Box>
          </Box>

          <Collapse in={isLinkedRecordsOpen}>
            <Box sx={{ p: "12px", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Linked Sub-filter Tabs */}
              <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {filterTabs.map((t) => {
                  const isSel = linkedTab === t.id;
                  return (
                    <Box
                      key={t.id}
                      onClick={() => setLinkedTab(t.id)}
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

              {/* Records Mini Table */}
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 1fr 70px",
                    gap: "8px",
                    p: "6px 8px",
                    bgcolor: "#F8FAFC",
                    borderRadius: "4px",
                    fontSize: "11px",
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

                {filteredItems.map((rec) => (
                  <Box
                    key={rec.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 1fr 70px",
                      gap: "8px",
                      p: "8px",
                      borderBottom: "1px solid #F1F5F9",
                      fontSize: "12px",
                      alignItems: "center",
                      fontFamily: "var(--font-cairo)",
                      "&:hover": { bgcolor: "#F8FAFC" },
                    }}
                  >
                    <Box sx={{ color: "#0000FF", fontWeight: 500 }}>{rec.type}</Box>
                    <Box sx={{ color: "#1E293B", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {rec.nameOrIdentifier}
                    </Box>
                    <Box sx={{ color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {rec.canonicalAddress}
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
                        {rec.status}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
}

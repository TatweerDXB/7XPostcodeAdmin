"use client";

import React, { useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import PostcodeMiniMap from "@/components/map/PostcodeMiniMap";
import { PostcodeItem } from "@/data/postcodeListData";

interface PostcodeDetailsCardProps {
  item: PostcodeItem;
  onClose: () => void;
  onExpandMap?: () => void;
}

export default function PostcodeDetailsCard({
  item,
  onClose,
  onExpandMap,
}: PostcodeDetailsCardProps) {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(4);
  const [isGridInfoOpen, setIsGridInfoOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isLinkedRecordsOpen, setIsLinkedRecordsOpen] = useState(false);
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
        p: { xs: "16px", md: "20px" },
        boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header Container */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
        {/* Title, Badge, and Close Button Row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px", minWidth: 0 }}>
            {/* Mailbox Icon */}
            <Box
              sx={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mt: "2px",
              }}
            >
              <Image
                src="/images/postcode-mailbox.svg"
                alt="Mailbox"
                width={26}
                height={26}
                style={{ objectFit: "contain" }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "18px", md: "22px" },
                    lineHeight: "28px",
                    color: "#000000",
                  }}
                >
                  Postcode {item.postcode}
                </Typography>

                {/* Status Badge */}
                <Box
                  sx={{
                    px: "8px",
                    py: "2px",
                    borderRadius: "4px",
                    bgcolor: item.status === "Published" ? "#F3FAF4" : "#FEF2F2",
                    color: item.status === "Published" ? "#3F8E50" : "#D83731",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    lineHeight: "18px",
                  }}
                >
                  {item.status}
                </Box>
              </Box>

              {/* Subtitle */}
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "13px",
                  color: "#64748B",
                  lineHeight: "20px",
                }}
              >
                {item.subtitle}
              </Typography>
            </Box>
          </Box>

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            aria-label="Close details"
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

        {/* Grid Level Selector Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            pt: "4px",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "#64748B",
            }}
          >
            Grid Level:
          </Typography>

          {/* T1 */}
          <Box
            onClick={() => setActiveTier(1)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              px: "8px",
              py: "4px",
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              border: activeTier === 1 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 1 ? "#0000FF" : "#1E293B",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            {/* T1 Glyph / Purple box */}
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "3px",
                bgcolor: "#EFE4FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: "1px", bgcolor: "#7E1BFE" }} />
            </Box>
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600 }}>
              T1 ({item.chips.tier1})
            </Typography>
          </Box>

          {/* T2 */}
          <Box
            onClick={() => setActiveTier(2)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              px: "8px",
              py: "4px",
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              border: activeTier === 2 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 2 ? "#0000FF" : "#1E293B",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="#64748B" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="#64748B" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="#64748B" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="#64748B" />
            </svg>
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600 }}>
              T2 ({item.chips.tier2})
            </Typography>
          </Box>

          {/* T3 */}
          <Box
            onClick={() => setActiveTier(3)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              px: "8px",
              py: "4px",
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              border: activeTier === 3 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 3 ? "#0000FF" : "#1E293B",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="#10B981" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="#10B981" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="#10B981" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="#10B981" />
            </svg>
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600 }}>
              T3 ({item.chips.tier3})
            </Typography>
          </Box>

          {/* T4 */}
          <Box
            onClick={() => setActiveTier(4)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              px: "8px",
              py: "4px",
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              border: activeTier === 4 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 4 ? "#0000FF" : "#1E293B",
              cursor: "pointer",
              transition: "all 0.15s ease",
              userSelect: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="#0000FF" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="#0000FF" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="#0000FF" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="#0000FF" />
            </svg>
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600 }}>
              T4 ({item.chips.tier4})
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Body Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
        }}
      >
        {/* Interactive Mini Map Box */}
        <PostcodeMiniMap
          latitude={item.latitude}
          longitude={item.longitude}
          activeTier={activeTier}
          chipTier4={item.chips.tier4}
          onExpandMap={onExpandMap}
        />

        {/* Section 1: Grid Information (T4-76) */}
        <Box sx={{ border: "1px solid #F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
          <Box
            onClick={() => setIsGridInfoOpen(!isGridInfoOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "12px 14px",
              bgcolor: "#FFFFFF",
              cursor: "pointer",
              userSelect: "none",
              borderBottom: isGridInfoOpen ? "1px solid #F1F5F9" : "none",
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
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: "#000000",
                }}
              >
                Grid Information (T4-{item.chips.tier4})
              </Typography>
            </Box>

            <Box
              sx={{
                transform: isGridInfoOpen ? "rotate(180deg)" : "rotate(0deg)",
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

          <Collapse in={isGridInfoOpen}>
            <Box sx={{ p: "12px 16px", display: "flex", flexDirection: "column", gap: "10px", bgcolor: "#FFFFFF" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Buildings
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.gridInfo.buildingsCount}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Units
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.gridInfo.unitsCount}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Individual Recipients
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.gridInfo.recipientsCount}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Section 2: Location Details */}
        <Box sx={{ border: "1px solid #F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
          <Box
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "12px 14px",
              bgcolor: "#FFFFFF",
              cursor: "pointer",
              userSelect: "none",
              borderBottom: isLocationOpen ? "1px solid #F1F5F9" : "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Location Pin Icon in Royal Blue */}
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
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: "#000000",
                }}
              >
                Location Details
              </Typography>
            </Box>

            <Box
              sx={{
                transform: isLocationOpen ? "rotate(180deg)" : "rotate(0deg)",
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

          <Collapse in={isLocationOpen}>
            <Box sx={{ p: "12px 16px", display: "flex", flexDirection: "column", gap: "10px", bgcolor: "#FFFFFF" }}>
              {item.locationDetails.building && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                    Building
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                    {item.locationDetails.building}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Location
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.locationDetails.location}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Emirate
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.locationDetails.emirate}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Area
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.locationDetails.area}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Latitude
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.locationDetails.latitude}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px", color: "#64748B" }}>
                  Longitude
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
                  {item.locationDetails.longitude}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Section 3: Linked Records on This Postcode */}
        <Box sx={{ border: "1px solid #F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
          <Box
            onClick={() => setIsLinkedRecordsOpen(!isLinkedRecordsOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "12px 14px",
              bgcolor: "#FFFFFF",
              cursor: "pointer",
              userSelect: "none",
              borderBottom: isLinkedRecordsOpen ? "1px solid #F1F5F9" : "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Link Icon in Royal Blue */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 13C10.4225 13.5644 10.9678 14.0321 11.5975 14.3703C12.2272 14.7085 12.9262 14.9088 13.6441 14.9567C14.3621 15.0045 15.0815 14.8987 15.7507 14.6469C16.4199 14.3951 17.0223 14.0036 17.5144 13.5L20.5144 10.5C21.4518 9.56254 21.9785 8.29107 21.9785 6.96525C21.9785 5.63943 21.4518 4.36796 20.5144 3.4305C19.5769 2.49304 18.3055 1.96631 16.9796 1.96631C15.6538 1.96631 14.3824 2.49304 13.4449 3.4305L11.9949 4.8805"
                  stroke="#0000FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11C13.5775 10.4356 13.0322 9.96788 12.4025 9.62968C11.7728 9.29148 11.0738 9.09124 10.3559 9.04335C9.63793 8.99546 8.91854 9.10126 8.24933 9.35307C7.58013 9.60488 6.97768 9.99641 6.48558 10.5L3.48558 13.5C2.54815 14.4375 2.02148 15.7089 2.02148 17.0348C2.02148 18.3606 2.54815 19.632 3.48558 20.5695C4.42304 21.507 5.6945 22.0337 7.02033 22.0337C8.34615 22.0337 9.61761 21.507 10.5551 20.5695L12.0051 19.1195"
                  stroke="#0000FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <Typography
                sx={{
                  fontFamily: "var(--font-cairo)",
                  fontSize: "14.5px",
                  fontWeight: 700,
                  color: "#000000",
                }}
              >
                Linked Records on This Postcode
              </Typography>

              {/* Purple Pill Badge */}
              <Box
                sx={{
                  px: "8px",
                  py: "1px",
                  borderRadius: "12px",
                  bgcolor: "#EFE4FD",
                  color: "#7E1BFE",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "var(--font-cairo)",
                }}
              >
                {item.linkedRecords.totalCount.toLocaleString()}
              </Box>
            </Box>

            <Box
              sx={{
                transform: isLinkedRecordsOpen ? "rotate(180deg)" : "rotate(0deg)",
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

          <Collapse in={isLinkedRecordsOpen}>
            <Box sx={{ p: "12px 14px", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: "10px" }}>
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
                        borderRadius: "14px",
                        cursor: "pointer",
                        fontSize: "11.5px",
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

              {/* Records List */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", pr: 0.5 }}>
                {filteredItems.map((rec) => (
                  <Box
                    key={rec.id}
                    sx={{
                      p: "10px",
                      borderRadius: "8px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", fontWeight: 700, color: "#1E293B" }}>
                        {rec.nameOrIdentifier}
                      </Typography>
                      <Box
                        sx={{
                          px: "6px",
                          py: "1px",
                          borderRadius: "4px",
                          fontSize: "10.5px",
                          fontWeight: 600,
                          bgcolor: rec.status === "Verified" ? "#ECFDF5" : "#FEF3C7",
                          color: rec.status === "Verified" ? "#047857" : "#B45309",
                        }}
                      >
                        {rec.type}
                      </Box>
                    </Box>
                    <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#64748B" }}>
                      {rec.canonicalAddress}
                    </Typography>
                  </Box>
                ))}

                {filteredItems.length === 0 && (
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#94A3B8", py: 2, textAlign: "center" }}>
                    No linked records found in this category.
                  </Typography>
                )}
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
}

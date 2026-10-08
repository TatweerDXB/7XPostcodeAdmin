"use client";

import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import PostcodeMiniMap from "./PostcodeMiniMap";
import { AddressRegistryItem } from "@/data/addressRegistryData";

interface AddressDetailsCardProps {
  open: boolean;
  item: AddressRegistryItem | null;
  onClose: () => void;
}

export default function AddressDetailsCard({
  open,
  item,
  onClose,
}: AddressDetailsCardProps) {
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(4);
  const [isPostalAddressOpen, setIsPostalAddressOpen] = useState(false);
  const [isLocationDetailsOpen, setIsLocationDetailsOpen] = useState(true);
  const [mapSearch, setMapSearch] = useState("");

  if (!item) return null;

  const t1Val = item.t1?.replace("Cell ", "") || "47";
  const t2Val = item.t2?.replace("Cell ", "") || "48";
  const t3Val = item.t3?.replace("Cell ", "") || "67";
  const t4Val = item.t4?.replace("Cell ", "") || "90";
  const postcodeDisplay = item.postcode || `${t1Val}${t2Val}-${t3Val}${t4Val}`;

  const lat = item.latitude || 25.1972;
  const lng = item.longitude || 55.2744;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(1.5px)",
          },
        },
        paper: {
          sx: {
            width: { xs: "100%", sm: "520px", md: "566px" },
            height: "100vh",
            maxHeight: "100vh",
            bgcolor: "#FFFFFF",
            p: "24px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            boxShadow: "-8px 0px 30px rgba(0, 0, 0, 0.12)",
            borderLeft: "1px solid #E2E8F0",
            zIndex: 1400,
          },
        },
      }}
    >
      {/* Scrollable Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: "4px",
          },
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Top Title & Close Button Row */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "26px",
                    lineHeight: "34px",
                    color: "#000000",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Postcode {postcodeDisplay}
                </Typography>

                {/* Class Badge (e.g. Building / Unit) */}
                <Box
                  sx={{
                    px: "10px",
                    py: "3px",
                    borderRadius: "4px",
                    bgcolor: "rgba(0, 0, 255, 0.08)",
                    color: "#0000FF",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    fontWeight: 500,
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  }}
                >
                  {/* Building / Unit icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2 22H22M3 22V5C3 3.9 3.9 3 5 3H13C14.1 3 15 3.9 15 5V22M15 11H19C20.1 11 21 11.9 21 13V22M7 7H11M7 11H11M7 15H11"
                      stroke="#0000FF"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item.classType}
                </Box>

                {/* Status Badge */}
                <Box
                  sx={{
                    px: "10px",
                    py: "3px",
                    borderRadius: "3px",
                    bgcolor: "#F3FAF4",
                    color: "#3F8E50",
                    fontSize: "13px",
                    fontWeight: 500,
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                      stroke="#3F8E50"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.75 12L10.58 14.83L16.25 9.17"
                      stroke="#3F8E50"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item.status}
                </Box>
              </Box>

              {/* Subtitle / Full Address Label */}
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "15px",
                  color: "#5A5A5A",
                  lineHeight: "24px",
                }}
              >
                {item.addressLabel}
                {item.area ? `, ${item.area}` : ""}, {item.emirate}
              </Typography>
            </Box>

            {/* Close Circle Button */}
            <IconButton
              onClick={onClose}
              size="small"
              title="Close Details"
              sx={{
                p: 0.5,
                color: "#000000",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#F0F6FC",
                  color: "#0000FF",
                },
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.17 14.83L14.83 9.17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.83 14.83L9.17 9.17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ width: "100%", height: "1px", bgcolor: "#F0F6FC" }} />

        {/* Tier Tabs (Figma Tier 1, Tier 2, Tier 3, Tier 4 selector) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
          }}
        >
          {[
            { tier: 1 as const, val: t1Val },
            { tier: 2 as const, val: t2Val },
            { tier: 3 as const, val: t3Val },
            { tier: 4 as const, val: t4Val },
          ].map(({ tier, val }) => {
            const isActive = activeTier === tier;
            return (
              <Box
                key={tier}
                onClick={() => setActiveTier(tier)}
                sx={{
                  flex: 1,
                  height: 38,
                  borderRadius: "8px",
                  bgcolor: isActive ? "rgba(235, 134, 31, 0.85)" : "#FFFFFF",
                  border: isActive ? "none" : "1px solid #DEDEDE",
                  color: isActive ? "#FFFFFF" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                  "&:hover": {
                    bgcolor: isActive ? "rgba(235, 134, 31, 0.95)" : "#F8FAFC",
                    borderColor: isActive ? "none" : "#CBD5E1",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  Tier {tier}
                </Typography>
                <Typography sx={{ fontSize: "12px", opacity: 0.8 }}>→</Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {val}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Mini Map View with Search Overlay */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Map search box overlay on top-left of map */}
          <Box
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 500,
              display: "flex",
              alignItems: "center",
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
              height: 30,
              overflow: "hidden",
            }}
          >
            <InputBase
              placeholder="Search postcode..."
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
              sx={{
                px: 1,
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12px",
                width: 130,
                color: "#000000",
                "& input::placeholder": {
                  color: "#919191",
                  opacity: 1,
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                minWidth: 28,
                width: 28,
                height: 30,
                p: 0,
                borderRadius: 0,
                bgcolor: "#0000FF",
                boxShadow: "none",
                "&:hover": { bgcolor: "#0000CC", boxShadow: "none" },
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                  fill="white"
                />
              </svg>
            </Button>
          </Box>

          {/* Leaflet Mini Map */}
          <PostcodeMiniMap
            latitude={lat}
            longitude={lng}
            activeTier={activeTier}
            chipTier4={t4Val}
          />
        </Box>

        {/* Collapsible Section 1: Postal Address */}
        <Box
          sx={{
            border: "1px solid #F0F6FC",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Box
            onClick={() => setIsPostalAddressOpen(!isPostalAddressOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "14px 16px",
              bgcolor: "#FFFFFF",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                color: "#000000",
              }}
            >
              Postal Address
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                transform: isPostalAddressOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Box>
          </Box>

          <Collapse in={isPostalAddressOpen}>
            <Box sx={{ p: "0 16px 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Digital Postcode
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#000000" }}>
                  {postcodeDisplay}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Address ID
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#000000" }}>
                  {item.addressId}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Grid Cell
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 600, color: "#000000" }}>
                  {item.t4 || `Cell ${t4Val}`}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Collapsible Section 2: Location Details (Expanded by default) */}
        <Box
          sx={{
            border: "1px solid #F0F6FC",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Box
            onClick={() => setIsLocationDetailsOpen(!isLocationDetailsOpen)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "14px 16px",
              bgcolor: "#FFFFFF",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                color: "#000000",
              }}
            >
              Location Details
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                transform: isLocationDetailsOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="#5A5A5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Box>
          </Box>

          <Collapse in={isLocationDetailsOpen}>
            <Box sx={{ p: "0 16px 16px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Recipient Name */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Recipient Name
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.addressLabel}
                </Typography>
              </Box>

              {/* Organization Name */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Organization Name
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.buildingName || item.addressLabel}
                </Typography>
              </Box>

              {/* Address Type */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Address Type
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.classType}
                </Typography>
              </Box>

              {/* Unit Number */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Unit Number
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.unitNumber || "-"}
                </Typography>
              </Box>

              {/* Street */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Street
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  Al Tahani Street
                </Typography>
              </Box>

              {/* Area Locality */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Area Locality
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.area || "Burj Khalifa"}
                </Typography>
              </Box>

              {/* Emirate Admin Area */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Emirate Admin Area
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.emirate}
                </Typography>
              </Box>

              {/* Makani number */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Makani number
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.makani !== "-" ? item.makani : "26144 87868"}
                </Typography>
              </Box>

              {/* Onwani code */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  Onwani code
                </Typography>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500, color: "#000000" }}>
                  {item.onwani !== "-" ? item.onwani : "-"}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Drawer>
  );
}

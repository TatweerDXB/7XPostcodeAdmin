"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GRID_STATISTICS_DATA, GridStatItem } from "@/data/portalSearchData";

function renderStatIcon(iconType: GridStatItem["iconType"], color: string) {
  switch (iconType) {
    case "grid-amber":
    case "grid-red":
    case "grid-purple":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
          <rect x="11.5" y="2" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
          <rect x="2" y="11.5" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
          <rect x="11.5" y="11.5" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case "postcodes-teal":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 4H17C17.55 4 18 4.45 18 5V14C18 14.55 17.55 15 17 15H3C2.45 15 2 14.55 2 14V5C2 4.45 2.45 4 3 4Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M2.5 5L10 10.5L17.5 5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "buildings-pink":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 17.5H18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 17.5V3.5C4 2.95 4.45 2.5 5 2.5H11C11.55 2.5 12 2.95 12 3.5V17.5" stroke={color} strokeWidth="1.6" />
          <path d="M12 7.5H15C15.55 7.5 16 7.95 16 8.5V17.5" stroke={color} strokeWidth="1.6" />
          <path d="M7 6H9M7 9H9M7 12H9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "addresses-orange":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.6" />
          <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.6" />
          <path d="M10 2V4M10 16V18M2 10H4M16 10H18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "units-blue":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 8.5L10 3L17 8.5V16.5C17 17.05 16.55 17.5 16 17.5H4C3.45 17.5 3 17.05 3 16.5V8.5Z" stroke={color} strokeWidth="1.6" />
          <path d="M8 17.5V12H12V17.5" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case "makani-purple":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="14" height="14" rx="3" stroke={color} strokeWidth="1.6" />
          <path d="M7 10L9 12L13 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "onwani-brown":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 17.5H17.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 17.5V7L10 2.5L16 7V17.5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="8" y="11" width="4" height="6.5" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "makani-mapped-green":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M9 13.5L4 8.5L8.5 4H15.5V11L10.5 16L9 13.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12.5" cy="7" r="1.5" fill={color} />
        </svg>
      );
    case "onwani-mapped-lime":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 8L10 2.5L17 8V16.5C17 17.05 16.55 17.5 16 17.5H4C3.45 17.5 3 17.05 3 16.5V8Z" stroke={color} strokeWidth="1.6" />
          <path d="M7.5 11L9.5 13L13 9.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "verified-green":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.6" />
          <path d="M7 10L9 12L13.5 7.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "coverage-blue":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3.5" y="2.5" width="13" height="15" rx="2" stroke={color} strokeWidth="1.6" />
          <path d="M7 7H13M7 10.5H13M7 14H10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "postcodes-alert-rose":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5H17V15H3V5Z" stroke={color} strokeWidth="1.6" />
          <path d="M10 8V10.5M10 13H10.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function GridStatisticsPanel() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        p: "20px 18px",
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
      {/* Title Header */}
      <Typography
        sx={{
          fontFamily: "var(--font-cairo), Cairo, sans-serif",
          fontSize: "19px",
          fontWeight: 700,
          color: "#0F172A",
          mb: 2.2,
          letterSpacing: "-0.2px",
        }}
      >
        Grid Statistics
      </Typography>

      {/* 2-column Grid of Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {GRID_STATISTICS_DATA.map((item) => (
          <Box
            key={item.id}
            sx={{
              bgcolor: "#FFFFFF",
              border: `1px solid ${item.borderColor}`,
              borderRadius: "12px",
              p: "14px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 4px 12px ${item.bgColor}`,
              },
            }}
          >
            {/* Top Icon Box */}
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "8px",
                bgcolor: item.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {renderStatIcon(item.iconType, item.color)}
            </Box>

            {/* Label */}
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#64748B",
                lineHeight: 1.25,
                minHeight: 28,
                display: "flex",
                alignItems: "center",
              }}
            >
              {item.label}
            </Typography>

            {/* Value */}
            <Typography
              sx={{
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                color: item.color,
                lineHeight: 1.1,
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

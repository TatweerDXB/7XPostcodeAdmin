"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface PostcodeStatsProps {
  totalPostcodes?: number;
  publishedCount?: number;
  maskedCount?: number;
  emiratesCount?: number;
}

// Mailbox SVG icon matching Figma component 7692:58053
function MailboxSvg({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.58 6.74C5.12 6.36 5.78 6.13 6.5 6.13C7.36 6.13 8.16 6.54 8.84 7.1C9.55 7.77 9.8 8.57 9.8 9.43V16.4H3.2V16.03C3.24 15.5 2.42 15.5 2.47 16.03V16.77C2.47 16.97 2.63 17.13 2.83 17.13H13.83V22.27H12.36V18.23C12.36 17.74 11.63 17.74 11.63 18.23V22.63C11.63 22.84 11.8 23 12 23H14.2C14.4 23 14.57 22.84 14.57 22.63V17.13H22.63C22.83 17.13 23 16.97 23 16.77V9.43C23 7.34 21.06 5.4 18.97 5.4H16.03V1.73H18.6V3.2H17.13C16.64 3.2 16.64 3.93 17.13 3.93H18.97C19.17 3.93 19.33 3.77 19.33 3.57V1.36C19.33 1.16 19.17 1 18.97 1H15.66C15.46 1 15.3 1.16 15.3 1.36V9.12C14.7 9.2 14.2 9.8 14.2 10.53C14.2 11.34 14.86 12 15.66 12C16.47 12 17.13 11.34 17.13 10.53C17.13 9.85 16.66 9.28 16.03 9.12V6.13H18.97C20.63 6.13 22.27 7.4 22.27 9.43V16.4H10.53V9.43C10.53 8.07 9.85 6.86 8.81 6.13H14.2C14.73 6.18 14.73 5.36 14.2 5.4H6.51C5.63 5.4 4.81 5.68 4.15 6.15C3.74 6.43 4.18 7.05 4.58 6.74Z"
        fill={color}
      />
      <path
        d="M2.03 7.6C1.48 7.6 1 8.02 1 8.57V13.97C1 14.51 1.48 14.93 2.03 14.93H8.77C9.27 14.94 9.27 14.19 8.77 14.2H2.37L5.26 11.75L5.89 12.28C6.04 12.37 6.22 12.37 6.37 12.28L7 11.75L8.46 12.98C8.84 13.3 9.31 12.74 8.94 12.42L7.57 11.27L8.94 10.11C9.31 9.79 8.84 9.23 8.46 9.55L6.13 11.52L2.37 8.33H8.04C8.54 8.34 8.54 7.59 8.04 7.6H2.03ZM1.73 8.76L4.7 11.27L1.73 13.78V8.76Z"
        fill={color}
      />
    </svg>
  );
}

// UAE Map Silhouette SVG icon matching Figma component 8217:66884
function UaeMapIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="18" viewBox="0 0 25 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24.56 7.77L22.77 7.84L21.78 7.7V4.3L21.26 3.65H20.51L20.34 3.44L20.16 2.64V1.56L20.28 1.34L20.22 0.26L19.99 0.04H19.76L19.41 0.4L19.35 1.13L19.24 1.27H18.55L18.43 1.13L14.73 1.2L14.5 1.05L14.44 1.63H17.1L17.16 2.86L16.41 3L16.06 3.58V3.94L15.89 4.23H15.31L15.19 4.74L14.84 4.81L14.79 5.24H14.5L14.15 5.68V6.04L13.92 6.4H13.63L13.4 6.69H13.17V6.98L12.76 7.48L12.42 7.56L11.72 8.71H11.32V9.29L11.14 9.51H10.91L10.51 10.01L10.33 10.52H9.47L8.95 10.81L7.73 10.88L7.5 11.09L7.44 12.11H6.69L6.35 11.53L5.3 11.38L5.02 11.02L4.44 11.24H3.05L2.93 11.09H2.47L2.36 10.95V10.59L1.84 10.52L1.6 10.08V9.22L1.84 9V8.86H1.49L1.26 8.57V7.7L0.27 7.77L0.04 8.86L0.39 9.79L0.33 11.24L0.56 12.18L1.6 13.48L2.24 14.56V14.85L2.88 15.86L5.48 16.73L6.75 16.95L7.04 17.23H7.39L7.56 17.52L8.72 17.6L9.41 17.96L11.38 17.88L11.66 17.6H15.13L15.19 17.81H15.31L15.37 17.6L15.6 17.52L15.65 16.95L16.35 16.3L16.58 15.43L17.22 14.85V14.27L17.85 13.77L18.02 13.33V12.54L18.26 11.89L18.2 10.16L18.55 9.72L19.59 9.79L19.7 11.6L19.87 11.89L20.45 12.11L20.63 11.74H20.97V11.6H20.11L19.82 11.38V10.37L20.22 10.16L20.34 9.65H21.61L21.67 11.02H21.78L21.84 8.35H24.56V7.77Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default function PostcodeStatisticsCards({
  totalPostcodes = 27,
  publishedCount = 100,
  maskedCount = 100,
  emiratesCount = 7,
}: PostcodeStatsProps) {
  const cards = [
    {
      id: "total",
      label: "Total Postcode",
      value: totalPostcodes,
      color: "#0000FF",
      iconBg: "#F0F6FC",
      icon: <MailboxSvg color="#0000FF" />,
    },
    {
      id: "published",
      label: "Published Postcode",
      value: publishedCount,
      color: "#3F8E50",
      iconBg: "#EAF7EE",
      icon: <MailboxSvg color="#3F8E50" />,
    },
    {
      id: "masked",
      label: "Masked Postcode",
      value: maskedCount,
      color: "#D83731",
      iconBg: "#FEF2F2",
      icon: <MailboxSvg color="#D83731" />,
    },
    {
      id: "emirates",
      label: "Emirates",
      value: emiratesCount,
      color: "#7E1BFE",
      iconBg: "#EFE4FD",
      icon: <UaeMapIcon color="#7E1BFE" />,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: "16px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {cards.map((c) => (
        <Box
          key={c.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            p: "14px 18px",
            bgcolor: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #EAEFEF",
            boxShadow: "0px 1px 4px rgba(206, 213, 216, 0.2)",
            boxSizing: "border-box",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              boxShadow: "0px 4px 12px rgba(206, 213, 216, 0.35)",
            },
          }}
        >
          {/* Left Icon Pill */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "6px",
              bgcolor: c.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {c.icon}
          </Box>

          {/* Right Label & Value */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#64748B",
                lineHeight: "18px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {c.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                fontSize: "26px",
                fontWeight: 700,
                color: c.color,
                lineHeight: "32px",
              }}
            >
              {c.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

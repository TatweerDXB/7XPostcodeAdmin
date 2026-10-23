"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface GridStatsProps {
  tier1Count?: number;
  tier2Count?: number;
  tier3Count?: number;
  tier4Count?: number;
}

// 4-squares grid icon matching Figma element-3 (component 8121:58014)
function Element3Icon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export default function GridEngineStatsCards({
  tier1Count = 27,
  tier2Count = 100,
  tier3Count = 100,
  tier4Count = 100,
}: GridStatsProps) {
  const cards = [
    {
      id: "t1",
      label: "Tier 1 Grids",
      count: tier1Count,
      sublabel: "UAE Total",
      countColor: "#0000FF",
      iconBg: "#F0F6FC",
      iconColor: "#0000FF",
    },
    {
      id: "t2",
      label: "Tier 2 Grids",
      count: tier2Count,
      sublabel: "Per T1 Grid",
      countColor: "#EB861F",
      iconBg: "rgba(235, 134, 31, 0.1)",
      iconColor: "#EB861F",
    },
    {
      id: "t3",
      label: "Tier 3 Grids",
      count: tier3Count,
      sublabel: "Per T2 Grid",
      countColor: "#3F8E50",
      iconBg: "rgba(63, 142, 80, 0.15)",
      iconColor: "#3F8E50",
    },
    {
      id: "t4",
      label: "Tier 4 Grids",
      count: tier4Count,
      sublabel: "Per T3 Grid",
      countColor: "#7E1BFE",
      iconBg: "#EFE4FD",
      iconColor: "#7E1BFE",
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
      }}
    >
      {cards.map((card) => (
        <Box
          key={card.id}
          sx={{
            bgcolor: "#FFFFFF",
            borderRadius: "12px",
            p: "14px 18px",
            boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            boxSizing: "border-box",
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 14px rgba(206, 213, 216, 0.45)",
            },
          }}
        >
          {/* Icon Box */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "8px",
              bgcolor: card.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Element3Icon color={card.iconColor} />
          </Box>

          {/* Texts */}
          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#000000",
                lineHeight: "18px",
              }}
            >
              {card.label}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px", mt: "2px" }}>
              <Typography
                sx={{
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                  fontSize: "26px",
                  fontWeight: 700,
                  color: card.countColor,
                  lineHeight: "30px",
                }}
              >
                {card.count}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#767676",
                  lineHeight: "16px",
                }}
              >
                {card.sublabel}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

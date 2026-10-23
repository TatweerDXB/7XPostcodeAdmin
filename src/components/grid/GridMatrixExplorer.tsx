"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GridMatrixCell, GRID_MATRIX_CELLS } from "@/data/gridMatrixCells";

interface GridMatrixExplorerProps {
  selectedCell: GridMatrixCell;
  onSelectCell: (cell: GridMatrixCell) => void;
  activeTier: 1 | 2 | 3 | 4;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
  viewMode: "grid" | "list";
  onToggleViewMode: (mode: "grid" | "list") => void;
}

export default function GridMatrixExplorer({
  selectedCell,
  onSelectCell,
  activeTier,
  onSelectTier,
  viewMode,
  onToggleViewMode,
}: GridMatrixExplorerProps) {
  // Lineage pills matching Figma design
  const lineageTabs = [
    { tier: 1 as const, label: "T1", code: "46", color: "#0000FF", iconColor: "#0000FF" },
    { tier: 2 as const, label: "T2", code: "45", color: "#5A5A5A", iconColor: "#64748B" },
    { tier: 3 as const, label: "T3", code: "67", color: "#3F8E50", iconColor: "#3F8E50" },
    { tier: 4 as const, label: "T4", code: "76", color: "#1B8CFE", iconColor: "#1B8CFE" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        p: { xs: "14px", md: "16px" },
        boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.25)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Header: Title, Description & View Switcher */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 700,
              fontSize: { xs: "20px", md: "24px" },
              lineHeight: "32px",
              color: "#000000",
            }}
          >
            Tier {activeTier}(T{activeTier})
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "22px",
              color: "#767676",
            }}
          >
            Select a grid to explore its child grid (T{Math.min(4, activeTier + 1)})
          </Typography>
        </Box>

        {/* View Switch Button matching Figma Switch Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: "4px",
            gap: "6px",
            bgcolor: "#F0F6FC",
            borderRadius: "8px",
            height: 36,
            boxSizing: "border-box",
          }}
        >
          {/* Grid View Toggle */}
          <Box
            onClick={() => onToggleViewMode("grid")}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "4px",
              bgcolor: viewMode === "grid" ? "#0000FF" : "transparent",
              color: viewMode === "grid" ? "#FFFFFF" : "#0000FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </Box>

          {/* List View Toggle */}
          <Box
            onClick={() => onToggleViewMode("list")}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "4px",
              bgcolor: viewMode === "list" ? "#0000FF" : "transparent",
              color: viewMode === "list" ? "#FFFFFF" : "#0000FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="3" rx="1" fill="currentColor" />
              <rect x="3" y="10.5" width="18" height="3" rx="1" fill="currentColor" />
              <rect x="3" y="17" width="18" height="3" rx="1" fill="currentColor" />
            </svg>
          </Box>
        </Box>
      </Box>

      {/* Grid Lineage Selector Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          flexWrap: "wrap",
          p: "2px 0",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "12px",
            color: "#5A5A5A",
            whiteSpace: "nowrap",
          }}
        >
          Grid Lineage:
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, flexWrap: "wrap" }}>
          {lineageTabs.map((tab) => {
            const isTabActive = activeTier === tab.tier;
            return (
              <Box
                key={tab.tier}
                onClick={() => onSelectTier(tab.tier)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  p: "4px 8px",
                  borderRadius: "4px",
                  bgcolor: isTabActive ? "#FFFFFF" : "#F9FBFD",
                  border: isTabActive ? "1px solid #0000FF" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "3px",
                    bgcolor: tab.tier === 1 ? "rgba(0, 0, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="5" height="5" rx="1" fill={tab.iconColor} />
                    <rect x="9" y="2" width="5" height="5" rx="1" fill={tab.iconColor} />
                    <rect x="2" y="9" width="5" height="5" rx="1" fill={tab.iconColor} />
                    <rect x="9" y="9" width="5" height="5" rx="1" fill={tab.iconColor} />
                  </svg>
                </Box>

                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#000000",
                  }}
                >
                  {tab.label}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo)",
                    fontSize: "12px",
                    fontWeight: 400,
                    color: isTabActive ? tab.color : "#5A5A5A",
                  }}
                >
                  ({tab.code})
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 10x10 Spatial Grid Matrix Container */}
      <Box
        sx={{
          width: "100%",
          bgcolor: "#F8FAFC",
          borderRadius: "16px",
          p: { xs: "8px", md: "12px" },
          boxSizing: "border-box",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: "2px",
            width: "100%",
            aspectRatio: "1 / 1",
            bgcolor: "#E2E8F0",
            p: "2px",
            borderRadius: "8px",
            boxSizing: "border-box",
          }}
        >
          {GRID_MATRIX_CELLS.map((cell) => {
            const isSelected = selectedCell.code === cell.code;
            const dotColor =
              cell.density === "high"
                ? "#3F8E50"
                : cell.density === "medium"
                ? "#EB861F"
                : "#D83731";

            return (
              <Box
                key={cell.code}
                onClick={() => onSelectCell(cell)}
                sx={{
                  bgcolor: isSelected
                    ? "#0000FF"
                    : cell.isOutsideUae
                    ? "#F9FBFD"
                    : "#FFFFFF",
                  backgroundImage:
                    cell.isOutsideUae && !isSelected
                      ? "repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(200, 200, 200, 0.45) 5px, rgba(200, 200, 200, 0.45) 6px)"
                      : "none",
                  borderRadius: "2px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  cursor: "pointer",
                  p: "2px",
                  userSelect: "none",
                  transition: "all 0.12s ease",
                  border: isSelected
                    ? "1.5px solid #0000FF"
                    : cell.isOutsideUae
                    ? "0.5px solid #E5E7EB"
                    : "0.5px solid rgba(0, 0, 0, 0.06)",
                  boxShadow: isSelected ? "0px 0px 8px rgba(0, 0, 255, 0.4)" : "none",
                  "&:hover": {
                    transform: isSelected ? "none" : "scale(1.05)",
                    zIndex: 2,
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {/* Cell Number */}
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontWeight: 700,
                    fontSize: { xs: "10px", sm: "12px", md: "13px" },
                    lineHeight: 1.1,
                    color: isSelected ? "#FFFFFF" : "#000000",
                  }}
                >
                  {cell.code}
                </Typography>

                {/* Weight Indicator (Dot + Count) */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: isSelected ? "#FFFFFF" : dotColor,
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 700,
                      fontSize: { xs: "8.5px", sm: "10px", md: "11px" },
                      lineHeight: 1,
                      color: isSelected ? "#FFFFFF" : "#5A5A5A",
                    }}
                  >
                    {cell.count}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Legend Row matching Screenshot 1 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            pt: "8px",
            px: "4px",
          }}
        >
          {/* Default */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 14, height: 14, borderRadius: "2px", bgcolor: "#FFFFFF", border: "1px solid #DEDEDE" }} />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              Default
            </Typography>
          </Box>

          {/* Selected */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 14, height: 14, borderRadius: "2px", bgcolor: "#0000FF" }} />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              Selected
            </Typography>
          </Box>

          {/* Outside UAE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "2px",
                bgcolor: "#F9FBFD",
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent, transparent 3px, #C8C8C8 3px, #C8C8C8 4px)",
                border: "1px solid #DEDEDE",
              }}
            />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              Outside UAE
            </Typography>
          </Box>

          {/* UAE Borders */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "2px",
                border: "1.5px dashed #0000FF",
                bgcolor: "rgba(0, 0, 255, 0.05)",
              }}
            />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              UAE Borders
            </Typography>
          </Box>

          {/* High Addresses */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#3F8E50" }} />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              High Addresses
            </Typography>
          </Box>

          {/* Medium */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#EB861F" }} />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              Medium
            </Typography>
          </Box>

          {/* Low */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#D83731" }} />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              Low
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

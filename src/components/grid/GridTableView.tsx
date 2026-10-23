"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { GridMatrixCell, GRID_MATRIX_CELLS } from "@/data/gridMatrixCells";

interface GridTableViewProps {
  activeTier: 1 | 2 | 3 | 4;
  onSelectTier: (tier: 1 | 2 | 3 | 4) => void;
  viewMode: "grid" | "list";
  onToggleViewMode: (mode: "grid" | "list") => void;
  selectedCell: GridMatrixCell;
  onSelectCell: (cell: GridMatrixCell) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages?: number;
}

export default function GridTableView({
  activeTier,
  onSelectTier,
  viewMode,
  onToggleViewMode,
  selectedCell,
  onSelectCell,
  currentPage,
  onPageChange,
  totalPages = 10,
}: GridTableViewProps) {
  const lineageTabs = [
    { tier: 1 as const, label: "T1", code: "46", color: "#0000FF", iconColor: "#0000FF" },
    { tier: 2 as const, label: "T2", code: "45", color: "#5A5A5A", iconColor: "#64748B" },
    { tier: 3 as const, label: "T3", code: "67", color: "#3F8E50", iconColor: "#3F8E50" },
    { tier: 4 as const, label: "T4", code: "76", color: "#1B8CFE", iconColor: "#1B8CFE" },
  ];

  // Slice 10 items for the current page
  const pageSize = 11;
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = GRID_MATRIX_CELLS.slice(startIndex, startIndex + pageSize);

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#FFFFFF",
        borderRadius: "16px",
        p: { xs: "16px", md: "20px" },
        boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.25)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Header Row */}
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

        {/* View Switch Button */}
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

          {/* List View Toggle (Active) */}
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

      {/* Table Container */}
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          bgcolor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #F1F5F9",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "80px 80px 90px 80px 1.2fr 1.2fr 1.2fr 1.2fr 100px",
            alignItems: "center",
            height: 48,
            px: "16px",
            borderBottom: "1px solid #F1F5F9",
            bgcolor: "#FFFFFF",
            minWidth: 800,
          }}
        >
          {["Full ID", "Cell", "Parent", "Level", "North", "South", "West", "East", "Size"].map((col) => (
            <Typography
              key={col}
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 600,
                fontSize: "13.5px",
                color: "#5A5A5A",
              }}
            >
              {col}
            </Typography>
          ))}
        </Box>

        {/* Table Rows */}
        {pageItems.map((cell) => {
          const isSelected = selectedCell.code === cell.code;
          return (
            <Box
              key={cell.code}
              onClick={() => onSelectCell(cell)}
              sx={{
                display: "grid",
                gridTemplateColumns: "80px 80px 90px 80px 1.2fr 1.2fr 1.2fr 1.2fr 100px",
                alignItems: "center",
                height: 52,
                px: "16px",
                borderBottom: "1px solid #F1F5F9",
                bgcolor: isSelected ? "#F0F6FC" : "#FFFFFF",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                minWidth: 800,
                "&:hover": {
                  bgcolor: isSelected ? "#E5F0FA" : "#F8FAFC",
                },
              }}
            >
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.code}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.code}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                -
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                T{activeTier}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.north}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.south}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.west}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.east}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.size}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Pagination Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "4px",
          py: "8px",
          userSelect: "none",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Numbered Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* << */}
          <IconButton
            size="small"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            sx={{ color: "#000000", p: 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M11 12L7 8L11 4M7 12L3 8L7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>

          {/* < */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            sx={{ color: "#000000", p: 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>

          {/* 1 */}
          <Box
            onClick={() => onPageChange(1)}
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              bgcolor: currentPage === 1 ? "#0000FF" : "transparent",
              color: currentPage === 1 ? "#FFFFFF" : "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: currentPage === 1 ? 700 : 500,
              fontSize: "13px",
              fontFamily: "var(--font-cairo)",
            }}
          >
            1
          </Box>

          {/* 2 */}
          <Box
            onClick={() => onPageChange(2)}
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              bgcolor: currentPage === 2 ? "#0000FF" : "transparent",
              color: currentPage === 2 ? "#FFFFFF" : "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: currentPage === 2 ? 700 : 500,
              fontSize: "13px",
              fontFamily: "var(--font-cairo)",
            }}
          >
            2
          </Box>

          {/* 3 */}
          <Box
            onClick={() => onPageChange(3)}
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              bgcolor: currentPage === 3 ? "#0000FF" : "transparent",
              color: currentPage === 3 ? "#FFFFFF" : "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: currentPage === 3 ? 700 : 500,
              fontSize: "13px",
              fontFamily: "var(--font-cairo)",
            }}
          >
            3
          </Box>

          <Typography sx={{ color: "#8E8E93", px: 0.5, fontSize: "14px" }}>
            ...
          </Typography>

          {/* 6 */}
          <Box
            onClick={() => onPageChange(6)}
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              bgcolor: currentPage === 6 ? "#0000FF" : "transparent",
              color: currentPage === 6 ? "#FFFFFF" : "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontWeight: currentPage === 6 ? 700 : 500,
              fontSize: "13px",
              fontFamily: "var(--font-cairo)",
            }}
          >
            6
          </Box>

          {/* > */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            sx={{ color: "#000000", p: 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>

          {/* >> */}
          <IconButton
            size="small"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            sx={{ color: "#000000", p: 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M5 4L9 8L5 12M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>
        </Box>

        {/* Right Page Dropdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#000000" }}>
            Page
          </Typography>

          <Select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            size="small"
            sx={{
              height: 32,
              fontSize: "13px",
              fontFamily: "var(--font-cairo)",
              bgcolor: "#FFFFFF",
              borderRadius: "6px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#DEDEDE",
              },
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <MenuItem key={num} value={num} sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px" }}>
                {num}
              </MenuItem>
            ))}
          </Select>

          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#000000" }}>
            of {totalPages}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import type { GridEngineCell, GridTier } from "@/services/gridEngineService";

const PAGE_SIZE = 10;

interface GridTableViewProps {
  /** Real cells of the active tier (same list as the matrix) */
  cells: GridEngineCell[];
  /** The cell picked at each tier (the lineage) */
  lineage: Partial<Record<GridTier, GridEngineCell>>;
  /** Cell size of the active tier, e.g. "70 km" (GET /api/grid/tiers) */
  sizeLabel: string;
  activeTier: GridTier;
  onSelectTier: (tier: GridTier) => void;
  viewMode: "grid" | "list";
  onToggleViewMode: (mode: "grid" | "list") => void;
  selectedCell: GridEngineCell | null;
  onSelectCell: (cell: GridEngineCell) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  error?: string | null;
}

export default function GridTableView({
  cells,
  lineage,
  sizeLabel,
  activeTier,
  onSelectTier,
  viewMode,
  onToggleViewMode,
  selectedCell,
  onSelectCell,
  currentPage,
  onPageChange,
  loading = false,
  error = null,
}: GridTableViewProps) {
  // Lineage pills: the code picked at each tier; a tier opens once its parent is picked
  const lineageTabs = (
    [
      { tier: 1, label: "T1", color: "#0000FF", iconColor: "#0000FF" },
      { tier: 2, label: "T2", color: "#5A5A5A", iconColor: "#64748B" },
      { tier: 3, label: "T3", color: "#3F8E50", iconColor: "#3F8E50" },
      { tier: 4, label: "T4", color: "#1B8CFE", iconColor: "#1B8CFE" },
    ] as const
  ).map((pill) => ({
    ...pill,
    code: lineage[pill.tier]?.segment ?? "—",
    enabled: pill.tier === 1 || Boolean(lineage[(pill.tier - 1) as GridTier]),
  }));

  const totalPages = Math.max(1, Math.ceil(cells.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const coord = (value: number | undefined) => (value != null ? value.toFixed(7) : "—");
  /** Parent code: the cell's code without its own segment */
  const parentCode = (cell: GridEngineCell) =>
    cell.tier === 1 ? "-" : cell.displayCode.split("-").slice(0, -1).join("-");

  const pageItems = cells.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            {activeTier < 4
              ? `Select a grid to explore its child grid (T${activeTier + 1})`
              : "Select a T4 cell to see its postcodes and addresses"}
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
                onClick={() => tab.enabled && onSelectTier(tab.tier)}
                title={tab.enabled ? undefined : `Select a T${tab.tier - 1} cell first`}
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
        {(loading || error || pageItems.length === 0) && (
          <Box sx={{ p: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, minWidth: 800 }}>
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#0000FF" }} />
            ) : (
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: error ? "#B42318" : "#5A5A5A" }}>
                {error ||
                  (activeTier > 1 && lineage[(activeTier - 1) as GridTier]
                    ? `No T${activeTier} cells are loaded under ${lineage[(activeTier - 1) as GridTier]!.displayCode} on this server yet.`
                    : "No grid cells at this level.")}
              </Typography>
            )}
          </Box>
        )}
        {!loading && !error && pageItems.map((cell) => {
          const isSelected = selectedCell?.gridId === cell.gridId;
          return (
            <Box
              key={cell.gridId}
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
                {cell.displayCode}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {cell.segment}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {parentCode(cell)}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                T{cell.tier}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {coord(cell.bounds?.north)}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {coord(cell.bounds?.south)}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {coord(cell.bounds?.west)}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {coord(cell.bounds?.east)}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#000000" }}>
                {sizeLabel}
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
            disabled={page === 1}
            sx={{ color: "#000000", p: 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M11 12L7 8L11 4M7 12L3 8L7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>

          {/* < */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            sx={{ color: "#000000", p: 0.6 }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </IconButton>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <Box
              key={num}
              onClick={() => onPageChange(num)}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                bgcolor: page === num ? "#0000FF" : "transparent",
                color: page === num ? "#FFFFFF" : "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: page === num ? 700 : 500,
                fontSize: "13px",
                fontFamily: "var(--font-cairo)",
              }}
            >
              {num}
            </Box>
          ))}

          {/* > */}
          <IconButton
            size="small"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
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
            disabled={page === totalPages}
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
            value={page}
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

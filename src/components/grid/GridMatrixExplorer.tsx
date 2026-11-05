"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import {
  densityOf,
  formatCompact,
  rowsCountFromNorth,
  type GridEngineCell,
  type GridTier,
} from "@/services/gridEngineService";

/** Lineage pill colours per tier */
const TIER_PILLS: { tier: GridTier; label: string; color: string; iconColor: string }[] = [
  { tier: 1, label: "T1", color: "#0000FF", iconColor: "#0000FF" },
  { tier: 2, label: "T2", color: "#5A5A5A", iconColor: "#64748B" },
  { tier: 3, label: "T3", color: "#3F8E50", iconColor: "#3F8E50" },
  { tier: 4, label: "T4", color: "#1B8CFE", iconColor: "#1B8CFE" },
];

/**
 * Dashed outline around the cells that exist, in the matrix's 0–100 viewBox (display row 0 = north edge).
 */
function coverageOutline(present: boolean[][]): string {
  const step = 10;
  const parts: string[] = [];
  const has = (r: number, c: number) => r >= 0 && r < 10 && c >= 0 && c < 10 && present[r][c];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (!present[r][c]) continue;
      const x = c * step;
      const y = r * step;
      if (!has(r - 1, c)) parts.push(`M${x} ${y}H${x + step}`);
      if (!has(r + 1, c)) parts.push(`M${x} ${y + step}H${x + step}`);
      if (!has(r, c - 1)) parts.push(`M${x} ${y}V${y + step}`);
      if (!has(r, c + 1)) parts.push(`M${x + step} ${y}V${y + step}`);
    }
  }
  return parts.join("");
}

interface GridMatrixExplorerProps {
  /** Real cells of the active tier (T1: all; T2–T4: children of the parent picked one tier up) */
  cells: GridEngineCell[];
  /** The cell picked at each tier (the lineage) */
  lineage: Partial<Record<GridTier, GridEngineCell>>;
  /** gridId → has a sub-grid (green dot); missing = not known yet */
  subGrids?: Record<string, boolean>;
  selectedCell: GridEngineCell | null;
  onSelectCell: (cell: GridEngineCell) => void;
  activeTier: GridTier;
  onSelectTier: (tier: GridTier) => void;
  loading?: boolean;
  error?: string | null;
  viewMode: "grid" | "list";
  onToggleViewMode: (mode: "grid" | "list") => void;
}

export default function GridMatrixExplorer({
  cells,
  lineage,
  subGrids = {},
  selectedCell,
  onSelectCell,
  activeTier,
  onSelectTier,
  viewMode,
  onToggleViewMode,
  loading = false,
  error = null,
}: GridMatrixExplorerProps) {
  // Lineage pills: the code picked at each tier; a tier opens once its parent is picked
  const lineageTabs = TIER_PILLS.map((pill) => ({
    ...pill,
    code: lineage[pill.tier]?.segment ?? "—",
    enabled: pill.tier === 1 || Boolean(lineage[(pill.tier - 1) as GridTier]),
  }));

  // Place each real cell in its parent's 10 × 10 block (display row 0 = north); the row direction is read from the data
  const fromNorth = rowsCountFromNorth(cells);
  const grid: (GridEngineCell | null)[][] = Array.from({ length: 10 }, () => Array<GridEngineCell | null>(10).fill(null));
  cells.forEach((cell) => {
    if (cell.row >= 0 && cell.row <= 9 && cell.col >= 0 && cell.col <= 9) {
      grid[fromNorth ? cell.row : 9 - cell.row][cell.col] = cell;
    }
  });
  const maxCount = Math.max(0, ...cells.map((c) => c.postcodeCount ?? 0));
  const outline = coverageOutline(grid.map((row) => row.map((cell) => Boolean(cell && !cell.masked))));

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
            {activeTier < 4
              ? `Select a grid to explore its child grid (T${activeTier + 1})`
              : "Select a T4 cell to see its postcodes and addresses"}
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
                  cursor: tab.enabled ? "pointer" : "not-allowed",
                  opacity: tab.enabled ? 1 : 0.5,
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
        <Box sx={{ position: "relative", width: "100%" }}>
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
            {grid.flatMap((row, r) =>
              row.map((cell, c) => {
                const key = `${r}-${c}`;
                // No cell at this position: outside the territory / coverage
                if (!cell) {
                  return (
                    <Box
                      key={key}
                      sx={{
                        bgcolor: "#F9FBFD",
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent, transparent 5px, rgba(200, 200, 200, 0.45) 5px, rgba(200, 200, 200, 0.45) 6px)",
                        borderRadius: "2px",
                        border: "0.5px solid #E5E7EB",
                      }}
                    />
                  );
                }
                const isSelected = selectedCell?.gridId === cell.gridId;
                const isOutside = cell.masked;
                const density = densityOf(cell.postcodeCount, maxCount);
                const dotColor = density === "high" ? "#3F8E50" : density === "medium" ? "#EB861F" : "#D83731";

                return (
                  <Box
                    key={key}
                    onClick={() => onSelectCell(cell)}
                    title={`${cell.displayCode} · ${cell.postcodeCount ?? 0} postcodes`}
                    sx={{
                      bgcolor: isSelected ? "#0000FF" : isOutside ? "#F9FBFD" : "#FFFFFF",
                      backgroundImage:
                        isOutside && !isSelected
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
                      position: "relative",
                      userSelect: "none",
                      transition: "all 0.12s ease",
                      border: isSelected
                        ? "1.5px solid #0000FF"
                        : isOutside
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
                    {/* Has a sub-grid at the next tier */}
                    {subGrids[cell.gridId] && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 3,
                          right: 3,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: isSelected ? "#FFFFFF" : "#22C55E",
                          boxShadow: "0 0 0 1px #FFFFFF",
                        }}
                      />
                    )}

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
                      {cell.segment}
                    </Typography>

                    {/* Weight Indicator (Dot + Postcode Count) */}
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
                        {formatCompact(cell.postcodeCount)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          {/* Boundary Overlay: outer edge of the cells that exist */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              width: "calc(100% - 4px)",
              height: "calc(100% - 4px)",
              pointerEvents: "none",
              zIndex: 3,
              overflow: "visible",
            }}
          >
            <path
              d={outline}
              fill="none"
              stroke="#0000FF"
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {(loading || error || cells.length === 0) && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                bgcolor: "rgba(248, 250, 252, 0.85)",
                borderRadius: "8px",
                textAlign: "center",
                px: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "#0000FF" }} />
              ) : (
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: error ? "#B42318" : "#5A5A5A" }}>
                  {error ||
                    (activeTier > 1 && lineage[(activeTier - 1) as GridTier]
                      ? `No T${activeTier} cells are loaded under ${lineage[(activeTier - 1) as GridTier]!.displayCode} on this server yet. Pick a T${activeTier - 1} cell with a green dot.`
                      : "No grid cells at this level.")}
                </Typography>
              )}
            </Box>
          )}
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

          {/* Has Sub-grid */}
          {activeTier < 4 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#22C55E" }} />
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
                Has T{activeTier + 1} Grid
              </Typography>
            </Box>
          )}

          {/* High Postcodes */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#3F8E50" }} />
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
              High Postcodes
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

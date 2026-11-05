"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  GridEngineStatsCards,
  GridMatrixExplorer,
  GridCellInspectorCard,
  GridTableView,
} from "@/components/grid";
import AddressRegistryGridMap from "@/components/address/AddressRegistryGridMap";
import { ApiError } from "@/services/apiClient";
import {
  gridEngineService,
  formatCellSize,
  type GridEngineCell,
  type GridTier,
  type GridTierInfo,
} from "@/services/gridEngineService";

type Lineage = Partial<Record<GridTier, GridEngineCell>>;

const TIERS: GridTier[] = [1, 2, 3, 4];

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "You do not have permission to view the grid (Grid_Read).";
    if (err.status === 429) return "Too many requests. Please wait a moment and try again.";
    if (err.status === 502 || err.status === 503) return "The grid service is unavailable. Please try again shortly.";
  }
  return "Could not load the grid cells. Please try again.";
}

/** Keep the picks above `tier`, set `cell` at `tier`, drop everything below. */
function withPick(lineage: Lineage, tier: GridTier, cell: GridEngineCell): Lineage {
  const next: Lineage = {};
  TIERS.filter((t) => t < tier).forEach((t) => {
    if (lineage[t]) next[t] = lineage[t];
  });
  next[tier] = cell;
  return next;
}

/** Which cells have a sub-grid, probed a few at a time (results are cached per cell). */
async function probeSubGrids(cells: GridEngineCell[], onResult: (gridId: string, has: boolean) => void) {
  let cursor = 0;
  const worker = async () => {
    while (cursor < cells.length) {
      const cell = cells[cursor++];
      try {
        onResult(cell.gridId, await gridEngineService.hasChildren(cell));
      } catch {
        // leave unknown
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, cells.length) }, worker));
}

export default function PostcodeGridEnginePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTier, setActiveTier] = useState<GridTier>(1);
  const [lineage, setLineage] = useState<Lineage>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpandedMapOpen, setIsExpandedMapOpen] = useState(false);

  // Cells of the active tier: T1 = all T1 cells; T2–T4 = children of the cell picked one tier up
  const parentCell = activeTier === 1 ? null : lineage[(activeTier - 1) as GridTier] ?? null;
  const cellsKey = activeTier === 1 ? "root" : parentCell?.gridId ?? null;
  const [loaded, setLoaded] = useState<{ key: string; cells: GridEngineCell[]; error: string | null } | null>(null);
  const isLoading = cellsKey !== null && loaded?.key !== cellsKey;
  const cells = loaded && loaded.key === cellsKey ? loaded.cells : [];
  const cellsError = loaded && loaded.key === cellsKey ? loaded.error : null;

  // Cells known to have a sub-grid (green dot); the dev grid is only partly populated
  const [subGrids, setSubGrids] = useState<Record<string, boolean>>({});

  // Tier sizes and UAE totals: once
  const [tiers, setTiers] = useState<GridTierInfo[]>([]);
  const [totals, setTotals] = useState<Partial<Record<GridTier, number>>>({});

  useEffect(() => {
    gridEngineService.loadTiers().then(setTiers).catch(() => setTiers([]));
    gridEngineService.loadTierTotals().then(setTotals).catch(() => setTotals({}));
  }, []);

  useEffect(() => {
    if (cellsKey === null) return;
    let cancelled = false;
    const tier = activeTier;
    gridEngineService
      .loadCells(parentCell)
      .then((result) => {
        if (cancelled) return;
        setLoaded({ key: cellsKey, cells: result, error: null });
        // Mark which cells can be drilled into (green dot)
        if (tier < 4) {
          probeSubGrids(result, (gridId, has) => !cancelled && setSubGrids((prev) => ({ ...prev, [gridId]: has })));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setLoaded({ key: cellsKey, cells: [], error: describeError(err) });
      });
    return () => {
      cancelled = true;
    };
    // parentCell is identified by cellsKey (its gridId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellsKey, activeTier]);

  // Highlighted in the matrix: the pick at the tier on screen (none until you click one)
  const selectedCell = lineage[activeTier] ?? null;
  // Shown in the inspector: the last cell picked (on a freshly opened tier, the parent you just drilled into)
  const inspectedCell = selectedCell ?? (activeTier > 1 ? lineage[(activeTier - 1) as GridTier] ?? null : null);
  const sizeLabel = formatCellSize(tiers.find((t) => t.tier === (inspectedCell?.tier ?? activeTier))?.cellSizeM);

  /**
   * Same as the Search Console: picking a T1–T3 cell opens its children at the next tier; a T4 pick is final.
   * A cell already known to have no sub-grid is selected without moving into an empty tier.
   */
  const handleSelectCell = (cell: GridEngineCell) => {
    setLineage((prev) => withPick(prev, cell.tier, cell));
    if (cell.tier < 4 && subGrids[cell.gridId] !== false) {
      setActiveTier((cell.tier + 1) as GridTier);
      setCurrentPage(1);
    }
  };

  const handleSelectTier = (tier: GridTier) => {
    setActiveTier(tier);
    setCurrentPage(1);
  };

  const mapHierarchy = inspectedCell
    ? TIERS.filter((t) => t <= inspectedCell.tier && lineage[t]).map((t) => ({
        tier: t,
        gridId: lineage[t]!.gridId,
        segment: lineage[t]!.segment,
        geometry: lineage[t]!.geometry,
      }))
    : [];

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: { xs: "16px 20px 32px 20px", md: "24px 32px 48px 32px" },
        bgcolor: "#F9FBFD",
        boxSizing: "border-box",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Page Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: { xs: "24px", md: "28px" },
          lineHeight: "34px",
          color: "#000000",
        }}
      >
        Postcode Grid Engine
      </Typography>

      {/* Top 4 KPI Metrics Cards: UAE-wide cell count per tier */}
      <GridEngineStatsCards
        tier1Count={totals[1] ?? null}
        tier2Count={totals[2] ?? null}
        tier3Count={totals[3] ?? null}
        tier4Count={totals[4] ?? null}
      />

      {/* Main View: Grid Matrix View vs List Table View */}
      {viewMode === "grid" ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.25fr 1fr", xl: "1.3fr 1fr" },
            gap: "24px",
            width: "100%",
            alignItems: "flex-start",
          }}
        >
          {/* Left: 10x10 Matrix Explorer */}
          <GridMatrixExplorer
            cells={cells}
            lineage={lineage}
            subGrids={subGrids}
            selectedCell={selectedCell}
            onSelectCell={handleSelectCell}
            activeTier={activeTier}
            onSelectTier={handleSelectTier}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            loading={isLoading}
            error={cellsError}
          />

          {/* Right: Current Cell Inspector Card */}
          <GridCellInspectorCard
            cell={inspectedCell}
            lineage={lineage}
            sizeLabel={sizeLabel}
            activeTier={activeTier}
            onExpandMap={() => setIsExpandedMapOpen(true)}
          />
        </Box>
      ) : (
        /* List View: Full Width Table */
        <GridTableView
          cells={cells}
          lineage={lineage}
          sizeLabel={sizeLabel}
          activeTier={activeTier}
          onSelectTier={handleSelectTier}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          selectedCell={selectedCell}
          onSelectCell={handleSelectCell}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          loading={isLoading}
          error={cellsError}
        />
      )}

      {/* Expanded real-grid map of the selected cell */}
      <Dialog
        open={isExpandedMapOpen && Boolean(inspectedCell)}
        onClose={() => setIsExpandedMapOpen(false)}
        fullWidth
        maxWidth="lg"
        slotProps={{ paper: { sx: { borderRadius: "12px", overflow: "hidden" } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "12px 16px" }}>
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontWeight: 700, fontSize: "16px" }}>
            {inspectedCell ? `Cell ${inspectedCell.displayCode} (T${inspectedCell.tier})` : ""}
          </Typography>
          <IconButton size="small" onClick={() => setIsExpandedMapOpen(false)} aria-label="Close map">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ width: "100%", height: "75vh" }}>
          {inspectedCell && <AddressRegistryGridMap activeTier={inspectedCell.tier} hierarchy={mapHierarchy} />}
        </Box>
      </Dialog>
    </Box>
  );
}

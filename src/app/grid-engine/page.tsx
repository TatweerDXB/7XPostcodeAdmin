"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  GridEngineStatsCards,
  GridMatrixExplorer,
  GridCellInspectorCard,
  GridTableView,
} from "@/components/grid";
import { GRID_MATRIX_CELLS, GridMatrixCell } from "@/data/gridMatrixCells";
import { PostcodeExpandedMapModal } from "@/components/postcode";
import type { PostcodeItem } from "@/data/postcodeListData";

export default function PostcodeGridEnginePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(1);

  // Default to cell 46 as shown in Screenshot 1
  const defaultCell =
    GRID_MATRIX_CELLS.find((c) => c.code === "46") || GRID_MATRIX_CELLS[46] || GRID_MATRIX_CELLS[0];
  const [selectedCell, setSelectedCell] = useState<GridMatrixCell>(defaultCell);

  // Pagination for table view
  const [currentPage, setCurrentPage] = useState(1);

  // Expanded map modal state
  const [isExpandedMapOpen, setIsExpandedMapOpen] = useState(false);

  // Synthesize a PostcodeItem representation for the modal
  const modalItem: PostcodeItem = {
    id: `cell-${selectedCell.code}`,
    rowNumber: 1,
    postcode: `46-45-67-${selectedCell.code}`,
    chips: { tier1: "46", tier2: "45", tier3: "67", tier4: selectedCell.code },
    emirate: "Dubai",
    status: "Published",
    title: `Grid Cell ${selectedCell.code}`,
    subtitle: `UAE > Dubai > Sector 46`,
    area: "Dubai Central Sector",
    latitude: selectedCell.latitude,
    longitude: selectedCell.longitude,
    gridInfo: {
      tierLabel: `T${activeTier}-${selectedCell.code}`,
      buildingsCount: 134,
      unitsCount: 1567,
      recipientsCount: 467,
    },
    locationDetails: {
      building: "Sector Hub 46",
      location: "Central District 46",
      emirate: "Dubai",
      area: "Downtown Sector",
      latitude: selectedCell.latitude,
      longitude: selectedCell.longitude,
    },
    linkedRecords: {
      totalCount: selectedCell.addressesCount,
      items: [],
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
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

      {/* Top 4 KPI Metrics Cards */}
      <GridEngineStatsCards
        tier1Count={27}
        tier2Count={100}
        tier3Count={100}
        tier4Count={100}
      />

      {/* Main View: Grid Matrix View (Screenshot 1) vs List Table View (Screenshot 2) */}
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
            selectedCell={selectedCell}
            onSelectCell={setSelectedCell}
            activeTier={activeTier}
            onSelectTier={setActiveTier}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
          />

          {/* Right: Current Cell Inspector Card */}
          <GridCellInspectorCard
            cell={selectedCell}
            activeTier={activeTier}
            onExpandMap={() => setIsExpandedMapOpen(true)}
          />
        </Box>
      ) : (
        /* List View (Screenshot 2: Full Width Table) */
        <GridTableView
          activeTier={activeTier}
          onSelectTier={setActiveTier}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={10}
        />
      )}

      {/* Full-Screen Expanded Map View Modal */}
      <PostcodeExpandedMapModal
        open={isExpandedMapOpen}
        onClose={() => setIsExpandedMapOpen(false)}
        item={modalItem}
      />
    </Box>
  );
}

"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { GRID_TREE_DATA, GridCellNode } from "@/data/gridEngineData";
import GridCellDetailsCard from "@/components/grid/GridCellDetailsCard";

export default function PostcodeGridEnginePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmirate, setSelectedEmirate] = useState("All Emirates");
  const [emirateMenuAnchor, setEmirateMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTierTab, setSelectedTierTab] = useState<1 | 2 | 3 | 4>(1);
  const [selectedNode, setSelectedNode] = useState<GridCellNode | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const emiratesList = [
    "All Emirates",
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ];

  const handleOpenEmirateMenu = (event: React.MouseEvent<HTMLElement>) => {
    setEmirateMenuAnchor(event.currentTarget);
  };

  const handleSelectEmirate = (emirate: string) => {
    setSelectedEmirate(emirate);
    setEmirateMenuAnchor(null);
  };

  const toggleExpand = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodeIds((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleSelectCell = (node: GridCellNode) => {
    setSelectedNode(node);
  };

  const handleCloseDetails = () => {
    setSelectedNode(null);
  };

  // Filter items based on search query and emirate
  const queryTrimmed = searchQuery.trim().toLowerCase();
  const filterNode = (node: GridCellNode): boolean => {
    const matchesEmirate =
      selectedEmirate === "All Emirates" || node.emirate === selectedEmirate;
    const matchesQuery =
      !queryTrimmed ||
      node.cellCode.toLowerCase().includes(queryTrimmed) ||
      node.area.toLowerCase().includes(queryTrimmed) ||
      node.emirate.toLowerCase().includes(queryTrimmed) ||
      node.containsText.toLowerCase().includes(queryTrimmed);

    return matchesEmirate && matchesQuery;
  };

  const filteredTree = GRID_TREE_DATA.filter((node) => {
    if (filterNode(node)) return true;
    if (node.children && node.children.some(filterNode)) return true;
    return false;
  });

  // Render recursive tree row
  const renderTreeRow = (node: GridCellNode, depth: number = 0) => {
    const isExpanded = !!expandedNodeIds[node.id];
    const hasChildren = !!node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    // Indentation based on tier level depth
    const paddingLeft = depth === 0 ? "16px" : `${16 + depth * 20}px`;

    return (
      <React.Fragment key={node.id}>
        <Box
          onClick={() => handleSelectCell(node)}
          sx={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 110px",
            alignItems: "center",
            minHeight: 56,
            py: "8px",
            pl: paddingLeft,
            pr: "16px",
            borderBottom: "1px solid #F0F6FC",
            bgcolor: isSelected ? "#F0F6FC" : "#FFFFFF",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: isSelected ? "#E5F0FA" : "#F8FAFC",
            },
          }}
        >
          {/* Grid Cell Name Column */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Cell Code with light blue background pill */}
            <Box
              sx={{
                px: "10px",
                py: "3px",
                borderRadius: "4px",
                bgcolor: "rgba(0, 0, 255, 0.05)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: depth === 0 ? "14.5px" : "13.5px",
                  color: "#000000",
                }}
              >
                {node.cellCode}
              </Typography>
            </Box>
          </Box>

          {/* Contains Column */}
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "#000000",
            }}
          >
            {node.containsText}
          </Typography>

          {/* Actions Column (Eye Button + Chevron Expand Button) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "8px",
            }}
          >
            {/* Eye Action Button (Frame 9170 in Figma) */}
            <Box
              onClick={(e) => {
                e.stopPropagation();
                handleSelectCell(node);
              }}
              sx={{
                width: 34,
                height: 34,
                borderRadius: "8px",
                bgcolor: "#F0F6FC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#E2EEFC",
                },
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15.58 12C15.58 13.98 13.98 15.58 12 15.58C10.02 15.58 8.42 13.98 8.42 12C8.42 10.02 10.02 8.42 12 8.42C13.98 8.42 15.58 10.02 15.58 12Z"
                  stroke="#0000FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.47 3.71997 5.18 5.79997 2.89 9.39997C1.99 10.81 1.99 13.18 2.89 14.59C5.18 18.19 8.47 20.27 12 20.27Z"
                  stroke="#0000FF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>

            {/* Chevron Action Button (Frame 9172 in Figma) */}
            {hasChildren ? (
              <Box
                onClick={(e) => toggleExpand(node.id, e)}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "8px",
                  bgcolor: "#F0F6FC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#E2EEFC",
                  },
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <path
                    d="M3.5 6L8 10.5L12.5 6"
                    stroke="#5A5A5A"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Box>
            ) : (
              <Box sx={{ width: 34, height: 34 }} />
            )}
          </Box>
        </Box>

        {/* Child Rows when expanded */}
        {hasChildren &&
          isExpanded &&
          node.children!.map((child) => renderTreeRow(child, depth + 1))}

        {/* Load more link if children expanded at level 2/3 */}
        {hasChildren && isExpanded && depth > 0 && (
          <Box
            sx={{
              pl: `${16 + (depth + 1) * 20}px`,
              py: "8px",
              borderBottom: "1px solid #F0F6FC",
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0000FF",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Load more...
            </Typography>
          </Box>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: "24px 32px 48px 32px",
        bgcolor: "#F9FBFD",
        boxSizing: "border-box",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Split View Container */}
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          width: "100%",
          alignItems: "flex-start",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Left Container (Table + Search + Tabs + Pagination) */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Top Search & Filter Bar (Frame 9155 in Figma) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: "16px",
              gap: "12px",
              bgcolor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.15)",
              boxSizing: "border-box",
            }}
          >
            {/* Search Input with Blue Search Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                maxWidth: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#FFFFFF",
                  border: "1px solid #DEDEDE",
                  borderRight: "none",
                  borderRadius: "4px 0 0 4px",
                  height: 32,
                  flex: 1,
                  px: 1.2,
                  boxSizing: "border-box",
                }}
              >
                <InputBase
                  placeholder="Search by cell, Area or Emirate"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    flex: 1,
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "13px",
                    color: "#000000",
                    "& input::placeholder": {
                      color: "#919191",
                      opacity: 1,
                    },
                  }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery("")}
                    sx={{ color: "#919191", p: 0.2 }}
                  >
                    <ClearIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>

              {/* Blue Magnifying Glass Search Button */}
              <Button
                variant="contained"
                sx={{
                  minWidth: 34,
                  width: 34,
                  height: 32,
                  p: 0,
                  borderRadius: "0 4px 4px 0",
                  bgcolor: "#0000FF",
                  boxShadow: "none",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#0000CC",
                    boxShadow: "none",
                  },
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                    fill="white"
                  />
                </svg>
              </Button>
            </Box>

            {/* Emirate Dropdown Filter (Frame 9156 in Figma) */}
            <Box
              onClick={handleOpenEmirateMenu}
              sx={{
                height: 32,
                px: "10px",
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                userSelect: "none",
                flexShrink: 0,
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: "#0000FF",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "13.5px",
                  color: "#000000",
                }}
              >
                {selectedEmirate}
              </Typography>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#000000" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            </Box>

            <Menu
              anchorEl={emirateMenuAnchor}
              open={Boolean(emirateMenuAnchor)}
              onClose={() => setEmirateMenuAnchor(null)}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: {
                    mt: 1,
                    minWidth: 150,
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                  },
                },
              }}
            >
              {emiratesList.map((em) => (
                <MenuItem
                  key={em}
                  onClick={() => handleSelectEmirate(em)}
                  selected={selectedEmirate === em}
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "13.5px",
                  }}
                >
                  {em}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* 4 Tier Navigation Tabs */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Tier 1 */}
            <Box
              onClick={() => setSelectedTierTab(1)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                py: "7px",
                px: "12px",
                borderRadius: "8px",
                bgcolor: selectedTierTab === 1 ? "rgba(0, 0, 255, 0.6)" : "#FFFFFF",
                border: selectedTierTab === 1 ? "1px solid rgba(0, 0, 255, 0.6)" : "1px solid #E2E8F0",
                color: selectedTierTab === 1 ? "#FFFFFF" : "#000000",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                Tier 1 → 27
              </Typography>
            </Box>

            {/* Tier 2 */}
            <Box
              onClick={() => setSelectedTierTab(2)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                py: "7px",
                px: "12px",
                borderRadius: "8px",
                bgcolor: selectedTierTab === 2 ? "rgba(0, 0, 255, 0.6)" : "#FFFFFF",
                border: selectedTierTab === 2 ? "1px solid rgba(0, 0, 255, 0.6)" : "1px solid #E2E8F0",
                color: selectedTierTab === 2 ? "#FFFFFF" : "#000000",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                Tier 2 → 45
              </Typography>
            </Box>

            {/* Tier 3 */}
            <Box
              onClick={() => setSelectedTierTab(3)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                py: "7px",
                px: "12px",
                borderRadius: "8px",
                bgcolor: selectedTierTab === 3 ? "rgba(0, 0, 255, 0.6)" : "#FFFFFF",
                border: selectedTierTab === 3 ? "1px solid rgba(0, 0, 255, 0.6)" : "1px solid #E2E8F0",
                color: selectedTierTab === 3 ? "#FFFFFF" : "#000000",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                Tier 3 → 65
              </Typography>
            </Box>

            {/* Tier 4 */}
            <Box
              onClick={() => setSelectedTierTab(4)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                py: "7px",
                px: "12px",
                borderRadius: "8px",
                bgcolor: selectedTierTab === 4 ? "rgba(235, 134, 31, 0.8)" : "#FFFFFF",
                border: selectedTierTab === 4 ? "1px solid rgba(235, 134, 31, 0.8)" : "1px solid #E2E8F0",
                color: selectedTierTab === 4 ? "#FFFFFF" : "#000000",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                Tier 4 → 95
              </Typography>
            </Box>
          </Box>

          {/* Table Container (Table Frame in Figma) */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "16px",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Table Header Row */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 110px",
                alignItems: "center",
                height: 48,
                px: "16px",
                borderBottom: "1px solid #F0F6FC",
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#5A5A5A",
                }}
              >
                Grid Cell
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#5A5A5A",
                }}
              >
                Contains
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#5A5A5A",
                  textAlign: "right",
                  pr: 1,
                }}
              >
                Actions
              </Typography>
            </Box>

            {/* Table Recursive Rows */}
            {filteredTree.map((node) => renderTreeRow(node, 0))}

            {/* Pagination Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                p: "20px 16px",
                bgcolor: "#FFFFFF",
                userSelect: "none",
                flexWrap: "wrap",
              }}
            >
              {/* First Button (shown in full view) */}
              {!selectedNode && (
                <Box
                  onClick={() => setCurrentPage(1)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    px: "10px",
                    py: "6px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "#000000",
                    "&:hover": { bgcolor: "#F1F5F9" },
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M11 12L7 8L11 4M7 12L3 8L7 4" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px" }}>
                    First
                  </Typography>
                </Box>
              )}

              {/* Previous Button */}
              <Box
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  px: "10px",
                  py: "6px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: "#000000",
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px" }}>
                  Previous
                </Typography>
              </Box>

              {/* Number 1 (Active) */}
              <Box
                onClick={() => setCurrentPage(1)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: currentPage === 1 ? "#F0F6FC" : "transparent",
                  color: currentPage === 1 ? "#0000FF" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: currentPage === 1 ? 600 : 400,
                  fontSize: "14px",
                  fontFamily: "var(--font-cairo)",
                  "&:hover": { bgcolor: "#E2EEFC" },
                }}
              >
                1
              </Box>

              {/* Number 2 */}
              <Box
                onClick={() => setCurrentPage(2)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: currentPage === 2 ? "#F0F6FC" : "transparent",
                  color: currentPage === 2 ? "#0000FF" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "var(--font-cairo)",
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                2
              </Box>

              {/* Number 3 */}
              <Box
                onClick={() => setCurrentPage(3)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: currentPage === 3 ? "#F0F6FC" : "transparent",
                  color: currentPage === 3 ? "#0000FF" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "var(--font-cairo)",
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                3
              </Box>

              {/* Number 4 */}
              {!selectedNode && (
                <Box
                  onClick={() => setCurrentPage(4)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: currentPage === 4 ? "#F0F6FC" : "transparent",
                    color: currentPage === 4 ? "#0000FF" : "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontFamily: "var(--font-cairo)",
                    "&:hover": { bgcolor: "#F1F5F9" },
                  }}
                >
                  4
                </Box>
              )}

              {/* Number 5 */}
              {!selectedNode && (
                <Box
                  onClick={() => setCurrentPage(5)}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: currentPage === 5 ? "#F0F6FC" : "transparent",
                    color: currentPage === 5 ? "#0000FF" : "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontFamily: "var(--font-cairo)",
                    "&:hover": { bgcolor: "#F1F5F9" },
                  }}
                >
                  5
                </Box>
              )}

              {/* Ellipsis */}
              <Typography sx={{ color: "#ADADAD", px: 0.5, fontSize: "14px" }}>...</Typography>

              {/* Number 17 */}
              <Box
                onClick={() => setCurrentPage(17)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: currentPage === 17 ? "#F0F6FC" : "transparent",
                  color: currentPage === 17 ? "#0000FF" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "var(--font-cairo)",
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                17
              </Box>

              {/* Next Button */}
              <Box
                onClick={() => setCurrentPage((p) => Math.min(17, p + 1))}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  px: "10px",
                  py: "6px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: "#000000",
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px" }}>
                  Next
                </Typography>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>

              {/* Last Button (shown in full view) */}
              {!selectedNode && (
                <Box
                  onClick={() => setCurrentPage(17)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    px: "10px",
                    py: "6px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: "#000000",
                    "&:hover": { bgcolor: "#F1F5F9" },
                  }}
                >
                  <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13.5px" }}>
                    Last
                  </Typography>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M5 4L9 8L5 12M9 4L13 8L9 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Container: Grid Cell Details Card */}
        {selectedNode && (
          <Box
            sx={{
              width: { xs: "100%", lg: "540px", xl: "560px" },
              flexShrink: 0,
              animation: "detailsSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              "@keyframes detailsSlideIn": {
                from: { opacity: 0, transform: "translateX(20px)" },
                to: { opacity: 1, transform: "translateX(0)" },
              },
            }}
          >
            <GridCellDetailsCard
              node={selectedNode}
              onClose={handleCloseDetails}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

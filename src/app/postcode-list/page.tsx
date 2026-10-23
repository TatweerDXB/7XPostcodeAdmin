"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ClearIcon from "@mui/icons-material/Clear";
import { POSTCODE_ITEMS, PostcodeItem } from "@/data/postcodeListData";
import {
  PostcodeDetailsCard,
  PostcodeStatisticsCards,
  PostcodeFilterDrawer,
  PostcodeExpandedMapModal,
} from "@/components/postcode";
import type { PostcodeFilterValues } from "@/components/postcode/PostcodeFilterDrawer";

export default function PostcodeListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPostcode, setSelectedPostcode] = useState<PostcodeItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<PostcodeFilterValues>({
    emirate: "All Emirates",
    status: "All Status",
  });

  // Expanded map modal state
  const [isExpandedMapOpen, setIsExpandedMapOpen] = useState(false);

  // Combined search & filter items
  const queryTrimmed = searchQuery.trim().toLowerCase();
  const filteredItems = POSTCODE_ITEMS.filter((item) => {
    // Search query matching
    if (queryTrimmed) {
      const matchSearch =
        item.postcode.toLowerCase().includes(queryTrimmed) ||
        item.emirate.toLowerCase().includes(queryTrimmed) ||
        item.subtitle.toLowerCase().includes(queryTrimmed) ||
        item.status.toLowerCase().includes(queryTrimmed) ||
        item.chips.tier1.includes(queryTrimmed) ||
        item.chips.tier2.includes(queryTrimmed) ||
        item.chips.tier3.includes(queryTrimmed) ||
        item.chips.tier4.includes(queryTrimmed);
      if (!matchSearch) return false;
    }

    // Emirate filter
    if (filters.emirate !== "All Emirates") {
      if (item.emirate.toLowerCase() !== filters.emirate.toLowerCase()) {
        return false;
      }
    }

    // Status filter
    if (filters.status !== "All Status") {
      if (item.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const handleRowClick = (item: PostcodeItem) => {
    setSelectedPostcode(item);
  };

  const handleCloseDetails = () => {
    setSelectedPostcode(null);
  };

  const handleApplyFilters = (newFilters: PostcodeFilterValues) => {
    setFilters(newFilters);
    setIsFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      emirate: "All Emirates",
      status: "All Status",
    });
    setIsFilterDrawerOpen(false);
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
        Postcode List
      </Typography>

      {/* KPI Statistics Cards (Screenshot 1: shown when not in split-view) */}
      {!selectedPostcode && (
        <PostcodeStatisticsCards
          totalPostcodes={27}
          publishedCount={100}
          maskedCount={100}
          emiratesCount={7}
        />
      )}

      {/* Main Content Area (Table + Split Postcode Details Card) */}
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          width: "100%",
          alignItems: "flex-start",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Left Container (Search + Filter + Table + Pagination) */}
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
          {/* Top Search & Filter Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Search Input Box with Blue Action Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                maxWidth: "100%",
                bgcolor: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0px 0px 8px rgba(206, 213, 216, 0.2)",
                p: "4px 6px 4px 16px",
                height: 48,
                boxSizing: "border-box",
              }}
            >
              <InputBase
                placeholder="Search postcodes, Longitude, latitude, buildings, units, addresses....."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
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
                  sx={{ color: "#919191", p: 0.5, mr: 0.5 }}
                >
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}

              {/* Blue Magnifying Glass Search Button */}
              <Button
                variant="contained"
                sx={{
                  minWidth: 38,
                  width: 38,
                  height: 38,
                  p: 0,
                  borderRadius: "6px",
                  bgcolor: "#0000FF",
                  boxShadow: "none",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#0000CC",
                    boxShadow: "none",
                  },
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                    fill="white"
                  />
                </svg>
              </Button>
            </Box>

            {/* Filter Button (Opens Slide-over Drawer) */}
            <Button
              onClick={() => setIsFilterDrawerOpen(true)}
              sx={{
                height: 48,
                px: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#000000",
                textTransform: "none",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                boxShadow: "0px 0px 8px rgba(206, 213, 216, 0.15)",
                flexShrink: 0,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#0000FF",
                  color: "#0000FF",
                },
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.5 4H3.5L8.7 10.24V14.5L11.3 16V10.24L16.5 4Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Filter
            </Button>
          </Box>

          {/* Table Container */}
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
                gridTemplateColumns: "56px 1.4fr 1.2fr 110px",
                alignItems: "center",
                height: 52,
                px: "20px",
                borderBottom: "1px solid #F1F5F9",
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "14.5px",
                  color: "#5A5A5A",
                  textAlign: "center",
                }}
              >
                #
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "14.5px",
                  color: "#5A5A5A",
                  pl: 1,
                }}
              >
                Postcode
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "14.5px",
                  color: "#5A5A5A",
                }}
              >
                Emirate
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "14.5px",
                  color: "#5A5A5A",
                  textAlign: "center",
                }}
              >
                Status
              </Typography>
            </Box>

            {/* Table Rows */}
            {filteredItems.map((item) => {
              const isSelected = selectedPostcode?.id === item.id;
              return (
                <Box
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "56px 1.4fr 1.2fr 110px",
                    alignItems: "center",
                    height: 64,
                    px: "20px",
                    borderBottom: "1px solid #F1F5F9",
                    bgcolor: isSelected ? "#F0F6FC" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      bgcolor: isSelected ? "#E5F0FA" : "#F8FAFC",
                    },
                  }}
                >
                  {/* # Column */}
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#000000",
                      textAlign: "center",
                    }}
                  >
                    {item.rowNumber}
                  </Typography>

                  {/* 4 Colored Postcode Chips */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      pl: 1,
                    }}
                  >
                    {/* Chip 1 (Blue) */}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "3px",
                        bgcolor: "#5B67EA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#FFFFFF",
                          lineHeight: 1,
                        }}
                      >
                        {item.chips.tier1}
                      </Typography>
                    </Box>

                    {/* Chip 2 (Grey) */}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "3px",
                        bgcolor: "#4D4D4D",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#FFFFFF",
                          lineHeight: 1,
                        }}
                      >
                        {item.chips.tier2}
                      </Typography>
                    </Box>

                    {/* Chip 3 (Green) */}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "3px",
                        bgcolor: "#3F8E50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#FFFFFF",
                          lineHeight: 1,
                        }}
                      >
                        {item.chips.tier3}
                      </Typography>
                    </Box>

                    {/* Chip 4 (Sky Blue) */}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "3px",
                        bgcolor: "#2979FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          color: "#FFFFFF",
                          lineHeight: 1,
                        }}
                      >
                        {item.chips.tier4}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Emirate Column */}
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "#000000",
                    }}
                  >
                    {item.emirate}
                  </Typography>

                  {/* Status Column */}
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Box
                      sx={{
                        px: "10px",
                        py: "3px",
                        borderRadius: "4px",
                        bgcolor: item.status === "Published" ? "#F3FAF4" : "#FEF2F2",
                        color: item.status === "Published" ? "#3F8E50" : "#D83731",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "var(--font-cairo), Cairo, sans-serif",
                        textAlign: "center",
                        minWidth: 70,
                        display: "inline-block",
                      }}
                    >
                      {item.status}
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {filteredItems.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}>
                  No postcodes match your search and filter criteria.
                </Typography>
              </Box>
            )}

            {/* Pagination Row matching Screenshot 1 & 4 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: "20px",
                py: "16px",
                bgcolor: "#FFFFFF",
                userSelect: "none",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              {/* Left Side: Numbered controls with double and single chevrons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* << (First Page) */}
                <IconButton
                  size="small"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M11 12L7 8L11 4M7 12L3 8L7 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>

                {/* < (Previous Page) */}
                <IconButton
                  size="small"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>

                {/* 1 (Active / Inactive) */}
                <Box
                  onClick={() => setCurrentPage(1)}
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
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: currentPage === 1 ? "#0000FF" : "#F1F5F9",
                    },
                  }}
                >
                  1
                </Box>

                {/* 2 */}
                <Box
                  onClick={() => setCurrentPage(2)}
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
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: currentPage === 2 ? "#0000FF" : "#F1F5F9",
                    },
                  }}
                >
                  2
                </Box>

                {/* 3 */}
                <Box
                  onClick={() => setCurrentPage(3)}
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
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: currentPage === 3 ? "#0000FF" : "#F1F5F9",
                    },
                  }}
                >
                  3
                </Box>

                {/* Ellipsis */}
                <Typography sx={{ color: "#8E8E93", px: 0.5, fontSize: "14px" }}>
                  ...
                </Typography>

                {/* 6 */}
                <Box
                  onClick={() => setCurrentPage(6)}
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
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: currentPage === 6 ? "#0000FF" : "#F1F5F9",
                    },
                  }}
                >
                  6
                </Box>

                {/* > (Next Page) */}
                <IconButton
                  size="small"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>

                {/* >> (Last Page) */}
                <IconButton
                  size="small"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M5 4L9 8L5 12M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
              </Box>

              {/* Right Side: Page Selector Dropdown */}
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    color: "#000000",
                  }}
                >
                  Page
                </Typography>

                <Select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
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
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0000FF",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0000FF",
                    },
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <MenuItem key={num} value={num} sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px" }}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>

                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    color: "#000000",
                  }}
                >
                  of {totalPages}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Container: Postcode Details Card (Screenshot 4 & 5) */}
        {selectedPostcode && (
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
            <PostcodeDetailsCard
              item={selectedPostcode}
              onClose={handleCloseDetails}
              onExpandMap={() => setIsExpandedMapOpen(true)}
            />
          </Box>
        )}
      </Box>

      {/* Filter Slide-over Drawer (Screenshot 2) */}
      <PostcodeFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        appliedFilters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Expanded Map View Modal (Screenshot 3) */}
      <PostcodeExpandedMapModal
        open={isExpandedMapOpen}
        onClose={() => setIsExpandedMapOpen(false)}
        item={selectedPostcode}
      />
    </Box>
  );
}

"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { POSTCODE_ITEMS, PostcodeItem } from "@/data/postcodeListData";
import PostcodeDetailsCard from "@/components/PostcodeDetailsCard";

export default function PostcodeListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPostcode, setSelectedPostcode] = useState<PostcodeItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter items based on search query
  const queryTrimmed = searchQuery.trim().toLowerCase();
  const filteredItems = queryTrimmed
    ? POSTCODE_ITEMS.filter(
      (item) =>
        item.postcode.toLowerCase().includes(queryTrimmed) ||
        item.emirate.toLowerCase().includes(queryTrimmed) ||
        item.subtitle.toLowerCase().includes(queryTrimmed) ||
        item.status.toLowerCase().includes(queryTrimmed) ||
        item.chips.tier1.includes(queryTrimmed) ||
        item.chips.tier2.includes(queryTrimmed) ||
        item.chips.tier3.includes(queryTrimmed) ||
        item.chips.tier4.includes(queryTrimmed)
    )
    : POSTCODE_ITEMS;

  const handleRowClick = (item: PostcodeItem) => {
    setSelectedPostcode(item);
  };

  const handleCloseDetails = () => {
    setSelectedPostcode(null);
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
      {/* Split View Container (Screenshot 1: Full width table / Screenshot 2: Split 2 cards) */}
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          width: "100%",
          alignItems: "flex-start",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Left Container (Table + Search + Pagination) */}
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
              gap: "10px",
              bgcolor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.15)",
              boxSizing: "border-box",
            }}
          >
            {/* Search Input Box with Blue Action Button */}
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
                  placeholder="Search postcodes, Longitude, latitude, buildings, units, addresses...."
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

            {/* Filter Button (Figma Filter Box) */}
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: "#F0F6FC",
                border: "1px solid rgba(0, 0, 255, 0.15)",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#E1EDFB",
                  borderColor: "rgba(0, 0, 255, 0.3)",
                },
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16.5 4H3.5L8.7 10.24V14.5L11.3 16V10.24L16.5 4Z"
                  stroke="#000000"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                gridTemplateColumns: "48px 1.2fr 1fr 100px",
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
                  textAlign: "center",
                }}
              >
                #
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
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
                  fontSize: "15px",
                  color: "#5A5A5A",
                }}
              >
                Emirate
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
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
                    gridTemplateColumns: "48px 1.2fr 1fr 100px",
                    alignItems: "center",
                    height: 64,
                    px: "16px",
                    borderBottom: "1px solid #F0F6FC",
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
                        width: 24,
                        height: 24,
                        borderRadius: "2px",
                        bgcolor: "rgba(0, 0, 255, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
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
                        width: 24,
                        height: 24,
                        borderRadius: "2px",
                        bgcolor: "rgba(77, 77, 77, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
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
                        width: 24,
                        height: 24,
                        borderRadius: "2px",
                        bgcolor: "rgba(63, 142, 80, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#FFFFFF",
                          lineHeight: 1,
                        }}
                      >
                        {item.chips.tier3}
                      </Typography>
                    </Box>

                    {/* Chip 4 (Orange) */}
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "2px",
                        bgcolor: "rgba(235, 134, 31, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
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
                        borderRadius: "3px",
                        bgcolor: item.status === "Published" ? "#F3FAF4" : "#FEF2F2",
                        color: item.status === "Published" ? "#3F8E50" : "#D83731",
                        fontSize: "12px",
                        fontWeight: 500,
                        fontFamily: "var(--font-cairo), Cairo, sans-serif",
                        textAlign: "center",
                        minWidth: 64,
                        display: "inline-block",
                      }}
                    >
                      {item.status}
                    </Box>
                  </Box>
                </Box>
              );
            })}

            {/* Pagination Row matching Figma design */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                p: "20px 16px",
                bgcolor: "#FFFFFF",
                userSelect: "none",
              }}
            >
              {/* Previous Button */}
              <Box
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  px: "14px",
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
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px" }}>
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

              {/* Number 5 */}
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

              {/* Ellipsis */}
              <Typography sx={{ color: "#ADADAD", px: 0.5, fontSize: "15px" }}>...</Typography>

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
                  gap: "6px",
                  px: "14px",
                  py: "6px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  color: "#000000",
                  "&:hover": { bgcolor: "#F1F5F9" },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px" }}>
                  Next
                </Typography>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Container: Postcode Details Card (Screenshot 2 / Frame 9154 in Figma) */}
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
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

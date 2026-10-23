"use client";

import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

export interface PostcodeFilterValues {
  emirate: string;
  status: string;
}

interface PostcodeFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  appliedFilters: PostcodeFilterValues;
  onApply: (filters: PostcodeFilterValues) => void;
  onClear: () => void;
}

export const EMIRATES_OPTIONS = [
  "All Emirates",
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al-Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export const STATUS_OPTIONS = ["All Status", "Published", "Masked"];

export default function PostcodeFilterDrawer({
  open,
  onClose,
  appliedFilters,
  onApply,
  onClear,
}: PostcodeFilterDrawerProps) {
  const [draftEmirate, setDraftEmirate] = useState(appliedFilters.emirate);
  const [draftStatus, setDraftStatus] = useState(appliedFilters.status);

  useEffect(() => {
    if (open) {
      setDraftEmirate(appliedFilters.emirate);
      setDraftStatus(appliedFilters.status);
    }
  }, [open, appliedFilters]);

  const handleApply = () => {
    onApply({
      emirate: draftEmirate,
      status: draftStatus,
    });
    onClose();
  };

  const handleClear = () => {
    setDraftEmirate("All Emirates");
    setDraftStatus("All Status");
    onClear();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "85vw", sm: 320 },
            maxWidth: 320,
            bgcolor: "#FFFFFF",
            p: "20px 16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.08)",
          },
        },
      }}
    >
      {/* Top Header & Form */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Title & Close Icon Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "#000000",
              lineHeight: "26px",
            }}
          >
            Filter
          </Typography>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              p: 0.5,
              color: "#000000",
              "&:hover": { bgcolor: "#F1F5F9" },
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="1.5" />
              <path d="M9 9L15 15M15 9L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "#EAEFEF" }} />

        {/* Emirate Filter Field */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#475569",
            }}
          >
            Emirate
          </Typography>

          <Select
            value={draftEmirate}
            onChange={(e) => setDraftEmirate(e.target.value)}
            size="small"
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#DEDEDE",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ADADAD",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#0000FF",
              },
            }}
          >
            {EMIRATES_OPTIONS.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
                }}
              >
                {opt}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Status Filter Field */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#475569",
            }}
          >
            Status
          </Typography>

          <Select
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value)}
            size="small"
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#DEDEDE",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ADADAD",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#0000FF",
              },
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
                }}
              >
                {opt}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Bottom Action Buttons */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", pt: "20px" }}>
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{
            height: 42,
            bgcolor: "#0000FF",
            color: "#FFFFFF",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "4px",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#0000CC",
              boxShadow: "none",
            },
          }}
        >
          Apply Filter
        </Button>

        <Button
          variant="outlined"
          onClick={handleClear}
          sx={{
            height: 42,
            bgcolor: "#FFFFFF",
            color: "#0000FF",
            border: "1px solid #0000FF",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "4px",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "rgba(0, 0, 255, 0.04)",
              border: "1px solid #0000CC",
              boxShadow: "none",
            },
          }}
        >
          Clear All Filters
        </Button>
      </Box>
    </Drawer>
  );
}

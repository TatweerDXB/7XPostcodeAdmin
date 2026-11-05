"use client";

import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import type { RegistryCodeValueDto } from "@/services/addressRegistryService";

export interface AddressFilterState {
  emirate: string;
  classType: string;
  status: string;
}

interface AddressRegistryFilterProps {
  open: boolean;
  filters: AddressFilterState;
  onFilterChange: (key: keyof AddressFilterState, value: string) => void;
  /** EMIRATE code values from GET /api/registry/code-values */
  emirateOptions?: RegistryCodeValueDto[];
  /** BUILDING_TYPE code values from GET /api/registry/code-values (the "Class" filter) */
  classOptions?: RegistryCodeValueDto[];
  /** RECORD_STATUS code values from GET /api/registry/code-values */
  statusOptions?: RegistryCodeValueDto[];
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export default function AddressRegistryFilter({
  open,
  filters,
  onFilterChange,
  emirateOptions = [],
  classOptions = [],
  statusOptions = [],
  onApply,
  onClear,
  onClose,
}: AddressRegistryFilterProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(1.5px)",
          },
        },
        paper: {
          sx: {
            width: { xs: "300px", sm: "340px" },
            height: "100vh",
            maxHeight: "100vh",
            bgcolor: "#FFFFFF",
            p: "20px 20px 24px 20px",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            boxShadow: "-8px 0px 30px rgba(0, 0, 0, 0.12)",
            borderLeft: "1px solid #E2E8F0",
            zIndex: 1400,
          },
        },
      }}
    >
      {/* Top Header: Title & Close Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 36,
          pb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontWeight: 600,
            fontSize: "18px",
            lineHeight: "34px",
            color: "#000000",
          }}
        >
          Filter
        </Typography>

        {/* Close Circle Button (Figma close-circle icon) */}
        <IconButton
          onClick={onClose}
          size="small"
          title="Close Filter"
          sx={{
            p: 0.5,
            color: "#000000",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "#F0F6FC",
              color: "#0000FF",
            },
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.17 14.83L14.83 9.17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14.83 14.83L9.17 9.17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          width: "100%",
          height: "1px",
          bgcolor: "#DEDEDE",
          mb: "16px",
        }}
      />

      {/* Filter Form Fields (Scrollable area spanning remaining height) */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: "4px",
          },
        }}
      >
        {/* Emirate */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            Emirate
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.emirate}
              onChange={(e) => onFilterChange("emirate", e.target.value)}
              displayEmpty
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                borderRadius: "4px",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                color: "#000000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DEDEDE",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                  borderWidth: "1px",
                },
                "& .MuiSelect-select": {
                  py: "8px",
                  px: "16px",
                },
              }}
            >
              <MenuItem value="">All Emirates</MenuItem>
              {emirateOptions.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Class */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            Class
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.classType}
              onChange={(e) => onFilterChange("classType", e.target.value)}
              displayEmpty
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                borderRadius: "4px",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                color: "#000000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DEDEDE",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                  borderWidth: "1px",
                },
                "& .MuiSelect-select": {
                  py: "8px",
                  px: "16px",
                },
              }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {classOptions.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Status */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            Status
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              displayEmpty
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                borderRadius: "4px",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                color: "#000000",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DEDEDE",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                  borderWidth: "1px",
                },
                "& .MuiSelect-select": {
                  py: "8px",
                  px: "16px",
                },
              }}
            >
              <MenuItem value="">All Status</MenuItem>
              {statusOptions.map((opt) => (
                <MenuItem key={opt.code} value={opt.code}>
                  {opt.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Buttons at Bottom: Apply Filter & Clear All Filters */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", pt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            onApply();
            onClose();
          }}
          sx={{
            bgcolor: "#0000FF",
            color: "#FFFFFF",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            height: 40,
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
          fullWidth
          variant="outlined"
          onClick={onClear}
          sx={{
            borderColor: "#0000FF",
            color: "#0000FF",
            bgcolor: "#FFFFFF",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "none",
            height: 40,
            borderRadius: "4px",
            "&:hover": {
              borderColor: "#0000CC",
              bgcolor: "rgba(0, 0, 255, 0.04)",
            },
          }}
        >
          Clear All Filters
        </Button>
      </Box>
    </Drawer>
  );
}

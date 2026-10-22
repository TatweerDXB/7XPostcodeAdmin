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

export interface AddressFilterState {
  t1: string;
  t2: string;
  t3: string;
  t4: string;
  emirate: string;
  classType: string;
  status: string;
}

interface AddressRegistryFilterProps {
  open: boolean;
  filters: AddressFilterState;
  onFilterChange: (key: keyof AddressFilterState, value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export default function AddressRegistryFilter({
  open,
  filters,
  onFilterChange,
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
        {/* T1 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            T1
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.t1}
              onChange={(e) => onFilterChange("t1", e.target.value)}
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
              <MenuItem value="">All T1</MenuItem>
              <MenuItem value="Cell 45">Cell 45</MenuItem>
              <MenuItem value="Cell 32">Cell 32</MenuItem>
              <MenuItem value="Cell 12">Cell 12</MenuItem>
              <MenuItem value="Cell 99">Cell 99</MenuItem>
              <MenuItem value="Cell 47">Cell 47</MenuItem>
              <MenuItem value="Cell 33">Cell 33</MenuItem>
              <MenuItem value="Cell 15">Cell 15</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* T2 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            T2
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.t2}
              onChange={(e) => onFilterChange("t2", e.target.value)}
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
              <MenuItem value="">All T2</MenuItem>
              <MenuItem value="Cell 67">Cell 67</MenuItem>
              <MenuItem value="Cell 54">Cell 54</MenuItem>
              <MenuItem value="Cell 34">Cell 34</MenuItem>
              <MenuItem value="Cell 88">Cell 88</MenuItem>
              <MenuItem value="Cell 48">Cell 48</MenuItem>
              <MenuItem value="Cell 12">Cell 12</MenuItem>
              <MenuItem value="Cell 22">Cell 22</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* T3 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            T3
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.t3}
              onChange={(e) => onFilterChange("t3", e.target.value)}
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
              <MenuItem value="">All T3</MenuItem>
              <MenuItem value="Cell 89">Cell 89</MenuItem>
              <MenuItem value="Cell 71">Cell 71</MenuItem>
              <MenuItem value="Cell 56">Cell 56</MenuItem>
              <MenuItem value="Cell 77">Cell 77</MenuItem>
              <MenuItem value="Cell 67">Cell 67</MenuItem>
              <MenuItem value="Cell 88">Cell 88</MenuItem>
              <MenuItem value="Cell 39">Cell 39</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* T4 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            T4
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.t4}
              onChange={(e) => onFilterChange("t4", e.target.value)}
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
              <MenuItem value="">All T4</MenuItem>
              <MenuItem value="Cell 22">Cell 22</MenuItem>
              <MenuItem value="Cell 10">Cell 10</MenuItem>
              <MenuItem value="Cell 78">Cell 78</MenuItem>
              <MenuItem value="Cell 66">Cell 66</MenuItem>
              <MenuItem value="Cell 90">Cell 90</MenuItem>
              <MenuItem value="Cell 45">Cell 45</MenuItem>
              <MenuItem value="Cell 81">Cell 81</MenuItem>
            </Select>
          </FormControl>
        </Box>

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
              <MenuItem value="Dubai">Dubai</MenuItem>
              <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
              <MenuItem value="Sharjah">Sharjah</MenuItem>
              <MenuItem value="Ajman">Ajman</MenuItem>
              <MenuItem value="Umm Al Quwain">Umm Al Quwain</MenuItem>
              <MenuItem value="Ras Al Khaimah">Ras Al Khaimah</MenuItem>
              <MenuItem value="Fujairah">Fujairah</MenuItem>
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
              <MenuItem value="Building">Building</MenuItem>
              <MenuItem value="Unit">Unit</MenuItem>
              <MenuItem value="Individual Recipient">Individual Recipient</MenuItem>
              <MenuItem value="Land / Plot">Land / Plot</MenuItem>
              <MenuItem value="Facility">Facility</MenuItem>
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
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Restricted">Restricted</MenuItem>
              <MenuItem value="Unverified">Unverified</MenuItem>
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

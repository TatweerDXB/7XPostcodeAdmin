"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { ADDRESS_REGISTRY_ITEMS, AddressRegistryItem } from "@/data/addressRegistryData";
import AddressRegistryFilter, { AddressFilterState } from "@/components/address/AddressRegistryFilter";
import AddressRegistryInlinePanel from "@/components/address/AddressRegistryInlinePanel";
import AddAddressDialog from "@/components/address/AddAddressDialog";

const initialFilterState: AddressFilterState = {
  t1: "",
  t2: "",
  t3: "",
  t4: "",
  emirate: "",
  classType: "",
  status: "",
};

export default function AddressRegistryPage() {
  const [addresses, setAddresses] = useState<AddressRegistryItem[]>(ADDRESS_REGISTRY_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Inline right panel mode: 'view' | 'edit' | null
  const [rightPanelMode, setRightPanelMode] = useState<"view" | "edit" | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<AddressRegistryItem | null>(null);

  // Draft filter state (while changing inputs) and applied filter state
  const [filterDraft, setFilterDraft] = useState<AddressFilterState>(initialFilterState);
  const [appliedFilters, setAppliedFilters] = useState<AddressFilterState>(initialFilterState);

  // Check if any filter is actively applied
  const hasActiveFilters = useMemo(() => {
    return Object.values(appliedFilters).some((val) => val !== "");
  }, [appliedFilters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof AddressFilterState, value: string) => {
    setFilterDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilter = () => {
    setAppliedFilters(filterDraft);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setFilterDraft(initialFilterState);
    setAppliedFilters(initialFilterState);
    setCurrentPage(1);
  };

  // Add new address (via slide-over popup)
  const handleAddNewAddress = (newAddr: AddressRegistryItem) => {
    setAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddress(newAddr);
    setRightPanelMode("view");
    setIsAddAddressOpen(false);
  };

  // Update address (via inline edit panel)
  const handleUpdateAddress = (updatedAddr: AddressRegistryItem) => {
    setAddresses((prev) =>
      prev.map((item) => (item.id === updatedAddr.id ? updatedAddr : item))
    );
    if (selectedAddress?.id === updatedAddr.id) {
      setSelectedAddress(updatedAddr);
    }
  };

  // Filter and search dataset
  const filteredAddresses = useMemo(() => {
    let list = [...addresses];

    // Search query matching Address ID, Address/Label, Postcode, Makani, Onwani
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (item) =>
          item.addressId.toLowerCase().includes(q) ||
          item.addressLabel.toLowerCase().includes(q) ||
          (item.postcode && item.postcode.toLowerCase().includes(q)) ||
          item.makani.toLowerCase().includes(q) ||
          item.onwani.toLowerCase().includes(q) ||
          item.classType.toLowerCase().includes(q) ||
          item.emirate.toLowerCase().includes(q)
      );
    }

    // Apply structured filters
    if (appliedFilters.t1) {
      list = list.filter((item) => item.t1 === appliedFilters.t1);
    }
    if (appliedFilters.t2) {
      list = list.filter((item) => item.t2 === appliedFilters.t2);
    }
    if (appliedFilters.t3) {
      list = list.filter((item) => item.t3 === appliedFilters.t3);
    }
    if (appliedFilters.t4) {
      list = list.filter((item) => item.t4 === appliedFilters.t4);
    }
    if (appliedFilters.emirate) {
      list = list.filter((item) => item.emirate.toLowerCase() === appliedFilters.emirate.toLowerCase());
    }
    if (appliedFilters.classType) {
      list = list.filter((item) => item.classType.toLowerCase() === appliedFilters.classType.toLowerCase());
    }
    if (appliedFilters.status) {
      list = list.filter((item) => item.status.toLowerCase() === appliedFilters.status.toLowerCase());
    }

    return list;
  }, [searchQuery, appliedFilters, addresses]);

  const isPanelOpen = Boolean(rightPanelMode && selectedAddress);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: { xs: "16px 20px 32px 20px", sm: "24px 32px 48px 32px" },
        bgcolor: "#F9FBFD",
        boxSizing: "border-box",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* Top Action Bar (Search + Filter Toggle + Add New Address Button) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: "14px 16px",
          gap: "10px",
          bgcolor: "#FFFFFF",
          borderRadius: "8px",
          boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.15)",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        {/* Search Input with integrated blue button */}
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
              placeholder="Search by Address, ID, Postcode,Makani or Onwani"
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
                sx={{ color: "#919191", p: 0.2 }}
              >
                <ClearIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>

          {/* Blue Search Button with Magnifying Glass Icon */}
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

        {/* Filter Toggle Button */}
        <Box
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          sx={{
            width: 32,
            height: 32,
            bgcolor: isFilterOpen || hasActiveFilters ? "#E1EDFB" : "#F0F6FC",
            border: isFilterOpen || hasActiveFilters ? "1px solid #0000FF" : "1px solid rgba(0, 0, 255, 0.15)",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            position: "relative",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "#E1EDFB",
              borderColor: "rgba(0, 0, 255, 0.4)",
            },
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.5 4H3.5L8.7 10.24V14.5L11.3 16V10.24L16.5 4Z"
              stroke={isFilterOpen || hasActiveFilters ? "#0000FF" : "#000000"}
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Active Filter Dot */}
          {hasActiveFilters && (
            <Box
              sx={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                bgcolor: "#0000FF",
                borderRadius: "50%",
                border: "1.5px solid #FFFFFF",
              }}
            />
          )}
        </Box>

        {/* Add New Address Button (Opens Slide Popup Drawer) */}
        <Button
          variant="contained"
          onClick={() => setIsAddAddressOpen(true)}
          sx={{
            height: 32,
            px: "12px",
            bgcolor: "#0000FF",
            color: "#FFFFFF",
            borderRadius: "4px",
            fontFamily: "var(--font-cairo), 'Titillium Web', sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            lineHeight: "16px",
            textTransform: "none",
            whiteSpace: "nowrap",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#0000CC",
              boxShadow: "none",
            },
          }}
        >
          Add New Address
        </Button>
      </Box>

      {/* Main Content Layout: Table on Left + Inline Panel on Right */}
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          width: "100%",
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        {/* Left Table Section (Stretches when inline panel is open or closed) */}
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
          {/* Table Container Card */}
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.25)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Table Header: 3 columns when panel open, 7 columns when panel closed */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: isPanelOpen
                  ? "1.2fr 2fr 90px"
                  : "1.2fr 1.6fr 1.3fr 1fr 1fr 1fr 90px",
                alignItems: "center",
                height: 48,
                px: { xs: "16px", sm: "24px" },
                borderBottom: "1px solid #F0F6FC",
                bgcolor: "#FFFFFF",
                transition: "grid-template-columns 0.2s ease",
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
                Address ID
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#5A5A5A",
                }}
              >
                Address/Label
              </Typography>

              {!isPanelOpen && (
                <>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#5A5A5A",
                    }}
                  >
                    Class
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#5A5A5A",
                    }}
                  >
                    Makani
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#5A5A5A",
                    }}
                  >
                    Onwani
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#5A5A5A",
                    }}
                  >
                    Status
                  </Typography>
                </>
              )}

              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#5A5A5A",
                  textAlign: "center",
                }}
              >
                Action
              </Typography>
            </Box>

            {/* Table Rows */}
            {filteredAddresses.length > 0 ? (
              filteredAddresses.map((item) => {
                const isSelected = selectedAddress?.id === item.id;
                return (
                  <Box
                    key={item.id}
                    onClick={() => {
                      setSelectedAddress(item);
                      if (!rightPanelMode) {
                        setRightPanelMode("view");
                      }
                    }}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: isPanelOpen
                        ? "1.2fr 2fr 90px"
                        : "1.2fr 1.6fr 1.3fr 1fr 1fr 1fr 90px",
                      alignItems: "center",
                      height: 64,
                      px: { xs: "16px", sm: "24px" },
                      borderBottom: "1px solid #F0F6FC",
                      bgcolor: isSelected ? "#F0F6FC" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        bgcolor: isSelected ? "#E5F0FA" : "#F8FAFC",
                      },
                    }}
                  >
                    {/* Address ID */}
                    <Typography
                      sx={{
                        fontFamily: "var(--font-cairo), Cairo, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        color: "#000000",
                      }}
                    >
                      {item.addressId}
                    </Typography>

                    {/* Address/Label */}
                    <Typography
                      sx={{
                        fontFamily: "var(--font-cairo), Cairo, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        color: "#000000",
                        pr: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.addressLabel}
                    </Typography>

                    {!isPanelOpen && (
                      <>
                        {/* Class */}
                        <Typography
                          sx={{
                            fontFamily: "var(--font-cairo), Cairo, sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            color: "#000000",
                          }}
                        >
                          {item.classType}
                        </Typography>

                        {/* Makani */}
                        <Typography
                          sx={{
                            fontFamily: "var(--font-cairo), Cairo, sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            color: "#000000",
                          }}
                        >
                          {item.makani}
                        </Typography>

                        {/* Onwani */}
                        <Typography
                          sx={{
                            fontFamily: "var(--font-cairo), Cairo, sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            color: "#000000",
                          }}
                        >
                          {item.onwani}
                        </Typography>

                        {/* Status Badge */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              px: "12px",
                              py: "3px",
                              borderRadius: "3px",
                              bgcolor: "#F3FAF4",
                              color: "#3F8E50",
                              fontSize: "14px",
                              fontWeight: 400,
                              fontFamily: "var(--font-cairo), Cairo, sans-serif",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 26,
                            }}
                          >
                            {item.status}
                          </Box>
                        </Box>
                      </>
                    )}

                    {/* Action Buttons: View Details (Blue Eye) & Edit (Pencil) */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      {/* View Icon Button (Blue Eye) */}
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAddress(item);
                          setRightPanelMode("view");
                        }}
                        title="View Details"
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "6px",
                          bgcolor: isSelected && rightPanelMode === "view" ? "#E1EDFB" : "#F0F6FC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: "#E1EDFB",
                            transform: "scale(1.05)",
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

                      {/* Edit Icon Button */}
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAddress(item);
                          setRightPanelMode("edit");
                        }}
                        title="Edit Address"
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "6px",
                          bgcolor: isSelected && rightPanelMode === "edit" ? "#E1EDFB" : "#F0F6FC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: "#E1EDFB",
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M13.26 3.59997L5.04997 12.29C4.73997 12.62 4.43997 13.27 4.37997 13.72L4.00997 16.96C3.87997 18.13 4.71997 18.93 5.87997 18.73L9.09997 18.18C9.54997 18.1 10.18 17.77 10.49 17.43L18.7 8.73997C20.12 7.23997 20.76 5.52997 18.55 3.44997C16.35 1.39997 14.68 2.09997 13.26 3.59997Z"
                            stroke="#5A5A5A"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M11.89 5.05005C12.32 7.81005 14.56 9.92005 17.34 10.2"
                            stroke="#5A5A5A"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3 22H21"
                            stroke="#5A5A5A"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Box>
                    </Box>
                  </Box>
                );
              })
            ) : (
              /* Empty state */
              <Box
                sx={{
                  p: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#5A5A5A",
                  }}
                >
                  No address records found
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    color: "#919191",
                  }}
                >
                  Try clearing your search or resetting the filters.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearFilter}
                  sx={{
                    borderColor: "#0000FF",
                    color: "#0000FF",
                    textTransform: "none",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  }}
                >
                  Reset Filters
                </Button>
              </Box>
            )}

            {/* Pagination Row matching Figma specifications */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                p: "20px 16px",
                bgcolor: "#FFFFFF",
                userSelect: "none",
                borderTop: "1px solid #F0F6FC",
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

              {/* Number 1 */}
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

        {/* Right Section: Inline Panel for View Details & Edit Address (Matching Figma) */}
        {isPanelOpen && selectedAddress && (
          <AddressRegistryInlinePanel
            mode={rightPanelMode!}
            item={selectedAddress}
            onClose={() => {
              setRightPanelMode(null);
              setSelectedAddress(null);
            }}
            onSwitchToEdit={() => setRightPanelMode("edit")}
            onSwitchToView={() => setRightPanelMode("view")}
            onSave={handleUpdateAddress}
          />
        )}
      </Box>

      {/* Filter Drawer - Opens on top of UI as a popup drawer */}
      <AddressRegistryFilter
        open={isFilterOpen}
        filters={filterDraft}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Add Address Drawer - Opens full height from right as a slide popup ONLY for Adding New Address */}
      <AddAddressDialog
        open={isAddAddressOpen}
        initialData={null}
        onClose={() => setIsAddAddressOpen(false)}
        onAddAddress={handleAddNewAddress}
      />
    </Box>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import ClearIcon from "@mui/icons-material/Clear";
import AddressRegistryFilter, { AddressFilterState } from "@/components/address/AddressRegistryFilter";
import AddressRegistryInlinePanel from "@/components/address/AddressRegistryInlinePanel";
import { addressRegistryService, AddressRegistryItem, RegistryLookups } from "@/services/addressRegistryService";
import { ApiError } from "@/services/apiClient";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

const initialFilterState: AddressFilterState = {
  emirate: "",
  classType: "",
  status: "",
};

const FONT = "var(--font-cairo), Cairo, sans-serif";

/** Grid columns: 3 when the side panel is open, 7 when it is closed */
const COLUMNS_WITH_PANEL = "1.2fr 2fr 90px";
const COLUMNS_FULL = "1.2fr 1.6fr 1.3fr 1fr 1fr 1fr 90px";

/** Header labels between "Address/Label" and "Action", hidden while the panel is open */
const EXTRA_COLUMNS = ["Class", "Makani", "Onwani", "Status"];

const headerCellSx = { fontFamily: FONT, fontWeight: 600, fontSize: "15px", color: "#5A5A5A" };
const cellSx = { fontFamily: FONT, fontWeight: 400, fontSize: "14px", color: "#000000" };

/** Previous / Next pagination buttons */
const navButtonSx = (enabled: boolean) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  px: "14px",
  py: "6px",
  borderRadius: "4px",
  cursor: enabled ? "pointer" : "default",
  opacity: enabled ? 1 : 0.4,
  color: "#000000",
  "&:hover": { bgcolor: enabled ? "#F1F5F9" : "transparent" },
});

/** Page numbers with ellipses, e.g. [1, 2, 3, 4, 5, "…", 17]. */
function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 4) [2, 3, 4, 5].forEach((p) => pages.add(p));
  if (current >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return "You do not have permission to view the address registry.";
    if (err.status === 429) return "Too many requests. Please wait a moment and try again.";
    if (err.status === 502 || err.status === 503) return "The address registry service is unavailable. Please try again shortly.";
  }
  return "Could not load address records. Please try again.";
}

export default function AddressRegistryPage() {
  const [addresses, setAddresses] = useState<AddressRegistryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [lookups, setLookups] = useState<RegistryLookups | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Row shown in the side panel (view only)
  const [selectedAddress, setSelectedAddress] = useState<AddressRegistryItem | null>(null);

  // Draft filter state (while changing inputs) and applied filter state
  const [filterDraft, setFilterDraft] = useState<AddressFilterState>(initialFilterState);
  const [appliedFilters, setAppliedFilters] = useState<AddressFilterState>(initialFilterState);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const isPanelOpen = Boolean(selectedAddress);
  const gridColumns = isPanelOpen ? COLUMNS_WITH_PANEL : COLUMNS_FULL;

  // The request the table should show; loading until it settles (and until the lookups are in)
  const queryKey = JSON.stringify([appliedFilters, appliedSearch, currentPage, reloadKey]);
  const isLoading = loadedKey !== queryKey;

  const hasActiveFilters = (Object.keys(appliedFilters) as (keyof AddressFilterState)[]).some(
    (key) => appliedFilters[key] !== initialFilterState[key]
  );

  // Lookups (emirates, statuses, building types) — once per session, in memory
  useEffect(() => {
    let cancelled = false;
    addressRegistryService.loadLookups().then((lk) => {
      if (!cancelled) setLookups(lk);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce typing in the search box
  useEffect(() => {
    const next = searchQuery.trim();
    if (next === appliedSearch) return;
    const handle = setTimeout(() => {
      setAppliedSearch(next);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchQuery, appliedSearch]);

  const submitSearch = () => {
    const next = searchQuery.trim();
    if (next !== appliedSearch) {
      setAppliedSearch(next);
      setCurrentPage(1);
    }
  };

  // Load the current page (after the lookups, so labels are ready on the first load)
  useEffect(() => {
    if (!lookups) return;
    const controller = new AbortController();

    (async () => {
      try {
        const result = await addressRegistryService.fetchList(
          {
            buildingType: appliedFilters.classType,
            search: appliedSearch,
            emirate: appliedFilters.emirate,
            status: appliedFilters.status,
            page: currentPage,
            pageSize: PAGE_SIZE,
          },
          lookups,
          controller.signal
        );
        if (controller.signal.aborted) return;
        setAddresses(result.items);
        setTotalCount(result.totalCount);
        setLoadError(null);
        setLoadedKey(queryKey);

        // Fill Makani / Onwani for the visible rows (not on list rows)
        const enriched = await addressRegistryService.enrichWithIdentifiers(result.items, controller.signal);
        if (controller.signal.aborted) return;
        setAddresses(enriched);
        setSelectedAddress((sel) => (sel ? enriched.find((e) => e.id === sel.id) ?? sel : sel));
      } catch (err) {
        if (controller.signal.aborted) return;
        setAddresses([]);
        setTotalCount(0);
        setLoadError(describeError(err));
        setLoadedKey(queryKey);
      }
    })();

    return () => controller.abort();
  }, [appliedFilters, appliedSearch, currentPage, lookups, reloadKey, queryKey]);

  const handleFilterChange = (key: keyof AddressFilterState, value: string) => {
    setFilterDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = () => {
    setAppliedFilters(filterDraft);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setFilterDraft(initialFilterState);
    setAppliedFilters(initialFilterState);
    setSearchQuery("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

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
      {/* Top Action Bar (Search + Filter Toggle) */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
              }}
              sx={{
                flex: 1,
                fontFamily: FONT,
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
            onClick={submitSearch}
            aria-label="Search"
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
                gridTemplateColumns: gridColumns,
                alignItems: "center",
                height: 48,
                px: { xs: "16px", sm: "24px" },
                borderBottom: "1px solid #F0F6FC",
                bgcolor: "#FFFFFF",
                transition: "grid-template-columns 0.2s ease",
              }}
            >
              <Typography sx={headerCellSx}>Address ID</Typography>
              <Typography sx={headerCellSx}>Address/Label</Typography>
              {!isPanelOpen &&
                EXTRA_COLUMNS.map((label) => (
                  <Typography key={label} sx={headerCellSx}>
                    {label}
                  </Typography>
                ))}
              <Typography sx={{ ...headerCellSx, textAlign: "center" }}>Action</Typography>
            </Box>

            {/* Table Rows */}
            {isLoading && addresses.length === 0 ? (
              <Box sx={{ p: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                <CircularProgress size={22} sx={{ color: "#0000FF" }} />
                <Typography sx={{ fontFamily: FONT, fontSize: "14px", color: "#5A5A5A" }}>
                  Loading address records…
                </Typography>
              </Box>
            ) : loadError && !isLoading ? (
              <Box sx={{ p: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Typography sx={{ fontFamily: FONT, fontSize: "15px", fontWeight: 600, color: "#B42318" }}>
                  {loadError}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setReloadKey((k) => k + 1)}
                  sx={{ borderColor: "#0000FF", color: "#0000FF", textTransform: "none", fontFamily: FONT }}
                >
                  Retry
                </Button>
              </Box>
            ) : addresses.length > 0 ? (
              addresses.map((item) => {
                const isSelected = selectedAddress?.id === item.id;
                return (
                  <Box
                    key={item.id}
                    onClick={() => setSelectedAddress(item)}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: gridColumns,
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
                    <Typography sx={cellSx}>{item.addressId}</Typography>
                    <Typography
                      sx={{ ...cellSx, pr: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {item.addressLabel}
                    </Typography>

                    {!isPanelOpen && (
                      <>
                        <Typography sx={cellSx}>{item.classType}</Typography>

                        <Typography sx={cellSx}>{item.makani}</Typography>

                        <Typography sx={cellSx}>{item.onwani}</Typography>

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
                              fontFamily: FONT,
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

                    {/* Action: View Details (Blue Eye) */}
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
                        }}
                        title="View Details"
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "6px",
                          bgcolor: isSelected ? "#E1EDFB" : "#F0F6FC",
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
                    fontFamily: FONT,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#5A5A5A",
                  }}
                >
                  No address records found
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT,
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
                    fontFamily: FONT,
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
                onClick={() => goToPage(currentPage - 1)}
                sx={navButtonSx(currentPage > 1)}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px" }}>
                  Previous
                </Typography>
              </Box>

              {/* Page Numbers */}
              {buildPageList(currentPage, totalPages).map((p, idx) =>
                p === "…" ? (
                  <Typography key={`ellipsis-${idx}`} sx={{ color: "#ADADAD", px: 0.5, fontSize: "15px" }}>
                    ...
                  </Typography>
                ) : (
                  <Box
                    key={p}
                    onClick={() => goToPage(p)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      bgcolor: currentPage === p ? "#F0F6FC" : "transparent",
                      color: currentPage === p ? "#0000FF" : "#000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontWeight: currentPage === p ? 600 : 400,
                      fontSize: "14px",
                      fontFamily: "var(--font-cairo)",
                      "&:hover": { bgcolor: currentPage === p ? "#E2EEFC" : "#F1F5F9" },
                    }}
                  >
                    {p}
                  </Box>
                )
              )}

              {/* Next Button */}
              <Box
                onClick={() => goToPage(currentPage + 1)}
                sx={navButtonSx(currentPage < totalPages)}
              >
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px" }}>
                  Next
                </Typography>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>

              {/* Total + background loading indicator */}
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#919191", ml: 1 }}>
                {totalCount.toLocaleString()} records
              </Typography>
              {isLoading && addresses.length > 0 && <CircularProgress size={14} sx={{ color: "#0000FF" }} />}
            </Box>
          </Box>
        </Box>

        {/* Right Section: Inline Panel for View Details (Matching Figma) */}
        {selectedAddress && (
          <AddressRegistryInlinePanel mode="view" item={selectedAddress} onClose={() => setSelectedAddress(null)} />
        )}
      </Box>

      {/* Filter Drawer - Opens on top of UI as a popup drawer */}
      <AddressRegistryFilter
        open={isFilterOpen}
        filters={filterDraft}
        onFilterChange={handleFilterChange}
        emirateOptions={lookups?.emirates}
        classOptions={lookups?.buildingTypes}
        statusOptions={lookups?.statuses}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        onClose={() => setIsFilterOpen(false)}
      />
    </Box>
  );
}

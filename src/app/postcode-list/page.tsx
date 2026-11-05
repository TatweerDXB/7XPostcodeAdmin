"use client";

import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import ClearIcon from "@mui/icons-material/Clear";
import { PostcodeItem } from "@/data/postcodeListData";
import {
  PostcodeDetailsCard,
  PostcodeStatisticsCards,
  PostcodeFilterDrawer,
  PostcodeExpandedMapModal,
} from "@/components/postcode";
import type { PostcodeFilterValues } from "@/components/postcode/PostcodeFilterDrawer";
import {
  postcodeService,
  mapPostcodeRowToItem,
  mergeDetailIntoPostcodeItem,
  normalizePostcodeSearchInput,
  parsePostcodeParts,
  toEmirateQueryParam,
} from "@/services/postcodeService";
import { gridService, GridStatisticsDto } from "@/services/gridService";
import { ApiError } from "@/services/apiClient";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/** Builds dynamic page numbers with ellipsis, e.g. [1, 2, 3, "…", 10]. */
function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 4) [2, 3, 4, 5].forEach((p) => pages.add(p));
  if (current >= total - 3)
    [total - 4, total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

function describePostcodeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return "Session expired or unauthorized. Please sign in again.";
    if (err.status === 403) return "You do not have permission to view postcodes.";
    if (err.status === 429) return "Too many requests. Please wait a moment and try again.";
    if (err.status === 502 || err.status === 503)
      return "The postcode service is temporarily unavailable. Please try again shortly.";
  }
  return "Could not load postcodes from the server. Please try again.";
}

export default function PostcodeListPage() {
  const [postcodeItems, setPostcodeItems] = useState<PostcodeItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Top KPI statistics state
  const [gridStats, setGridStats] = useState<GridStatisticsDto | null>(null);

  // Search & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Selected postcode & detail loading state (GET /api/postcodes/{postcode})
  const [selectedPostcode, setSelectedPostcode] = useState<PostcodeItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const detailAbortRef = useRef<AbortController | null>(null);

  // Filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<PostcodeFilterValues>({
    emirate: "All Emirates",
    status: "All Status",
  });

  // Expanded map modal state
  const [isExpandedMapOpen, setIsExpandedMapOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const next = searchQuery.trim();
    if (next === appliedSearch) return;
    const timer = setTimeout(() => {
      setAppliedSearch(next);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, appliedSearch]);

  const handleSearchSubmit = () => {
    const next = searchQuery.trim();
    if (next !== appliedSearch) {
      setAppliedSearch(next);
      setCurrentPage(1);
    } else {
      setReloadKey((k) => k + 1);
    }
  };

  // Load KPI statistics (filtered by emirate when applicable)
  useEffect(() => {
    const controller = new AbortController();
    const emirateParam = toEmirateQueryParam(filters.emirate);

    gridService
      .getGridStatistics({ emirate: emirateParam }, { signal: controller.signal, retries: 0 })
      .then((res) => {
        if (!controller.signal.aborted && res?.success && res.data) {
          setGridStats(res.data);
        }
      })
      .catch(() => {
        // Non-blocking: KPI cards fall back to totalCount from GET /api/postcodes
      });

    return () => controller.abort();
  }, [filters.emirate, reloadKey]);

  // Fetch paginated postcode list via GET /api/postcodes
  // and enrich rows via GET /api/postcodes/{postcode}
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    const normalizedSearch = normalizePostcodeSearchInput(appliedSearch);
    const emirateParam = toEmirateQueryParam(filters.emirate);

    (async () => {
      try {
        const res = await postcodeService.searchPostcodes(
          {
            search: normalizedSearch,
            emirate: emirateParam,
            Page: currentPage,
            PageSize: PAGE_SIZE,
          },
          { signal: controller.signal, retries: 0 }
        );

        if (controller.signal.aborted) return;

        const rows = Array.isArray(res?.data) ? res.data : [];
        let mapped = rows.map((row, idx) =>
          mapPostcodeRowToItem(row, (currentPage - 1) * PAGE_SIZE + idx + 1)
        );
        let resolvedTotal = res?.totalCount ?? mapped.length;

        // If backend returned 0 rows when filtering by emirate (because emirateCode is null in DB),
        // fallback to fetching postcodes and filtering by coordinate-inferred emirate
        if (mapped.length === 0 && emirateParam) {
          const fallbackRes = await postcodeService.searchPostcodes(
            {
              search: normalizedSearch,
              Page: 1,
              PageSize: 200,
            },
            { signal: controller.signal, retries: 0 }
          );
          if (controller.signal.aborted) return;
          const allRows = Array.isArray(fallbackRes?.data) ? fallbackRes.data : [];
          const allMapped = allRows
            .map((r, i) => mapPostcodeRowToItem(r, i + 1))
            .filter((item) => item.emirate.toLowerCase() === filters.emirate.toLowerCase());
          resolvedTotal = allMapped.length;
          const startIdx = (currentPage - 1) * PAGE_SIZE;
          mapped = allMapped
            .slice(startIdx, startIdx + PAGE_SIZE)
            .map((item, idx) => ({ ...item, rowNumber: startIdx + idx + 1 }));
        }

        // If user searched a specific 8-digit postcode and GET /api/postcodes returned empty,
        // try resolving it directly via GET /api/postcodes/{postcode}
        const searchDigits = normalizedSearch?.replace(/\D/g, "") || "";
        if (mapped.length === 0 && searchDigits.length === 8 && normalizedSearch) {
          const detail = await postcodeService.getPostcodeDetailCached(normalizedSearch, {
            signal: controller.signal,
          });
          if (controller.signal.aborted) return;
          if (detail?.cell) {
            const parsed = parsePostcodeParts(
              detail.cell.postcode || normalizedSearch,
              detail.cell.postcodeDisplay,
              detail.cell.hierarchyCode
            );
            const fallbackBase = mapPostcodeRowToItem(
              {
                postcode: detail.cell.postcode || parsed.formatted,
                postcodeDisplay: detail.cell.postcodeDisplay || parsed.formatted,
                gridId: detail.cell.gridId || parsed.formatted,
                centroidLatitude: Number(detail.cell.centroidLatitude ?? 25.1972),
                centroidLongitude: Number(detail.cell.centroidLongitude ?? 55.2744),
                emirateCode: detail.cell.emirateCode,
                localityNameEn: detail.cell.nameEn || detail.cell.name,
                maskStatusCode: detail.cell.maskStatusCode,
              },
              1
            );
            mapped = [mergeDetailIntoPostcodeItem(fallbackBase, detail)];
            resolvedTotal = 1;
          }
        }

        setPostcodeItems(mapped);
        setTotalCount(resolvedTotal);
        setIsLoading(false);

        // Enrich current page items with GET /api/postcodes/{postcode} details in background
        if (mapped.length > 0) {
          const enriched = await postcodeService.enrichPostcodeItems(mapped, controller.signal);
          if (controller.signal.aborted) return;
          setPostcodeItems(enriched);
          setSelectedPostcode((prev) => {
            if (!prev) return null;
            const match = enriched.find(
              (e) => e.id === prev.id || e.rawPostcode === prev.rawPostcode
            );
            return match ? { ...match, ...prev, status: match.status, chips: match.chips } : prev;
          });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setPostcodeItems([]);
        setTotalCount(0);
        setLoadError(describePostcodeError(err));
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [appliedSearch, filters.emirate, currentPage, reloadKey]);

  // Apply client-side status filter if selected in Filter Drawer
  const displayedItems = postcodeItems.filter((item) => {
    if (filters.status !== "All Status") {
      return item.status.toLowerCase() === filters.status.toLowerCase();
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageNumbers = buildPageList(currentPage, totalPages);

  // Row click handler: selects row immediately and calls GET /api/postcodes/{postcode}
  const handleRowClick = async (item: PostcodeItem) => {
    if (detailAbortRef.current) {
      detailAbortRef.current.abort();
    }
    const controller = new AbortController();
    detailAbortRef.current = controller;

    setSelectedPostcode(item);
    setIsLoadingDetail(true);

    try {
      const fullItem = await postcodeService.fetchFullPostcodeDetail(item, controller.signal);
      if (controller.signal.aborted) return;
      setSelectedPostcode(fullItem);
      setPostcodeItems((prev) =>
        prev.map((p) =>
          p.id === item.id || p.rawPostcode === item.rawPostcode ? fullItem : p
        )
      );
    } catch {
      // Keep base item displayed if detail call fails
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingDetail(false);
      }
    }
  };

  const handleCloseDetails = () => {
    if (detailAbortRef.current) {
      detailAbortRef.current.abort();
    }
    setSelectedPostcode(null);
    setIsLoadingDetail(false);
  };

  const handleApplyFilters = (newFilters: PostcodeFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      emirate: "All Emirates",
      status: "All Status",
    });
    setCurrentPage(1);
    setIsFilterDrawerOpen(false);
  };

  // Compute KPI card numbers from live endpoints
  const kpiTotalPostcodes = gridStats?.postcodeCount ?? totalCount;
  const kpiPublishedCount =
    gridStats?.unmaskedCellCount ??
    (totalCount > 0
      ? totalCount
      : postcodeItems.filter((i) => i.status === "Published").length);
  const kpiMaskedCount =
    gridStats?.maskedCellCount ??
    postcodeItems.filter((i) => i.status === "Masked").length;
  const kpiEmiratesCount = filters.emirate !== "All Emirates" ? 1 : 7;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: { xs: "16px 20px 32px 20px", md: "24px 32px 48px 32px" },
        bgcolor: "#F9FBFD",
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {/* KPI Statistics Cards (shown when not in split-view) */}
      {!selectedPostcode && (
        <Box sx={{ flexShrink: 0 }}>
          <PostcodeStatisticsCards
            totalPostcodes={kpiTotalPostcodes}
            publishedCount={kpiPublishedCount}
            maskedCount={kpiMaskedCount}
            emiratesCount={kpiEmiratesCount}
          />
        </Box>
      )}

      {/* Main Content Area (Table + Split Postcode Details Card) */}
      <Box
        sx={{
          display: "flex",
          gap: "24px",
          width: "100%",
          alignItems: "flex-start",
          flexShrink: 0,
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
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
                  onClick={() => {
                    setSearchQuery("");
                    setAppliedSearch("");
                    setCurrentPage(1);
                  }}
                  sx={{ color: "#919191", p: 0.5, mr: 0.5 }}
                >
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}

              {/* Blue Magnifying Glass Search Button */}
              <Button
                variant="contained"
                onClick={handleSearchSubmit}
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
                border:
                  filters.emirate !== "All Emirates" || filters.status !== "All Status"
                    ? "1.5px solid #0000FF"
                    : "1px solid #DEDEDE",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color:
                  filters.emirate !== "All Emirates" || filters.status !== "All Status"
                    ? "#0000FF"
                    : "#000000",
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

            {/* Loading State */}
            {isLoading && (
              <Box
                sx={{
                  py: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                }}
              >
                <CircularProgress size={28} sx={{ color: "#0000FF" }} />
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    color: "#64748B",
                  }}
                >
                  Loading postcodes...
                </Typography>
              </Box>
            )}

            {/* Error State */}
            {!isLoading && loadError && (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    color: "#D83731",
                  }}
                >
                  {loadError}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setReloadKey((k) => k + 1)}
                  sx={{
                    textTransform: "none",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    borderColor: "#0000FF",
                    color: "#0000FF",
                  }}
                >
                  Retry
                </Button>
              </Box>
            )}

            {/* Table Rows */}
            {!isLoading &&
              !loadError &&
              displayedItems.map((item) => {
                const isSelected =
                  selectedPostcode?.id === item.id ||
                  (Boolean(selectedPostcode?.rawPostcode) &&
                    selectedPostcode?.rawPostcode === item.rawPostcode);
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

            {!isLoading && !loadError && displayedItems.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography
                  sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", color: "#64748B" }}
                >
                  No postcodes match your search and filter criteria.
                </Typography>
              </Box>
            )}

            {/* Pagination Row */}
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
                  disabled={currentPage === 1 || isLoading}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11 12L7 8L11 4M7 12L3 8L7 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>

                {/* < (Previous Page) */}
                <IconButton
                  size="small"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>

                {/* Dynamic Page Numbers */}
                {pageNumbers.map((entry, idx) =>
                  entry === "…" ? (
                    <Typography
                      key={`ellipsis-${idx}`}
                      sx={{ color: "#8E8E93", px: 0.5, fontSize: "14px" }}
                    >
                      ...
                    </Typography>
                  ) : (
                    <Box
                      key={entry}
                      onClick={() => !isLoading && setCurrentPage(entry)}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        bgcolor: currentPage === entry ? "#0000FF" : "transparent",
                        color: currentPage === entry ? "#FFFFFF" : "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: isLoading ? "default" : "pointer",
                        fontWeight: currentPage === entry ? 700 : 500,
                        fontSize: "13px",
                        fontFamily: "var(--font-cairo)",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          bgcolor: currentPage === entry ? "#0000FF" : "#F1F5F9",
                        },
                      }}
                    >
                      {entry}
                    </Box>
                  )
                )}

                {/* > (Next Page) */}
                <IconButton
                  size="small"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>

                {/* >> (Last Page) */}
                <IconButton
                  size="small"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages || isLoading}
                  sx={{ color: "#000000", p: 0.6 }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M5 4L9 8L5 12M9 4L13 8L9 12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                  value={Math.min(currentPage, totalPages)}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  disabled={isLoading}
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
                    <MenuItem
                      key={num}
                      value={num}
                      sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px" }}
                    >
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

        {/* Right Container: Postcode Details Card */}
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
              isLoadingDetail={isLoadingDetail}
              onClose={handleCloseDetails}
              onExpandMap={() => setIsExpandedMapOpen(true)}
            />
          </Box>
        )}
      </Box>

      {/* Filter Slide-over Drawer */}
      <PostcodeFilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        appliedFilters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Expanded Map View Modal */}
      <PostcodeExpandedMapModal
        open={isExpandedMapOpen}
        onClose={() => setIsExpandedMapOpen(false)}
        item={selectedPostcode}
      />
    </Box>
  );
}

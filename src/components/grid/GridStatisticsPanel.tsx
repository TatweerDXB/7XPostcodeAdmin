"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import { GRID_STATISTICS_DATA, GridStatItem } from "@/data/portalSearchData";
import { gridService, GridStatisticsDto } from "@/services/gridService";

function renderStatIcon(iconType: GridStatItem["iconType"], color: string) {
  switch (iconType) {
    case "grid-amber":
    case "grid-red":
    case "grid-purple":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
          <rect x="11.5" y="2" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
          <rect x="2" y="11.5" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
          <rect x="11.5" y="11.5" width="6.5" height="6.5" rx="1.5" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case "postcodes-teal":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 4H17C17.55 4 18 4.45 18 5V14C18 14.55 17.55 15 17 15H3C2.45 15 2 14.55 2 14V5C2 4.45 2.45 4 3 4Z"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M2.5 5L10 10.5L17.5 5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "buildings-pink":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 17.5H18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 17.5V3.5C4 2.95 4.45 2.5 5 2.5H11C11.55 2.5 12 2.95 12 3.5V17.5" stroke={color} strokeWidth="1.6" />
          <path d="M12 7.5H15C15.55 7.5 16 7.95 16 8.5V17.5" stroke={color} strokeWidth="1.6" />
          <path d="M7 6H9M7 9H9M7 12H9" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "addresses-orange":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.6" />
          <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.6" />
          <path d="M10 2V4M10 16V18M2 10H4M16 10H18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "units-blue":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 8.5L10 3L17 8.5V16.5C17 17.05 16.55 17.5 16 17.5H4C3.45 17.5 3 17.05 3 16.5V8.5Z" stroke={color} strokeWidth="1.6" />
          <path d="M8 17.5V12H12V17.5" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    case "makani-purple":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="14" height="14" rx="3" stroke={color} strokeWidth="1.6" />
          <path d="M7 10L9 12L13 8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "onwani-brown":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 17.5H17.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 17.5V7L10 2.5L16 7V17.5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="8" y="11" width="4" height="6.5" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case "makani-mapped-green":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M9 13.5L4 8.5L8.5 4H15.5V11L10.5 16L9 13.5Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12.5" cy="7" r="1.5" fill={color} />
        </svg>
      );
    case "onwani-mapped-lime":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 8L10 2.5L17 8V16.5C17 17.05 16.55 17.5 16 17.5H4C3.45 17.5 3 17.05 3 16.5V8Z" stroke={color} strokeWidth="1.6" />
          <path d="M7.5 11L9.5 13L13 9.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "verified-green":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.6" />
          <path d="M7 10L9 12L13.5 7.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "coverage-blue":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3.5" y="2.5" width="13" height="15" rx="2" stroke={color} strokeWidth="1.6" />
          <path d="M7 7H13M7 10.5H13M7 14H10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "postcodes-alert-rose":
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5H17V15H3V5Z" stroke={color} strokeWidth="1.6" />
          <path d="M10 8V10.5M10 13H10.01" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

interface GridStatisticsPanelProps {
  onClose?: () => void;
  code?: string;
  emirate?: string;
}

export default function GridStatisticsPanel({ onClose, code, emirate }: GridStatisticsPanelProps) {
  const [statsData, setStatsData] = useState<GridStatItem[]>(GRID_STATISTICS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const requestSeqRef = useRef<number>(0);

  const fetchStatistics = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    setIsLoading(true);
    setErrorNotice(null);
    try {
      const response = await gridService.getGridStatistics({
        code: code || undefined,
        emirate: emirate || undefined,
      });
      if (seq !== requestSeqRef.current) return;

      if (response && response.success && response.data) {
        const d: GridStatisticsDto = response.data;
        setStatsData((prev) =>
          prev.map((item) => {
            let val: string | number = "—";
            switch (item.id) {
              case "total-grid-cells": {
                const total = (d.maskedCellCount ?? 0) + (d.unmaskedCellCount ?? 0);
                val = total > 0 ? total : d.unmaskedCellCount != null ? total : "—";
                break;
              }
              case "masked-cells":
                val = d.maskedCellCount != null ? d.maskedCellCount : "—";
                break;
              case "unmasked-cells":
                val = d.unmaskedCellCount != null ? d.unmaskedCellCount : "—";
                break;
              case "total-postcodes":
                val = d.postcodeCount != null ? d.postcodeCount.toLocaleString() : "—";
                break;
              case "total-buildings":
                val = d.buildingCount != null ? d.buildingCount.toLocaleString() : "—";
                break;
              case "total-addresses":
                val = d.addressCount != null ? d.addressCount.toLocaleString() : "—";
                break;
              case "total-units":
                val = d.unitCount != null ? d.unitCount.toLocaleString() : "—";
                break;
              case "makani-listed":
                val = d.makaniListedCount != null ? d.makaniListedCount.toLocaleString() : "—";
                break;
              case "onwani-listed":
                val = d.onwaniListedCount != null ? d.onwaniListedCount.toLocaleString() : "—";
                break;
              case "makani-mapped":
                val = d.makaniMappedCount != null ? d.makaniMappedCount.toLocaleString() : "—";
                break;
              case "onwani-mapped":
                val = d.onwaniMappedCount != null ? d.onwaniMappedCount.toLocaleString() : "—";
                break;
              case "verified-addresses":
                val = d.verifiedAddressCount != null ? d.verifiedAddressCount.toLocaleString() : "—";
                break;
              case "coverage":
                val = d.buildingCoveragePercent != null ? `${d.buildingCoveragePercent}%` : "—";
                break;
              case "postcodes-without-buildings":
                val = d.postcodesWithoutBuildingsCount != null ? d.postcodesWithoutBuildingsCount.toLocaleString() : "—";
                break;
            }
            return { ...item, value: val };
          })
        );
        setLastUpdated(new Date());
      }
    } catch (err: unknown) {
      if (seq === requestSeqRef.current) {
        const msg = err instanceof Error ? err.message : "Unable to load live statistics";
        setErrorNotice(msg);
      }
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, [code, emirate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
        borderRadius: "8px",
        p: "18px 16px",
        boxSizing: "border-box",
        boxShadow: "0 2px 14px rgba(0, 0, 0, 0.05)",
        border: "1px solid #EAEFEF",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: 5,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#D1D5DB",
          borderRadius: 3,
        },
      }}
    >
      {/* Title Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "16px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
              fontSize: "19px",
              fontWeight: 700,
              color: "#000000",
              letterSpacing: "-0.2px",
            }}
          >
            Grid Statistics
          </Typography>
          {code && (
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#2563EB",
                bgcolor: "rgba(37, 99, 235, 0.1)",
                px: 1,
                py: 0.25,
                borderRadius: "4px",
                fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
              }}
            >
              {code}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={isLoading ? "Updating statistics..." : "Refresh statistics"}>
            <span>
              <IconButton
                size="small"
                onClick={fetchStatistics}
                disabled={isLoading}
                sx={{ color: "#64748B", p: 0.5 }}
              >
                {isLoading ? (
                  <CircularProgress size={16} sx={{ color: "#2563EB" }} />
                ) : (
                  <RefreshIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          {onClose && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                p: 0.5,
                color: "#000000",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#F1F5F9",
                  transform: "scale(1.08)",
                },
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="1.5" />
                <path d="M9 9L15 15M15 9L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </IconButton>
          )}
        </Box>
      </Box>

      {/* 2-column Grid of Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        }}
      >
        {statsData.map((item) => (
          <Box
            key={item.id}
            sx={{
              bgcolor: "#FFFFFF",
              border: `1px solid ${item.borderColor}`,
              borderRadius: "8px",
              p: "6px 8px",
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: "8px",
              minHeight: item.label.length > 18 ? 72 : 58,
              boxSizing: "border-box",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `0 4px 10px ${item.bgColor}`,
              },
            }}
          >
            {/* Left Icon Box (28x28 matching Figma) */}
            <Box
              sx={{
                width: 28,
                height: 28,
                minWidth: 28,
                minHeight: 28,
                borderRadius: "5px",
                bgcolor: item.bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {renderStatIcon(item.iconType, item.color)}
            </Box>

            {/* Right Text Column */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                minWidth: 0,
                flex: 1,
              }}
            >
              {/* Label */}
              <Typography
                sx={{
                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "#000000",
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>

              {/* Value */}
              {isLoading ? (
                <Skeleton
                  variant="rectangular"
                  width={64}
                  height={20}
                  sx={{ borderRadius: "4px", mt: "2px" }}
                  animation="wave"
                />
              ) : (
                <Typography
                  sx={{
                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: item.color,
                    lineHeight: 1.1,
                    mt: "2px",
                  }}
                >
                  {item.value}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

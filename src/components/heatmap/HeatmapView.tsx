"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import Drawer from "@mui/material/Drawer";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import type { Map as LeafletMap, LayerGroup, Marker, Rectangle } from "leaflet";
import {
  HeatmapMetric,
  TierLevel,
  TIER_CONFIGS,
  DENSITY_PALETTE,
  generateTierCells,
  HEATMAP_STATISTICS,
} from "@/data/heatmapData";
import { sanitizeHtml } from "@/utils/security";

export default function HeatmapView() {
  const [activeTier, setActiveTier] = useState<TierLevel>(1);
  const [activeMetric, setActiveMetric] = useState<HeatmapMetric>("deliveries");
  
  // Filter Drawer State (matching Figma right-slide full-height drawer)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterPostcode, setFilterPostcode] = useState("DXB-00087");
  const [filterArea, setFilterArea] = useState("Business Bay");
  const [_filterTier, setFilterTier] = useState<TierLevel | null>(null);
  const [filterEmirate, setFilterEmirate] = useState("All Emirates");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterPropertyType, setFilterPropertyType] = useState("All Types");
  const [filterAttempts, setFilterAttempts] = useState("All");

  const handleClearFilters = () => {
    setFilterPostcode("");
    setFilterArea("");
    setFilterTier(null);
    setFilterEmirate("All Emirates");
    setFilterStatus("All Status");
    setFilterPropertyType("All Types");
    setFilterAttempts("All");
  };

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const gridLayerGroupRef = useRef<LayerGroup | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);
  const handleTierChangeRef = useRef<(newTier: TierLevel) => void>(() => {});

  // Render Grid Cells, Density Colors, Numbers, Pin, and Postcodes
  const renderGridLayers = useCallback(
    async (tier: TierLevel) => {
      if (!mapInstanceRef.current) return;
      const L = await import("leaflet");

      const map = mapInstanceRef.current;

      // Ensure layer group is attached to the active map instance
      if (!gridLayerGroupRef.current || !map.hasLayer(gridLayerGroupRef.current)) {
        gridLayerGroupRef.current = L.layerGroup().addTo(map);
      } else {
        gridLayerGroupRef.current.clearLayers();
      }

      const group = gridLayerGroupRef.current;

      const config = TIER_CONFIGS[tier];
      const cells = generateTierCells(tier);

      const { south, north, west, east } = config.bounds;
      const latStep = (north - south) / 10;
      const lngStep = (east - west) / 10;

      let targetCellCenter: [number, number] | null = null;

      cells.forEach((cell) => {
        const cellNorth = north - cell.row * latStep;
        const cellSouth = cellNorth - latStep;
        const cellWest = west + cell.col * lngStep;
        const cellEast = cellWest + lngStep;

        const bounds: [[number, number], [number, number]] = [
          [cellSouth, cellWest],
          [cellNorth, cellEast],
        ];

        const isTarget = cell.row === config.targetRow && cell.col === config.targetCol;
        const cellCenterLat = (cellNorth + cellSouth) / 2;
        const cellCenterLng = (cellWest + cellEast) / 2;

        if (isTarget) {
          targetCellCenter = [cellCenterLat, cellCenterLng];
        }

        const palette = DENSITY_PALETTE[cell.colorLevel];
        const fillColor = isTarget ? config.activeHexFill : palette.hex;
        const fillOpacity = isTarget ? 0.85 : palette.opacity;
        const strokeColor = isTarget ? "#FFFFFF" : "#0000FF";
        const strokeWidth = isTarget ? 2.0 : 0.8;
        const dashArray = isTarget ? undefined : "3, 3";

        // Draw Cell Rectangle
        const rect: Rectangle = L.rectangle(bounds, {
          color: strokeColor,
          weight: strokeWidth,
          dashArray: dashArray,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          interactive: true,
          bubblingMouseEvents: false,
        });

        const safeDisplayCode = sanitizeHtml(cell.displayCode);
        const safeDeliveries = sanitizeHtml(cell.deliveries.toLocaleString());
        const safeRepeatRate = sanitizeHtml(cell.repeatRate);
        const safeUnstructuredRate = sanitizeHtml(cell.unstructuredRate);
        const safePostcode = cell.postcode ? sanitizeHtml(cell.postcode) : "";

        // Hover tooltip with metrics
        const tooltipHtml = `
          <div style="font-family: 'Cairo', sans-serif; padding: 6px 10px; font-size: 13px; line-height: 1.4; color: #101828;">
            <div style="font-weight: 700; color: #0000FF; margin-bottom: 2px;">
              ${tier === 1 ? `Cell ${safeDisplayCode}` : `Tier ${tier} Cell [${safeDisplayCode}]`}
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px;">
              <span style="color: #64748B;">Deliveries:</span>
              <span style="font-weight: 600;">${safeDeliveries}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px;">
              <span style="color: #64748B;">Repeat Attempts:</span>
              <span style="font-weight: 600;">${safeRepeatRate}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px;">
              <span style="color: #64748B;">Unstructured %:</span>
              <span style="font-weight: 600;">${safeUnstructuredRate}%</span>
            </div>
            ${safePostcode ? `
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #CBD5E1; font-size: 11px; color: #475569;">
                Postcode: <strong>${safePostcode}</strong>
              </div>
            ` : ""}
          </div>
        `;

        rect.bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -5],
          opacity: 0.96,
        });

        // Click on cell to drill in
        rect.on("click", (e) => {
          if (e && e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          if (tier < 4) {
            handleTierChangeRef.current((tier + 1) as TierLevel);
          }
        });

        rect.addTo(group);

        // Center Cell Marker / Label
        if (tier === 4 && cell.postcode) {
          // Floating Postcode Chips per Figma Screenshot 3
          const postcodeBadge = L.divIcon({
            className: "heatmap-clean-div-icon",
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                background: #FFFFFF;
                border: 1px solid #DEDEDE;
                border-radius: 4px;
                padding: 3px 6px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                font-family: 'Cairo', sans-serif;
                font-size: 12px;
                font-weight: 500;
                color: #000000;
                white-space: nowrap;
                pointer-events: none;
                transform: translate(-50%, -50%);
              ">
                ${safePostcode}
              </div>
            `,
            iconSize: [88, 30],
            iconAnchor: [44, 15],
          });

          L.marker([cellCenterLat, cellCenterLng], {
            icon: postcodeBadge,
            interactive: false,
          }).addTo(group);
        } else {
          // Cell Numbers (e.g. 2..51 in Tier 1, 00..99 in Tiers 2 & 3)
          const numberIcon = L.divIcon({
            className: "heatmap-clean-div-icon",
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Cairo', sans-serif;
                font-size: ${tier === 1 ? "13px" : "14px"};
                font-weight: ${isTarget ? "700" : "500"};
                color: ${isTarget ? "#FFFFFF" : tier === 1 ? "#0000FF" : "rgba(0, 0, 0, 0.75)"};
                text-shadow: ${isTarget ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 2px rgba(255,255,255,0.85)"};
                pointer-events: none;
                transform: translate(-50%, -50%);
              ">
                ${safeDisplayCode}
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([cellCenterLat, cellCenterLng], {
            icon: numberIcon,
            interactive: false,
          }).addTo(group);
        }
      });

      // Red Spotlight Pin Marker on target cell for Tiers 2, 3, 4
      if (pinMarkerRef.current) {
        pinMarkerRef.current.remove();
        pinMarkerRef.current = null;
      }

      if (tier >= 2 && targetCellCenter) {
        const spotlightIcon = L.divIcon({
          className: "heatmap-clean-div-icon",
          html: `
            <div style="position: relative; width: 30px; height: 48px; transform: translate(-50%, -100%); filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.35));">
              <svg width="30" height="48" viewBox="0 0 30 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Drop shadow ellipse -->
                <ellipse cx="15" cy="45" rx="6" ry="2.5" fill="rgba(0, 0, 0, 0.25)" />
                <!-- Red Teardrop Location Pin -->
                <path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 44 15 44C15 44 30 26.25 30 15C30 6.716 23.284 0 15 0Z" fill="#EA352B" />
                <!-- Inner circular core -->
                <circle cx="15" cy="15" r="7" fill="rgba(0, 0, 0, 0.38)" />
                <circle cx="15" cy="15" r="3.2" fill="#FFFFFF" />
              </svg>
            </div>
          `,
          iconSize: [30, 48],
          iconAnchor: [15, 48],
        });

        const pinMarker = L.marker(targetCellCenter, {
          icon: spotlightIcon,
          zIndexOffset: 1000,
          interactive: false,
        });

        pinMarker.addTo(group);
        pinMarkerRef.current = pinMarker;
      }
    },
    []
  );

  // Initialize Map
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const L = await import("leaflet");
      if (cancelled) return;

      // Clean up previous instance on container if needed
      type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };
      const container = mapContainerRef.current as LeafletContainer;
      if (container._leaflet_id && mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        renderGridLayers(activeTier || 1);
        return;
      } else if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      const initialTier = activeTier || 1;
      const config = TIER_CONFIGS[initialTier];

      const map = new L.Map(mapContainerRef.current, {
        center: config.center,
        zoom: config.zoom,
        zoomControl: false,
        attributionControl: false,
        minZoom: 5,
        maxZoom: 19,
      });

      // Crisp Google Maps tile layer
      const googleTileLayer = L.tileLayer(
        "https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}",
        {
          subdomains: ["0", "1", "2", "3"],
          maxZoom: 20,
        }
      );
      googleTileLayer.addTo(map);

      const gridLayerGroup = L.layerGroup().addTo(map);
      gridLayerGroupRef.current = gridLayerGroup;
      mapInstanceRef.current = map;

      // Fit bounds for Tier 1 UAE National Grid initially so it is framed properly
      const { south, north, west, east } = config.bounds;
      map.fitBounds(
        [
          [south, west],
          [north, east],
        ],
        { padding: [20, 20] }
      );

      // Render grid cells immediately
      renderGridLayers(initialTier);

      // Multiple safety ticks to ensure Leaflet recalculates layout and paints cells
      setTimeout(() => {
        if (!cancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          renderGridLayers(initialTier);
        }
      }, 100);

      setTimeout(() => {
        if (!cancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          renderGridLayers(initialTier);
        }
      }, 400);

      map.whenReady(() => {
        if (!cancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          renderGridLayers(initialTier);
        }
      });
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      gridLayerGroupRef.current = null;
      pinMarkerRef.current = null;
    };
  }, [renderGridLayers, activeTier]);

  // Handle Tier Switching
  const handleTierChange = useCallback((newTier: TierLevel) => {
    setActiveTier(newTier);
    setFilterTier(newTier);
    if (!mapInstanceRef.current) return;

    const config = TIER_CONFIGS[newTier];
    const { south, north, west, east } = config.bounds;

    mapInstanceRef.current.flyToBounds(
      [
        [south, west],
        [north, east],
      ],
      {
        duration: 1.2,
        easeLinearity: 0.25,
        padding: [20, 20],
      }
    );

    renderGridLayers(newTier);
  }, [renderGridLayers]);

  useEffect(() => {
    handleTierChangeRef.current = handleTierChange;
  }, [handleTierChange]);

  // Zoom In / Out Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "#F9FBFD",
        py: "12px",
      }}
    >
      <style>{`
        .heatmap-clean-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      {/* Main 1156px Container matching Figma */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1156px",
          px: { xs: "16px", md: "0px" },
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* SECTION 1: Statistics Header (Frame 9208) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            height: 40,
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 600,
              fontSize: "24px",
              lineHeight: "40px",
              color: "#000000",
            }}
          >
            Statistics
          </Typography>

          <IconButton
            id="heatmap-filter-btn"
            onClick={(e) => {
              e.stopPropagation();
              setFilterDrawerOpen(true);
            }}
            aria-label="Filter Statistics"
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#F0F6FC",
              border: "1px solid rgba(0, 0, 255, 0.15)",
              borderRadius: "4px",
              p: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#E1EEFA",
              },
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.83 3.5H17.17M5.5 8.5H14.5M8.5 13.5H11.5"
                stroke="#000000"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>

          {/* Full-Height Right Slide Filter Drawer (Matching Image 5) */}
          <Drawer
            anchor="right"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            slotProps={{
              backdrop: {
                sx: { bgcolor: "rgba(0, 0, 0, 0.25)" },
              },
              paper: {
                sx: {
                  width: { xs: "100%", sm: 380 },
                  maxWidth: "100vw",
                  height: "100%",
                  bgcolor: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.12)",
                  p: { xs: "20px 16px", sm: "24px 20px" },
                  boxSizing: "border-box",
                },
              },
            }}
          >
            {/* Drawer Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: "16px",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 700,
                  fontSize: "22px",
                  color: "#111827",
                  lineHeight: "28px",
                }}
              >
                Filter
              </Typography>

              <IconButton
                id="close-filter-drawer-btn"
                onClick={() => setFilterDrawerOpen(false)}
                aria-label="Close Filter"
                sx={{
                  p: "4px",
                  color: "#111827",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10.5" stroke="#111827" strokeWidth="1.5" />
                  <path d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </IconButton>
            </Box>

            {/* Scrollable Form Body */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                py: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                pr: "2px",
              }}
            >
              {/* Field 1: Postcode */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4B5563",
                  }}
                >
                  Postcode
                </Typography>
                <OutlinedInput
                  id="filter-postcode-input"
                  size="small"
                  fullWidth
                  value={filterPostcode}
                  onChange={(e) => setFilterPostcode(e.target.value)}
                  placeholder="DXB-00087"
                  endAdornment={
                    filterPostcode ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setFilterPostcode("")}
                          aria-label="Clear postcode"
                          sx={{ p: 0.25 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="#9CA3AF" strokeWidth="1.5" />
                            <path d="M7 7L13 13M13 7L7 13" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                  sx={{
                    borderRadius: "6px",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    height: "44px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0000FF" },
                  }}
                />
              </Box>

              {/* Field 2: Area/Community */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4B5563",
                  }}
                >
                  Area/Community
                </Typography>
                <OutlinedInput
                  id="filter-area-input"
                  size="small"
                  fullWidth
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  placeholder="Business Bay"
                  endAdornment={
                    filterArea ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setFilterArea("")}
                          aria-label="Clear area"
                          sx={{ p: 0.25 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="#9CA3AF" strokeWidth="1.5" />
                            <path d="M7 7L13 13M13 7L7 13" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }
                  sx={{
                    borderRadius: "6px",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    height: "44px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0000FF" },
                  }}
                />
              </Box>

              {/* Field 3: Postal Tier */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4B5563",
                  }}
                >
                  Postal Tier
                </Typography>

                {/* 4 Colored Tier Chips matching Screenshot */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "6px",
                    width: "100%",
                  }}
                >
                  {[
                    { tier: 1 as TierLevel, label: "Tier 1", color: "#6366F1" },
                    { tier: 2 as TierLevel, label: "Tier 2", color: "#4B5563" },
                    { tier: 3 as TierLevel, label: "Tier 3", color: "#22C55E" },
                    { tier: 4 as TierLevel, label: "Tier 4", color: "#F97316" },
                  ].map(({ tier, label, color }) => {
                    const isSelected = activeTier === tier;
                    return (
                      <ButtonBase
                        key={tier}
                        id={`filter-tier-chip-${tier}`}
                        onClick={() => handleTierChange(tier)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          p: "6px 8px",
                          height: "36px",
                          bgcolor: isSelected ? "#F0F6FC" : "#FFFFFF",
                          border: isSelected ? "1.5px solid #2563EB" : "1px solid #E5E7EB",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            borderColor: "#9CA3AF",
                            bgcolor: isSelected ? "#F0F6FC" : "#F9FAFB",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "2px",
                            bgcolor: color,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "var(--font-cairo), Cairo, sans-serif",
                            fontSize: "13px",
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? "#1D4ED8" : "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </Typography>
                      </ButtonBase>
                    );
                  })}
                </Box>

                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "12px",
                    color: "#6B7280",
                    lineHeight: 1.45,
                    mt: "2px",
                  }}
                >
                  Deliveries per grid cell, Sep 2025 - Sep 2026: T1≥ 5,000 · T2 1,000-4,999 · T3 100-999 · T4 &lt;100
                </Typography>
              </Box>

              {/* Field 4: Emirate */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4B5563",
                  }}
                >
                  Emirate
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    id="filter-emirate-select"
                    value={filterEmirate}
                    onChange={(e) => setFilterEmirate(e.target.value)}
                    sx={{
                      borderRadius: "6px",
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontSize: "14px",
                      height: "44px",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0000FF" },
                    }}
                  >
                    <MenuItem value="All Emirates">All Emirates</MenuItem>
                    <MenuItem value="Dubai">Dubai</MenuItem>
                    <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
                    <MenuItem value="Sharjah">Sharjah</MenuItem>
                    <MenuItem value="Ajman">Ajman</MenuItem>
                    <MenuItem value="Ras Al Khaimah">Ras Al Khaimah</MenuItem>
                    <MenuItem value="Fujairah">Fujairah</MenuItem>
                    <MenuItem value="Umm Al Quwain">Umm Al Quwain</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Field 5: Status */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4B5563",
                  }}
                >
                  Status
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    id="filter-status-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{
                      borderRadius: "6px",
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontSize: "14px",
                      height: "44px",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0000FF" },
                    }}
                  >
                    <MenuItem value="All Status">All Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Provisional">Provisional</MenuItem>
                    <MenuItem value="Pending Verification">Pending Verification</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Field 6: Property/Address Type */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4B5563",
                  }}
                >
                  Property/Address Type
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    id="filter-property-type-select"
                    value={filterPropertyType}
                    onChange={(e) => setFilterPropertyType(e.target.value)}
                    sx={{
                      borderRadius: "6px",
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontSize: "14px",
                      height: "44px",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CA3AF" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0000FF" },
                    }}
                  >
                    <MenuItem value="All Types">All Types</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                    <MenuItem value="Residential">Residential</MenuItem>
                    <MenuItem value="Government">Government</MenuItem>
                    <MenuItem value="Industrial">Industrial</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Field 7: Recorded Attempts */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#4B5563",
                  }}
                >
                  Recorded Attempts
                </Typography>

                {/* 5 Pill Buttons */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "6px",
                    width: "100%",
                  }}
                >
                  {["All", "1-2", "3-4", "+5", "Unknown"].map((attemptOption) => {
                    const isSelected = filterAttempts === attemptOption;
                    return (
                      <ButtonBase
                        key={attemptOption}
                        id={`filter-attempts-${attemptOption}`}
                        onClick={() => setFilterAttempts(attemptOption)}
                        sx={{
                          height: "36px",
                          borderRadius: "6px",
                          bgcolor: isSelected ? "#F0F6FC" : "#FFFFFF",
                          border: isSelected ? "1.5px solid #2563EB" : "1px solid #E5E7EB",
                          color: isSelected ? "#1D4ED8" : "#1F2937",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            borderColor: "#9CA3AF",
                            bgcolor: isSelected ? "#F0F6FC" : "#F9FAFB",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "var(--font-cairo), Cairo, sans-serif",
                            fontSize: "13px",
                            fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? "#1D4ED8" : "#1F2937",
                          }}
                        >
                          {attemptOption}
                        </Typography>
                      </ButtonBase>
                    );
                  })}
                </Box>

                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "12px",
                    color: "#6B7280",
                    lineHeight: 1.45,
                    mt: "2px",
                  }}
                >
                  Most parcels show 2 recorded attempts, and the counts cluster on even numbers. So this dashboard treats 1-2 as first-time delivery and 3+ as repeat attempts.
                </Typography>
              </Box>
            </Box>

            {/* Bottom Button: Clear All Filters */}
            <Box sx={{ pt: "14px", mt: "auto", borderTop: "1px solid #E5E7EB" }}>
              <Button
                id="clear-all-filters-btn"
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  height: "44px",
                  borderRadius: "6px",
                  borderColor: "#0000FF",
                  color: "#0000FF",
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#0000CC",
                    bgcolor: "#F0F6FC",
                  },
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          </Drawer>
        </Box>

        {/* SECTION 2: 5 KPI Statistics Cards in a single horizontal row (Frame 9187) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "24px",
            width: "100%",
            height: 98,
            overflowX: "auto",
          }}
        >
          {/* Card 1: Deliveries */}
          <Box
            sx={{
              flex: "1 1 0",
              minWidth: "200px",
              height: 98,
              bgcolor: "#FFFFFF",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
              borderRadius: "8px",
              p: "8px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
                color: "#000000",
              }}
            >
              Deliveries
            </Typography>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 800,
                  fontSize: "18px",
                  lineHeight: "30px",
                  color: "#0000FF",
                }}
              >
                {HEATMAP_STATISTICS.deliveries}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#919191",
                }}
              >
                {HEATMAP_STATISTICS.deliveriesSubtitle}
              </Typography>
            </Box>
          </Box>

          {/* Card 2: PostCodes */}
          <Box
            sx={{
              flex: "1 1 0",
              minWidth: "200px",
              height: 98,
              bgcolor: "#FFFFFF",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
              borderRadius: "8px",
              p: "8px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
                color: "#000000",
              }}
            >
              PostCodes
            </Typography>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 800,
                  fontSize: "18px",
                  lineHeight: "30px",
                  color: "#0000FF",
                }}
              >
                {HEATMAP_STATISTICS.postcodes}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#919191",
                }}
              >
                {HEATMAP_STATISTICS.postcodesSubtitle}
              </Typography>
            </Box>
          </Box>

          {/* Card 3: Grid Cells */}
          <Box
            sx={{
              flex: "1 1 0",
              minWidth: "200px",
              height: 98,
              bgcolor: "#FFFFFF",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
              borderRadius: "8px",
              p: "8px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
                color: "#000000",
              }}
            >
              Grid Cells
            </Typography>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 800,
                  fontSize: "18px",
                  lineHeight: "30px",
                  color: "#0000FF",
                }}
              >
                {HEATMAP_STATISTICS.gridCells}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#919191",
                }}
              >
                {HEATMAP_STATISTICS.gridCellsSubtitle}
              </Typography>
            </Box>
          </Box>

          {/* Card 4: Repeat Attempts */}
          <Box
            sx={{
              flex: "1 1 0",
              minWidth: "200px",
              height: 98,
              bgcolor: "#FFFFFF",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
              borderRadius: "8px",
              p: "8px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
                color: "#000000",
              }}
            >
              Repeat Attempts
            </Typography>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 800,
                  fontSize: "18px",
                  lineHeight: "30px",
                  color: "#0000FF",
                }}
              >
                {HEATMAP_STATISTICS.repeatAttempts}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#919191",
                }}
              >
                {HEATMAP_STATISTICS.repeatAttemptsSubtitle}
              </Typography>
            </Box>
          </Box>

          {/* Card 5: Unstructured Addresses */}
          <Box
            sx={{
              flex: "1 1 0",
              minWidth: "200px",
              height: 98,
              bgcolor: "#FFFFFF",
              boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
              borderRadius: "8px",
              p: "8px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                lineHeight: "22px",
                color: "#000000",
              }}
            >
              Unstructured Addresses
            </Typography>
            <Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontWeight: 800,
                  fontSize: "18px",
                  lineHeight: "30px",
                  color: "#0000FF",
                }}
              >
                {HEATMAP_STATISTICS.unstructuredAddresses}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: "#919191",
                }}
              >
                {HEATMAP_STATISTICS.unstructuredAddressesSubtitle}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SECTION 3: Heat Map Viewport & Overlays */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 500, md: "calc(100vh - 235px)" },
            minHeight: 480,
            maxHeight: 727,
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.08)",
            border: "1px solid #DEDEDE",
          }}
        >
          {/* Leaflet Map Canvas */}
          <Box
            ref={mapContainerRef}
            sx={{
              width: "100%",
              height: "100%",
              zIndex: 1,
              bgcolor: "#E5E3DF",
            }}
          />

          {/* OVERLAY 1: Top-Right Filter Tabs (Deliveries | Repeat% | Unstructured%) */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 14,
              zIndex: 1000,
              width: 302,
              height: 50,
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
              p: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: 34,
                gap: "8px",
              }}
            >
              {/* Deliveries */}
              <ButtonBase
                id="filter-tab-deliveries"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMetric("deliveries");
                }}
                sx={{
                  flex: "0 0 82px",
                  height: 34,
                  bgcolor: "#FFFFFF",
                  border: activeMetric === "deliveries" ? "1px solid #0000FF" : "1px solid #F0F6FC",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: activeMetric === "deliveries" ? 600 : 400,
                    color: activeMetric === "deliveries" ? "#0000FF" : "#000000",
                  }}
                >
                  Deliveries
                </Typography>
              </ButtonBase>

              {/* Repeat% */}
              <ButtonBase
                id="filter-tab-repeat"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMetric("repeat");
                }}
                sx={{
                  flex: "0 0 73px",
                  height: 34,
                  bgcolor: "#FFFFFF",
                  border: activeMetric === "repeat" ? "1px solid #0000FF" : "1px solid #F0F6FC",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: activeMetric === "repeat" ? 600 : 400,
                    color: activeMetric === "repeat" ? "#0000FF" : "#000000",
                  }}
                >
                  Repeat%
                </Typography>
              </ButtonBase>

              {/* Unstructured% */}
              <ButtonBase
                id="filter-tab-unstructured"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMetric("unstructured");
                }}
                sx={{
                  flex: "0 0 115px",
                  height: 34,
                  bgcolor: "#FFFFFF",
                  border: activeMetric === "unstructured" ? "1px solid #0000FF" : "1px solid #F0F6FC",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "14px",
                    fontWeight: activeMetric === "unstructured" ? 600 : 400,
                    color: activeMetric === "unstructured" ? "#0000FF" : "#000000",
                  }}
                >
                  Unstructured%
                </Typography>
              </ButtonBase>
            </Box>
          </Box>

          {/* OVERLAY 2: Bottom-Left Density Legend Card (Frame 9200) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 86,
              left: 16,
              zIndex: 1000,
              width: 189,
              height: 60,
              bgcolor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
              p: "8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              pointerEvents: "auto",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12px",
                lineHeight: "18px",
                color: "#5A5A5A",
                whiteSpace: "nowrap",
              }}
            >
              {activeMetric === "deliveries"
                ? "Grid cells· Deliveries per cell"
                : activeMetric === "repeat"
                ? "Grid cells· Repeat Rate"
                : "Grid cells· Unstructured %"}
            </Typography>

            {/* 5-Color Spectrum Bar from Figma */}
            <Box
              sx={{
                display: "flex",
                width: 173,
                height: 10,
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <Box sx={{ flex: 1, bgcolor: "#89ECC1" }} />
              <Box sx={{ flex: 1, bgcolor: "#FACC15" }} />
              <Box sx={{ flex: 1, bgcolor: "#EB861F" }} />
              <Box sx={{ flex: 1, bgcolor: "#EF4444" }} />
              <Box sx={{ flex: 1, bgcolor: "#7C3AED" }} />
            </Box>

            {/* LOW and HIGH */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: 173,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "8px",
                  lineHeight: "8px",
                  color: "#5A5A5A",
                  fontWeight: 600,
                }}
              >
                LOW
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "8px",
                  lineHeight: "8px",
                  color: "#5A5A5A",
                  fontWeight: 600,
                }}
              >
                HIGH
              </Typography>
            </Box>
          </Box>

          {/* OVERLAY 3: Bottom-Left Grid Level Selector Box (506px x 54px) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 17,
              zIndex: 1000,
              width: { xs: "calc(100% - 90px)", sm: 506 },
              maxWidth: 506,
              height: 54,
              bgcolor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
              px: "14px",
              py: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              pointerEvents: "auto",
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "15px",
                lineHeight: "30px",
                color: "#000000",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Grid Level:
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {/* Tier 1 Chip */}
              <ButtonBase
                id="tier-btn-1"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierChange(1);
                }}
                sx={{
                  flex: "1 1 0",
                  height: 38,
                  bgcolor: activeTier === 1 ? "#2952E8" : "#FFFFFF",
                  color: activeTier === 1 ? "#FFFFFF" : "#000000",
                  border: activeTier === 1 ? "none" : "1px solid #E2E8F0",
                  borderRadius: "8px",
                  px: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: activeTier === 1 ? "#2044C7" : "#F8FAFC",
                  },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  Tier 1
                </Typography>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                    stroke={activeTier === 1 ? "#FFFFFF" : "#000000"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  27
                </Typography>
              </ButtonBase>

              {/* Tier 2 Chip */}
              <ButtonBase
                id="tier-btn-2"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierChange(2);
                }}
                sx={{
                  flex: "1 1 0",
                  height: 38,
                  bgcolor: activeTier === 2 ? "#4F5D6B" : "#FFFFFF",
                  color: activeTier === 2 ? "#FFFFFF" : "#000000",
                  border: activeTier === 2 ? "none" : "1px solid #E2E8F0",
                  borderRadius: "8px",
                  px: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: activeTier === 2 ? "#404D59" : "#F8FAFC",
                  },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  Tier 2
                </Typography>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                    stroke={activeTier === 2 ? "#FFFFFF" : "#000000"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  45
                </Typography>
              </ButtonBase>

              {/* Tier 3 Chip */}
              <ButtonBase
                id="tier-btn-3"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierChange(3);
                }}
                sx={{
                  flex: "1 1 0",
                  height: 38,
                  bgcolor: activeTier === 3 ? "#3F8E50" : "#FFFFFF",
                  color: activeTier === 3 ? "#FFFFFF" : "#000000",
                  border: activeTier === 3 ? "none" : "1px solid #E2E8F0",
                  borderRadius: "8px",
                  px: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: activeTier === 3 ? "#327542" : "#F8FAFC",
                  },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  Tier 3
                </Typography>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                    stroke={activeTier === 3 ? "#FFFFFF" : "#000000"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  65
                </Typography>
              </ButtonBase>

              {/* Tier 4 Chip */}
              <ButtonBase
                id="tier-btn-4"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTierChange(4);
                }}
                sx={{
                  flex: "1 1 0",
                  height: 38,
                  bgcolor: activeTier === 4 ? "#EB861F" : "#FFFFFF",
                  color: activeTier === 4 ? "#FFFFFF" : "#000000",
                  border: activeTier === 4 ? "none" : "1px solid #E2E8F0",
                  borderRadius: "8px",
                  px: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: activeTier === 4 ? "#D97706" : "#F8FAFC",
                  },
                }}
              >
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  Tier 4
                </Typography>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5"
                    stroke={activeTier === 4 ? "#FFFFFF" : "#000000"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 500 }}>
                  95
                </Typography>
              </ButtonBase>
            </Box>
          </Box>

          {/* OVERLAY 4: Bottom-Right Zoom Controls (+ / -) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: 40,
              height: 88,
              pointerEvents: "auto",
            }}
          >
            {/* Zoom In */}
            <IconButton
              id="btn-zoom-in"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              aria-label="Zoom in"
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#FFFFFF",
                borderRadius: "4px",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.101961)",
                "&:hover": {
                  bgcolor: "#F8FAFC",
                },
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4V16M4 10H16" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </IconButton>

            {/* Zoom Out */}
            <IconButton
              id="btn-zoom-out"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              aria-label="Zoom out"
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#FFFFFF",
                borderRadius: "4px",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.101961)",
                "&:hover": {
                  bgcolor: "#F8FAFC",
                },
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10H16" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

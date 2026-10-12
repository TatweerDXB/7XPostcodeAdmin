"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import type { Map as LeafletMap, LayerGroup, Marker, Rectangle } from "leaflet";
import {
  HeatmapMetric,
  TierLevel,
  TIER_CONFIGS,
  DENSITY_PALETTE,
  generateTierCells,
  HEATMAP_STATISTICS,
} from "@/data/heatmapData";

export default function HeatmapView() {
  const [activeTier, setActiveTier] = useState<TierLevel>(1);
  const [activeMetric, setActiveMetric] = useState<HeatmapMetric>("deliveries");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmirate, setSelectedEmirate] = useState("All Emirates");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const gridLayerGroupRef = useRef<LayerGroup | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);

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

        // Hover tooltip with metrics
        const tooltipHtml = `
          <div style="font-family: 'Cairo', sans-serif; padding: 6px 10px; font-size: 13px; line-height: 1.4; color: #101828;">
            <div style="font-weight: 700; color: #0000FF; margin-bottom: 2px;">
              ${tier === 1 ? `Cell ${cell.displayCode}` : `Tier ${tier} Cell [${cell.displayCode}]`}
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px;">
              <span style="color: #64748B;">Deliveries:</span>
              <span style="font-weight: 600;">${cell.deliveries.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px;">
              <span style="color: #64748B;">Repeat Attempts:</span>
              <span style="font-weight: 600;">${cell.repeatRate}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 12px;">
              <span style="color: #64748B;">Unstructured %:</span>
              <span style="font-weight: 600;">${cell.unstructuredRate}%</span>
            </div>
            ${cell.postcode ? `
              <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #CBD5E1; font-size: 11px; color: #475569;">
                Postcode: <strong>${cell.postcode}</strong>
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
            handleTierChange((tier + 1) as TierLevel);
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
                ${cell.postcode}
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
                ${cell.displayCode}
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
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = await import("leaflet");

      const map = new L.Map(mapContainerRef.current, {
        center: TIER_CONFIGS[1].center,
        zoom: TIER_CONFIGS[1].zoom,
        zoomControl: false,
        attributionControl: false,
        minZoom: 6,
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

      map.whenReady(() => {
        if (isMounted) {
          map.invalidateSize();
          renderGridLayers(1);
        }
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      gridLayerGroupRef.current = null;
      pinMarkerRef.current = null;
    };
  }, [renderGridLayers]);

  // Handle Tier Switching
  const handleTierChange = (newTier: TierLevel) => {
    setActiveTier(newTier);
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
  };

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
              setFilterAnchorEl(e.currentTarget);
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

          {/* Filter Popover */}
          <Popover
            open={Boolean(filterAnchorEl)}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  p: "16px",
                  width: 280,
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                },
              },
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-cairo)", fontWeight: 700, fontSize: "15px", color: "#101828" }}>
              Filter Heatmap Data
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px" }}>Emirate</InputLabel>
              <Select
                value={selectedEmirate}
                label="Emirate"
                onChange={(e) => setSelectedEmirate(e.target.value)}
                sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px" }}
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

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px" }}>Time Range</InputLabel>
              <Select
                value={selectedDateRange}
                label="Time Range"
                onChange={(e) => setSelectedDateRange(e.target.value)}
                sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px" }}
              >
                <MenuItem value="Today">Today</MenuItem>
                <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                <MenuItem value="This Quarter">This Quarter</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", mt: "4px" }}>
              <Button
                size="small"
                onClick={() => setFilterAnchorEl(null)}
                sx={{ fontFamily: "var(--font-cairo)", color: "#64748B", textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setFilterAnchorEl(null)}
                sx={{
                  fontFamily: "var(--font-cairo)",
                  bgcolor: "#0000FF",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0000CC" },
                }}
              >
                Apply
              </Button>
            </Box>
          </Popover>
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

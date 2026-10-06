"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ClearIcon from "@mui/icons-material/Clear";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import BuildingDetailsCard from "./BuildingDetailsCard";
import { UAE_BUILDINGS, UAEBuilding } from "@/data/uaeBuildings";
import type { Map as LeafletMap, LayerGroup, Marker } from "leaflet";

const filterTabs = [
  { id: "all", label: "All", icon: null, width: 80, placeholder: "Search postcodes, buildings, units, addresses..." },
  {
    id: "address",
    label: "Address",
    width: 105,
    placeholder: "Search by address or street name...",
    icon: (
      <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 7.453C7.649 7.453 8.58 6.522 8.58 5.373C8.58 4.224 7.649 3.293 6.5 3.293C5.351 3.293 4.42 4.224 4.42 5.373C4.42 6.522 5.351 7.453 6.5 7.453Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M0.913 4.161C2.227 -1.613 10.78 -1.606 12.087 4.167C12.853 7.554 10.747 10.421 8.9 12.194C7.56 13.487 5.44 13.487 4.093 12.194C2.253 10.421 0.147 7.547 0.913 4.161Z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "postcode",
    label: "Postcode",
    width: 110,
    placeholder: "Search by 8-digit postcode (e.g. 47-48-67-90)...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5H14V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M2 5L8 9.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M4 2H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "makani",
    label: "Makani",
    width: 105,
    placeholder: "Search by Makani number (e.g. 26144 87868)...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 15H1.6C0.72 15 0 14.28 0 13.4V2.46C0 0.51 1.48 0 3.31 0.88L6.71 2.53C7.44 2.89 8 3.84 8 4.65V15Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.25 9.87V12.75C15.25 14.39 14.48 15 12.84 15H8V6.18L11.82 7.39C12.82 7.61 13.64 8.12 13.69 9.58V9.87Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "onwani",
    label: "onwani",
    width: 105,
    placeholder: "Search by Onwani Unified address...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.5 15H15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.5 15V6L8 1L14.5 6V15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M6 15V9H10V15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "coordinates",
    label: "Coordinates",
    width: 120,
    placeholder: "Enter Lat, Lng coordinates (e.g. 25.19, 55.27)...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 13.5C11.0376 13.5 13.5 11.0376 13.5 8C13.5 4.96243 11.0376 2.5 8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 11.0376 4.96243 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 1.5V0M0 8H1.5M8 14.5V16M14.5 8H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

type TierLevel = 1 | 2 | 3 | 4;

interface TierPath {
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
}

interface TierBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

const TIER1_DEFAULT_BOUNDS: TierBounds = {
  north: 27.789,
  south: 21.989,
  west: 50.363,
  east: 56.863,
};

function getSubCellBounds(parent: TierBounds, cellId: string): TierBounds {
  const r = parseInt(cellId[0], 10) || 0;
  const c = parseInt(cellId[1], 10) || 0;
  const latStep = (parent.north - parent.south) / 10;
  const lngStep = (parent.east - parent.west) / 10;
  return {
    north: parent.north - r * latStep,
    south: parent.north - (r + 1) * latStep,
    west: parent.west + c * lngStep,
    east: parent.west + (c + 1) * lngStep,
  };
}

export default function GoogleMapView() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<UAEBuilding | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeTier, setActiveTier] = useState<TierLevel>(1);
  const [tierPath, setTierPath] = useState<TierPath>({
    tier1: "47",
    tier2: "45",
    tier3: "65",
    tier4: "95",
  });
  const [boundsHistory, setBoundsHistory] = useState<{
    tier1: TierBounds;
    tier2: TierBounds;
    tier3: TierBounds;
    tier4: TierBounds;
  }>({
    tier1: TIER1_DEFAULT_BOUNDS,
    tier2: getSubCellBounds(TIER1_DEFAULT_BOUNDS, "47"),
    tier3: getSubCellBounds(getSubCellBounds(TIER1_DEFAULT_BOUNDS, "47"), "45"),
    tier4: getSubCellBounds(getSubCellBounds(getSubCellBounds(TIER1_DEFAULT_BOUNDS, "47"), "45"), "65"),
  });

  const tierPathRef = useRef<TierPath>(tierPath);
  tierPathRef.current = tierPath;

  const boundsHistoryRef = useRef(boundsHistory);
  boundsHistoryRef.current = boundsHistory;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const gridLayerGroupRef = useRef<LayerGroup | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);

  // Filter building suggestions based on user search query
  const queryTrimmed = searchQuery.trim().toLowerCase();
  const filteredBuildings = queryTrimmed
    ? UAE_BUILDINGS.filter(
        (b) =>
          b.name.toLowerCase().includes(queryTrimmed) ||
          b.subtitle.toLowerCase().includes(queryTrimmed) ||
          b.postCode.toLowerCase().includes(queryTrimmed) ||
          b.makaniNumber.toLowerCase().includes(queryTrimmed) ||
          b.street.toLowerCase().includes(queryTrimmed) ||
          b.areaLocality.toLowerCase().includes(queryTrimmed) ||
          b.addressIdentifier.toLowerCase().includes(queryTrimmed) ||
          b.gridId.toLowerCase().includes(queryTrimmed)
      )
    : UAE_BUILDINGS;

  const updatePinMarker = useCallback(async (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    const L = await import("leaflet");

    if (pinMarkerRef.current) {
      mapInstanceRef.current.removeLayer(pinMarkerRef.current);
      pinMarkerRef.current = null;
    }

    const pinHtml = `
      <div style="position: relative; width: 32px; height: 38px; transform: translate(-50%, -100%);">
        <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <filter id="shadow" x="0" y="0" width="32" height="38" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
          </filter>
          <g filter="url(#shadow)">
            <path d="M16 2C9.37 2 4 7.37 4 14C4 22.5 16 34 16 34C16 34 28 22.5 28 14C28 7.37 22.63 2 16 2Z" fill="#DC2626"/>
            <circle cx="16" cy="14" r="5" fill="#1E293B"/>
          </g>
        </svg>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: "building-pin-marker",
      html: pinHtml,
      iconSize: [32, 38],
      iconAnchor: [16, 38],
    });

    pinMarkerRef.current = L.marker([lat, lng], {
      icon: pinIcon,
      zIndexOffset: 1000,
    }).addTo(mapInstanceRef.current);
  }, []);

  const clearPinMarker = useCallback(() => {
    if (pinMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(pinMarkerRef.current);
      pinMarkerRef.current = null;
    }
  }, []);

  // Recursive Grid Renderer for any tier level with given parent bounds
  const renderTierGrid = useCallback(
    async (tier: TierLevel, currentBounds: TierBounds, building: UAEBuilding | null = null) => {
      if (!mapInstanceRef.current) return;
      const L = await import("leaflet");

      if (!gridLayerGroupRef.current) {
        gridLayerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      } else {
        gridLayerGroupRef.current.clearLayers();
      }

      let strokeColor = "rgba(147, 197, 253, 0.75)";
      let fillColor = "#38BDF8";
      let fillOpacity = 0.22;
      let strokeOpacity = 0.8;
      let strokeWidth = 1.0;
      let fontSize = "11px";
      let fontColor = "#0369A1";

      if (tier === 1) {
        strokeColor = "rgba(147, 197, 253, 0.75)";
        fillColor = "#38BDF8";
        fillOpacity = 0.22;
        strokeOpacity = 0.8;
        strokeWidth = 1.0;
        fontColor = "#0369A1";
      } else if (tier === 2) {
        strokeColor = "rgba(148, 163, 184, 0.75)";
        fillColor = "#64748B";
        fillOpacity = 0.16;
        strokeOpacity = 0.8;
        strokeWidth = 1.0;
        fontColor = "#334155";
      } else if (tier === 3) {
        strokeColor = "rgba(52, 211, 153, 0.75)";
        fillColor = "#10B981";
        fillOpacity = 0.18;
        strokeOpacity = 0.8;
        strokeWidth = 1.1;
        fontColor = "#047857";
      } else if (tier === 4) {
        strokeColor = "rgba(251, 146, 60, 0.8)";
        fillColor = "#F97316";
        fillOpacity = 0.22;
        strokeOpacity = 0.85;
        strokeWidth = 1.2;
        fontColor = "#C2410C";
      }

      const { north, south, west, east } = currentBounds;
      const latStep = (north - south) / 10;
      const lngStep = (east - west) / 10;

      const handleCellClickAction = (
        clickedTier: TierLevel,
        cId: string,
        cNorth: number,
        cSouth: number,
        cWest: number,
        cEast: number
      ) => {
        const nextCellBounds: TierBounds = {
          north: cNorth,
          south: cSouth,
          west: cWest,
          east: cEast,
        };

        if (clickedTier === 1) {
          const updated = { ...tierPathRef.current, tier1: cId };
          tierPathRef.current = updated;
          boundsHistoryRef.current.tier2 = nextCellBounds;
          setTierPath(updated);
          setBoundsHistory((prev) => ({ ...prev, tier2: nextCellBounds }));
          setActiveTier(2);
          renderTierGrid(2, nextCellBounds);
        } else if (clickedTier === 2) {
          const updated = { ...tierPathRef.current, tier2: cId };
          tierPathRef.current = updated;
          boundsHistoryRef.current.tier3 = nextCellBounds;
          setTierPath(updated);
          setBoundsHistory((prev) => ({ ...prev, tier3: nextCellBounds }));
          setActiveTier(3);
          renderTierGrid(3, nextCellBounds);
        } else if (clickedTier === 3) {
          const updated = { ...tierPathRef.current, tier3: cId };
          tierPathRef.current = updated;
          boundsHistoryRef.current.tier4 = nextCellBounds;
          setTierPath(updated);
          setBoundsHistory((prev) => ({ ...prev, tier4: nextCellBounds }));
          setActiveTier(4);
          renderTierGrid(4, nextCellBounds);
        } else if (clickedTier === 4) {
          const updated = { ...tierPathRef.current, tier4: cId };
          tierPathRef.current = updated;
          setTierPath(updated);

          const centerLat = (cNorth + cSouth) / 2;
          const centerLng = (cWest + cEast) / 2;
          updatePinMarker(centerLat, centerLng);

          const fullCode = `${tierPathRef.current.tier1}-${tierPathRef.current.tier2}-${tierPathRef.current.tier3}-${cId}`;
          const foundBuilding =
            UAE_BUILDINGS.find(
              (b) =>
                b.tiers.tier1 === tierPathRef.current.tier1 &&
                b.tiers.tier2 === tierPathRef.current.tier2 &&
                b.tiers.tier3 === tierPathRef.current.tier3 &&
                b.tiers.tier4 === cId
            ) || {
              id: `b-${fullCode}`,
              name: `Address Plot ${fullCode}`,
              subtitle: `Sector ${tierPathRef.current.tier1}, Area ${tierPathRef.current.tier2}, Sub-grid ${tierPathRef.current.tier3}, Plot ${cId}`,
              postCode: fullCode,
              formattedPostCode: fullCode,
              tiers: updated,
              chipTiers: updated,
              addressLine1: `Registered Property Plot ${cId}`,
              addressLine2: `Area ${tierPathRef.current.tier2}, Sector ${tierPathRef.current.tier1}, Dubai,`,
              addressLine3: `DXB-${tierPathRef.current.tier1}${tierPathRef.current.tier2}`,
              addressLine4: "UNITED ARAB EMIRATES",
              addressIdentifier: `DXB-${tierPathRef.current.tier1}${tierPathRef.current.tier2}${tierPathRef.current.tier3}`,
              gridId: `GRD-${tierPathRef.current.tier1}${tierPathRef.current.tier2}`,
              latitude: centerLat,
              longitude: centerLng,
              makaniNumber: `26${tierPathRef.current.tier1}${tierPathRef.current.tier2} ${tierPathRef.current.tier3}${cId}`,
              onwaniAddress: "-",
              recipientName: "Property Owner",
              organizationName: "Registry Verified",
              addressType: "Building",
              unitNumber: "-",
              street: `Street ${tierPathRef.current.tier3}`,
              areaLocality: `Locality ${tierPathRef.current.tier2}`,
              emirateAdminArea: "Dubai",
              postalCode: `DXB-${tierPathRef.current.tier1}${tierPathRef.current.tier2}`,
            };

          setSelectedBuilding(foundBuilding);
        }
      };

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cellId = `${r}${c}`;
          const cellNorth = north - r * latStep;
          const cellSouth = north - (r + 1) * latStep;
          const cellWest = west + c * lngStep;
          const cellEast = west + (c + 1) * lngStep;

          const bounds: [[number, number], [number, number]] = [
            [cellSouth, cellWest],
            [cellNorth, cellEast],
          ];

          const rect = L.rectangle(bounds, {
            color: strokeColor,
            weight: strokeWidth,
            opacity: strokeOpacity,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            className: "interactive-tier-cell",
            interactive: true,
            bubblingMouseEvents: false,
          });

          // Cell Hover Interactions
          rect.on("mouseover", () => {
            rect.setStyle({
              fillOpacity: fillOpacity + 0.2,
              weight: strokeWidth + 1.0,
            });
          });

          rect.on("mouseout", () => {
            rect.setStyle({
              fillOpacity: fillOpacity,
              weight: strokeWidth,
            });
          });

          // Click on cell rectangle
          rect.on("click", (e) => {
            if (e && e.originalEvent) {
              e.originalEvent.stopPropagation();
            }
            handleCellClickAction(tier, cellId, cellNorth, cellSouth, cellWest, cellEast);
          });

          rect.addTo(gridLayerGroupRef.current);

          // Center label for cell number (also clickable!)
          const centerLat = (cellNorth + cellSouth) / 2;
          const centerLng = (cellWest + cellEast) / 2;

          const labelIcon = L.divIcon({
            className: "grid-cell-label",
            html: `<div style="color: ${fontColor}; font-family: var(--font-cairo), Cairo, sans-serif; font-size: ${fontSize}; font-weight: 600; text-align: center; line-height: 1; user-select: none; cursor: pointer;">${cellId}</div>`,
            iconSize: [24, 16],
            iconAnchor: [12, 8],
          });

          const labelMarker = L.marker([centerLat, centerLng], {
            icon: labelIcon,
            interactive: true,
          }).addTo(gridLayerGroupRef.current);

          labelMarker.on("click", (e) => {
            if (e && e.originalEvent) {
              e.originalEvent.stopPropagation();
            }
            handleCellClickAction(tier, cellId, cellNorth, cellSouth, cellWest, cellEast);
          });
        }
      }

      // Smooth camera transition to the active grid bounds with optimal zoom
      const maxZoomForTier = tier === 1 ? 8 : tier === 2 ? 13 : tier === 3 ? 15 : 18;
      mapInstanceRef.current.flyToBounds(
        [
          [currentBounds.south, currentBounds.west],
          [currentBounds.north, currentBounds.east],
        ],
        {
          padding: [24, 24],
          duration: 0.8,
          maxZoom: maxZoomForTier,
        }
      );

      if (building) {
        updatePinMarker(building.latitude, building.longitude);
      }
    },
    [updatePinMarker]
  );

  const handleSelectBuilding = (building: UAEBuilding) => {
    setSelectedBuilding(building);
    setSearchQuery(building.name);
    setIsSuggestionsOpen(false);

    const bTiers = building.tiers;
    const t2b = getSubCellBounds(TIER1_DEFAULT_BOUNDS, bTiers.tier1);
    const t3b = getSubCellBounds(t2b, bTiers.tier2);
    const t4b = getSubCellBounds(t3b, bTiers.tier3);

    tierPathRef.current = bTiers;
    boundsHistoryRef.current = {
      tier1: TIER1_DEFAULT_BOUNDS,
      tier2: t2b,
      tier3: t3b,
      tier4: t4b,
    };

    setTierPath(bTiers);
    setBoundsHistory({
      tier1: TIER1_DEFAULT_BOUNDS,
      tier2: t2b,
      tier3: t3b,
      tier4: t4b,
    });

    setActiveTier(4);
    renderTierGrid(4, t4b, building);
  };

  const handleSelectTier = (tier: TierLevel) => {
    setActiveTier(tier);
    if (tier === 1) {
      renderTierGrid(1, boundsHistoryRef.current.tier1);
    } else if (tier === 2) {
      renderTierGrid(2, boundsHistoryRef.current.tier2);
    } else if (tier === 3) {
      renderTierGrid(3, boundsHistoryRef.current.tier3);
    } else if (tier === 4) {
      renderTierGrid(4, boundsHistoryRef.current.tier4, selectedBuilding);
    }
  };

  const handleSearchSubmit = () => {
    if (filteredBuildings.length > 0) {
      handleSelectBuilding(filteredBuildings[0]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSuggestionsOpen(false);
    setSelectedBuilding(null);
    clearPinMarker();
    setActiveTier(1);
    renderTierGrid(1, TIER1_DEFAULT_BOUNDS);
  };

  // Initialize interactive map with Google Maps Roadmap layer (full POIs, parks, and buildings)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [24.4, 54.3],
        zoom: 7,
        minZoom: 5,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Google Maps Roadmap layer with full POIs, buildings, and parks
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
      }).addTo(map);

      gridLayerGroupRef.current = L.layerGroup().addTo(map);

      // Render default Tier 1 Blue Grid across UAE
      renderTierGrid(1, TIER1_DEFAULT_BOUNDS);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [renderTierGrid]);

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

  const handleResetLocation = () => {
    setSelectedBuilding(null);
    clearPinMarker();
    setSearchQuery("");
    setActiveTier(1);
    renderTierGrid(1, TIER1_DEFAULT_BOUNDS);
  };

  const currentTabInfo = filterTabs.find((t) => t.id === activeFilter) || filterTabs[0];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        bgcolor: "#F9FBFD",
      }}
    >
      {/* Map Canvas Container */}
      <Box
        ref={mapContainerRef}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Floating Top Search & Filter Bar */}
      <Box
        sx={{
          position: "absolute",
          top: "16px",
          left: "24px",
          right: "24px",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          overflow: "visible",
          pointerEvents: "auto",
        }}
      >
        {/* Search Input Box */}
        <ClickAwayListener onClickAway={() => setIsSuggestionsOpen(false)}>
          <Box sx={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0, overflow: "visible" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRight: "none",
                borderRadius: "4px 0 0 4px",
                height: 32,
                width: 320,
                px: 1.2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                boxSizing: "border-box",
              }}
            >
              <InputBase
                placeholder={currentTabInfo.placeholder}
                value={searchQuery}
                onFocus={() => setIsSuggestionsOpen(true)}
                onClick={() => setIsSuggestionsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                sx={{
                  flex: 1,
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "12px",
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
                  onClick={handleClearSearch}
                  sx={{ color: "#919191", p: 0.2 }}
                >
                  <ClearIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Blue Search Action Button */}
            <Button
              variant="contained"
              onClick={handleSearchSubmit}
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

            {/* Suggestions Dropdown Popup matching Screenshot 2 */}
            {isSuggestionsOpen && (
              <Paper
                elevation={6}
                sx={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  width: 354,
                  zIndex: 100,
                  bgcolor: "#FFFFFF",
                  borderRadius: "4px",
                  border: "1px solid #DEDEDE",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  maxHeight: 320,
                  overflowY: "auto",
                  p: 0.5,
                }}
              >
                {filteredBuildings.length === 0 ? (
                  <Box sx={{ p: 1.5, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748B", fontFamily: "var(--font-cairo)" }}>
                      No results found for &quot;{searchQuery}&quot;
                    </Typography>
                  </Box>
                ) : (
                  filteredBuildings.map((b) => (
                    <Box
                      key={b.id}
                      onClick={() => handleSelectBuilding(b)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: "7px 10px",
                        borderRadius: "3px",
                        cursor: "pointer",
                        transition: "background-color 0.12s ease",
                        "&:hover": { bgcolor: "#F1F5F9" },
                      }}
                    >
                      {/* Left: Location Pin & Name */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <PlaceOutlinedIcon sx={{ fontSize: 16, color: "#64748B", flexShrink: 0 }} />
                        <Typography
                          sx={{
                            fontSize: "12.5px",
                            fontWeight: 500,
                            color: "#000000",
                            fontFamily: "var(--font-cairo)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {b.name}
                        </Typography>
                      </Box>

                      {/* Right: Postcode Badge */}
                      <Box
                        sx={{
                          px: 0.8,
                          py: 0.2,
                          borderRadius: "4px",
                          bgcolor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#0000FF",
                          fontFamily: "var(--font-cairo)",
                          flexShrink: 0,
                        }}
                      >
                        {b.formattedPostCode || b.postCode}
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            )}
          </Box>
        </ClickAwayListener>

        {/* Filter Pills */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <Box
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  setIsSuggestionsOpen(true);
                }}
                sx={{
                  height: 32,
                  width: tab.width,
                  borderRadius: "7.5px",
                  bgcolor: "#FFFFFF",
                  border: isSelected ? "1.5px solid #0000FF" : "1px solid #DEDEDE",
                  color: isSelected ? "#0000FF" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  userSelect: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                  boxSizing: "border-box",
                  "&:hover": {
                    borderColor: isSelected ? "#0000FF" : "#94A3B8",
                  },
                }}
              >
                {tab.icon && (
                  <Box sx={{ display: "flex", alignItems: "center", color: isSelected ? "#0000FF" : "#000000" }}>
                    {tab.icon}
                  </Box>
                )}
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "12px",
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "#0000FF" : "#000000",
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Building Details Card Popup (Opens when building is selected - Screenshots 3, 4, 5) */}
      {selectedBuilding && (
        <Box
          sx={{
            position: "absolute",
            top: "64px",
            left: "24px",
            zIndex: 40,
            animation: "fadeIn 0.2s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(-6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <BuildingDetailsCard
            building={selectedBuilding}
            onClose={() => {
              setSelectedBuilding(null);
              clearPinMarker();
              setActiveTier(1);
              renderTierGrid(1, TIER1_DEFAULT_BOUNDS);
            }}
          />
        </Box>
      )}

      {/* Floating Bottom Tier Level Toolbar (Screenshots 3, 4, 5) */}
      <Box
        sx={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 35,
          bgcolor: "#FFFFFF",
          borderRadius: "8px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          userSelect: "none",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "13px",
            fontWeight: 700,
            color: "#1E293B",
            mr: 0.5,
          }}
        >
          Grid Level:
        </Typography>

        {/* Tier 1 Pill */}
        <Box
          onClick={() => handleSelectTier(1)}
          sx={{
            px: 1.4,
            py: 0.6,
            borderRadius: "6px",
            bgcolor: activeTier === 1 ? "#0000FF" : "#F8FAFC",
            border: activeTier === 1 ? "1px solid #0000FF" : "1px solid #E2E8F0",
            color: activeTier === 1 ? "#FFFFFF" : "#334155",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-cairo)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: activeTier === 1 ? "#0000CC" : "#F1F5F9",
            },
          }}
        >
          Tier 1 → {selectedBuilding?.tiers.tier1 || tierPath.tier1}
        </Box>

        {/* Tier 2 Pill */}
        <Box
          onClick={() => handleSelectTier(2)}
          sx={{
            px: 1.4,
            py: 0.6,
            borderRadius: "6px",
            bgcolor: activeTier === 2 ? "#64748B" : "#F8FAFC",
            border: activeTier === 2 ? "1px solid #64748B" : "1px solid #E2E8F0",
            color: activeTier === 2 ? "#FFFFFF" : "#334155",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-cairo)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: activeTier === 2 ? "#475569" : "#F1F5F9",
            },
          }}
        >
          Tier 2 → {selectedBuilding?.tiers.tier2 || tierPath.tier2}
        </Box>

        {/* Tier 3 Pill */}
        <Box
          onClick={() => handleSelectTier(3)}
          sx={{
            px: 1.4,
            py: 0.6,
            borderRadius: "6px",
            bgcolor: activeTier === 3 ? "#10B981" : "#F8FAFC",
            border: activeTier === 3 ? "1px solid #10B981" : "1px solid #E2E8F0",
            color: activeTier === 3 ? "#FFFFFF" : "#334155",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-cairo)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: activeTier === 3 ? "#059669" : "#F1F5F9",
            },
          }}
        >
          Tier 3 → {selectedBuilding?.tiers.tier3 || tierPath.tier3}
        </Box>

        {/* Tier 4 Pill */}
        <Box
          onClick={() => handleSelectTier(4)}
          sx={{
            px: 1.4,
            py: 0.6,
            borderRadius: "6px",
            bgcolor: activeTier === 4 ? "#F97316" : "#F8FAFC",
            border: activeTier === 4 ? "1px solid #F97316" : "1px solid #E2E8F0",
            color: activeTier === 4 ? "#FFFFFF" : "#334155",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-cairo)",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: activeTier === 4 ? "#EA580C" : "#F1F5F9",
            },
          }}
        >
          Tier 4 → {selectedBuilding?.tiers.tier4 || tierPath.tier4}
        </Box>
      </Box>

      {/* Floating Bottom-Right Map Controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: "32px",
          right: "32px",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Current Location Button */}
        <Box
          onClick={handleResetLocation}
          title="Reset Location"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "4px",
            bgcolor: "#FFFFFF",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 9.429C11.72 9.429 13.12 8.033 13.12 6.309C13.12 4.586 11.72 3.189 10 3.189C8.28 3.189 6.88 4.586 6.88 6.309C6.88 8.033 8.28 9.429 10 9.429Z"
              stroke="#0000FF"
              strokeWidth="1.5"
            />
            <path
              d="M1.62 4.49C3.59 -4.17 16.42 -4.16 18.38 4.5C19.53 9.58 16.37 13.88 13.6 16.54C11.59 18.48 8.41 18.48 6.39 16.54C3.63 13.88 0.47 9.57 1.62 4.49Z"
              stroke="#0000FF"
              strokeWidth="1.5"
            />
          </svg>
        </Box>

        {/* Zoom In Plus Button */}
        <Box
          onClick={handleZoomIn}
          title="Zoom In"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "4px",
            bgcolor: "#FFFFFF",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.17 10H15.83M10 4.166V15.834" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        {/* Zoom Out Minus Button */}
        <Box
          onClick={handleZoomOut}
          title="Zoom Out"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "4px",
            bgcolor: "#FFFFFF",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.17 10H15.83" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}


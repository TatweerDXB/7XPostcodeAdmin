"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ClearIcon from "@mui/icons-material/Clear";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import type { Map as LeafletMap, LayerGroup, Marker } from "leaflet";
import {
  PORTAL_SEARCH_ITEMS,
  SearchResultItem,
  UAE_UNMASKED_CELLS,
} from "@/data/portalSearchData";
import GridStatisticsPanel from "./GridStatisticsPanel";
import PostcodeDetailsPanel from "./PostcodeDetailsPanel";
import { sanitizeHtml } from "@/utils/security";
import {
  getPlacePredictions,
  PlacePrediction,
  subscribeGoogleMapsError,
  GoogleMapsErrorInfo,
  loadGoogleMaps,
  geocodePlaceId,
} from "@/services/googleMaps";

// Category filter tabs
const filterTabs = [
  {
    id: "address",
    label: "Address",
    icon: (
      <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
        <path
          d="M6.5 7.453C7.649 7.453 8.58 6.522 8.58 5.373C8.58 4.224 7.649 3.293 6.5 3.293C5.351 3.293 4.42 4.224 4.42 5.373C4.42 6.522 5.351 7.453 6.5 7.453Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M0.913 4.161C2.227 -1.613 10.78 -1.606 12.087 4.167C12.853 7.554 10.747 10.421 8.9 12.194C7.56 13.487 5.44 13.487 4.093 12.194C2.253 10.421 0.147 7.547 0.913 4.161Z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    id: "postcode",
    label: "Postcode",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 5H14V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M2 5L8 9.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M4 2H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "makani",
    label: "Makani",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 15H1.6C0.72 15 0 14.28 0 13.4V2.46C0 0.51 1.48 0 3.31 0.88L6.71 2.53C7.44 2.89 8 3.84 8 4.65V15Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.25 9.87V12.75C15.25 14.39 14.48 15 12.84 15H8V6.18L11.82 7.39C12.82 7.61 13.64 8.12 13.69 9.58V9.87Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "onwani",
    label: "onwani",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M0.5 15H15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.5 15V6L8 1L14.5 6V15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M6 15V9H10V15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "coordinates",
    label: "Coordinates",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 1V3M8 13V15M1 8H3M13 8H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

type TierLevel = 1 | 2 | 3 | 4;

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

function _getSubCellBounds(parent: TierBounds, cellId: string): TierBounds {
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
  const [activeFilter, setActiveFilter] = useState("address");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isResultsPanelOpen, setIsResultsPanelOpen] = useState(false);
  const [isResultsPanelCollapsed, setIsResultsPanelCollapsed] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTier, setActiveTier] = useState<TierLevel>(1);
  const [uaeMenuAnchor, setUaeMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCountry, setActiveCountry] = useState<string>("UAE");

  const [selectedCellId, setSelectedCellId] = useState<string>("46");
  const selectedCellIdRef = useRef<string>("46");

  // Google Places & Auth Error Tracking
  const [googleMapsError, setGoogleMapsError] = useState<GoogleMapsErrorInfo | null>(null);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>([]);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [copiedError, setCopiedError] = useState<boolean>(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load Google Maps SDK on mount to detect RefererNotAllowedMapError immediately
  useEffect(() => {
    loadGoogleMaps().catch(() => { });
    const unsubscribe = subscribeGoogleMapsError((err) => {
      setGoogleMapsError(err);
    });
    return () => {
      unsubscribe();
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const gridLayerGroupRef = useRef<LayerGroup | null>(null);
  const poiLayerGroupRef = useRef<LayerGroup | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);

  // Injects the 135deg diagonal hatched lines pattern into Leaflet SVG defs
  const ensureSvgDefs = useCallback((map: LeafletMap) => {
    try {
      const container = map.getContainer()?.querySelector("svg.leaflet-zoom-animated");
      if (!container) return;
      if (container.querySelector("#uaeDisabledHatchPattern")) return;

      let defs = container.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        container.insertBefore(defs, container.firstChild);
      }

      const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
      pattern.setAttribute("id", "uaeDisabledHatchPattern");
      pattern.setAttribute("width", "12");
      pattern.setAttribute("height", "12");
      pattern.setAttribute("patternTransform", "rotate(135 0 0)");
      pattern.setAttribute("patternUnits", "userSpaceOnUse");

      const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bgRect.setAttribute("width", "12");
      bgRect.setAttribute("height", "12");
      bgRect.setAttribute("fill", "#F9FBFD");
      bgRect.setAttribute("fill-opacity", "0.95");

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", "0");
      line.setAttribute("x2", "0");
      line.setAttribute("y2", "12");
      line.setAttribute("stroke", "#C8C8C8");
      line.setAttribute("stroke-width", "1.2");

      pattern.appendChild(bgRect);
      pattern.appendChild(line);
      defs.appendChild(pattern);
    } catch {
      // SVG defs fallback
    }
  }, []);

  // Filtered search list
  const filteredResults = searchQuery.trim()
    ? PORTAL_SEARCH_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.addressLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.postCode.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : PORTAL_SEARCH_ITEMS;

  const updatePinMarker = useCallback(async (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    const L = await import("leaflet");

    if (pinMarkerRef.current) {
      mapInstanceRef.current.removeLayer(pinMarkerRef.current);
      pinMarkerRef.current = null;
    }

    const pinHtml = `
      <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <div class="radar-pulse-ring"></div>
        <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%);">
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none">
            <filter id="pinShadow" x="0" y="0" width="34" height="42" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-opacity="0.38"/>
            </filter>
            <g filter="url(#pinShadow)">
              <path d="M17 2C9.82 2 4 7.82 4 15C4 24.5 17 38 17 38C17 38 30 24.5 30 15C30 7.82 24.18 2 17 2Z" fill="#DC2626"/>
              <circle cx="17" cy="15" r="5.5" fill="#FFFFFF"/>
            </g>
          </svg>
        </div>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: "custom-red-pin-marker",
      html: pinHtml,
      iconSize: [34, 42],
      iconAnchor: [17, 42],
    });

    pinMarkerRef.current = L.marker([lat, lng], {
      icon: pinIcon,
      zIndexOffset: 1200,
    }).addTo(mapInstanceRef.current);
  }, []);

  const clearPinMarker = useCallback(() => {
    if (pinMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(pinMarkerRef.current);
      pinMarkerRef.current = null;
    }
  }, []);

  // Render POIs for Tier 4 view
  const renderPlotPOIs = useCallback(async () => {
    if (!mapInstanceRef.current) return;
    const L = await import("leaflet");

    if (!poiLayerGroupRef.current) {
      poiLayerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    } else {
      poiLayerGroupRef.current.clearLayers();
    }

    const pois = [
      {
        name: "Armani ball room",
        lat: 25.1983,
        lng: 55.2730,
        color: "#8B5CF6",
        iconSvg: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" fill="#8B5CF6"/><path d="M7 11V15M10 8V15M13 11V15" stroke="white" stroke-width="1.5"/></svg>`,
      },
      {
        name: "EV Green Charging Station",
        lat: 25.1979,
        lng: 55.2762,
        color: "#0D9488",
        iconSvg: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#0D9488"/><path d="M10.5 4L6 11H10L9.5 16L14 9H10L10.5 4Z" fill="white"/></svg>`,
      },
      {
        name: "Tesla Destination Charger",
        lat: 25.1963,
        lng: 55.2732,
        color: "#0D9488",
        iconSvg: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#0D9488"/><path d="M10.5 4L6 11H10L9.5 16L14 9H10L10.5 4Z" fill="white"/></svg>`,
      },
      {
        name: "The Burj Club",
        lat: 25.1950,
        lng: 55.2741,
        color: "#F97316",
        iconSvg: `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#F97316"/><path d="M7 6V14M13 6V14M7 9H13" stroke="white" stroke-width="1.5"/></svg>`,
      },
    ];

    pois.forEach((poi) => {
      const poiHtml = `
        <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
          <div style="width: 28px; height: 28px; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; background: white;">
            ${poi.iconSvg}
          </div>
          <span style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: ${poi.color}; text-shadow: 0 1px 3px rgba(255,255,255,0.9); white-space: nowrap;">
            ${sanitizeHtml(poi.name)}
          </span>
        </div>
      `;

      const poiIcon = L.divIcon({
        className: "plot-poi-marker",
        html: poiHtml,
        iconSize: [160, 28],
        iconAnchor: [14, 14],
      });

      L.marker([poi.lat, poi.lng], { icon: poiIcon, interactive: false }).addTo(poiLayerGroupRef.current!);
    });
  }, []);

  const renderGridRef = useRef<((tier: TierLevel, targetItem?: SearchResultItem | null) => Promise<void>) | null>(null);

  // Render Grid Layer (T1, T2, T3, T4)
  const renderGrid = useCallback(
    async (tier: TierLevel, targetItem: SearchResultItem | null = selectedResult) => {
      if (!mapInstanceRef.current) return;
      const L = await import("leaflet");

      if (!gridLayerGroupRef.current) {
        gridLayerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      } else {
        gridLayerGroupRef.current.clearLayers();
      }

      if (poiLayerGroupRef.current) {
        poiLayerGroupRef.current.clearLayers();
      }

      // Ensure SVG diagonal hatch pattern is defined in Leaflet overlay
      ensureSvgDefs(mapInstanceRef.current);

      if (tier === 1) {
        // UAE TIER 1 GRID
        const { north, south, west, east } = TIER1_DEFAULT_BOUNDS;
        const latStep = (north - south) / 10;
        const lngStep = (east - west) / 10;

        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            const cellId = `${r}${c}`;
            const cellNorth = north - r * latStep;
            const cellSouth = north - (r + 1) * latStep;
            const cellWest = west + c * lngStep;
            const cellEast = west + (c + 1) * lngStep;

            const isUnmasked = UAE_UNMASKED_CELLS.includes(cellId);
            const isHighlightTarget = targetItem ? cellId === targetItem.tiers.tier1 : false;
            const isSelected = isHighlightTarget || selectedCellIdRef.current === cellId;

            const bounds: [[number, number], [number, number]] = [
              [cellSouth, cellWest],
              [cellNorth, cellEast],
            ];

            if (isUnmasked) {
              // ENABLED UAE CELL (Inside UAE Boundary)
              const fillColor = isSelected ? "rgba(0, 0, 255, 0.6)" : "#FFFFFF";
              const fillOpacity = isSelected ? 0.85 : 0.88;
              const strokeColor = isSelected ? "#0000FF" : "rgba(0, 0, 0, 0.12)";
              const strokeWidth = isSelected ? 2.5 : 0.8;

              const rect = L.rectangle(bounds, {
                color: strokeColor,
                weight: strokeWidth,
                fillColor,
                fillOpacity,
                className: isSelected ? "selected-grid-cell" : "enabled-grid-cell",
              });

              // Enabled interaction
              rect.on("click", (e) => {
                L.DomEvent.stopPropagation(e);
                selectedCellIdRef.current = cellId;
                setSelectedCellId(cellId);
                renderGridRef.current?.(1, targetItem);
              });

              rect.on("dblclick", (e) => {
                L.DomEvent.stopPropagation(e);
                selectedCellIdRef.current = cellId;
                setSelectedCellId(cellId);
                setActiveTier(4);
                renderGridRef.current?.(4, targetItem);
              });

              rect.addTo(gridLayerGroupRef.current);

              // Cell label (Bold Cairo 14px)
              const textColor = isSelected ? "#FFFFFF" : "#000000";
              const labelHtml = `
                <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 14px; font-weight: 700; color: ${textColor}; text-align: center; line-height: 1; user-select: none; pointer-events: none;">
                  ${cellId}
                  ${isSelected && cellId === "46" ? '<div style="font-size: 10px; font-weight: 600; opacity: 0.95; margin-top: 2px;">E66</div>' : ""}
                </div>
              `;

              const labelIcon = L.divIcon({
                className: "t1-cell-label",
                html: labelHtml,
                iconSize: [32, 22],
                iconAnchor: [16, 11],
              });

              L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
                icon: labelIcon,
                interactive: false,
              }).addTo(gridLayerGroupRef.current);
            } else {
              // DISABLED OUTSIDE UAE BOUNDARY CELL (Diagonal Hatched Lines)
              const rect = L.rectangle(bounds, {
                color: "#DEDEDE",
                weight: 0.8,
                fillColor: "url(#uaeDisabledHatchPattern)",
                fillOpacity: 1.0,
                className: "disabled-grid-cell",
                interactive: false,
              });

              rect.addTo(gridLayerGroupRef.current);

              // Muted disabled cell label
              const labelHtml = `
                <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: #94A3B8; text-align: center; line-height: 1; user-select: none; pointer-events: none; opacity: 0.65;">
                  ${cellId}
                </div>
              `;

              const labelIcon = L.divIcon({
                className: "t1-disabled-cell-label",
                html: labelHtml,
                iconSize: [28, 18],
                iconAnchor: [14, 9],
              });

              L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
                icon: labelIcon,
                interactive: false,
              }).addTo(gridLayerGroupRef.current);
            }
          }
        }

        // Fly camera to UAE overview
        mapInstanceRef.current.flyTo([24.3, 54.4], 7, {
          duration: 1.4,
          easeLinearity: 0.25,
        });

        if (targetItem) {
          updatePinMarker(targetItem.latitude, targetItem.longitude);
        }
      } else if (tier === 2) {
        // TIER 2: SECTOR SUB-GRID (10x10 within the selected Tier 1 cell)
        const parentId = targetItem?.tiers.tier1 || selectedCellIdRef.current || "46";
        const parentBounds = _getSubCellBounds(TIER1_DEFAULT_BOUNDS, parentId);
        const { north, south, west, east } = parentBounds;
        const latStep = (north - south) / 10;
        const lngStep = (east - west) / 10;

        const targetSector = targetItem?.tiers.tier2 || "45";

        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            const cellId = `${r}${c}`;
            const cellNorth = north - r * latStep;
            const cellSouth = north - (r + 1) * latStep;
            const cellWest = west + c * lngStep;
            const cellEast = west + (c + 1) * lngStep;

            const isTargetSector = cellId === targetSector;
            const bounds: [[number, number], [number, number]] = [
              [cellSouth, cellWest],
              [cellNorth, cellEast],
            ];

            const rect = L.rectangle(bounds, {
              color: isTargetSector ? "#0000FF" : "rgba(37, 99, 235, 0.4)",
              weight: isTargetSector ? 2.5 : 1,
              fillColor: isTargetSector ? "rgba(0, 0, 255, 0.6)" : "#FFFFFF",
              fillOpacity: isTargetSector ? 0.8 : 0.82,
              className: isTargetSector ? "selected-grid-cell" : "enabled-grid-cell",
            });

            rect.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              setActiveTier(4);
              renderGridRef.current?.(4, targetItem);
            });

            rect.addTo(gridLayerGroupRef.current);

            const textColor = isTargetSector ? "#FFFFFF" : "#0F172A";
            const labelHtml = `
              <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: ${textColor}; text-align: center; line-height: 1;">
                ${cellId}
              </div>
            `;

            const labelIcon = L.divIcon({
              className: "t2-cell-label",
              html: labelHtml,
              iconSize: [26, 16],
              iconAnchor: [13, 8],
            });

            L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
            }).addTo(gridLayerGroupRef.current);
          }
        }

        const centerLat = (north + south) / 2;
        const centerLng = (west + east) / 2;
        mapInstanceRef.current.flyTo([centerLat, centerLng], 10.5, {
          duration: 1.4,
          easeLinearity: 0.25,
        });

        if (targetItem) {
          updatePinMarker(targetItem.latitude, targetItem.longitude);
        }
      } else if (tier === 4) {
        // TIER 4 (Plot Grid: 10x10 sub-cells 00 to 99 around target)
        const centerLat = targetItem ? targetItem.latitude : 25.1972;
        const centerLng = targetItem ? targetItem.longitude : 55.2744;

        // Bounding box ~ 700m square
        const deltaLat = 0.0035;
        const deltaLng = 0.0038;
        const north = centerLat + deltaLat;
        const south = centerLat - deltaLat;
        const west = centerLng - deltaLng;
        const east = centerLng + deltaLng;

        const latStep = (north - south) / 10;
        const lngStep = (east - west) / 10;

        const targetPlotCell = targetItem?.tiers.tier4 || "76";

        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            const cellId = `${r}${c}`;
            const cellNorth = north - r * latStep;
            const cellSouth = north - (r + 1) * latStep;
            const cellWest = west + c * lngStep;
            const cellEast = west + (c + 1) * lngStep;

            const isTargetPlot = cellId === targetPlotCell;
            const isNearNeighbor = ["75", "77", "66", "86", "65", "67", "85", "87"].includes(cellId);

            const bounds: [[number, number], [number, number]] = [
              [cellSouth, cellWest],
              [cellNorth, cellEast],
            ];

            const fillColor = isTargetPlot
              ? "#0000FF"
              : isNearNeighbor
                ? "rgba(56, 189, 248, 0.25)"
                : "#FFFFFF";
            const fillOpacity = isTargetPlot ? 0.78 : isNearNeighbor ? 0.35 : 0.15;
            const strokeColor = isTargetPlot ? "#0000FF" : "rgba(148, 163, 184, 0.5)";
            const strokeWidth = isTargetPlot ? 2.5 : 0.8;

            const rect = L.rectangle(bounds, {
              color: strokeColor,
              weight: strokeWidth,
              fillColor,
              fillOpacity,
            });

            rect.addTo(gridLayerGroupRef.current);

            // Label
            const cLat = (cellNorth + cellSouth) / 2;
            const cLng = (cellWest + cellEast) / 2;
            const textColor = isTargetPlot ? "#FFFFFF" : "#1E293B";

            const labelIcon = L.divIcon({
              className: "t4-cell-label",
              html: `<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: ${textColor}; text-align: center;">${cellId}</div>`,
              iconSize: [22, 14],
              iconAnchor: [11, 7],
            });

            L.marker([cLat, cLng], { icon: labelIcon, interactive: false }).addTo(
              gridLayerGroupRef.current
            );
          }
        }

        renderPlotPOIs();

        // Smooth camera transition to target location
        mapInstanceRef.current.flyTo([centerLat, centerLng], 17.5, {
          duration: 1.6,
          easeLinearity: 0.25,
        });

        updatePinMarker(centerLat, centerLng);
      } else {
        // TIER 3 Intermediate Zoom
        const centerLat = targetItem ? targetItem.latitude : 25.1972;
        const centerLng = targetItem ? targetItem.longitude : 55.2744;

        mapInstanceRef.current.flyTo([centerLat, centerLng], 14, {
          duration: 1.4,
          easeLinearity: 0.25,
        });

        if (targetItem) {
          updatePinMarker(targetItem.latitude, targetItem.longitude);
        }
      }
    },
    [selectedResult, updatePinMarker, renderPlotPOIs, ensureSvgDefs]
  );

  useEffect(() => {
    renderGridRef.current = renderGrid;
  }, [renderGrid]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    let isMounted = true;

    type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };
    const container = mapContainerRef.current as LeafletContainer;
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [24.3, 54.4],
        zoom: 7,
        minZoom: 5,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Clean, high-resolution Google Maps tile layer
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
      }).addTo(map);

      gridLayerGroupRef.current = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = L.layerGroup().addTo(map);

      // Render initial Tier 1 UAE Grid
      renderGrid(1, null);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [renderGrid]);

  // Handle selecting an item from suggestions or results
  const handleSelectItem = (item: SearchResultItem) => {
    setSelectedResult(item);
    setSearchQuery(item.name);
    setIsSuggestionsOpen(false);
    setIsResultsPanelOpen(true);
    setIsResultsPanelCollapsed(false);
    setRightPanelOpen(true);

    // Zoom to Tier 4
    setActiveTier(4);
    renderGrid(4, item);
  };

  // Handle typing in search input with Places Autocomplete debouncing
  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    setIsSuggestionsOpen(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val || val.trim().length < 2) {
      setPlacePredictions([]);
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const preds = await getPlacePredictions(val);
        setPlacePredictions(preds);
      } catch {
        setPlacePredictions([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 280);
  };

  // Handle selecting a Google Places live prediction
  const handleSelectPrediction = async (pred: PlacePrediction) => {
    setSearchQuery(pred.mainText);
    setIsSuggestionsOpen(false);
    setIsResultsPanelOpen(true);
    setIsResultsPanelCollapsed(false);
    setRightPanelOpen(true);

    try {
      const details = await geocodePlaceId(pred.placeId);
      if (details) {
        const customItem: SearchResultItem = {
          id: pred.placeId,
          name: pred.mainText,
          type: "location",
          status: "Verified",
          addressLine: details.formattedAddress || pred.description,
          postCode: "46-45-65-76",
          tiers: {
            tier1: "46",
            tier2: "45",
            tier3: "65",
            tier4: "76",
          },
          latitude: details.lat,
          longitude: details.lng,
          makaniNumber: "-",
          onwaniAddress: "-",
          coordinates: `${details.lat.toFixed(5)}, ${details.lng.toFixed(5)}`,
          buildingName: pred.mainText,
          addressType: "Google Place",
          addressIdentifier: `GP-${pred.placeId.slice(0, 8)}`,
          floors: 1,
          units: 1,
          street: details.street || pred.secondaryText || "Main Street",
          areaLocality: details.areaLocality || "Downtown",
          emirateAdminArea: details.emirate || "Dubai",
          countryCode: "AE",
          countryName: "United Arab Emirates",
          lastUpdate: "Today",
          gridLineage: {
            tier1: { code: "46", label: "Tier 1", desc: details.emirate || "Dubai" },
            tier2: { code: "46-45", label: "Tier 2", desc: details.areaLocality || "District" },
            tier3: { code: "46-45-65", label: "Tier 3", desc: "Sector 65" },
            tier4: { code: "46-45-65-76", label: "Tier 4", desc: "Plot 76" },
          },
        };
        handleSelectItem(customItem);
      }
    } catch (err) {
      console.error("Geocoding place failed:", err);
    }
  };

  // Copy Google Maps API error report to clipboard
  const handleCopyErrorText = () => {
    if (!googleMapsError) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const keySnippet = apiKey ? `${apiKey.slice(0, 10)}...${apiKey.slice(-4)}` : "Missing";
    const textToCopy = `=== Google Maps API Error Report ===
Error Code: ${googleMapsError.code}
Message: ${googleMapsError.message}
Blocked Origin / Referrer: ${origin}
API Key: ${keySnippet}
Timestamp: ${googleMapsError.timestamp}

Issue Explanation:
Google Maps Places Autocomplete is not suggesting new places because this site URL (${origin}) is not authorized under the API Key's HTTP Referrer restrictions in Google Cloud Console.

How To Fix (For Team/Admin):
1. Open Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Select your Google Maps API Key: ${keySnippet}
3. Under 'Set application restrictions', ensure 'Websites' is selected
4. Add the following URLs to Allowed Websites / Referrers:
   - ${origin}/*
   - http://localhost:3000/*
   - http://127.0.0.1:3000/*
5. Save changes and wait 1-2 minutes for changes to propagate.`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedError(true);
    setTimeout(() => setCopiedError(false), 2500);
  };

  // Handle submitting search
  const handleSearchSubmit = () => {
    if (filteredResults.length > 0) {
      handleSelectItem(filteredResults[0]);
    }
  };

  // Handle resetting search
  const handleClearSearch = () => {
    setSearchQuery("");
    setPlacePredictions([]);
    setIsSuggestionsOpen(false);
    setIsResultsPanelOpen(false);
    setSelectedResult(null);
    clearPinMarker();
    setActiveTier(1);
    renderGrid(1, null);
  };

  // Switch Tier Level via bottom bar
  const handleSwitchTier = (tier: TierLevel) => {
    setActiveTier(tier);
    renderGrid(tier, selectedResult);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        bgcolor: "#F9FBFD",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Main Map View Area */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          position: "relative",
          minWidth: 0,
        }}
      >
        {/* Leaflet Map Canvas */}
        <Box
          ref={mapContainerRef}
          sx={{
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        />

        {/* Top Floating Controls Container */}
        <Box
          sx={{
            position: "absolute",
            top: "16px",
            left: "24px",
            right: "24px",
            zIndex: 30,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          {/* Top Left: Search Bar & Dropdowns */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pointerEvents: "auto", width: 340 }}>
            {/* Search Input Box */}
            <ClickAwayListener onClickAway={() => setIsSuggestionsOpen(false)}>
              <Box sx={{ position: "relative", width: "100%" }}>
                {/* Search Input Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #E2E8F0",
                    height: 44,
                    px: 1.5,
                    gap: 1,
                  }}
                >
                  <InputBase
                    placeholder="Search postcodes, buildings, units,..."
                    value={searchQuery}
                    onFocus={() => setIsSuggestionsOpen(true)}
                    onClick={() => setIsSuggestionsOpen(true)}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchSubmit();
                      }
                    }}
                    sx={{
                      flex: 1,
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontSize: "13px",
                      color: "#0F172A",
                      "& input::placeholder": {
                        color: "#94A3B8",
                        opacity: 1,
                      },
                    }}
                  />

                  {isSearchingPlaces && (
                    <CircularProgress size={16} sx={{ color: "#0000FF", mr: 0.5 }} />
                  )}

                  {searchQuery && (
                    <IconButton size="small" onClick={handleClearSearch} sx={{ color: "#94A3B8", p: 0.3 }}>
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}

                  {/* Blue Magnifier Search Action Button */}
                  <IconButton
                    size="small"
                    onClick={handleSearchSubmit}
                    sx={{
                      color: "#0000FF",
                      p: 0.5,
                      "&:hover": { bgcolor: "rgba(0, 0, 255, 0.06)" },
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                        fill="currentColor"
                      />
                    </svg>
                  </IconButton>
                </Box>

                {/* RefererNotAllowedMapError Alert Pill (Visible beneath Search Box) */}
                {googleMapsError && (
                  <Box
                    onClick={() => setShowErrorModal(true)}
                    sx={{
                      mt: 0.8,
                      px: 1.2,
                      py: 0.7,
                      borderRadius: "6px",
                      bgcolor: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(220, 38, 38, 0.08)",
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: "#FEE2E2", borderColor: "#F87171" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                      <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 17, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#991B1B",
                            fontFamily: "var(--font-cairo)",
                            lineHeight: 1.2,
                          }}
                        >
                          Google Places API: RefererNotAllowedMapError
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "10px",
                            color: "#B91C1C",
                            fontFamily: "var(--font-cairo)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          http://localhost:3000 is not authorized in Google Cloud Console
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowErrorModal(true);
                      }}
                      sx={{
                        fontSize: "10px",
                        fontWeight: 700,
                        bgcolor: "#DC2626",
                        color: "#FFFFFF",
                        textTransform: "none",
                        py: 0.2,
                        px: 1,
                        borderRadius: "4px",
                        flexShrink: 0,
                        minWidth: "auto",
                        "&:hover": { bgcolor: "#B91C1C" },
                      }}
                    >
                      Show Details
                    </Button>
                  </Box>
                )}

                {/* Filter Category Tabs (Pills) */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    mt: 1,
                    bgcolor: "#FFFFFF",
                    p: 0.5,
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {filterTabs.map((tab) => {
                    const isSelected = activeFilter === tab.id;
                    return (
                      <Box
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        sx={{
                          flex: 1,
                          height: 28,
                          borderRadius: "6px",
                          bgcolor: isSelected ? "#0000FF" : "transparent",
                          color: isSelected ? "#FFFFFF" : "#64748B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          userSelect: "none",
                          fontSize: "11px",
                          fontWeight: isSelected ? 600 : 500,
                          fontFamily: "var(--font-cairo), Cairo, sans-serif",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            bgcolor: isSelected ? "#0000FF" : "#F1F5F9",
                          },
                        }}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </Box>
                    );
                  })}
                </Box>

                {/* Auto-suggest Dropdown Panel (Searching Page.png) */}
                {isSuggestionsOpen && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      width: "100%",
                      bgcolor: "#FFFFFF",
                      borderRadius: "12px",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
                      border: "1px solid #E2E8F0",
                      p: 1.5,
                      zIndex: 100,
                      maxHeight: 460,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Suggestions Header */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1, borderBottom: "1px solid #F1F5F9" }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-cairo)" }}>
                        Search suggested ({placePredictions.length + filteredResults.length})
                      </Typography>
                      <IconButton size="small" onClick={() => setIsSuggestionsOpen(false)} sx={{ p: 0.2, color: "#64748B" }}>
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    {/* RefererNotAllowedMapError Diagnostic Card inside Dropdown */}
                    {googleMapsError && (
                      <Box
                        sx={{
                          p: 1.2,
                          mt: 1,
                          mb: 1,
                          borderRadius: "8px",
                          bgcolor: "#FEF2F2",
                          border: "1.5px solid #F87171",
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.8,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 18 }} />
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#991B1B", fontFamily: "var(--font-cairo)" }}>
                              Google Maps Error: RefererNotAllowedMapError
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              px: 0.7,
                              py: 0.1,
                              borderRadius: "4px",
                              bgcolor: "#FEE2E2",
                              border: "1px solid #FCA5A5",
                              color: "#B91C1C",
                              fontSize: "9.5px",
                              fontWeight: 700,
                              fontFamily: "monospace",
                            }}
                          >
                            HTTP 403
                          </Box>
                        </Box>

                        <Typography sx={{ fontSize: "11px", color: "#7F1D1D", fontFamily: "var(--font-cairo)", lineHeight: 1.35 }}>
                          Live suggestions for new places are blocked because Google Maps API rejected the HTTP referer (<code>{typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}</code>).
                        </Typography>

                        <Box
                          sx={{
                            p: 0.8,
                            borderRadius: "5px",
                            bgcolor: "#FFFFFF",
                            border: "1px solid #FECACA",
                            fontSize: "10px",
                            color: "#991B1B",
                            fontFamily: "var(--font-cairo)",
                          }}
                        >
                          <strong>Required Team Action:</strong>
                          <div style={{ marginTop: "2px", lineHeight: 1.4 }}>
                            In Google Cloud Console &gt; APIs &amp; Services &gt; Credentials &gt; API Key &gt; Add <strong>{typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/*</strong> to Authorized HTTP referrers.
                          </div>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 0.4 }}>
                          <Button
                            size="small"
                            startIcon={copiedError ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyIcon sx={{ fontSize: 13 }} />}
                            onClick={handleCopyErrorText}
                            sx={{
                              fontSize: "10.5px",
                              fontWeight: 600,
                              color: copiedError ? "#15803D" : "#DC2626",
                              textTransform: "none",
                              p: 0,
                              minWidth: "auto",
                            }}
                          >
                            {copiedError ? "Copied Report to Clipboard!" : "Copy Report for Team"}
                          </Button>

                          <Button
                            size="small"
                            onClick={() => setShowErrorModal(true)}
                            sx={{
                              fontSize: "10.5px",
                              fontWeight: 700,
                              color: "#991B1B",
                              textTransform: "none",
                              p: 0,
                              minWidth: "auto",
                              textDecoration: "underline",
                            }}
                          >
                            View Technical Details
                          </Button>
                        </Box>
                      </Box>
                    )}

                    {/* Google Places Live Predictions (if available) */}
                    {placePredictions.length > 0 && (
                      <Box sx={{ py: 0.5, borderBottom: "1px solid #F1F5F9" }}>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", mb: 0.5, fontFamily: "var(--font-cairo)" }}>
                          Google Places Suggestions:
                        </Typography>
                        {placePredictions.map((pred) => (
                          <Box
                            key={pred.placeId}
                            onClick={() => handleSelectPrediction(pred)}
                            sx={{
                              p: "6px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              mb: 0.4,
                              bgcolor: "rgba(37, 99, 235, 0.04)",
                              "&:hover": { bgcolor: "rgba(37, 99, 235, 0.08)" },
                            }}
                          >
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-cairo)" }}>
                              {pred.mainText}
                            </Typography>
                            <Typography sx={{ fontSize: "10.5px", color: "#64748B", fontFamily: "var(--font-cairo)" }}>
                              {pred.secondaryText || pred.description}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Fallback Verified UAE Registry Results */}
                    <Box sx={{ flex: 1, overflowY: "auto", py: 0.5, display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#64748B", py: 0.5, fontFamily: "var(--font-cairo)" }}>
                        {googleMapsError ? "Verified UAE Registry Places (Offline / Fallback):" : "Verified UAE Locations:"}
                      </Typography>
                      {filteredResults.map((item) => (
                        <Box
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          sx={{
                            p: "8px 6px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "background-color 0.12s ease",
                            borderBottom: "1px solid #F8FAFC",
                            "&:hover": { bgcolor: "#F1F5F9" },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                              <PlaceOutlinedIcon sx={{ fontSize: 17, color: "#0000FF", flexShrink: 0 }} />
                              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-cairo)" }}>
                                {item.name}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                px: 0.8,
                                py: 0.15,
                                borderRadius: "4px",
                                bgcolor: item.status === "Verified" ? "rgba(22, 163, 74, 0.08)" : "rgba(249, 115, 22, 0.08)",
                                border: item.status === "Verified" ? "1px solid rgba(22, 163, 74, 0.25)" : "1px solid rgba(249, 115, 22, 0.25)",
                                color: item.status === "Verified" ? "#16A34A" : "#EA580C",
                                fontSize: "10.5px",
                                fontWeight: 600,
                                fontFamily: "var(--font-cairo)",
                                flexShrink: 0,
                              }}
                            >
                              {item.status}
                            </Box>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: "11.5px",
                              color: "#64748B",
                              fontFamily: "var(--font-cairo)",
                              mt: 0.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.addressLine}
                          </Typography>

                          <Typography sx={{ fontSize: "11px", color: "#64748B", fontFamily: "var(--font-cairo)", mt: 0.2 }}>
                            Postcode:{" "}
                            <span style={{ color: "#0000FF", fontWeight: 700, fontFamily: "var(--font-space-grotesk)" }}>
                              {item.postCode}
                            </span>
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Footer Pagination */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                      <IconButton size="small" sx={{ p: 0.2 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M10 12L6 8L10 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </IconButton>
                      <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontFamily: "var(--font-cairo)" }}>
                        1 of 14
                      </Typography>
                      <IconButton size="small" sx={{ p: 0.2 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            </ClickAwayListener>

            {/* Collapsible Search Results Card (Results Page.png & Results Page-3.png) */}
            {isResultsPanelOpen && (
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
                  border: "1px solid #E2E8F0",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                }}
              >
                {/* Results Header with Toggle Button */}
                <Box
                  onClick={() => setIsResultsPanelCollapsed(!isResultsPanelCollapsed)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "10px 14px",
                    cursor: "pointer",
                    userSelect: "none",
                    bgcolor: "#FFFFFF",
                    borderBottom: isResultsPanelCollapsed ? "none" : "1px solid #F1F5F9",
                    "&:hover": { bgcolor: "#F8FAFC" },
                  }}
                >
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-cairo)" }}>
                    Search Results ({filteredResults.length})
                  </Typography>

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      transform: isResultsPanelCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path d="M4 6L8 10L12 6" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </Box>

                {/* Expanded Results List */}
                {!isResultsPanelCollapsed && (
                  <Box sx={{ p: 1.2, maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                    {filteredResults.map((item) => {
                      const isSelected = selectedResult?.id === item.id;
                      return (
                        <Box
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          sx={{
                            p: "8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            bgcolor: isSelected ? "rgba(0, 0, 255, 0.04)" : "transparent",
                            border: isSelected ? "1px solid rgba(0, 0, 255, 0.2)" : "1px solid transparent",
                            borderBottom: isSelected ? "1px solid rgba(0, 0, 255, 0.2)" : "1px solid #F8FAFC",
                            transition: "background-color 0.12s ease",
                            mb: 0.5,
                            "&:hover": { bgcolor: isSelected ? "rgba(0, 0, 255, 0.06)" : "#F1F5F9" },
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, minWidth: 0 }}>
                              <PlaceOutlinedIcon sx={{ fontSize: 16, color: "#0000FF", flexShrink: 0 }} />
                              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-cairo)" }}>
                                {item.name}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                px: 0.8,
                                py: 0.15,
                                borderRadius: "4px",
                                bgcolor: item.status === "Verified" ? "rgba(22, 163, 74, 0.08)" : "rgba(249, 115, 22, 0.08)",
                                border: item.status === "Verified" ? "1px solid rgba(22, 163, 74, 0.25)" : "1px solid rgba(249, 115, 22, 0.25)",
                                color: item.status === "Verified" ? "#16A34A" : "#EA580C",
                                fontSize: "10.5px",
                                fontWeight: 600,
                                fontFamily: "var(--font-cairo)",
                                flexShrink: 0,
                              }}
                            >
                              {item.status}
                            </Box>
                          </Box>

                          <Typography
                            sx={{
                              fontSize: "11px",
                              color: "#64748B",
                              fontFamily: "var(--font-cairo)",
                              mt: 0.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.addressLine}
                          </Typography>

                          <Typography sx={{ fontSize: "11px", color: "#64748B", fontFamily: "var(--font-cairo)", mt: 0.2 }}>
                            Postcode:{" "}
                            <span style={{ color: "#0000FF", fontWeight: 700, fontFamily: "var(--font-space-grotesk)" }}>
                              {item.postCode}
                            </span>
                          </Typography>
                        </Box>
                      );
                    })}

                    {/* Pagination Footer */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, pt: 1, borderTop: "1px solid #F1F5F9" }}>
                      <IconButton size="small" sx={{ p: 0.2 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M10 12L6 8L10 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </IconButton>
                      <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontFamily: "var(--font-cairo)" }}>
                        1 of 14
                      </Typography>
                      <IconButton size="small" sx={{ p: 0.2 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Top Right: Country Dropdown (UAE) */}
          <Box sx={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              onClick={(e) => setUaeMenuAnchor(e.currentTarget)}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid #E2E8F0",
                height: 38,
                px: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.15s ease",
                "&:hover": { borderColor: "#0000FF" },
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#0000FF" strokeWidth="1.4" />
                <path d="M8 5V8L10 9" stroke="#0000FF" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                {activeCountry}
              </Typography>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                <path d="M1 1L6 6L11 1" stroke="#64748B" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </Box>

            <Menu
              anchorEl={uaeMenuAnchor}
              open={Boolean(uaeMenuAnchor)}
              onClose={() => setUaeMenuAnchor(null)}
              slotProps={{
                paper: {
                  elevation: 4,
                  sx: { borderRadius: "8px", minWidth: 120, mt: 0.5 },
                },
              }}
            >
              {["UAE", "Dubai", "Abu Dhabi", "Sharjah"].map((c) => (
                <MenuItem
                  key={c}
                  onClick={() => {
                    setActiveCountry(c);
                    setUaeMenuAnchor(null);
                  }}
                  sx={{ fontSize: "13px", fontFamily: "var(--font-cairo)" }}
                >
                  {c}
                </MenuItem>
              ))}
            </Menu>

            {/* Toggle Right Panel Button (if closed) */}
            {!rightPanelOpen && (
              <Button
                variant="contained"
                onClick={() => setRightPanelOpen(true)}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#0000FF",
                  borderRadius: "8px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #E2E8F0",
                  height: 38,
                  px: 1.5,
                  fontSize: "12.5px",
                  fontWeight: 600,
                  fontFamily: "var(--font-cairo)",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                {selectedResult ? "View Details" : "View Statistics"}
              </Button>
            )}
          </Box>
        </Box>

        {/* Bottom Left Floating: Grid Level (T1, T2, T3, T4) */}
        <Box
          sx={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            zIndex: 30,
            bgcolor: "#FFFFFF",
            borderRadius: "10px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
            border: "1px solid #E2E8F0",
            px: 1.5,
            py: 0.8,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            userSelect: "none",
          }}
        >
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 600, color: "#64748B" }}>
            Grid Level:
          </Typography>

          {/* T1 */}
          <Box
            onClick={() => handleSwitchTier(1)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.2,
              py: 0.5,
              borderRadius: "6px",
              cursor: "pointer",
              bgcolor: activeTier === 1 ? "rgba(0, 0, 255, 0.08)" : "transparent",
              border: activeTier === 1 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 1 ? "#0000FF" : "#0F172A",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-cairo)",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4L8 1L14 4V12L8 15L2 12V4Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>T1</span>
          </Box>

          {/* T2 */}
          <Box
            onClick={() => handleSwitchTier(2)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.2,
              py: 0.5,
              borderRadius: "6px",
              cursor: "pointer",
              bgcolor: activeTier === 2 ? "rgba(0, 0, 255, 0.08)" : "transparent",
              border: activeTier === 2 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 2 ? "#0000FF" : "#0F172A",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-cairo)",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>T2</span>
          </Box>

          {/* T3 */}
          <Box
            onClick={() => handleSwitchTier(3)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.2,
              py: 0.5,
              borderRadius: "6px",
              cursor: "pointer",
              bgcolor: activeTier === 3 ? "rgba(0, 0, 255, 0.08)" : "transparent",
              border: activeTier === 3 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 3 ? "#0000FF" : "#0F172A",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-cairo)",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>T3</span>
          </Box>

          {/* T4 */}
          <Box
            onClick={() => handleSwitchTier(4)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.2,
              py: 0.5,
              borderRadius: "6px",
              cursor: "pointer",
              bgcolor: activeTier === 4 ? "rgba(0, 0, 255, 0.08)" : "transparent",
              border: activeTier === 4 ? "1.5px solid #0000FF" : "1px solid #E2E8F0",
              color: activeTier === 4 ? "#0000FF" : "#0F172A",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-cairo)",
              transition: "all 0.15s ease",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>T4</span>
          </Box>
        </Box>

        {/* Bottom Right Floating Map Controls */}
        <Box
          sx={{
            position: "absolute",
            bottom: "24px",
            right: "24px",
            zIndex: 30,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {/* Target / Locate Me Button */}
          <Box
            onClick={() => {
              if (selectedResult) {
                mapInstanceRef.current?.flyTo([selectedResult.latitude, selectedResult.longitude], 17);
              } else {
                mapInstanceRef.current?.flyTo([24.3, 54.4], 7);
              }
            }}
            title="Reset to Target"
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC", transform: "scale(1.05)" },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="#000000" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="2.5" stroke="#000000" strokeWidth="1.5" />
              <path d="M10 1V4M10 16V19M1 10H4M16 10H19" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Box>

          {/* Zoom In Button */}
          <Box
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC", transform: "scale(1.05)" },
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M8 3V13" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Box>

          {/* Zoom Out Button */}
          <Box
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC", transform: "scale(1.05)" },
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Box>

          {/* Layers Toggle Button */}
          <Box
            title="Map Layers"
            sx={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC", transform: "scale(1.05)" },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L2 6L10 10L18 6L10 2Z" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 10L10 14L18 10" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M2 14L10 18L18 14" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </Box>
        </Box>
      </Box>

      {/* Right Side Panel (Grid Statistics or Postcode Details) */}
      <Box
        sx={{
          width: rightPanelOpen ? "380px" : "0px",
          minWidth: rightPanelOpen ? "380px" : "0px",
          p: rightPanelOpen ? "16px 18px 16px 0" : 0,
          height: "100%",
          boxSizing: "border-box",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {selectedResult ? (
          <PostcodeDetailsPanel item={selectedResult} onClose={() => setRightPanelOpen(false)} />
        ) : (
          <GridStatisticsPanel />
        )}
      </Box>

      {/* Technical Error Details Dialog (RefererNotAllowedMapError) */}
      <Dialog
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "12px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.2, pb: 1 }}>
          <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 26 }} />
          <Box>
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-cairo)" }}>
              Google Maps API: RefererNotAllowedMapError
            </Typography>
            <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontFamily: "var(--font-cairo)" }}>
              Technical diagnostics report for development and DevOps team
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
          <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
            <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: "#991B1B", mb: 0.5 }}>
              Status: HTTP 403 Forbidden (RefererNotAllowedMapError)
            </Typography>
            <Typography sx={{ fontSize: "11.5px", color: "#7F1D1D", lineHeight: 1.45 }}>
              Google Places Autocomplete failed to suggest new places because Google Cloud has rejected the HTTP Referer header from this application. The API key in <code>.env.local</code> has website restrictions enabled that do not permit this origin.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, bgcolor: "#F8FAFC", p: 1.5, borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
              <span style={{ color: "#64748B", fontWeight: 600 }}>Rejected Origin / Referer:</span>
              <code style={{ color: "#DC2626", fontWeight: 700, background: "#FEE2E2", padding: "2px 6px", borderRadius: "4px" }}>
                {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
              </code>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11.5px" }}>
              <span style={{ color: "#64748B", fontWeight: 600 }}>Detected Timestamp:</span>
              <span style={{ color: "#0F172A" }}>{googleMapsError?.timestamp || new Date().toLocaleTimeString()}</span>
            </Box>
          </Box>

          <Box sx={{ bgcolor: "#F0FDF4", p: 1.5, borderRadius: "8px", border: "1px solid #BBF7D0" }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#166534", mb: 0.5 }}>
              Resolution Guide for Team:
            </Typography>
            <Typography sx={{ fontSize: "11.5px", color: "#15803D", lineHeight: 1.5 }}>
              1. Open <strong>Google Cloud Console</strong>: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: "#15803D", fontWeight: 700 }}>Google Cloud Credentials</a><br />
              2. Click your Google Maps API Key.<br />
              3. Under <strong>Set application restrictions</strong> &gt; <strong>Websites</strong>, add:<br />
              &nbsp;&nbsp;&bull; <code>{typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/*</code><br />
              &nbsp;&nbsp;&bull; <code>http://localhost:3000/*</code><br />
              &nbsp;&nbsp;&bull; <code>http://127.0.0.1:3000/*</code><br />
              4. Click <strong>Save</strong>. (Note: Google takes ~1-2 minutes to propagate changes).
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            startIcon={copiedError ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            onClick={handleCopyErrorText}
            sx={{
              textTransform: "none",
              fontSize: "12px",
              color: copiedError ? "#15803D" : "#DC2626",
              borderColor: copiedError ? "#86EFAC" : "#FCA5A5",
              "&:hover": { borderColor: "#DC2626", bgcolor: "#FEF2F2" },
            }}
          >
            {copiedError ? "Diagnostic Report Copied!" : "Copy Report to Clipboard"}
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowErrorModal(false)}
            sx={{ bgcolor: "#0000FF", textTransform: "none", fontSize: "12px", "&:hover": { bgcolor: "#0000CC" } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

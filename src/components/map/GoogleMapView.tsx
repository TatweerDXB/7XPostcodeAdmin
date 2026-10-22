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
import LinearProgress from "@mui/material/LinearProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { Map as LeafletMap, LayerGroup, Marker } from "leaflet";
import {
  PORTAL_SEARCH_ITEMS,
  SearchResultItem,
  UAE_UNMASKED_CELLS,
  UAE_BORDER_COORDINATES,
} from "@/data/portalSearchData";
import GridStatisticsPanel from "@/components/grid/GridStatisticsPanel";
import PostcodeDetailsPanel from "@/components/postcode/PostcodeDetailsPanel";
import { sanitizeHtml } from "@/utils/security";
import {
  getPlacePredictions,
  PlacePrediction,
  subscribeGoogleMapsError,
  GoogleMapsErrorInfo,
  loadGoogleMaps,
  geocodePlaceId,
} from "@/services/googleMaps";
import {
  gridService,
  GeoJsonFeature,
  GridCellProperties,
  ResolvePointResponse,
} from "@/services/gridService";
import { postcodeService } from "@/services/postcodeService";

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
  north: 26.15,
  south: 21.00,
  west: 50.85,
  east: 57.15,
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

export interface BreadcrumbStep {
  tier: TierLevel;
  label: string;
  code: string;
  id?: string;
  cellProps?: GridCellProperties;
  bounds?: [[number, number], [number, number]];
}

export function buildSearchResultFromResolve(
  res: ResolvePointResponse,
  lat: number,
  lon: number
): SearchResultItem {
  const cell = res.cell || {};
  const rawCode = cell.hierarchyCode || cell.code || "";
  const parts = rawCode.split(/[\.-]/);
  const t1 = parts[0] || "46";
  const t2 = parts[1] || "";
  const t3 = parts[2] || "";
  const t4 = parts[3] || "";
  const postcode =
    res.postcodeDisplay ||
    res.postcode ||
    (rawCode ? rawCode.replace(/\./g, "-") : "4632-8278");

  return {
    id: cell.gridId || cell.id || `resolve-${lat}-${lon}`,
    name: res.postcodeDisplay ? `Postcode ${res.postcodeDisplay}` : `Cell ${rawCode}`,
    type: "location",
    status: "Verified",
    addressLine: `${postcode}, ${cell.emirate || "UAE"}`,
    postCode: postcode,
    tiers: {
      tier1: t1,
      tier2: t2,
      tier3: t3,
      tier4: t4,
    },
    latitude: lat,
    longitude: lon,
    makaniNumber: "-",
    onwaniAddress: "-",
    coordinates: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
    buildingName: cell.nameEn || cell.name || `Building (${postcode})`,
    addressType: "Postcode Grid Cell",
    addressIdentifier: cell.gridId || rawCode,
    floors: 1,
    units: 1,
    street: cell.nameEn || (t2 ? `Sector ${t2}` : "Main Street"),
    areaLocality: cell.emirate || "UAE",
    emirateAdminArea: cell.emirate || "UAE",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "Live API",
    gridLineage: {
      tier1: { code: t1, label: "Tier 1", desc: cell.emirate || "UAE" },
      tier2: { code: t2 ? `${t1}-${t2}` : t1, label: "Tier 2", desc: `Sector ${t2}` },
      tier3: { code: t3 ? `${t1}-${t2}-${t3}` : "", label: "Tier 3", desc: `Block ${t3}` },
      tier4: { code: t4 ? `${t1}-${t2}-${t3}-${t4}` : "", label: "Tier 4", desc: `Plot ${t4}` },
    },
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

  // Grid Navigation & Breadcrumb State
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbStep[]>([
    { tier: 1, label: "UAE (Tier 1)", code: "UAE" },
  ]);
  const [isGridLoading, setIsGridLoading] = useState<boolean>(false);
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);
  const [livePostcodeResults, setLivePostcodeResults] = useState<SearchResultItem[]>([]);
  const [selectedCellProps, setSelectedCellProps] = useState<GridCellProperties | null>(null);
  const [selectedNeighborCodes, setSelectedNeighborCodes] = useState<string[]>([]);
  const currentTierFeaturesRef = useRef<GeoJsonFeature[]>([]);

  // Grid Type: Full Grid vs UnMasked Cells matching Figma
  const [gridType, setGridType] = useState<"full-grid" | "unmasked">("full-grid");
  const gridTypeRef = useRef<"full-grid" | "unmasked">("full-grid");

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

  // Injects the 135deg diagonal hatched lines pattern into Leaflet SVG defs matching Figma CSS
  const ensureSvgDefs = useCallback((map: LeafletMap) => {
    try {
      const container =
        map.getContainer()?.querySelector("svg.leaflet-zoom-animated") ||
        map.getContainer()?.querySelector("svg") ||
        (map as any)._panes?.overlayPane?.querySelector("svg");
      if (!container) return;

      let defs = container.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        container.insertBefore(defs, container.firstChild);
      }

      // Re-create pattern so updates always take effect immediately
      const existing = defs.querySelector("#uaeDisabledHatchPattern");
      if (existing) {
        existing.remove();
      }

      const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
      pattern.setAttribute("id", "uaeDisabledHatchPattern");
      pattern.setAttribute("width", "10");
      pattern.setAttribute("height", "10");
      pattern.setAttribute("patternUnits", "userSpaceOnUse");
      pattern.setAttribute("patternTransform", "rotate(45)");

      const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bgRect.setAttribute("width", "10");
      bgRect.setAttribute("height", "10");
      bgRect.setAttribute("fill", "rgba(249, 251, 253, 0.55)");

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", "0");
      line.setAttribute("x2", "0");
      line.setAttribute("y2", "10");
      line.setAttribute("stroke", "#C8C8C8");
      line.setAttribute("stroke-width", "1.2");
      line.setAttribute("stroke-opacity", "0.95");

      pattern.appendChild(bgRect);
      pattern.appendChild(line);
      defs.appendChild(pattern);
    } catch {
      // SVG defs fallback
    }
  }, []);

  // Filtered search list (shows all 6 Figma items for default Burj Khalifa / Burj queries)
  const filteredResults = searchQuery.trim() && !["burj khalifa", "burj"].includes(searchQuery.trim().toLowerCase())
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
      <div style="position: relative; width: 28px; height: 38px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
        <svg width="28" height="38" viewBox="0 0 28 38" fill="none">
          <path d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 38 14 38C14 38 28 24.5 28 14C28 6.27 21.73 0 14 0Z" fill="#DC2626"/>
          <circle cx="14" cy="13" r="5" fill="#FFFFFF"/>
        </svg>
      </div>
    `;

    const pinIcon = L.divIcon({
      className: "custom-red-pin-marker",
      html: pinHtml,
      iconSize: [28, 38],
      iconAnchor: [14, 38],
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

  const renderGridRef = useRef<
    ((tier: TierLevel, targetItem?: SearchResultItem | null, parentProps?: GridCellProperties | null) => Promise<void>) | null
  >(null);

  // Fallback Geometric Grid Helpers
  const renderFallbackTier1 = useCallback(
    (L: typeof import("leaflet"), targetItem: SearchResultItem | null) => {
      if (!mapInstanceRef.current || !gridLayerGroupRef.current) return;
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
            const fillColor = isSelected ? "#1B8CFE" : "rgba(255, 255, 255, 0.05)";
            const fillOpacity = isSelected ? 0.9 : 0.08;
            const strokeColor = isSelected ? "#0000FF" : "rgba(37, 99, 235, 0.35)";
            const strokeWidth = isSelected ? 2 : 0.8;

            const rect = L.rectangle(bounds, {
              color: strokeColor,
              weight: strokeWidth,
              fillColor,
              fillOpacity,
              className: isSelected ? "selected-grid-cell" : "enabled-grid-cell",
            });

            rect.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              selectedCellIdRef.current = cellId;
              setSelectedCellId(cellId);
              setActiveTier(2);
              setBreadcrumbs([
                { tier: 1, label: "UAE (Tier 1)", code: "UAE" },
                { tier: 2, label: `Cell ${cellId} (Tier 2)`, code: cellId },
              ]);
              renderGridRef.current?.(2, targetItem, { code: cellId });
            });

            rect.addTo(gridLayerGroupRef.current);

            const textColor = isSelected ? "#FFFFFF" : "#0F172A";
            const labelHtml = `
              <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: ${textColor}; text-align: center; line-height: 1.2; text-shadow: ${isSelected ? "none" : "0 0 4px rgba(255,255,255,0.95), 0 0 2px #FFFFFF"}; user-select: none; pointer-events: none;">
                ${cellId}
              </div>
            `;
            const labelIcon = L.divIcon({
              className: "t1-cell-label",
              html: labelHtml,
              iconSize: [32, 26],
              iconAnchor: [16, 13],
            });
            L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
            }).addTo(gridLayerGroupRef.current);
          } else if (gridTypeRef.current === "full-grid") {
            const rect = L.rectangle(bounds, {
              color: "#DEDEDE",
              weight: 0.8,
              fillColor: "url(#uaeDisabledHatchPattern)",
              fillOpacity: 1,
              className: "disabled-grid-cell",
              interactive: false,
            });
            rect.addTo(gridLayerGroupRef.current);
          }
        }
      }

      L.polygon(UAE_BORDER_COORDINATES, {
        color: "#2563EB",
        weight: 2.2,
        dashArray: "6 5",
        fillColor: "rgba(0, 0, 255, 0.05)",
        fillOpacity: 0.05,
        interactive: false,
      }).addTo(gridLayerGroupRef.current);

      const uaeBounds: [[number, number], [number, number]] = [
        [TIER1_DEFAULT_BOUNDS.south, TIER1_DEFAULT_BOUNDS.west],
        [TIER1_DEFAULT_BOUNDS.north, TIER1_DEFAULT_BOUNDS.east],
      ];
      mapInstanceRef.current.fitBounds(uaeBounds, { padding: [24, 24], animate: false });
    },
    []
  );

  const renderFallbackTier2 = useCallback(
    (L: typeof import("leaflet"), parentCode: string, targetItem: SearchResultItem | null) => {
      if (!mapInstanceRef.current || !gridLayerGroupRef.current) return;
      const parentBounds = _getSubCellBounds(TIER1_DEFAULT_BOUNDS, parentCode.slice(0, 2) || "46");
      const { north, south, west, east } = parentBounds;
      const latStep = (north - south) / 10;
      const lngStep = (east - west) / 10;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cellId = `${r}${c}`;
          const fullCode = `${parentCode}.${cellId}`;
          const cellNorth = north - r * latStep;
          const cellSouth = north - (r + 1) * latStep;
          const cellWest = west + c * lngStep;
          const cellEast = west + (c + 1) * lngStep;

          const isSelected = selectedCellIdRef.current === fullCode || cellId === (targetItem?.tiers.tier2 || "32");
          const bounds: [[number, number], [number, number]] = [
            [cellSouth, cellWest],
            [cellNorth, cellEast],
          ];

          const rect = L.rectangle(bounds, {
            color: isSelected ? "#0000FF" : "rgba(37, 99, 235, 0.4)",
            weight: isSelected ? 2 : 1,
            fillColor: isSelected ? "rgba(0, 0, 255, 0.6)" : "#FFFFFF",
            fillOpacity: isSelected ? 0.75 : 0.85,
            className: isSelected ? "selected-grid-cell" : "enabled-grid-cell",
          });

          rect.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            selectedCellIdRef.current = fullCode;
            setSelectedCellId(fullCode);
            setActiveTier(3);
            setBreadcrumbs((prev) => [
              ...prev.slice(0, 2),
              { tier: 3, label: `Sector ${fullCode} (Tier 3)`, code: fullCode },
            ]);
            renderGridRef.current?.(3, targetItem, { code: fullCode });
          });

          rect.addTo(gridLayerGroupRef.current);

          const textColor = isSelected ? "#FFFFFF" : "#0F172A";
          const labelIcon = L.divIcon({
            className: "t2-cell-label",
            html: `<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: ${textColor}; text-align: center;">${cellId}</div>`,
            iconSize: [26, 16],
            iconAnchor: [13, 8],
          });

          L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
            icon: labelIcon,
            interactive: false,
          }).addTo(gridLayerGroupRef.current);
        }
      }

      mapInstanceRef.current.flyTo([(north + south) / 2, (west + east) / 2], 10.5, {
        duration: 1.2,
      });
    },
    []
  );

  const renderFallbackTier3 = useCallback(
    (L: typeof import("leaflet"), parentCode: string, targetItem: SearchResultItem | null) => {
      if (!mapInstanceRef.current || !gridLayerGroupRef.current) return;
      const parts = parentCode.split(/[\.-]/);
      const t1 = parts[0] || "46";
      const t2 = parts[1] || "32";
      const b1 = _getSubCellBounds(TIER1_DEFAULT_BOUNDS, t1);
      const b2 = _getSubCellBounds(b1, t2);
      const { north, south, west, east } = b2;
      const latStep = (north - south) / 10;
      const lngStep = (east - west) / 10;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cellId = `${r}${c}`;
          const fullCode = `${parentCode}.${cellId}`;
          const cellNorth = north - r * latStep;
          const cellSouth = north - (r + 1) * latStep;
          const cellWest = west + c * lngStep;
          const cellEast = west + (c + 1) * lngStep;

          const isSelected = selectedCellIdRef.current === fullCode || cellId === (targetItem?.tiers.tier3 || "82");
          const bounds: [[number, number], [number, number]] = [
            [cellSouth, cellWest],
            [cellNorth, cellEast],
          ];

          const rect = L.rectangle(bounds, {
            color: isSelected ? "#0000FF" : "rgba(37, 99, 235, 0.45)",
            weight: isSelected ? 2 : 1,
            fillColor: isSelected ? "rgba(0, 0, 255, 0.65)" : "#FFFFFF",
            fillOpacity: isSelected ? 0.8 : 0.85,
          });

          rect.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            selectedCellIdRef.current = fullCode;
            setSelectedCellId(fullCode);
            setActiveTier(4);
            setBreadcrumbs((prev) => [
              ...prev.slice(0, 3),
              { tier: 4, label: `Plot ${fullCode} (Tier 4)`, code: fullCode },
            ]);
            renderGridRef.current?.(4, targetItem, { code: fullCode });
          });

          rect.addTo(gridLayerGroupRef.current);

          const textColor = isSelected ? "#FFFFFF" : "#0F172A";
          const labelIcon = L.divIcon({
            className: "t3-cell-label",
            html: `<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: ${textColor}; text-align: center;">${cellId}</div>`,
            iconSize: [24, 15],
            iconAnchor: [12, 7],
          });

          L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
            icon: labelIcon,
            interactive: false,
          }).addTo(gridLayerGroupRef.current);
        }
      }

      mapInstanceRef.current.flyTo([(north + south) / 2, (west + east) / 2], 13.5, {
        duration: 1.2,
      });
    },
    []
  );

  const renderFallbackTier4 = useCallback(
    (L: typeof import("leaflet"), targetItem: SearchResultItem | null) => {
      if (!mapInstanceRef.current || !gridLayerGroupRef.current) return;
      const centerLat = targetItem ? targetItem.latitude : 24.455054;
      const centerLng = targetItem ? targetItem.longitude : 54.395753;

      const deltaLat = 0.0035;
      const deltaLng = 0.0038;
      const north = centerLat + deltaLat;
      const south = centerLat - deltaLat;
      const west = centerLng - deltaLng;
      const east = centerLng + deltaLng;

      const latStep = (north - south) / 10;
      const lngStep = (east - west) / 10;
      const targetPlotCell = targetItem?.tiers.tier4 || "78";

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cellId = `${r}${c}`;
          const cellNorth = north - r * latStep;
          const cellSouth = north - (r + 1) * latStep;
          const cellWest = west + c * lngStep;
          const cellEast = west + (c + 1) * lngStep;

          const isTargetPlot = cellId === targetPlotCell;
          const isNearNeighbor = ["77", "79", "68", "88", "67", "69", "87", "89"].includes(cellId);

          const bounds: [[number, number], [number, number]] = [
            [cellSouth, cellWest],
            [cellNorth, cellEast],
          ];

          const fillColor = isTargetPlot
            ? "#0000FF"
            : isNearNeighbor
              ? "rgba(56, 189, 248, 0.25)"
              : "#FFFFFF";
          const fillOpacity = isTargetPlot ? 0.8 : isNearNeighbor ? 0.35 : 0.15;
          const strokeColor = isTargetPlot ? "#0000FF" : "rgba(148, 163, 184, 0.5)";
          const strokeWidth = isTargetPlot ? 2.5 : 0.8;

          const rect = L.rectangle(bounds, {
            color: strokeColor,
            weight: strokeWidth,
            fillColor,
            fillOpacity,
          });

          rect.addTo(gridLayerGroupRef.current);

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
      mapInstanceRef.current.flyTo([centerLat, centerLng], 17.5, {
        duration: 1.4,
      });
      updatePinMarker(centerLat, centerLng);
    },
    [renderPlotPOIs, updatePinMarker]
  );

  // Main Live Grid Render Function
  const renderGrid = useCallback(
    async (
      tier: TierLevel,
      targetItem: SearchResultItem | null = selectedResult,
      parentProps: GridCellProperties | null = selectedCellProps
    ) => {
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

      ensureSvgDefs(mapInstanceRef.current);
      setIsGridLoading(true);
      setServiceNotice(null);

      try {
        if (tier === 1) {
          // Fetch tiers diagnostic in background
          gridService.getGridTiers().catch(() => null);

          let features: GeoJsonFeature[] = [];
          try {
            const res = await gridService.getCells({ tier: 1, PageSize: 100 });
            if (res && res.success && res.data?.features && res.data.features.length > 0) {
              features = res.data.features;
            }
          } catch (apiErr: any) {
            if (apiErr?.status === 502 || apiErr?.isTransient) {
              setServiceNotice("Service waking up on Render (502). Falling back to cached grid.");
            }
          }

          currentTierFeaturesRef.current = features;

          if (features.length > 0) {
            features.forEach((feat) => {
              const props = feat.properties || {};
              const code = props.code || props.hierarchyCode || "";
              const isUnmasked = !(props.isMasked ?? !UAE_UNMASKED_CELLS.includes(code));
              const isSelected =
                code === (selectedCellIdRef.current || targetItem?.tiers.tier1);

              if (feat.geometry?.coordinates) {
                const ring = feat.geometry.coordinates[0];
                const latlngs: [number, number][] = ring.map(
                  ([lon, lat]: [number, number]) => [lat, lon]
                );

                if (isUnmasked) {
                  const fillColor = isSelected ? "#1B8CFE" : "rgba(255, 255, 255, 0.05)";
                  const fillOpacity = isSelected ? 0.9 : 0.08;
                  const strokeColor = isSelected ? "#0000FF" : "rgba(37, 99, 235, 0.35)";
                  const strokeWidth = isSelected ? 2 : 0.8;

                  const poly = L.polygon(latlngs, {
                    color: strokeColor,
                    weight: strokeWidth,
                    fillColor,
                    fillOpacity,
                    className: isSelected ? "selected-grid-cell" : "enabled-grid-cell",
                  });

                  poly.on("click", (e) => {
                    L.DomEvent.stopPropagation(e);
                    selectedCellIdRef.current = code;
                    setSelectedCellId(code);
                    setSelectedCellProps(props);
                    setActiveTier(2);
                    setBreadcrumbs([
                      { tier: 1, label: "UAE (Tier 1)", code: "UAE" },
                      {
                        tier: 2,
                        label: `Cell ${code} (Tier 2)`,
                        code,
                        id: props.id || props.gridId,
                        cellProps: props,
                      },
                    ]);
                    renderGridRef.current?.(2, targetItem, props);
                  });

                  poly.addTo(gridLayerGroupRef.current!);

                  // Centroid Label
                  const bounds = poly.getBounds();
                  const center = bounds.getCenter();
                  const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                  const labelHtml = `
                    <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: ${textColor}; text-align: center; line-height: 1.2; text-shadow: ${isSelected ? "none" : "0 0 4px rgba(255,255,255,0.95), 0 0 2px #FFFFFF"}; user-select: none; pointer-events: none;">
                      ${code}
                    </div>
                  `;
                  const labelIcon = L.divIcon({
                    className: "t1-cell-label",
                    html: labelHtml,
                    iconSize: [32, 26],
                    iconAnchor: [16, 13],
                  });
                  L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                    gridLayerGroupRef.current!
                  );
                } else if (gridTypeRef.current === "full-grid") {
                  const poly = L.polygon(latlngs, {
                    color: "#DEDEDE",
                    weight: 0.8,
                    fillColor: "url(#uaeDisabledHatchPattern)",
                    fillOpacity: 1,
                    className: "disabled-grid-cell",
                    interactive: false,
                  });
                  poly.addTo(gridLayerGroupRef.current!);
                }
              }
            });

            L.polygon(UAE_BORDER_COORDINATES, {
              color: "#2563EB",
              weight: 2.2,
              dashArray: "6 5",
              fillColor: "rgba(0, 0, 255, 0.05)",
              fillOpacity: 0.05,
              interactive: false,
            }).addTo(gridLayerGroupRef.current!);

            const uaeBounds: [[number, number], [number, number]] = [
              [TIER1_DEFAULT_BOUNDS.south, TIER1_DEFAULT_BOUNDS.west],
              [TIER1_DEFAULT_BOUNDS.north, TIER1_DEFAULT_BOUNDS.east],
            ];
            mapInstanceRef.current.fitBounds(uaeBounds, { padding: [24, 24], animate: false });
          } else {
            renderFallbackTier1(L, targetItem);
          }

          if (targetItem) {
            updatePinMarker(targetItem.latitude, targetItem.longitude);
          }
        } else if (tier === 2) {
          const parentCode =
            parentProps?.code ||
            parentProps?.hierarchyCode ||
            selectedCellIdRef.current ||
            targetItem?.tiers.tier1 ||
            "46";
          const parentId = parentProps?.id || parentProps?.gridId;

          let childFeatures: GeoJsonFeature[] = [];
          try {
            if (parentId) {
              const res = await gridService.getCellChildren(parentId, { PageSize: 1000 });
              if (res?.success && res.data?.features?.length) {
                childFeatures = res.data.features;
              }
            }
            if (!childFeatures.length) {
              const res = await gridService.getCells({
                tier: 2,
                code: parentCode,
                PageSize: 1000,
              });
              if (res?.success && res.data?.features?.length) {
                childFeatures = res.data.features;
              }
            }
          } catch {
            // fallback
          }

          if (childFeatures.length > 0) {
            const allBounds = L.latLngBounds([]);
            childFeatures.forEach((feat) => {
              const props = feat.properties || {};
              const code = props.code || props.hierarchyCode || "";
              const isSelected =
                code === selectedCellIdRef.current || code.endsWith(targetItem?.tiers.tier2 || "");

              if (feat.geometry?.coordinates) {
                const ring = feat.geometry.coordinates[0];
                const latlngs: [number, number][] = ring.map(
                  ([lon, lat]: [number, number]) => [lat, lon]
                );

                const poly = L.polygon(latlngs, {
                  color: isSelected ? "#0000FF" : "rgba(37, 99, 235, 0.4)",
                  weight: isSelected ? 2 : 1,
                  fillColor: isSelected ? "rgba(0, 0, 255, 0.6)" : "#FFFFFF",
                  fillOpacity: isSelected ? 0.75 : 0.85,
                  className: isSelected ? "selected-grid-cell" : "enabled-grid-cell",
                });

                poly.on("click", (e) => {
                  L.DomEvent.stopPropagation(e);
                  selectedCellIdRef.current = code;
                  setSelectedCellId(code);
                  setSelectedCellProps(props);
                  setActiveTier(3);
                  setBreadcrumbs((prev) => [
                    ...prev.slice(0, 2),
                    {
                      tier: 3,
                      label: `Sector ${code} (Tier 3)`,
                      code,
                      id: props.id || props.gridId,
                      cellProps: props,
                    },
                  ]);
                  renderGridRef.current?.(3, targetItem, props);
                });

                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const center = poly.getBounds().getCenter();
                const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                const labelIcon = L.divIcon({
                  className: "t2-cell-label",
                  html: `<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: ${textColor}; text-align: center;">${displayCode}</div>`,
                  iconSize: [26, 16],
                  iconAnchor: [13, 8],
                });
                L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                  gridLayerGroupRef.current!
                );
              }
            });

            if (allBounds.isValid()) {
              mapInstanceRef.current.fitBounds(allBounds, { padding: [30, 30] });
            }
          } else {
            renderFallbackTier2(L, parentCode, targetItem);
          }

          if (targetItem) {
            updatePinMarker(targetItem.latitude, targetItem.longitude);
          }
        } else if (tier === 3) {
          const parentCode =
            parentProps?.code ||
            parentProps?.hierarchyCode ||
            selectedCellIdRef.current ||
            "46.32";
          const parentId = parentProps?.id || parentProps?.gridId;

          let childFeatures: GeoJsonFeature[] = [];
          try {
            if (parentId) {
              const res = await gridService.getCellChildren(parentId, { PageSize: 1000 });
              if (res?.success && res.data?.features?.length) {
                childFeatures = res.data.features;
              }
            }
            if (!childFeatures.length) {
              const res = await gridService.getCells({
                tier: 3,
                code: parentCode,
                PageSize: 1000,
              });
              if (res?.success && res.data?.features?.length) {
                childFeatures = res.data.features;
              }
            }
          } catch {
            // fallback
          }

          if (childFeatures.length > 0) {
            const allBounds = L.latLngBounds([]);
            childFeatures.forEach((feat) => {
              const props = feat.properties || {};
              const code = props.code || props.hierarchyCode || "";
              const isSelected =
                code === selectedCellIdRef.current || code.endsWith(targetItem?.tiers.tier3 || "");

              if (feat.geometry?.coordinates) {
                const ring = feat.geometry.coordinates[0];
                const latlngs: [number, number][] = ring.map(
                  ([lon, lat]: [number, number]) => [lat, lon]
                );

                const poly = L.polygon(latlngs, {
                  color: isSelected ? "#0000FF" : "rgba(37, 99, 235, 0.45)",
                  weight: isSelected ? 2 : 1,
                  fillColor: isSelected ? "rgba(0, 0, 255, 0.65)" : "#FFFFFF",
                  fillOpacity: isSelected ? 0.8 : 0.85,
                });

                poly.on("click", (e) => {
                  L.DomEvent.stopPropagation(e);
                  selectedCellIdRef.current = code;
                  setSelectedCellId(code);
                  setSelectedCellProps(props);
                  setActiveTier(4);
                  setBreadcrumbs((prev) => [
                    ...prev.slice(0, 3),
                    {
                      tier: 4,
                      label: `Block ${code} (Tier 4)`,
                      code,
                      id: props.id || props.gridId,
                      cellProps: props,
                    },
                  ]);
                  renderGridRef.current?.(4, targetItem, props);
                });

                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const center = poly.getBounds().getCenter();
                const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                const labelIcon = L.divIcon({
                  className: "t3-cell-label",
                  html: `<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: ${textColor}; text-align: center;">${displayCode}</div>`,
                  iconSize: [24, 15],
                  iconAnchor: [12, 7],
                });
                L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                  gridLayerGroupRef.current!
                );
              }
            });

            if (allBounds.isValid()) {
              mapInstanceRef.current.fitBounds(allBounds, { padding: [30, 30] });
            }
          } else {
            renderFallbackTier3(L, parentCode, targetItem);
          }

          if (targetItem) {
            updatePinMarker(targetItem.latitude, targetItem.longitude);
          }
        } else if (tier === 4) {
          const parentCode =
            parentProps?.code ||
            parentProps?.hierarchyCode ||
            selectedCellIdRef.current ||
            "46.32.82";
          const parentId = parentProps?.id || parentProps?.gridId;

          let childFeatures: GeoJsonFeature[] = [];
          try {
            if (parentId) {
              const res = await gridService.getCellChildren(parentId, { PageSize: 1000 });
              if (res?.success && res.data?.features?.length) {
                childFeatures = res.data.features;
              }
            }
            if (!childFeatures.length) {
              const res = await gridService.getCells({
                tier: 4,
                code: parentCode,
                PageSize: 1000,
              });
              if (res?.success && res.data?.features?.length) {
                childFeatures = res.data.features;
              }
            }
          } catch {
            // fallback
          }

          if (childFeatures.length > 0) {
            const allBounds = L.latLngBounds([]);
            const targetPlotCode =
              targetItem?.tiers.tier4 ||
              (selectedCellIdRef.current.includes(".")
                ? selectedCellIdRef.current.split(".").pop()
                : "78");

            childFeatures.forEach((feat) => {
              const props = feat.properties || {};
              const code = props.code || props.hierarchyCode || "";
              const isTargetPlot =
                code === selectedCellIdRef.current || code.endsWith(targetPlotCode || "");
              const isNeighbor = selectedNeighborCodes.includes(props.id || code);

              if (feat.geometry?.coordinates) {
                const ring = feat.geometry.coordinates[0];
                const latlngs: [number, number][] = ring.map(
                  ([lon, lat]: [number, number]) => [lat, lon]
                );

                const fillColor = isTargetPlot
                  ? "#0000FF"
                  : isNeighbor
                    ? "rgba(56, 189, 248, 0.25)"
                    : "#FFFFFF";
                const fillOpacity = isTargetPlot ? 0.8 : isNeighbor ? 0.35 : 0.15;
                const strokeColor = isTargetPlot ? "#0000FF" : "rgba(148, 163, 184, 0.5)";
                const strokeWidth = isTargetPlot ? 2.5 : 0.8;

                const poly = L.polygon(latlngs, {
                  color: strokeColor,
                  weight: strokeWidth,
                  fillColor,
                  fillOpacity,
                });

                poly.on("click", async (e) => {
                  L.DomEvent.stopPropagation(e);
                  selectedCellIdRef.current = code;
                  setSelectedCellId(code);
                  setSelectedCellProps(props);

                  // Fetch adjacent neighbors if ID available
                  if (props.id) {
                    try {
                      const nRes = await gridService.getCellNeighbors(props.id);
                      if (nRes?.success && nRes.data?.length) {
                        setSelectedNeighborCodes(nRes.data.map((n) => n.cellId || n.hierarchyCode));
                      }
                    } catch {
                      // no-op
                    }
                  }

                  const bounds = poly.getBounds();
                  const center = bounds.getCenter();
                  updatePinMarker(center.lat, center.lng);
                });

                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const center = poly.getBounds().getCenter();
                const textColor = isTargetPlot ? "#FFFFFF" : "#1E293B";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                const labelIcon = L.divIcon({
                  className: "t4-cell-label",
                  html: `<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: ${textColor}; text-align: center;">${displayCode}</div>`,
                  iconSize: [22, 14],
                  iconAnchor: [11, 7],
                });
                L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                  gridLayerGroupRef.current!
                );
              }
            });

            renderPlotPOIs();
            if (allBounds.isValid()) {
              mapInstanceRef.current.fitBounds(allBounds, { padding: [25, 25] });
            }
          } else {
            renderFallbackTier4(L, targetItem);
          }
        }
      } finally {
        setIsGridLoading(false);
      }
    },
    [
      selectedResult,
      selectedCellProps,
      selectedNeighborCodes,
      ensureSvgDefs,
      renderFallbackTier1,
      renderFallbackTier2,
      renderFallbackTier3,
      renderFallbackTier4,
      renderPlotPOIs,
      updatePinMarker,
    ]
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

      // Map Click: Resolve clicked coordinates via POST /api/grid/resolve
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (lat >= 22 && lat <= 27 && lng >= 51 && lng <= 57) {
          setIsGridLoading(true);
          try {
            const res = await gridService.resolvePoint({ lat, lon: lng });
            if (res && res.success && res.data) {
              const item = buildSearchResultFromResolve(res.data, lat, lng);
              handleSelectItem(item);
            }
          } catch {
            // graceful
          } finally {
            setIsGridLoading(false);
          }
        }
      });

      // Render initial Tier 1 UAE Grid (matches Figma Default Page)
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

  // Handle typing in search input with Places Autocomplete and Live Postcodes
  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    setIsSuggestionsOpen(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!val || val.trim().length < 2) {
      setPlacePredictions([]);
      setLivePostcodeResults([]);
      setIsSearchingPlaces(false);
      return;
    }

    // Check if input looks like coordinates (e.g. "24.455, 54.395")
    const coordMatch = val.match(/^\s*([0-9.]+)\s*,\s*([0-9.]+)\s*$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      if (!isNaN(lat) && !isNaN(lon) && lat >= 20 && lat <= 28 && lon >= 50 && lon <= 58) {
        setLivePostcodeResults([
          {
            id: `coord-${lat}-${lon}`,
            name: `Coordinates: ${lat.toFixed(5)}, ${lon.toFixed(5)}`,
            type: "location",
            status: "Verified",
            addressLine: `Resolve via PostcodeGrid Backend`,
            postCode: "RESOLVE",
            tiers: { tier1: "46", tier2: "32", tier3: "82", tier4: "78" },
            latitude: lat,
            longitude: lon,
            makaniNumber: "-",
            onwaniAddress: "-",
            coordinates: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
            buildingName: "Coordinate Lookup",
            addressType: "Coordinate",
            addressIdentifier: "COORD",
            floors: 1,
            units: 1,
            street: "UAE",
            areaLocality: "UAE",
            emirateAdminArea: "UAE",
            countryCode: "AE",
            countryName: "United Arab Emirates",
            lastUpdate: "Coordinate",
            gridLineage: {
              tier1: { code: "46", label: "Tier 1", desc: "UAE" },
              tier2: { code: "46-32", label: "Tier 2", desc: "Sector" },
              tier3: { code: "46-32-82", label: "Tier 3", desc: "Block" },
              tier4: { code: "4632-8278", label: "Tier 4", desc: "Plot" },
            },
          },
        ]);
        return;
      }
    }

    setIsSearchingPlaces(true);
    searchDebounceRef.current = setTimeout(async () => {
      // 1. Live postcode prefix search
      try {
        const pcRes = await postcodeService.searchPostcodes({ search: val.trim(), PageSize: 6 });
        if (pcRes?.success && pcRes.data?.length) {
          const pcItems: SearchResultItem[] = pcRes.data.map((p) => ({
            id: p.postcode,
            name: p.postcodeDisplay || p.postcode,
            type: "location",
            status: "Verified",
            addressLine: `${p.localityNameEn || "UAE"} (Grid: ${p.gridId})`,
            postCode: p.postcodeDisplay || p.postcode,
            tiers: {
              tier1: p.postcode.slice(0, 2),
              tier2: p.postcode.slice(2, 4),
              tier3: p.postcode.slice(4, 6),
              tier4: p.postcode.slice(6, 8),
            },
            latitude: p.centroidLatitude,
            longitude: p.centroidLongitude,
            makaniNumber: "-",
            onwaniAddress: "-",
            coordinates: `${p.centroidLatitude.toFixed(5)}, ${p.centroidLongitude.toFixed(5)}`,
            buildingName: `Postcode ${p.postcodeDisplay || p.postcode}`,
            addressType: "Postcode",
            addressIdentifier: p.gridId,
            floors: 1,
            units: 1,
            street: p.localityNameEn || "Street",
            areaLocality: p.localityNameEn || "Area",
            emirateAdminArea: p.emirateCode || "UAE",
            countryCode: "AE",
            countryName: "United Arab Emirates",
            lastUpdate: "Backend API",
            gridLineage: {
              tier1: { code: p.postcode.slice(0, 2), label: "Tier 1", desc: "Emirate" },
              tier2: { code: `${p.postcode.slice(0, 2)}-${p.postcode.slice(2, 4)}`, label: "Tier 2", desc: "Sector" },
              tier3: { code: `${p.postcode.slice(0, 2)}-${p.postcode.slice(2, 4)}-${p.postcode.slice(4, 6)}`, label: "Tier 3", desc: "Block" },
              tier4: { code: p.postcodeDisplay || p.postcode, label: "Tier 4", desc: "Plot" },
            },
          }));
          setLivePostcodeResults(pcItems);
        } else {
          setLivePostcodeResults([]);
        }
      } catch {
        setLivePostcodeResults([]);
      }

      // 2. Google Places search
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

  // Handle selecting a Google Places live prediction with Backend Point Resolution
  const handleSelectPrediction = async (pred: PlacePrediction) => {
    setSearchQuery(pred.mainText);
    setIsSuggestionsOpen(false);
    setIsResultsPanelOpen(true);
    setIsResultsPanelCollapsed(false);
    setRightPanelOpen(true);

    try {
      const details = await geocodePlaceId(pred.placeId);
      if (details) {
        // Resolve coordinates against backend PostcodeGrid API
        let customItem: SearchResultItem | null = null;
        try {
          const res = await gridService.resolvePoint({ lat: details.lat, lon: details.lng });
          if (res?.success && res.data) {
            customItem = buildSearchResultFromResolve(res.data, details.lat, details.lng);
            customItem.name = pred.mainText;
            customItem.buildingName = pred.mainText;
            customItem.addressLine = details.formattedAddress || pred.description;
          }
        } catch {
          // fallback
        }

        if (!customItem) {
          customItem = {
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
        }
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
  const handleSearchSubmit = async () => {
    // If coordinate search
    const coordMatch = searchQuery.match(/^\s*([0-9.]+)\s*,\s*([0-9.]+)\s*$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      await handleResolveSeededPoint(lat, lon);
      return;
    }

    if (livePostcodeResults.length > 0) {
      handleSelectItem(livePostcodeResults[0]);
    } else if (filteredResults.length > 0) {
      handleSelectItem(filteredResults[0]);
    }
  };

  // Handle resetting search
  const handleClearSearch = () => {
    setSearchQuery("");
    setPlacePredictions([]);
    setLivePostcodeResults([]);
    setIsSuggestionsOpen(false);
    setIsResultsPanelOpen(false);
    setSelectedResult(null);
    clearPinMarker();
    setActiveTier(1);
    setBreadcrumbs([{ tier: 1, label: "UAE (Tier 1)", code: "UAE" }]);
    renderGrid(1, null, null);
  };

  // Switch Tier Level via bottom bar
  const handleSwitchTier = (tier: TierLevel) => {
    setActiveTier(tier);
    if (tier === 1) {
      setBreadcrumbs([{ tier: 1, label: "UAE (Tier 1)", code: "UAE" }]);
      setSelectedCellProps(null);
      renderGrid(1, null, null);
    } else {
      renderGrid(tier, selectedResult, selectedCellProps);
    }
  };

  // Breadcrumb Click Navigation
  const handleBreadcrumbClick = (step: BreadcrumbStep, index: number) => {
    setActiveTier(step.tier);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    if (step.tier === 1) {
      setSelectedCellProps(null);
      setSelectedCellId("46");
      selectedCellIdRef.current = "46";
      renderGrid(1, null, null);
    } else {
      setSelectedCellProps(step.cellProps || null);
      if (step.code) {
        selectedCellIdRef.current = step.code;
        setSelectedCellId(step.code);
      }
      renderGrid(step.tier, selectedResult, step.cellProps || null);
    }
  };

  // Seeded Points One-Click Test Handler (Section 9)
  const handleResolveSeededPoint = async (lat: number, lon: number) => {
    setIsGridLoading(true);
    setServiceNotice(null);
    try {
      const res = await gridService.resolvePoint({ lat, lon });
      if (res?.success && res.data) {
        const item = buildSearchResultFromResolve(res.data, lat, lon);
        handleSelectItem(item);
        setSearchQuery(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        setBreadcrumbs([
          { tier: 1, label: "UAE (Tier 1)", code: "UAE" },
          { tier: 2, label: `Cell ${item.tiers.tier1} (Tier 2)`, code: item.tiers.tier1 },
          {
            tier: 3,
            label: `Sector ${item.tiers.tier1}.${item.tiers.tier2} (Tier 3)`,
            code: `${item.tiers.tier1}.${item.tiers.tier2}`,
          },
          { tier: 4, label: `Plot ${item.tiers.tier4} (Tier 4)`, code: item.tiers.tier4 },
        ]);
      }
    } catch (err: any) {
      setServiceNotice(
        "Service waking up on Render: " + (err.message || "Failed to resolve point.")
      );
    } finally {
      setIsGridLoading(false);
    }
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
      {/* Global SVG defs for hatch pattern fallback */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
        <defs>
          <pattern id="uaeDisabledHatchPattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="#FFFFFF" fillOpacity="0.95" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="#CBD5E1" strokeWidth="1.2" strokeOpacity="0.95" />
          </pattern>
        </defs>
      </svg>

      {/* Main Map View Area */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          position: "relative",
          minWidth: 0,
        }}
      >
        {/* Loading Progress Bar for Grid & API Requests */}
        {isGridLoading && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              height: 3,
              bgcolor: "transparent",
              "& .MuiLinearProgress-bar": { bgcolor: "#0000FF" },
            }}
          />
        )}

        {/* Top Center: Live Hierarchy Breadcrumbs (Section 4) */}
        <Box
          sx={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 35,
            pointerEvents: "auto",
            bgcolor: "#FFFFFF",
            borderRadius: "20px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            border: "1px solid #E2E8F0",
            px: 2,
            py: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: "#94A3B8" }} />}>
            {breadcrumbs.map((step, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return isLast ? (
                <Typography
                  key={`${step.tier}-${step.code}`}
                  sx={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0000FF",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  }}
                >
                  {step.label}
                </Typography>
              ) : (
                <Link
                  key={`${step.tier}-${step.code}`}
                  underline="hover"
                  onClick={() => handleBreadcrumbClick(step, idx)}
                  sx={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  }}
                >
                  {step.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

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

                {/* Filter Category Tabs (Pills) matching Figma Search Filter */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    bgcolor: "#FFFFFF",
                    p: "4px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #E2E8F0",
                    height: 44,
                    boxSizing: "border-box",
                  }}
                >
                  {filterTabs.map((tab, idx) => {
                    const isSelected = activeFilter === tab.id;
                    return (
                      <React.Fragment key={tab.id}>
                        {idx > 0 && (
                          <Box sx={{ width: "1px", height: "20px", bgcolor: "#E2E8F0", flexShrink: 0 }} />
                        )}
                        <Box
                          onClick={() => setActiveFilter(tab.id)}
                          sx={{
                            flex: 1,
                            height: 36,
                            borderRadius: "6px",
                            bgcolor: isSelected ? "#F0F6FC" : "transparent",
                            color: isSelected ? "#0000FF" : "#64748B",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.6,
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: "12px",
                            fontWeight: isSelected ? 700 : 500,
                            fontFamily: "var(--font-cairo), Cairo, sans-serif",
                            transition: "all 0.15s ease",
                            "&:hover": {
                              bgcolor: isSelected ? "#F0F6FC" : "#F8FAFC",
                            },
                          }}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>

                {/* Seeded Data Quick Test Chips (Section 9) */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    mt: 0.8,
                    pointerEvents: "auto",
                  }}
                >
                  <Chip
                    size="small"
                    label="Seeded Abu Dhabi (B3)"
                    onClick={() => handleResolveSeededPoint(24.455053977027212, 54.39575259832567)}
                    sx={{
                      fontFamily: "var(--font-cairo)",
                      fontSize: "11px",
                      fontWeight: 600,
                      bgcolor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      "&:hover": { bgcolor: "#EFF6FF", borderColor: "#0000FF", color: "#0000FF" },
                    }}
                  />
                  <Chip
                    size="small"
                    label="Seeded Dubai (B6)"
                    onClick={() => handleResolveSeededPoint(25.266175816333703, 55.31071873668247)}
                    sx={{
                      fontFamily: "var(--font-cairo)",
                      fontSize: "11px",
                      fontWeight: 600,
                      bgcolor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      "&:hover": { bgcolor: "#EFF6FF", borderColor: "#0000FF", color: "#0000FF" },
                    }}
                  />
                </Box>

                {/* Auto-suggest Dropdown Panel (Searching Page.png) */}
                {isSuggestionsOpen && (
                  <Box
                    onWheel={(e) => e.stopPropagation()}
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
                      maxHeight: "min(460px, calc(100vh - 200px))",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    {/* Suggestions Header */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1, borderBottom: "1px solid #F1F5F9" }}>
                      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-cairo)" }}>
                        Search suggested ({livePostcodeResults.length + placePredictions.length + filteredResults.length})
                      </Typography>
                      <IconButton size="small" onClick={() => setIsSuggestionsOpen(false)} sx={{ p: 0.2, color: "#64748B" }}>
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    {/* Live PostcodeGrid Backend Results */}
                    {livePostcodeResults.length > 0 && (
                      <Box sx={{ py: 0.5, borderBottom: "1px solid #F1F5F9" }}>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#0000FF", mb: 0.5, fontFamily: "var(--font-cairo)" }}>
                          PostcodeGrid Backend Matches:
                        </Typography>
                        {livePostcodeResults.map((item) => (
                          <Box
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            sx={{
                              p: "6px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              mb: 0.4,
                              bgcolor: "rgba(0, 0, 255, 0.05)",
                              border: "1px solid rgba(0, 0, 255, 0.15)",
                              "&:hover": { bgcolor: "rgba(0, 0, 255, 0.1)" },
                            }}
                          >
                            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#0000FF", fontFamily: "var(--font-cairo)" }}>
                              {item.name}
                            </Typography>
                            <Typography sx={{ fontSize: "10.5px", color: "#475569", fontFamily: "var(--font-cairo)" }}>
                              {item.addressLine}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

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
                    <Box
                      onWheel={(e) => e.stopPropagation()}
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                        py: 0.5,
                        pr: "4px",
                        display: "flex",
                        flexDirection: "column",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#CBD5E1 #F8FAFC",
                        "&::-webkit-scrollbar": {
                          width: "5px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "#F8FAFC",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#CBD5E1",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "#94A3B8",
                        },
                      }}
                    >
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
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, pt: 1, borderTop: "1px solid #F1F5F9", flexShrink: 0 }}>
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

            {/* Collapsible Search Results Card (Figma Search Suggestions) */}
            {isResultsPanelOpen && (
              <Box
                onWheel={(e) => e.stopPropagation()}
                sx={{
                  width: "100%",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08), 0px 0px 10px rgba(206, 213, 216, 0.33)",
                  borderRadius: "8px",
                  p: isResultsPanelCollapsed ? "12px 16px" : "14px 16px 12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  gap: "6px",
                  boxSizing: "border-box",
                  maxHeight: isResultsPanelCollapsed ? "auto" : "calc(100vh - 210px)",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                }}
              >
                {/* Title */}
                <Box
                  onClick={() => setIsResultsPanelCollapsed(!isResultsPanelCollapsed)}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    height: "30px",
                    cursor: "pointer",
                    userSelect: "none",
                    flexShrink: 0,
                    pb: isResultsPanelCollapsed ? 0 : "4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Cairo', sans-serif",
                      fontStyle: "normal",
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "30px",
                      color: "#000000",
                    }}
                  >
                    Search Results ({filteredResults.length > 0 ? 24 : 0})
                  </Typography>

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: isResultsPanelCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path d="M18 15L12 9L6 15" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>

                {/* Frame 1000008127 - Cards and Pagination */}
                {!isResultsPanelCollapsed && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      width: "100%",
                      flex: 1,
                      minHeight: 0,
                      overflow: "hidden",
                    }}
                  >
                    {/* Frame 1000008118 - Address Cards List */}
                    <Box
                      onWheel={(e) => e.stopPropagation()}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        width: "100%",
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                        pr: "4px",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#CBD5E1 #F8FAFC",
                        "&::-webkit-scrollbar": {
                          width: "5px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "#F8FAFC",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#CBD5E1",
                          borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "#94A3B8",
                        },
                      }}
                    >
                      {filteredResults.map((item, index) => {
                        const isSelected = selectedResult?.id === item.id;
                        const isVerified = item.status === "Verified";
                        const isLast = index === filteredResults.length - 1;

                        const iconColor = isVerified ? "#0000FF" : "#EB861F";

                        return (
                          <Box
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            sx={{
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              p: "8px",
                              width: "100%",
                              cursor: "pointer",
                              bgcolor: isSelected ? "#F0F6FC" : "#FFFFFF",
                              borderBottom: isSelected
                                ? "1px solid rgba(0, 0, 255, 0.2)"
                                : isLast
                                  ? "none"
                                  : "1px solid #DEDEDE",
                              borderRadius: isSelected ? "4px" : "0px",
                              transition: "background-color 0.15s ease",
                              "&:hover": {
                                bgcolor: isSelected ? "#F0F6FC" : "#F8FAFC",
                              },
                            }}
                          >
                            {/* Title & icon */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "8px",
                                width: "100%",
                                height: "24px",
                              }}
                            >
                              {/* Type circular icon */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  bgcolor: isVerified ? "#F0F6FC" : "rgba(235, 134, 31, 0.1)",
                                  flexShrink: 0,
                                }}
                              >
                                {index === 2 || item.type === "restaurant" ? (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 20v-9.5z" />
                                    <path d="M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
                                  </svg>
                                ) : index === 3 || item.type === "location" ? (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 21s7-6.5 7-11.5A7 7 0 005 9.5C5 14.5 12 21 12 21z" />
                                    <circle cx="12" cy="9.5" r="2.5" />
                                  </svg>
                                ) : (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21h18" />
                                    <path d="M5 21V7l8-4v18" />
                                    <path d="M13 10l6 3v8" />
                                    <path d="M9 9h.01M9 13h.01M9 17h.01M16 16h.01M16 19h.01" />
                                  </svg>
                                )}
                              </Box>

                              {/* Title / Name */}
                              <Typography
                                sx={{
                                  fontFamily: "'Cairo', sans-serif",
                                  fontStyle: "normal",
                                  fontWeight: 700,
                                  fontSize: "14px",
                                  lineHeight: "26px",
                                  color: "#000000",
                                  flex: 1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.name}
                              </Typography>

                              {/* Badge */}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  px: "8px",
                                  height: "24px",
                                  borderRadius: "4px",
                                  bgcolor: isVerified ? "#F3FAF4" : "rgba(235, 134, 31, 0.1)",
                                  flexShrink: 0,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: "'Cairo', sans-serif",
                                    fontStyle: "normal",
                                    fontWeight: 400,
                                    fontSize: "14px",
                                    lineHeight: "26px",
                                    color: isVerified ? "#3F8E50" : "#EB861F",
                                  }}
                                >
                                  {item.status}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Address details */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                pl: "32px",
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "'Cairo', sans-serif",
                                  fontStyle: "normal",
                                  fontWeight: 400,
                                  fontSize: "12px",
                                  lineHeight: "22px",
                                  color: "#5A5A5A",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {item.addressLine}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: "'Cairo', sans-serif",
                                  fontStyle: "normal",
                                  fontWeight: 400,
                                  fontSize: "12px",
                                  lineHeight: "22px",
                                  color: "#5A5A5A",
                                }}
                              >
                                Postcode:{" "}
                                <span
                                  style={{
                                    color: "#0000FF",
                                    fontWeight: 700,
                                    fontFamily: "'Cairo', sans-serif",
                                  }}
                                >
                                  {item.postCode}
                                </span>
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Pagination */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pt: "12px",
                        pb: "2px",
                        width: "100%",
                        height: "44px",
                        boxSizing: "border-box",
                        borderTop: "1px solid #F1F5F9",
                        flexShrink: 0,
                      }}
                    >
                      {/* Previous Frame */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "52px",
                          height: "36px",
                          cursor: "pointer",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Box>

                      {/* Number Frame */}
                      <Typography
                        sx={{
                          fontFamily: "'Cairo', sans-serif",
                          fontStyle: "normal",
                          fontWeight: 400,
                          fontSize: "16px",
                          lineHeight: "30px",
                          color: "#000000",
                        }}
                      >
                        1 of 14
                      </Typography>

                      {/* Next Frame */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "52px",
                          height: "36px",
                          cursor: "pointer",
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M9 6L15 12L9 18" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Top Right: Grid Type Switch & Country Dropdown */}
          <Box sx={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 1.2 }}>
            {/* Grid Type Switch: Full Grid vs UnMasked Cells matching Figma */}
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid #DEDEDE",
                p: "3px",
                display: "flex",
                alignItems: "center",
                height: 38,
                boxSizing: "border-box",
                userSelect: "none",
              }}
            >
              {/* Full Grid Option */}
              <Box
                onClick={() => {
                  gridTypeRef.current = "full-grid";
                  setGridType("full-grid");
                  renderGrid(activeTier, selectedResult);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                  px: 1.2,
                  height: "100%",
                  borderRadius: "6px",
                  cursor: "pointer",
                  bgcolor: gridType === "full-grid" ? "#F0F6FC" : "transparent",
                  color: gridType === "full-grid" ? "#0000FF" : "#000000",
                  fontWeight: gridType === "full-grid" ? 700 : 400,
                  fontSize: "12px",
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: gridType === "full-grid" ? "#F0F6FC" : "#F8FAFC",
                  },
                }}
              >
                {/* 4-squares element-3 icon */}
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="1.5" y="9.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                <span>Full Grid</span>
              </Box>

              {/* UnMasked Cells Option */}
              <Box
                onClick={() => {
                  gridTypeRef.current = "unmasked";
                  setGridType("unmasked");
                  renderGrid(activeTier, selectedResult);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                  px: 1.2,
                  height: "100%",
                  borderRadius: "6px",
                  cursor: "pointer",
                  bgcolor: gridType === "unmasked" ? "#F0F6FC" : "transparent",
                  color: gridType === "unmasked" ? "#0000FF" : "#000000",
                  fontWeight: gridType === "unmasked" ? 700 : 400,
                  fontSize: "12px",
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: gridType === "unmasked" ? "#F0F6FC" : "#F8FAFC",
                  },
                }}
              >
                {/* UAE Border Map Outline Icon */}
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <path d="M4 14L2 8L7 3L13 2L17 6L18 12L13 17L8 16L4 14Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                <span>UnMasked Cells</span>
              </Box>
            </Box>

            {/* Country Dropdown (UAE) */}
            <Box
              onClick={(e) => setUaeMenuAnchor(e.currentTarget)}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                border: "1px solid #DEDEDE",
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
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 600, color: "#0F172A" }}>
                {activeCountry}
              </Typography>
              <svg width="10" height="6" viewBox="0 0 12 7" fill="none">
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

        {/* Bottom Left Floating: Grid Level (T1, T2, T3, T4) matching Figma */}
        <Box
          sx={{
            position: "absolute",
            bottom: "24px",
            left: isResultsPanelOpen && !isResultsPanelCollapsed ? "366px" : "24px",
            transition: "left 0.25s ease",
            zIndex: 30,
            bgcolor: "#FFFFFF",
            borderRadius: "8px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
            border: "1px solid #E2E8F0",
            px: 1.5,
            height: 48,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            userSelect: "none",
          }}
        >
          <Typography sx={{ fontFamily: "var(--font-cairo), Cairo, sans-serif", fontSize: "12px", fontWeight: 500, color: "#5A5A5A" }}>
            Grid Level:
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            {[
              {
                tier: 1,
                label: "T1",
                icon: (
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                    <path d="M4 14L2 8L7 3L13 2L17 6L18 12L13 17L8 16L4 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                defaultBg: "#FFFFFF",
                defaultColor: "#0000FF",
              },
              {
                tier: 2,
                label: "T2",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                  </svg>
                ),
                defaultBg: "#F1F5F9",
                defaultColor: "#0F172A",
              },
              {
                tier: 3,
                label: "T3",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                  </svg>
                ),
                defaultBg: "#ECFDF5",
                defaultColor: "#065F46",
              },
              {
                tier: 4,
                label: "T4",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                  </svg>
                ),
                defaultBg: "#EFF6FF",
                defaultColor: "#1E40AF",
              },
            ].map(({ tier, label, icon, defaultBg, defaultColor }) => {
              const isSelected = activeTier === tier;
              return (
                <Box
                  key={tier}
                  onClick={() => handleSwitchTier(tier as TierLevel)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    px: 1.2,
                    py: 0.5,
                    borderRadius: "4px",
                    cursor: "pointer",
                    bgcolor: isSelected ? "#FFFFFF" : defaultBg,
                    border: isSelected ? "1.5px solid #0000FF" : "1px solid transparent",
                    color: isSelected ? "#0000FF" : defaultColor,
                    fontSize: "12px",
                    fontWeight: 700,
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      opacity: 0.9,
                    },
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </Box>
              );
            })}
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

      {/* Right Side Panel (Grid Statistics or Postcode Details) matching Figma 330px width */}
      <Box
        sx={{
          width: rightPanelOpen ? "330px" : "0px",
          minWidth: rightPanelOpen ? "330px" : "0px",
          p: rightPanelOpen ? "16px 16px 16px 0" : 0,
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
          <GridStatisticsPanel
            code={selectedCellId || undefined}
            emirate={selectedCellProps?.emirate || undefined}
            onClose={() => setRightPanelOpen(false)}
          />
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

      {/* Backend Service Transient Alert (Render 502 / Wakeup) */}
      <Snackbar
        open={Boolean(serviceNotice)}
        autoHideDuration={8000}
        onClose={() => setServiceNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="info"
          onClose={() => setServiceNotice(null)}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => renderGrid(activeTier, selectedResult, selectedCellProps)}
            >
              Retry
            </Button>
          }
          sx={{
            fontFamily: "var(--font-cairo)",
            fontSize: "12.5px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          {serviceNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

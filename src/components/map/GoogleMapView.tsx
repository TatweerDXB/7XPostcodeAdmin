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
import Backdrop from "@mui/material/Backdrop";
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
import type { Map as LeafletMap, LayerGroup, Marker, TileLayer } from "leaflet";
import {
  PORTAL_SEARCH_ITEMS,
  SearchResultItem,
  UAE_BORDER_COORDINATES,
} from "@/data/portalSearchData";
import GridStatisticsPanel from "@/components/grid/GridStatisticsPanel";
import PostcodeDetailsPanel from "@/components/postcode/PostcodeDetailsPanel";
import { sanitizeHtml, sanitizeErrorMessage } from "@/utils/security";
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
  getMaskState,
} from "@/services/gridService";
import { postcodeService } from "@/services/postcodeService";

// Category filter tabs matching Figma vertical icon + label pill tabs
const filterTabs = [
  {
    id: "address",
    label: "Address",
    icon: (
      <svg width="15" height="16" viewBox="0 0 13 15" fill="none">
        <path
          d="M6.5 7.453C7.649 7.453 8.58 6.522 8.58 5.373C8.58 4.224 7.649 3.293 6.5 3.293C5.351 3.293 4.42 4.224 4.42 5.373C4.42 6.522 5.351 7.453 6.5 7.453Z"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M0.913 4.161C2.227 -1.613 10.78 -1.606 12.087 4.167C12.853 7.554 10.747 10.421 8.9 12.194C7.56 13.487 5.44 13.487 4.093 12.194C2.253 10.421 0.147 7.547 0.913 4.161Z"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
    ),
  },
  {
    id: "postcode",
    label: "Postcode",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2.5 6.5C2.5 4.843 3.843 3.5 5.5 3.5H11C12.657 3.5 14 4.843 14 6.5V10.5H2.5V6.5Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 3.5C7.157 3.5 8.5 4.843 8.5 6.5V10.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <path d="M8.5 10.5V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M10.5 6H12V3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "makani",
    label: "Makani",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 14.5H2C1.45 14.5 1 14.05 1 13.5V3.2C1 1.75 2.15 1.35 3.55 2.02L6.95 3.67C7.55 3.96 8 4.72 8 5.38V14.5Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 9.8V12.8C14.5 13.95 13.95 14.5 12.8 14.5H8V6.5L11.6 7.6C12.5 7.8 13.3 8.25 13.35 9.5V9.8Z"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3.8 6.5H5.5M3.8 9.2H5.5M3.8 11.8H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "onwani",
    label: "onwani",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 14.5H15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.2 14.5V6.5L8 2L13.8 6.5V14.5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M6.2 14.5V9.5H9.8V14.5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "coordinates",
    label: "Coordinates",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 1V3M8 13V15M1 8H3M13 8H15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
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

// Extent of the national 10x10 grid matching Figma Screenshot 2 (Frame 9757:897506):
// Row 0 is at the NORTH (Ras Al Khaimah / Musandam: lat 25.88 - 26.40),
// Row 2 is Dubai Downtown / Burj Khalifa (lat 24.84 - 25.36, cell 27),
// Row 6 is the southern border (lat 22.76 - 23.28),
// Columns run from WEST (50.80) to EAST (57.00).
const GRID_ORIGIN_BOUNDS: TierBounds = {
  north: 26.40,
  south: 21.20,
  west: 50.80,
  east: 57.00,
};

// Exact 27 unmasked UAE land cells matching Figma Screenshot 2 (Frame 9757:897506).
// In UnMasked Cells mode, only these cells are rendered and strictly clipped to the UAE border polygon.
export const UAE_UNMASKED_TIER1_CODES = new Set<string>([
  "06", "07",
  "17", "18",
  "26", "27", "28",
  "35", "36", "37", "38",
  "43", "44", "45", "46", "47",
  "51", "52", "53", "54", "55", "56",
  "62", "63", "64", "65", "66",
]);

// Optimized visual label centroids for edge cells ensuring cell numbers sit inside the land boundary
const CELL_LABEL_CENTERS: Record<string, [number, number]> = {
  "06": [25.96, 55.85],
  "07": [25.96, 56.12],
  "17": [25.62, 55.45],
  "18": [25.62, 56.10],
  "26": [25.10, 54.85],
  "27": [25.10, 55.45],
  "28": [25.10, 56.07],
  "35": [24.58, 54.21],
  "36": [24.58, 54.83],
  "37": [24.58, 55.45],
  "38": [24.58, 56.07],
  "43": [24.08, 53.15],
  "44": [24.08, 53.72],
  "45": [24.08, 54.28],
  "46": [24.08, 54.84],
  "47": [24.08, 55.45],
  "51": [23.54, 51.75],
  "52": [23.54, 52.35],
  "53": [23.54, 52.97],
  "54": [23.54, 53.59],
  "55": [23.54, 54.21],
  "56": [23.54, 54.83],
  "62": [23.02, 52.35],
  "63": [23.02, 52.97],
  "64": [23.02, 53.59],
  "65": [23.02, 54.21],
  "66": [23.02, 54.83],
};

// Real cell bounds reported by the API, keyed by hierarchy code. These take
// precedence over linear subdivision approximations.
const cellBoundsRegistry = new Map<string, TierBounds>();

function registerCellBounds(
  code: string,
  b: { getNorth(): number; getSouth(): number; getWest(): number; getEast(): number }
) {
  if (!code) return;
  cellBoundsRegistry.set(code, {
    north: b.getNorth(),
    south: b.getSouth(),
    west: b.getWest(),
    east: b.getEast(),
  });
}

function _getSubCellBounds(parent: TierBounds, cellId: string): TierBounds {
  const cleanId = cellId.replace(/[^0-9]/g, "");
  const r = parseInt(cleanId[0] || "0", 10);
  const c = parseInt(cleanId[1] || "0", 10);
  const latStep = (parent.north - parent.south) / 10;
  const lngStep = (parent.east - parent.west) / 10;
  const n = parent.north - r * latStep;
  const s = n - latStep;
  const w = parent.west + c * lngStep;
  const e = w + lngStep;
  return {
    north: n,
    south: s,
    west: w,
    east: e,
  };
}

function getHierarchyBounds(code: string): TierBounds {
  const parts = code.split(/[\.-]/).filter(Boolean);
  let b = GRID_ORIGIN_BOUNDS;
  let prefix = "";
  for (let i = 0; i < parts.length; i++) {
    prefix = prefix ? `${prefix}.${parts[i]}` : parts[i];
    b = cellBoundsRegistry.get(prefix) ?? _getSubCellBounds(b, parts[i]);
  }
  return b;
}

export interface BreadcrumbStep {
  tier: TierLevel;
  label: string;
  code: string;
  id?: string;
  cellProps?: GridCellProperties;
  bounds?: [[number, number], [number, number]];
}

function resolveFeatureCodes(
  props: GridCellProperties,
  parentCode?: string
): { fullCode: string; shortCode: string; parts: string[] } {
  const rawH = String(props.hierarchyCode || "").trim().replace(/-/g, ".");
  const rawC = String(props.code || "").trim().replace(/-/g, ".");
  let fullCode = rawH || rawC;
  if (parentCode && fullCode && !fullCode.includes(".") && !fullCode.startsWith(parentCode)) {
    fullCode = `${parentCode}.${fullCode}`;
  }
  const parts = fullCode.split(".").filter(Boolean);
  const shortCode = parts[parts.length - 1] || fullCode;
  return { fullCode, shortCode, parts };
}

function extractPolygonLatLngs(
  geometry: import("@/services/gridService").GeoJsonGeometry | string | undefined | null
): [number, number][] | [number, number][][] | null {
  if (!geometry) return null;
  let geomObj: import("@/services/gridService").GeoJsonGeometry;
  if (typeof geometry === "string") {
    try {
      geomObj = JSON.parse(geometry);
    } catch {
      return null;
    }
  } else {
    geomObj = geometry;
  }
  if (!geomObj || !Array.isArray(geomObj.coordinates) || geomObj.coordinates.length === 0) {
    return null;
  }
  if (geomObj.type === "MultiPolygon") {
    const multi = geomObj.coordinates as unknown as [number, number][][][];
    const rings = multi
      .map((poly) => (poly[0] ? poly[0].map(([lon, lat]) => [lat, lon] as [number, number]) : []))
      .filter((ring) => ring.length > 0);
    return rings.length > 0 ? rings : null;
  }
  const ring = geomObj.coordinates[0];
  if (!Array.isArray(ring) || ring.length === 0) return null;
  return ring.map(([lon, lat]: [number, number]) => [lat, lon]);
}

function buildBreadcrumbsFromParts(parts: string[]): BreadcrumbStep[] {
  const crumbs: BreadcrumbStep[] = [
    { tier: 1, label: "UAE (Tier 1)", code: "UAE" },
  ];
  if (parts.length >= 1) {
    const c1 = parts[0];
    crumbs.push({ tier: 2, label: `Cell ${c1} (Tier 2)`, code: c1 });
  }
  if (parts.length >= 2) {
    const c2 = `${parts[0]}.${parts[1]}`;
    crumbs.push({ tier: 3, label: `Sector ${c2} (Tier 3)`, code: c2 });
  }
  if (parts.length >= 3) {
    const c3 = `${parts[0]}.${parts[1]}.${parts[2]}`;
    const c4 = parts[3] ? `${c3}.${parts[3]}` : null;
    crumbs.push({
      tier: 4,
      label: c4 ? `Plot ${c4} (Tier 4)` : `Block ${c3} (Tier 4)`,
      code: c3,
    });
  }
  return crumbs;
}

export function parseLatLonInput(raw: string): { lat: number; lon: number } | null {
  const match = raw.trim().match(/^([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

export function buildSearchResultFromResolve(
  res: ResolvePointResponse,
  lat: number,
  lon: number
): SearchResultItem {
  const cell = res.cell || {};
  const hierarchyList = Array.isArray(res.hierarchy) ? res.hierarchy : [];
  const tier4Hierarchy = hierarchyList.find((h) => h.tier === 4);
  const rawCode =
    cell.hierarchyCode ||
    cell.code ||
    tier4Hierarchy?.hierarchyCode ||
    tier4Hierarchy?.code ||
    "";
  const parts = rawCode.split(/[.-]/).filter(Boolean);
  const t1 =
    parts[0] ||
    hierarchyList.find((h) => h.tier === 1)?.hierarchyCode ||
    "";
  const t2 =
    parts[1] ||
    hierarchyList.find((h) => h.tier === 2)?.hierarchyCode?.split(/[.-]/)[1] ||
    "";
  const t3 =
    parts[2] ||
    hierarchyList.find((h) => h.tier === 3)?.hierarchyCode?.split(/[.-]/)[2] ||
    "";
  const t4 =
    parts[3] ||
    hierarchyList.find((h) => h.tier === 4)?.hierarchyCode?.split(/[.-]/)[3] ||
    "";

  const postcode =
    res.postcodeDisplay ||
    res.postcode ||
    cell.postcodeDisplay ||
    cell.postcode ||
    (rawCode ? rawCode.replace(/\./g, "-") : "");

  const resolvedLat = res.normalized?.lat ?? cell.centroidLatitude ?? lat;
  const resolvedLon = res.normalized?.lon ?? cell.centroidLongitude ?? lon;
  const emirateLabel = cell.emirate || cell.emirateCode || "UAE";

  return {
    id: cell.gridId || cell.id || `resolve-${resolvedLat}-${resolvedLon}`,
    name: postcode ? `Postcode ${postcode}` : `Cell ${rawCode}`,
    type: "location",
    status: "Verified",
    addressLine: `Grid: ${rawCode || postcode} · (${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)})`,
    postCode: postcode,
    tiers: {
      tier1: t1,
      tier2: t2,
      tier3: t3,
      tier4: t4,
    },
    latitude: resolvedLat,
    longitude: resolvedLon,
    makaniNumber: "-",
    onwaniAddress: "-",
    coordinates: `${resolvedLat.toFixed(6)}, ${resolvedLon.toFixed(6)}`,
    buildingName: cell.nameEn || cell.name || `Cell ${rawCode || postcode}`,
    addressType: "Postcode Grid Cell",
    addressIdentifier: cell.gridId || rawCode,
    floors: 1,
    units: 1,
    street: cell.nameEn || (t2 ? `Sector ${t2}` : "Main Street"),
    areaLocality: emirateLabel,
    emirateAdminArea: emirateLabel,
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "Live API",
    gridLineage: {
      tier1: {
        code: hierarchyList.find((h) => h.tier === 1)?.hierarchyCode || t1,
        label: "Tier 1",
        desc: emirateLabel,
      },
      tier2: {
        code:
          hierarchyList.find((h) => h.tier === 2)?.hierarchyCode ||
          (t2 ? `${t1}.${t2}` : t1),
        label: "Tier 2",
        desc: `Sector ${t2}`,
      },
      tier3: {
        code:
          hierarchyList.find((h) => h.tier === 3)?.hierarchyCode ||
          (t3 ? `${t1}.${t2}.${t3}` : ""),
        label: "Tier 3",
        desc: `Block ${t3}`,
      },
      tier4: {
        code:
          hierarchyList.find((h) => h.tier === 4)?.hierarchyCode ||
          (t4 ? `${t1}.${t2}.${t3}.${t4}` : ""),
        label: "Tier 4",
        desc: `Plot ${t4}`,
      },
    },
  };
}

export type PortalGridMode = "full-grid" | "unmasked" | "hide-grids" | "all-tiers" | "default-search";

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

  const [selectedCellId, setSelectedCellId] = useState<string>("");
  const selectedCellIdRef = useRef<string>("");

  // Active hierarchy parts e.g. ["27"], ["27", "36"], ["27", "36", "04"], ["27", "36", "04", "12"]
  const [hierarchyParts, setHierarchyParts] = useState<string[]>([]);
  const hierarchyPartsRef = useRef<string[]>([]);
  const renderSeqRef = useRef<number>(0);

  // Grid Navigation & Breadcrumb State
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbStep[]>([
    { tier: 1, label: "UAE (Tier 1)", code: "UAE" },
  ]);

  const updateHierarchyParts = useCallback((parts: string[]) => {
    hierarchyPartsRef.current = parts;
    setHierarchyParts(parts);
    setBreadcrumbs(buildBreadcrumbsFromParts(parts));
  }, []);
  const [isGridLoading, setIsGridLoading] = useState<boolean>(false);
  const [tier1Error, setTier1Error] = useState<string | null>(null);
  const [tier1Empty, setTier1Empty] = useState<boolean>(false);
  const [serviceNotice, setServiceNotice] = useState<string | null>(null);
  const [livePostcodeResults, setLivePostcodeResults] = useState<SearchResultItem[]>([]);
  const [searchPage, setSearchPage] = useState<number>(1);
  const [totalSearchCount, setTotalSearchCount] = useState<number>(0);
  const [selectedCellProps, setSelectedCellProps] = useState<GridCellProperties | null>(null);
  const [selectedNeighborCodes, setSelectedNeighborCodes] = useState<string[]>([]);
  const currentTierFeaturesRef = useRef<GeoJsonFeature[]>([]);

  // Basemap style & layer ref
  const [mapStyle, setMapStyle] = useState<"standard" | "satellite">("standard");
  const tileLayerRef = useRef<TileLayer | null>(null);

  // Grid Type: 4 Figma Screen Modes (Full Grid, UnMasked Cells, All Tiers, Default Search)
  const [gridType, setGridType] = useState<PortalGridMode>("full-grid");
  const gridTypeRef = useRef<PortalGridMode>("full-grid");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

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
  const activePlotPolyRef = useRef<import("leaflet").Polygon | null>(null);
  const svgLabelRegistryRef = useRef<Array<{
    textEl: SVGTextElement;
    center: import("leaflet").LatLng;
    // [TEMPORARY DEMO FEATURE - REMOVE LATER]: Green dot SVG element indicating child tier availability
    dotEl?: SVGCircleElement | null;
  }>>([]);
  const repositionRafRef = useRef<number | null>(null);

  // ============================================================================
  // [TEMPORARY DEMO FEATURE - REMOVE LATER]
  // Caches whether a given cell (`${nextTier}:${fullCode}`) has child grid cells
  // in the next tier so we can display a green indicator dot on populated parent cells.
  // Once all backend grid tiers are fully populated, remove this cache, the green
  // dot SVG logic, and the background child-tier check in `renderGrid`.
  // ============================================================================
  const childAvailabilityCacheRef = useRef<Map<string, boolean>>(new Map());

  // Caches split sub-polygons (MASKED & UNMASKED) returned by GET /api/grid/partialcells?postalGridId=...
  const partialCellsCacheRef = useRef<Map<string, GeoJsonFeature[]>>(new Map());

  // Injects the 135deg diagonal hatched lines pattern & UAE boundary clipPath into Leaflet SVG defs
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
      bgRect.setAttribute("fill", "#FFFFFF");

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", "0");
      line.setAttribute("x2", "0");
      line.setAttribute("y2", "10");
      line.setAttribute("stroke", "#CBD5E1");
      line.setAttribute("stroke-width", "1.2");
      line.setAttribute("stroke-opacity", "1");

      pattern.appendChild(bgRect);
      pattern.appendChild(line);
      defs.appendChild(pattern);

      // SVG clipPath for UAE national boundary matching Figma Mask group
      let clipGroup = defs.querySelector("#uaeBoundaryClip");
      if (!clipGroup) {
        clipGroup = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipGroup.setAttribute("id", "uaeBoundaryClip");
        clipGroup.setAttribute("clipPathUnits", "userSpaceOnUse");
        defs.appendChild(clipGroup);
      }
      let clipPathEl = clipGroup.querySelector("#uaeBoundaryClipPath");
      if (!clipPathEl) {
        clipPathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        clipPathEl.setAttribute("id", "uaeBoundaryClipPath");
        clipGroup.appendChild(clipPathEl);
      }
    } catch {
      // SVG defs fallback
    }
  }, []);

  // Updates the SVG boundary clipPath from projected UAE_BORDER_COORDINATES
  const updateBoundaryClipPath = useCallback((map: LeafletMap | null) => {
    if (!map) return;
    try {
      const container =
        map.getContainer()?.querySelector("svg.leaflet-zoom-animated") ||
        map.getContainer()?.querySelector("svg") ||
        (map as any)._panes?.overlayPane?.querySelector("svg");
      if (!container) return;

      let clipPathEl = container.querySelector("#uaeBoundaryClipPath") as SVGPathElement | null;
      if (!clipPathEl) {
        let defs = container.querySelector("defs");
        if (!defs) {
          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          container.insertBefore(defs, container.firstChild);
        }
        let clipGroup = defs.querySelector("#uaeBoundaryClip");
        if (!clipGroup) {
          clipGroup = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
          clipGroup.setAttribute("id", "uaeBoundaryClip");
          clipGroup.setAttribute("clipPathUnits", "userSpaceOnUse");
          defs.appendChild(clipGroup);
        }
        clipPathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        clipPathEl.setAttribute("id", "uaeBoundaryClipPath");
        clipGroup.appendChild(clipPathEl);
      }

      let d = "";
      for (let i = 0; i < UAE_BORDER_COORDINATES.length; i++) {
        const pt = map.latLngToLayerPoint(UAE_BORDER_COORDINATES[i]);
        d += (i === 0 ? "M " : "L ") + `${Math.round(pt.x)} ${Math.round(pt.y)} `;
      }
      d += "Z";
      clipPathEl.setAttribute("d", d);
    } catch {
      // ignore
    }
  }, []);

  // Filtered search list:
  // - In "address" tab: combines live backend results + Google Places predictions converted to SearchResultItem
  // - In "postcode" / "coordinates" / "makani" / "onwani" tabs: uses livePostcodeResults for that active tab
  const placePredictionItems: SearchResultItem[] =
    activeFilter === "address"
      ? placePredictions.map((pred) => ({
          id: `place-${pred.placeId}`,
          name: pred.mainText,
          type: "building",
          status: "Verified",
          addressLine: pred.secondaryText || pred.description,
          postCode: "Click to resolve",
          tiers: { tier1: "", tier2: "", tier3: "", tier4: "" },
          latitude: 0,
          longitude: 0,
          makaniNumber: "-",
          onwaniAddress: "-",
          coordinates: "-",
          buildingName: pred.mainText,
          addressType: "Place / Address",
          addressIdentifier: pred.placeId,
          floors: 1,
          units: 1,
          street: pred.secondaryText || "UAE",
          areaLocality: "UAE",
          emirateAdminArea: "UAE",
          countryCode: "AE",
          countryName: "United Arab Emirates",
          lastUpdate: "Google Places",
          gridLineage: {
            tier1: { code: "-", label: "Tier 1", desc: "UAE" },
            tier2: { code: "-", label: "Tier 2", desc: "Sector" },
            tier3: { code: "-", label: "Tier 3", desc: "Block" },
            tier4: { code: "-", label: "Tier 4", desc: "Plot" },
          },
        }))
      : [];

  const filteredResults =
    activeFilter === "address"
      ? [...livePostcodeResults, ...placePredictionItems]
      : livePostcodeResults;

  const totalPages =
    totalSearchCount > 0
      ? Math.max(1, Math.ceil(totalSearchCount / 6))
      : filteredResults.length > 0
        ? 1
        : 1;
  const displayResultsCount =
    totalSearchCount > 0 ? totalSearchCount + placePredictionItems.length : filteredResults.length;

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

  // Category tabs visibility: visible below the search bar whenever not in default-search mode
  const showFilterTabs = gridType !== "default-search";

  const clearPinMarker = useCallback(() => {
    if (pinMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(pinMarkerRef.current);
      pinMarkerRef.current = null;
    }
  }, []);

  // Render POIs for Tier 4 view (only near Burj Khalifa / Downtown Dubai demo coordinates)
  const renderPlotPOIs = useCallback(async (centerLat?: number, centerLng?: number) => {
    if (!mapInstanceRef.current) return;
    const L = await import("leaflet");

    if (!poiLayerGroupRef.current) {
      poiLayerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    } else {
      poiLayerGroupRef.current.clearLayers();
    }

    const lat = centerLat ?? mapInstanceRef.current.getCenter().lat;
    const lng = centerLng ?? mapInstanceRef.current.getCenter().lng;
    const isNearBurj = Math.abs(lat - 25.1972) < 0.05 && Math.abs(lng - 55.2744) < 0.05;
    if (!isNearBurj) {
      return;
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
          <span style="font-family: var(--font-titillium), 'Titillium Web', sans-serif; font-size: 12px; font-weight: 700; color: ${poi.color}; text-shadow: 0 1px 3px rgba(255,255,255,0.9); white-space: nowrap;">
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
    ((
      tier: TierLevel,
      targetItem?: SearchResultItem | null,
      parentProps?: GridCellProperties | null,
      alreadyCentered?: boolean,
      explicitParts?: string[],
      highlightChildCode?: string
    ) => Promise<void>) | null
  >(null);

  // Centralized batch update for SVG labels on map movement (runs in requestAnimationFrame, 0 per-cell listeners)
  const repositionAllSvgLabels = useCallback(() => {
    if (!mapInstanceRef.current || svgLabelRegistryRef.current.length === 0) return;
    if ((mapInstanceRef.current as any)._animatingZoom) return;

    if (repositionRafRef.current !== null) {
      cancelAnimationFrame(repositionRafRef.current);
    }

    repositionRafRef.current = requestAnimationFrame(() => {
      repositionRafRef.current = null;
      const map = mapInstanceRef.current;
      if (!map) return;
      updateBoundaryClipPath(map);
      const registry = svgLabelRegistryRef.current;
      for (let i = 0; i < registry.length; i++) {
        const item = registry[i];
        if (!item.textEl || !item.textEl.parentNode) continue;
        try {
          const pt = map.latLngToLayerPoint(item.center);
          item.textEl.setAttribute("x", String(Math.round(pt.x)));
          item.textEl.setAttribute("y", String(Math.round(pt.y)));
          item.textEl.removeAttribute("clip-path");
          // Ensure all cell labels and green dots remain on top of every polygon (especially PARTIAL cells where
          // the MASKED sub-polygon is added after the UNMASKED sub-polygon and would otherwise paint over the center label)
          if (item.textEl.parentNode) {
            item.textEl.parentNode.appendChild(item.textEl);
          }
          // [TEMPORARY DEMO FEATURE - REMOVE LATER]: Reposition green child-availability dot beside the cell label
          if (item.dotEl && item.dotEl.parentNode) {
            item.dotEl.setAttribute("cx", String(Math.round(pt.x + 12)));
            item.dotEl.setAttribute("cy", String(Math.round(pt.y - 6)));
            item.dotEl.parentNode.appendChild(item.dotEl);
          }
        } catch {
          // map view transitioning
        }
      }
    });
  }, [updateBoundaryClipPath]);

  // Centralized clean removal of all SVG label elements to prevent memory leaks and ghost labels
  const clearAllSvgLabels = useCallback(() => {
    if (repositionRafRef.current !== null) {
      cancelAnimationFrame(repositionRafRef.current);
      repositionRafRef.current = null;
    }
    const registry = svgLabelRegistryRef.current;
    for (let i = 0; i < registry.length; i++) {
      const item = registry[i];
      if (item.textEl && item.textEl.parentNode) {
        item.textEl.parentNode.removeChild(item.textEl);
      }
      // [TEMPORARY DEMO FEATURE - REMOVE LATER]: Clean up green dot SVG element
      if (item.dotEl && item.dotEl.parentNode) {
        item.dotEl.parentNode.removeChild(item.dotEl);
      }
    }
    svgLabelRegistryRef.current = [];

    // Clean any orphaned text or dot nodes in the SVG container
    if (mapInstanceRef.current) {
      const container =
        mapInstanceRef.current.getContainer()?.querySelector("svg.leaflet-zoom-animated") ||
        mapInstanceRef.current.getContainer()?.querySelector("svg");
      if (container) {
        container.querySelectorAll("text.grid-cell-label, circle.grid-cell-child-dot").forEach((el) => el.remove());
      }
    }
  }, []);

  // ============================================================================
  // [TEMPORARY DEMO FEATURE - REMOVE LATER]
  // Attaches a green indicator dot (<circle>) beside a grid cell's SVG label
  // when that cell has child grid cells available in the next tier.
  // Remove this helper once all backend grid data is populated.
  // ============================================================================
  const attachGreenDotToCell = useCallback(
    (
      map: LeafletMap | null,
      poly: import("leaflet").Polygon | import("leaflet").Rectangle,
      customCenter?: import("leaflet").LatLng
    ) => {
      if (!map) return;
      const center = customCenter || poly.getBounds().getCenter();

      const doAttach = () => {
        const pathEl = (poly as unknown as { _path?: SVGElement })._path;
        if (!pathEl || !pathEl.parentNode) return;

        let dotEl = (poly as unknown as { _svgDotNode?: SVGCircleElement })._svgDotNode || null;
        if (!dotEl || !dotEl.parentNode) {
          dotEl = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dotEl.setAttribute("class", "grid-cell-child-dot");
          dotEl.setAttribute("r", "4");
          dotEl.setAttribute("fill", "#16A34A");
          dotEl.setAttribute("stroke", "#FFFFFF");
          dotEl.setAttribute("stroke-width", "1.5");
          dotEl.setAttribute("pointer-events", "none");
          pathEl.parentNode.appendChild(dotEl);
          (poly as unknown as { _svgDotNode?: SVGCircleElement })._svgDotNode = dotEl;
        }

        try {
          const pt = map.latLngToLayerPoint(center);
          dotEl.setAttribute("cx", String(Math.round(pt.x + 12)));
          dotEl.setAttribute("cy", String(Math.round(pt.y - 6)));
        } catch {
          // ignore
        }

        // Link dotEl to the existing registry entry for this polygon's textEl so zoom/pan updates it
        const textEl = (poly as unknown as { _svgTextNode?: SVGTextElement })._svgTextNode;
        if (textEl) {
          const entry = svgLabelRegistryRef.current.find((item) => item.textEl === textEl);
          if (entry) {
            entry.dotEl = dotEl;
          }
        }
      };

      if ((poly as unknown as { _path?: SVGElement })._path?.parentNode) {
        doAttach();
      } else {
        poly.once("add", doAttach);
      }
    },
    []
  );

  /**
   * High-Performance SVG Label Binder:
   * Attaches an SVG <text> element to the Leaflet overlay pane.
   * Registers into svgLabelRegistryRef for batch repositioning on zoomend/moveend.
   * ZERO individual map event listeners attached per polygon, completely eliminating UI freezing.
   */
  const bindSvgLabel = useCallback(
    (
      map: LeafletMap | null,
      poly: import("leaflet").Polygon | import("leaflet").Rectangle,
      text: string,
      options: {
        textColor?: string;
        fontSize?: string;
        isSelected?: boolean;
        customCenter?: import("leaflet").LatLng;
        // [TEMPORARY DEMO FEATURE - REMOVE LATER]: Whether to immediately render green dot
        hasChildren?: boolean;
      } = {}
    ) => {
      if (!map) return;
      const bounds = poly.getBounds();
      const center = options.customCenter || bounds.getCenter();

      const attachText = () => {
        const pathEl = (poly as unknown as { _path?: SVGElement })._path;
        if (!pathEl || !pathEl.parentNode) return;

        let textEl = (poly as unknown as { _svgTextNode?: SVGTextElement })._svgTextNode || null;
        if (textEl && textEl.parentNode) {
          try {
            const pt = map.latLngToLayerPoint(center);
            textEl.setAttribute("x", String(Math.round(pt.x)));
            textEl.setAttribute("y", String(Math.round(pt.y)));
            textEl.removeAttribute("clip-path");
          } catch {
            // ignore
          }
          return;
        }

        textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.textContent = text;
        textEl.setAttribute("class", "grid-cell-label");
        textEl.setAttribute("text-anchor", "middle");
        textEl.setAttribute("dominant-baseline", "central");
        textEl.setAttribute("pointer-events", "none");
        textEl.setAttribute("style", "user-select: none;");
        textEl.setAttribute("font-family", "var(--font-titillium), 'Titillium Web', sans-serif");
        textEl.setAttribute("font-size", options.fontSize || "12px");
        textEl.setAttribute("font-weight", "700");
        textEl.setAttribute("fill", options.textColor || (options.isSelected ? "#FFFFFF" : "#0F172A"));

        if (!options.isSelected) {
          textEl.setAttribute("paint-order", "stroke fill");
          textEl.setAttribute("stroke", "rgba(255, 255, 255, 0.95)");
          textEl.setAttribute("stroke-width", "2.5px");
          textEl.setAttribute("stroke-linejoin", "round");
        }

        try {
          const pt = map.latLngToLayerPoint(center);
          textEl.setAttribute("x", String(Math.round(pt.x)));
          textEl.setAttribute("y", String(Math.round(pt.y)));
        } catch {
          // ignore
        }

        pathEl.parentNode.appendChild(textEl);
        (poly as unknown as { _svgTextNode?: SVGTextElement })._svgTextNode = textEl;

        // [TEMPORARY DEMO FEATURE - REMOVE LATER]: Link any already-created dotEl or create if hasChildren is true
        const existingDot = (poly as unknown as { _svgDotNode?: SVGCircleElement })._svgDotNode || null;
        svgLabelRegistryRef.current.push({ textEl, center, dotEl: existingDot });
        if (options.hasChildren) {
          attachGreenDotToCell(map, poly, center);
        }
      };

      if ((poly as unknown as { _path?: SVGElement })._path?.parentNode) {
        attachText();
      } else {
        poly.once("add", attachText);
      }
    },
    [attachGreenDotToCell]
  );

  /**
   * Two-Phase Navigation:
   * 1. Smoothly animates the camera into the selected cell bounds without destroying current layers.
   * 2. Waits for camera arrival (moveend), then seamlessly renders the child tier at stable coordinates.
   */
  const navigateToNextTier = useCallback(
    (
      nextTier: TierLevel,
      cellBounds: import("leaflet").LatLngBounds,
      code: string,
      props: GridCellProperties,
      targetItem: SearchResultItem | null,
      nextParts: string[]
    ) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      selectedCellIdRef.current = code;
      setSelectedCellId(code);
      setSelectedCellProps(props);
      updateHierarchyParts(nextParts);

      let transitionFired = false;
      const proceedToNextTier = () => {
        if (transitionFired) return;
        transitionFired = true;
        map.off("moveend", proceedToNextTier);
        setActiveTier(nextTier);
        renderGridRef.current?.(nextTier, targetItem, props, true /* alreadyCentered */, nextParts);
      };

      map.once("moveend", proceedToNextTier);
      setTimeout(proceedToNextTier, 850);

      map.flyToBounds(cellBounds, {
        duration: 0.75,
        easeLinearity: 0.25,
        padding: [24, 24],
      });
    },
    [updateHierarchyParts]
  );

  // Main Live Grid Render Function — strictly uses GET /api/grid/cells?tier={tier}&code={code}&Page=1&PageSize=1000
  // Never renders static fallback grids if the API fails or returns no features.
  const renderGrid = useCallback(
    async (
      tier: TierLevel,
      targetItem: SearchResultItem | null = selectedResult,
      parentProps: GridCellProperties | null = selectedCellProps,
      alreadyCentered = false,
      explicitParts?: string[],
      highlightChildCode?: string
    ) => {
      if (!mapInstanceRef.current) return;
      const seq = ++renderSeqRef.current;
      const L = await import("leaflet");
      if (seq !== renderSeqRef.current || !mapInstanceRef.current) return;

      if (!gridLayerGroupRef.current) {
        gridLayerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      } else {
        gridLayerGroupRef.current.clearLayers();
      }
      clearAllSvgLabels();

      if (poiLayerGroupRef.current) {
        poiLayerGroupRef.current.clearLayers();
      }

      ensureSvgDefs(mapInstanceRef.current);
      setIsGridLoading(true);
      setServiceNotice(null);

      const activeParts = explicitParts ?? hierarchyPartsRef.current;

      if (gridTypeRef.current === "default-search" || gridTypeRef.current === "hide-grids") {
        if (gridLayerGroupRef.current) {
          gridLayerGroupRef.current.clearLayers();
        }
        if (poiLayerGroupRef.current) {
          poiLayerGroupRef.current.clearLayers();
        }
        clearAllSvgLabels();
        if (targetItem?.latitude && targetItem?.longitude) {
          updatePinMarker(targetItem.latitude, targetItem.longitude);
          if (!alreadyCentered) {
            mapInstanceRef.current.flyTo([targetItem.latitude, targetItem.longitude], 17, {
              duration: 0.8,
            });
          }
        } else if (!alreadyCentered && activeParts.length > 0) {
          const b = getHierarchyBounds(activeParts.join("."));
          const centerLat = (b.north + b.south) / 2;
          const centerLng = (b.east + b.west) / 2;
          updatePinMarker(centerLat, centerLng);
          mapInstanceRef.current.flyToBounds(
            [
              [b.south, b.west],
              [b.north, b.east],
            ],
            { duration: 0.8, easeLinearity: 0.25, padding: [30, 30] }
          );
        } else if (!alreadyCentered && activeParts.length === 0 && !targetItem) {
          mapInstanceRef.current.flyToBounds(
            [
              [TIER1_DEFAULT_BOUNDS.south, TIER1_DEFAULT_BOUNDS.west],
              [TIER1_DEFAULT_BOUNDS.north, TIER1_DEFAULT_BOUNDS.east],
            ],
            { duration: 0.8, easeLinearity: 0.25, padding: [24, 24] }
          );
        }
        setIsGridLoading(false);
        return;
      }
      let parentCode: string | undefined;
      if (tier === 2) {
        parentCode = activeParts[0];
      } else if (tier === 3) {
        parentCode = activeParts.length >= 2 ? `${activeParts[0]}.${activeParts[1]}` : undefined;
      } else if (tier === 4) {
        parentCode =
          activeParts.length >= 3
            ? `${activeParts[0]}.${activeParts[1]}.${activeParts[2]}`
            : undefined;
      }

      // For Tiers 2, 3, 4 a parent code is required. If missing, do not render anything.
      if (tier > 1 && !parentCode) {
        setIsGridLoading(false);
        return;
      }

      if (tier === 1) {
        setTier1Error(null);
        setTier1Empty(false);
      }

      try {
        const res = await gridService.getCells({
          tier,
          code: parentCode,
          Page: 1,
          PageSize: 1000,
        });

        if (seq !== renderSeqRef.current || !mapInstanceRef.current) return;

        // Ensure layers are clean before drawing
        gridLayerGroupRef.current?.clearLayers();
        clearAllSvgLabels();

        if (!res || !res.success) {
          currentTierFeaturesRef.current = [];
          const errMsg =
            res?.message ||
            (tier === 1
              ? "Failed to load Tier 1 grid cells from server."
              : `Failed to load Tier ${tier} grid cells for code ${parentCode}.`);
          if (tier === 1) {
            setTier1Error(errMsg);
          } else {
            setServiceNotice(errMsg);
          }
          return;
        }

        const features = res.data?.features || [];
        currentTierFeaturesRef.current = features;

        if (features.length === 0) {
          if (tier === 1) {
            setTier1Empty(true);
          } else {
            setServiceNotice(`No grid cells returned by the server for Tier ${tier} (code: ${parentCode}).`);
          }
          return;
        }

        // Resolve any boundary-intersecting cells where maskStatusCode === "PARTIAL"
        // by calling GET /api/grid/partialcells?postalGridId={gridId}
        const partialGridIds: string[] = [];
        features.forEach((feat) => {
          const props = feat.properties || {};
          if (getMaskState(props) === "PARTIAL") {
            const rawGridId = props.gridId || props.id || feat.id;
            const gridId = rawGridId ? String(rawGridId) : "";
            if (gridId && !partialCellsCacheRef.current.has(gridId) && !partialGridIds.includes(gridId)) {
              partialGridIds.push(gridId);
            }
          }
        });

        if (partialGridIds.length > 0) {
          const PARTIAL_CONCURRENCY = 8;
          let pCursor = 0;
          const partialWorkers = Array.from(
            { length: Math.min(PARTIAL_CONCURRENCY, partialGridIds.length) },
            async () => {
              while (pCursor < partialGridIds.length) {
                if (seq !== renderSeqRef.current) return;
                const gId = partialGridIds[pCursor++];
                try {
                  const partialRes = await gridService.getPartialCells(gId);
                  if (partialRes?.success && Array.isArray(partialRes.data?.features)) {
                    partialCellsCacheRef.current.set(gId, partialRes.data.features);
                  }
                } catch {
                  // Fallback to original cell polygon if partial endpoint fails
                }
              }
            }
          );
          await Promise.all(partialWorkers);
          if (seq !== renderSeqRef.current || !mapInstanceRef.current) return;
        }

        // Expand PARTIAL features into their split sub-features (MASKED & UNMASKED)
        // while keeping track of the original square cell bounds & center so the cell
        // label and green dot are only rendered ONCE per cell code (no duplicate numbers).
        interface RenderableGridItem {
          feat: GeoJsonFeature;
          parentFeat: GeoJsonFeature;
          parentBounds: import("leaflet").LatLngBounds | null;
          shouldBindLabel: boolean;
        }

        const renderableItems: RenderableGridItem[] = [];
        const labeledCodes = new Set<string>();

        features.forEach((feat) => {
          const props = feat.properties || {};
          const { fullCode } = resolveFeatureCodes(props, parentCode);
          const parentLatLngs = extractPolygonLatLngs(feat.geometry);
          const parentBounds = parentLatLngs ? L.polygon(parentLatLngs).getBounds() : null;
          if (fullCode && parentBounds) {
            registerCellBounds(fullCode, parentBounds);
          }

          if (getMaskState(props) === "PARTIAL") {
            const rawGridId = props.gridId || props.id || feat.id;
            const gridId = rawGridId ? String(rawGridId) : "";
            const subFeatures = gridId ? partialCellsCacheRef.current.get(gridId) : undefined;

            if (subFeatures && subFeatures.length > 0) {
              // Sort so UNMASKED sub-polygon comes first and receives the single cell label & green dot
              const sortedSubs = [...subFeatures].sort((a, b) => {
                const aUnmasked = getMaskState(a.properties || {}) === "UNMASKED" ? 0 : 1;
                const bUnmasked = getMaskState(b.properties || {}) === "UNMASKED" ? 0 : 1;
                return aUnmasked - bUnmasked;
              });

              sortedSubs.forEach((subFeat) => {
                const subProps: GridCellProperties = {
                  ...props,
                  ...(subFeat.properties || {}),
                  gridId: props.gridId || props.id || subFeat.properties?.postalGridId,
                  hierarchyCode: subFeat.properties?.hierarchyCode || props.hierarchyCode,
                  code: subFeat.properties?.code || props.code,
                };
                const subCodes = resolveFeatureCodes(subProps, parentCode);
                const codeKey = subCodes.fullCode || fullCode;
                const isMaskedSub = getMaskState(subProps) === "MASKED";

                if (gridTypeRef.current === "unmasked" && isMaskedSub) {
                  return;
                }

                const bindOnce = Boolean(codeKey && !labeledCodes.has(codeKey));
                if (bindOnce && codeKey) {
                  labeledCodes.add(codeKey);
                }

                renderableItems.push({
                  feat: {
                    ...subFeat,
                    properties: subProps,
                  },
                  parentFeat: feat,
                  parentBounds,
                  shouldBindLabel: bindOnce,
                });
              });
              return;
            }
          }

          const bindOnce = Boolean(fullCode && !labeledCodes.has(fullCode));
          if (bindOnce && fullCode) {
            labeledCodes.add(fullCode);
          }
          renderableItems.push({
            feat,
            parentFeat: feat,
            parentBounds,
            shouldBindLabel: bindOnce,
          });
        });

        const allBounds = L.latLngBounds([]);
        const expectedSelectedCode =
          highlightChildCode ||
          (activeParts.length >= tier ? activeParts.slice(0, tier).join(".") : "") ||
          selectedCellIdRef.current;

        // [TEMPORARY DEMO FEATURE - REMOVE LATER]: Track cells whose child-tier availability needs to be probed
        const cellsToProbeForChildren: Array<{
          fullCode: string;
          poly: import("leaflet").Polygon;
          labelCenter?: import("leaflet").LatLng;
        }> = [];
        const probedCodes = new Set<string>();

        renderableItems.forEach(({ feat, parentBounds, shouldBindLabel }) => {
          const props = feat.properties || {};
          const { fullCode, shortCode, parts: cellParts } = resolveFeatureCodes(props, parentCode);
          if (!fullCode) return;

          const maskState = getMaskState(props);
          const isMasked = maskState === "MASKED";

          // In "unmasked" mode, skip masked cells
          if (gridTypeRef.current === "unmasked" && isMasked) {
            return;
          }

          const latlngs = extractPolygonLatLngs(feat.geometry);
          if (!latlngs) return;

          const isSelected = Boolean(
            expectedSelectedCode &&
              (fullCode === expectedSelectedCode ||
                (tier === 1 && shortCode === expectedSelectedCode))
          );

          const isTier4 = tier === 4;
          const fillColor = isSelected
            ? "rgba(0, 0, 255, 0.06)"
            : isTier4
              ? "#0000FF"
              : isMasked
                ? "url(#uaeDisabledHatchPattern)"
                : "#FFFFFF";
          const fillOpacity = isSelected
            ? 0.06
            : isTier4
              ? 0
              : isMasked
                ? 1
                : 0.35;
          const strokeColor = isSelected
            ? "#0000FF"
            : isTier4
              ? "rgba(0, 0, 255, 0.55)"
              : "rgba(148, 163, 184, 0.75)";
          const strokeWidth = isSelected ? 2.5 : isTier4 ? 1.2 : 1;

          const poly = L.polygon(latlngs, {
            color: strokeColor,
            weight: strokeWidth,
            fill: true,
            fillColor,
            fillOpacity,
            className: isSelected
              ? "selected-grid-cell"
              : isMasked && !isTier4
                ? "disabled-grid-cell"
                : "enabled-grid-cell",
          });

          if (isTier4 && isSelected) {
            activePlotPolyRef.current = poly;
          }

          const effectiveBounds = parentBounds || poly.getBounds();
          registerCellBounds(fullCode, effectiveBounds);
          allBounds.extend(poly.getBounds());

          poly.on("mouseover", () => {
            if (selectedCellIdRef.current !== fullCode) {
              poly.setStyle({
                fillColor: isTier4
                  ? "#0000FF"
                  : isMasked
                    ? "url(#uaeDisabledHatchPattern)"
                    : "#FFFFFF",
                fillOpacity: isTier4 ? 0.04 : isMasked ? 1 : 0.5,
                color: isTier4 ? "#0000FF" : "#3B82F6",
                weight: isTier4 ? 2 : 1.5,
              });
            }
          });
          poly.on("mouseout", () => {
            if (selectedCellIdRef.current !== fullCode) {
              poly.setStyle({
                fillColor: isTier4
                  ? "#0000FF"
                  : isMasked
                    ? "url(#uaeDisabledHatchPattern)"
                    : "#FFFFFF",
                fillOpacity: isTier4 ? 0 : isMasked ? 1 : 0.35,
                color: isTier4 ? "rgba(0, 0, 255, 0.55)" : "rgba(148, 163, 184, 0.75)",
                weight: isTier4 ? 1.2 : 1,
              });
            }
          });

          poly.on("click", (e) => {
            L.DomEvent.stopPropagation(e);

            if (tier < 4) {
              const nextTier = (tier + 1) as TierLevel;
              const nextParts =
                cellParts.length >= tier
                  ? cellParts.slice(0, tier)
                  : [...activeParts.slice(0, tier - 1), shortCode];

              poly.setStyle({
                fillColor: "rgba(0, 0, 255, 0.05)",
                fillOpacity: 0.05,
                color: "#0000FF",
                weight: 2.5,
              });
              const textNode = (poly as unknown as { _svgTextNode?: SVGTextElement })._svgTextNode;
              if (textNode) {
                textNode.setAttribute("fill", "#0000FF");
                textNode.setAttribute("stroke", "rgba(255, 255, 255, 0.95)");
              }

              navigateToNextTier(
                nextTier,
                effectiveBounds,
                fullCode,
                props,
                targetItem,
                nextParts
              );
            } else {
              // Tier 4 plot click
              const nextParts =
                cellParts.length >= 4
                  ? cellParts.slice(0, 4)
                  : [...activeParts.slice(0, 3), shortCode];
              updateHierarchyParts(nextParts);
              selectedCellIdRef.current = fullCode;
              setSelectedCellId(fullCode);
              setSelectedCellProps(props);

              if (activePlotPolyRef.current && activePlotPolyRef.current !== poly) {
                activePlotPolyRef.current.setStyle({
                  fillColor: "#0000FF",
                  fillOpacity: 0,
                  color: "rgba(0, 0, 255, 0.55)",
                  weight: 1.2,
                });
                const prevTextNode = (
                  activePlotPolyRef.current as unknown as { _svgTextNode?: SVGTextElement }
                )._svgTextNode;
                if (prevTextNode) {
                  prevTextNode.setAttribute("fill", "#0F172A");
                  prevTextNode.setAttribute("stroke", "rgba(255, 255, 255, 0.95)");
                }
              }
              activePlotPolyRef.current = poly;

              poly.setStyle({
                fillColor: "rgba(0, 0, 255, 0.06)",
                fillOpacity: 0.06,
                color: "#0000FF",
                weight: 2.5,
              });
              const textNode = (poly as unknown as { _svgTextNode?: SVGTextElement })._svgTextNode;
              if (textNode) {
                textNode.setAttribute("fill", "#0000FF");
                textNode.setAttribute("stroke", "rgba(255, 255, 255, 0.95)");
              }

              const bounds = effectiveBounds;
              const center = bounds.getCenter();
              mapInstanceRef.current?.flyTo(center, 18.5, { duration: 0.6 });
              updatePinMarker(center.lat, center.lng);
            }
          });

          poly.addTo(gridLayerGroupRef.current!);

          if (shouldBindLabel) {
            const labelCenter = effectiveBounds.getCenter();
            // [TEMPORARY DEMO FEATURE - REMOVE LATER]: Check cache or queue probe for child grids in next tier
            const nextTierKey = tier < 4 ? `${tier + 1}:${fullCode}` : "";
            const cachedHasChildren =
              tier < 4 ? childAvailabilityCacheRef.current.get(nextTierKey) : false;
            if (tier < 4 && cachedHasChildren === undefined && !probedCodes.has(fullCode)) {
              probedCodes.add(fullCode);
              cellsToProbeForChildren.push({ fullCode, poly, labelCenter });
            }

            const fontSize = tier === 1 ? "13px" : tier === 2 ? "12px" : "11px";
            bindSvgLabel(mapInstanceRef.current, poly, shortCode, {
              isSelected,
              textColor: isSelected ? "#0000FF" : isMasked ? "#64748B" : "#0F172A",
              fontSize,
              customCenter: labelCenter,
              hasChildren: Boolean(cachedHasChildren),
            });
          }
        });

        // Ensure all SVG cell labels (<text>) and green child-availability dots (<circle>)
        // sit above every polygon in the SVG DOM (fixes PARTIAL cells where the second sub-polygon
        // was appended after the first sub-polygon's label and painted its hatch pattern over the text)
        svgLabelRegistryRef.current.forEach((entry) => {
          if (entry.textEl && entry.textEl.parentNode) {
            entry.textEl.parentNode.appendChild(entry.textEl);
          }
          if (entry.dotEl && entry.dotEl.parentNode) {
            entry.dotEl.parentNode.appendChild(entry.dotEl);
          }
        });

        if (allBounds.isValid() && !alreadyCentered) {
          mapInstanceRef.current.flyToBounds(allBounds, {
            duration: 0.8,
            easeLinearity: 0.25,
            padding: [30, 30],
          });
        }

        if (targetItem?.latitude && targetItem?.longitude) {
          updatePinMarker(targetItem.latitude, targetItem.longitude);
        }

        if (tier === 4 && targetItem?.latitude && targetItem?.longitude) {
          renderPlotPOIs(targetItem.latitude, targetItem.longitude);
        }

        // ============================================================================
        // [TEMPORARY DEMO FEATURE - REMOVE LATER]
        // Asynchronously probes child-tier availability for all cells in the active
        // tier (T1 -> T2, T2 -> T3, T3 -> T4) using a bounded concurrency pool and
        // PageSize=1 so we can light up a green dot on cells that have child grids.
        // Awaited so the semi-transparent loading Backdrop remains active until all probes finish.
        // Once all backend grid tiers are fully populated, remove this block.
        // ============================================================================
        if (tier < 4 && cellsToProbeForChildren.length > 0) {
          const nextTier = (tier + 1) as TierLevel;
          const CONCURRENCY = 12;
          let cursor = 0;
          const runChildProbePool = async () => {
            const workers = Array.from(
              { length: Math.min(CONCURRENCY, cellsToProbeForChildren.length) },
              async () => {
                while (cursor < cellsToProbeForChildren.length) {
                  if (seq !== renderSeqRef.current) return;
                  const item = cellsToProbeForChildren[cursor++];
                  const cacheKey = `${nextTier}:${item.fullCode}`;
                  if (childAvailabilityCacheRef.current.has(cacheKey)) {
                    if (
                      childAvailabilityCacheRef.current.get(cacheKey) &&
                      seq === renderSeqRef.current &&
                      mapInstanceRef.current
                    ) {
                      attachGreenDotToCell(mapInstanceRef.current, item.poly, item.labelCenter);
                    }
                    continue;
                  }
                  try {
                    const childRes = await gridService.getCells({
                      tier: nextTier,
                      code: item.fullCode,
                      Page: 1,
                      PageSize: 1,
                    });
                    const hasChild =
                      Boolean(childRes?.success) &&
                      Array.isArray(childRes?.data?.features) &&
                      childRes.data.features.length > 0;
                    childAvailabilityCacheRef.current.set(cacheKey, hasChild);
                    if (hasChild && seq === renderSeqRef.current && mapInstanceRef.current) {
                      attachGreenDotToCell(mapInstanceRef.current, item.poly, item.labelCenter);
                    }
                  } catch {
                    // Ignore transient network errors so cell can be retried next time
                  }
                }
              }
            );
            await Promise.all(workers);
          };
          await runChildProbePool();
        }
      } catch (err: any) {
        if (seq !== renderSeqRef.current) return;
        currentTierFeaturesRef.current = [];
        gridLayerGroupRef.current?.clearLayers();
        clearAllSvgLabels();
        const msg = sanitizeErrorMessage(
          err,
          tier === 1
            ? "Failed to load Tier 1 grid cells from server."
            : `Failed to load Tier ${tier} grid cells for ${parentCode}.`
        );
        if (tier === 1) {
          setTier1Error(msg);
        } else {
          setServiceNotice(msg);
        }
      } finally {
        if (seq === renderSeqRef.current) {
          setIsGridLoading(false);
        }
      }
    },
    [
      selectedResult,
      selectedCellProps,
      ensureSvgDefs,
      bindSvgLabel,
      attachGreenDotToCell,
      clearAllSvgLabels,
      navigateToNextTier,
      renderPlotPOIs,
      updatePinMarker,
      updateHierarchyParts,
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

      const uaeBounds: [[number, number], [number, number]] = [
        [TIER1_DEFAULT_BOUNDS.south, TIER1_DEFAULT_BOUNDS.west],
        [TIER1_DEFAULT_BOUNDS.north, TIER1_DEFAULT_BOUNDS.east],
      ];

      const map = L.map(mapContainerRef.current, {
        center: [23.575, 54.0],
        zoom: 7,
        minZoom: 5,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
      });

      // Fit map to UAE bounds immediately on creation so initial viewport is already exact without flying
      map.fitBounds(uaeBounds, { padding: [24, 24], animate: false });

      mapInstanceRef.current = map;

      // Clean, high-resolution Google Maps tile layer
      const tile = L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
      }).addTo(map);
      tileLayerRef.current = tile;

      gridLayerGroupRef.current = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = L.layerGroup().addTo(map);

      // Single centralized batch listener for all SVG labels (throttled by requestAnimationFrame)
      map.on("zoomend moveend", repositionAllSvgLabels);

      // Map Click: Resolve clicked coordinates via POST /api/grid/resolve
      map.on("click", async (e: any) => {
        if (gridTypeRef.current === "hide-grids") return;
        const { lat, lng } = e.latlng;
        if (lat >= 22 && lat <= 27 && lng >= 51 && lng <= 57) {
          setIsGridLoading(true);
          try {
            const res = await gridService.resolvePoint({ lat, lon: lng });
            const resolvedCode =
              res?.data?.cell?.hierarchyCode ||
              res?.data?.cell?.code ||
              res?.data?.postcode ||
              res?.data?.postcodeDisplay;
            if (
              res &&
              res.success &&
              res.data &&
              resolvedCode &&
              res.data.status !== "OUT_OF_BOUNDS" &&
              res.data.status !== "NOT_FOUND"
            ) {
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

      // Render initial Tier 1 UAE Grid from live backend API (/api/grid/cells?tier=1&Page=1&PageSize=1000)
      renderGridRef.current
        ? renderGridRef.current(1, null, null, false, [])
        : renderGrid(1, null, null, false, []);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
        }
      }, 250);
    });

    return () => {
      isMounted = false;
      if (repositionRafRef.current !== null) {
        cancelAnimationFrame(repositionRafRef.current);
        repositionRafRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off("zoomend moveend", repositionAllSvgLabels);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [repositionAllSvgLabels]);

  // Handle selecting an item from suggestions or results
  const handleSelectItem = async (item: SearchResultItem) => {
    if (item.id.startsWith("place-") && item.addressIdentifier) {
      await handleSelectPrediction({
        placeId: item.addressIdentifier,
        mainText: item.name,
        secondaryText: item.addressLine,
        description: `${item.name}, ${item.addressLine}`,
      });
      return;
    }
    if (item.id.startsWith("coord-") && item.latitude && item.longitude) {
      await handleResolveSeededPoint(item.latitude, item.longitude);
      return;
    }

    setSelectedResult(item);
    setSearchQuery(item.name || item.postCode);
    setIsSuggestionsOpen(false);
    setIsResultsPanelOpen(true);
    setIsResultsPanelCollapsed(false);
    setRightPanelOpen(true);

    const lat = item.latitude;
    const lon = item.longitude;

    // 1. Place pin marker at coordinates if available
    if (lat && lon) {
      updatePinMarker(lat, lon);
    }

    // 2. Extract clean hierarchy parts from item postcode or tiers (e.g. "25-07-25-00" -> ["25", "07", "25", "00"])
    let parts: string[] = [];
    if (item.postCode && item.postCode !== "RESOLVE") {
      const digits = item.postCode.replace(/\D/g, "");
      if (digits.length === 8) {
        parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6), digits.slice(6, 8)];
      } else {
        parts = item.postCode.split(/[.-]/).filter(Boolean);
      }
    }
    if (parts.length === 0) {
      const rawTiers = [item.tiers?.tier1, item.tiers?.tier2, item.tiers?.tier3, item.tiers?.tier4]
        .filter(Boolean)
        .join(".");
      const digits = rawTiers.replace(/\D/g, "");
      if (digits.length === 8) {
        parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6), digits.slice(6, 8)];
      } else {
        parts = rawTiers.split(/[.-]/).filter(Boolean);
      }
    }

    // 3. Prepare cell properties
    const dotHierarchy = parts.join(".");
    let cellProps: GridCellProperties = {
      id: item.addressIdentifier || item.id,
      gridId: item.addressIdentifier || item.id,
      hierarchyCode: dotHierarchy,
      code: item.postCode || dotHierarchy,
      postcode: item.id,
      postcodeDisplay: item.postCode,
      tier: 4,
    };

    // If gridId exists and hierarchy parts are not yet resolved, fetch cell details for exact hierarchy lineage
    if (
      parts.length === 0 &&
      item.addressIdentifier &&
      item.addressIdentifier.length > 10 &&
      item.addressIdentifier !== "COORD"
    ) {
      try {
        const cellRes = await gridService.getCellById(item.addressIdentifier);
        if (cellRes?.success && cellRes.data) {
          const detail = cellRes.data;
          if (detail.cell) {
            cellProps = {
              ...cellProps,
              ...detail.cell,
              tier: 4,
            };
            const rawCode = detail.cell.hierarchyCode || detail.cell.code || "";
            if (rawCode) {
              const resolvedParts = rawCode.replace(/-/g, ".").split(".").filter(Boolean);
              if (resolvedParts.length > 0) {
                parts = resolvedParts;
              }
            }
          }
        }
      } catch {
        // fallback to point resolve if cell by id fails
        try {
          if (lat && lon) {
            const res = await gridService.resolvePoint({ lat, lon });
            if (res?.success && res.data?.cell) {
              cellProps = {
                ...cellProps,
                ...res.data.cell,
                tier: 4,
              };
              const rawCode = res.data.cell.hierarchyCode || res.data.cell.code || "";
              if (rawCode) {
                const resolvedParts = rawCode.replace(/-/g, ".").split(".").filter(Boolean);
                if (resolvedParts.length > 0) {
                  parts = resolvedParts;
                }
              }
            }
          }
        } catch {
          // keep parts
        }
      }
    }

    updateHierarchyParts(parts);

    const targetTier: TierLevel =
      parts.length >= 3 ? 4 : parts.length === 2 ? 3 : parts.length === 1 ? 2 : 1;
    setActiveTier(targetTier);

    const fullDotCode = parts.join(".");
    setSelectedCellProps(cellProps);
    selectedCellIdRef.current = fullDotCode || item.postCode;
    setSelectedCellId(fullDotCode || item.postCode);

    renderGrid(targetTier, item, cellProps, false, parts, fullDotCode);
  };

  // Fetch live postcodes with pagination support
  const fetchLivePostcodes = useCallback(async (val: string, pageNum: number = 1) => {
    if (!val || val.trim().length < 2) {
      setLivePostcodeResults([]);
      setTotalSearchCount(0);
      setSearchPage(1);
      return;
    }
    setIsSearchingPlaces(true);
    try {
      const pcRes = await postcodeService.searchPostcodes({ search: val.trim(), Page: pageNum, PageSize: 6 });
      if (pcRes?.success && pcRes.data?.length) {
        const pcItems: SearchResultItem[] = pcRes.data.map((p) => {
          const rawPc = String(p.postcode || p.postcodeDisplay || "");
          const digits = rawPc.replace(/\D/g, "");
          const pcParts =
            digits.length === 8
              ? [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6), digits.slice(6, 8)]
              : rawPc.split(/[.-]/).filter(Boolean);
          const t1 = pcParts[0] || "";
          const t2 = pcParts[1] || "";
          const t3 = pcParts[2] || "";
          const t4 = pcParts[3] || "";

          return {
            id: p.postcode,
            name: p.postcodeDisplay || p.postcode,
            type: "location",
            status: "Verified",
            addressLine: `${p.localityNameEn || "UAE"} (Grid: ${p.gridId})`,
            postCode: p.postcodeDisplay || p.postcode,
            tiers: {
              tier1: t1,
              tier2: t2,
              tier3: t3,
              tier4: t4,
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
              tier1: { code: t1, label: "Tier 1", desc: "Emirate" },
              tier2: { code: t2 ? `${t1}.${t2}` : t1, label: "Tier 2", desc: "Sector" },
              tier3: { code: t3 ? `${t1}.${t2}.${t3}` : "", label: "Tier 3", desc: "Block" },
              tier4: { code: p.postcodeDisplay || p.postcode, label: "Tier 4", desc: "Plot" },
            },
          };
        });
        setLivePostcodeResults(pcItems);
        const total =
          typeof pcRes.totalCount === "number" && pcRes.totalCount > 0
            ? pcRes.totalCount
            : pcRes.data.length;
        setTotalSearchCount(total);
      } else {
        setLivePostcodeResults([]);
        setTotalSearchCount(0);
      }
    } catch {
      setLivePostcodeResults([]);
      setTotalSearchCount(0);
    } finally {
      setIsSearchingPlaces(false);
    }
  }, []);

  // Execute search strictly based on the selected category tab:
  // - "address": searches localities/addresses via postcode API (if non-numeric) + Google Places Autocomplete
  // - "postcode": searches ONLY postcodes/grid codes (if text without digits is entered, returns no results)
  // - "coordinates": resolves ONLY lat,long coordinates via POST /api/grid/resolve
  // - "makani" / "onwani": searches postcodes/identifiers matching the query
  const runSearchByFilter = useCallback(
    (val: string, filterType: string) => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      const trimmed = val.trim();
      if (!trimmed || trimmed.length < 2) {
        setPlacePredictions([]);
        setLivePostcodeResults([]);
        setSearchPage(1);
        setTotalSearchCount(0);
        setIsSearchingPlaces(false);
        return;
      }

      // 1. COORDINATES TAB: strictly resolve lat,long coordinates only
      if (filterType === "coordinates") {
        setPlacePredictions([]);
        const parsedCoord = parseLatLonInput(trimmed);
        if (!parsedCoord) {
          setLivePostcodeResults([]);
          setTotalSearchCount(0);
          setSearchPage(1);
          setIsSearchingPlaces(false);
          return;
        }

        const { lat, lon } = parsedCoord;
        setIsSearchingPlaces(true);
        setSearchPage(1);
        searchDebounceRef.current = setTimeout(async () => {
          try {
            const res = await gridService.resolvePoint({ lat, lon });
            const resolvedCode =
              res?.data?.cell?.hierarchyCode ||
              res?.data?.cell?.code ||
              res?.data?.postcode ||
              res?.data?.postcodeDisplay;
            if (
              res?.success &&
              res.data &&
              resolvedCode &&
              res.data.status !== "OUT_OF_BOUNDS" &&
              res.data.status !== "NOT_FOUND"
            ) {
              const resolvedItem = buildSearchResultFromResolve(res.data, lat, lon);
              setLivePostcodeResults([resolvedItem]);
              setTotalSearchCount(1);
            } else {
              setLivePostcodeResults([
                {
                  id: `coord-${lat}-${lon}`,
                  name: `Coordinates: ${lat}, ${lon}`,
                  type: "location",
                  status: "Verified",
                  addressLine: "Click or press Enter to resolve via /api/grid/resolve",
                  postCode: "RESOLVE",
                  tiers: { tier1: "", tier2: "", tier3: "", tier4: "" },
                  latitude: lat,
                  longitude: lon,
                  makaniNumber: "-",
                  onwaniAddress: "-",
                  coordinates: `${lat}, ${lon}`,
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
                    tier1: { code: "-", label: "Tier 1", desc: "UAE" },
                    tier2: { code: "-", label: "Tier 2", desc: "Sector" },
                    tier3: { code: "-", label: "Tier 3", desc: "Block" },
                    tier4: { code: "-", label: "Tier 4", desc: "Plot" },
                  },
                },
              ]);
              setTotalSearchCount(1);
            }
          } catch {
            setLivePostcodeResults([]);
            setTotalSearchCount(0);
          } finally {
            setIsSearchingPlaces(false);
          }
        }, 280);
        return;
      }

      // 2. POSTCODE TAB: strictly search postcodes (digits, dashes, dots only; ignore plain text or coordinates)
      if (filterType === "postcode") {
        setPlacePredictions([]);
        // If user entered lat,long coordinates or plain text with letters, do not search in Postcode tab
        if (parseLatLonInput(trimmed) || /[a-zA-Z\u0600-\u06FF]/.test(trimmed) || !/\d/.test(trimmed)) {
          setLivePostcodeResults([]);
          setTotalSearchCount(0);
          setSearchPage(1);
          setIsSearchingPlaces(false);
          return;
        }

        setIsSearchingPlaces(true);
        setSearchPage(1);
        searchDebounceRef.current = setTimeout(async () => {
          await fetchLivePostcodes(trimmed, 1);
        }, 280);
        return;
      }

      // 3. ADDRESS TAB: strictly search addresses/places/localities (ignore pure postcode numbers & coordinates)
      if (filterType === "address") {
        if (parseLatLonInput(trimmed) || /^[\d.\-\s]+$/.test(trimmed)) {
          setLivePostcodeResults([]);
          setPlacePredictions([]);
          setTotalSearchCount(0);
          setSearchPage(1);
          setIsSearchingPlaces(false);
          return;
        }

        setIsSearchingPlaces(true);
        setSearchPage(1);
        searchDebounceRef.current = setTimeout(async () => {
          await fetchLivePostcodes(trimmed, 1);
          try {
            const preds = await getPlacePredictions(trimmed);
            setPlacePredictions(preds);
          } catch {
            setPlacePredictions([]);
          } finally {
            setIsSearchingPlaces(false);
          }
        }, 280);
        return;
      }

      // 4. MAKANI / ONWANI TABS:
      setPlacePredictions([]);
      if (parseLatLonInput(trimmed)) {
        setLivePostcodeResults([]);
        setTotalSearchCount(0);
        setSearchPage(1);
        setIsSearchingPlaces(false);
        return;
      }
      setIsSearchingPlaces(true);
      setSearchPage(1);
      searchDebounceRef.current = setTimeout(async () => {
        await fetchLivePostcodes(trimmed, 1);
      }, 280);
    },
    [fetchLivePostcodes]
  );

  // Handle typing in search input (preserves search text when switching tabs)
  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    setIsSuggestionsOpen(true);
    runSearchByFilter(val, activeFilter);
  };

  // Handle switching the search category tab (keeps searchQuery intact and re-filters/re-queries immediately)
  const handleSelectFilterTab = (tabId: string) => {
    setActiveFilter(tabId);
    if (searchQuery.trim().length >= 2) {
      setIsResultsPanelOpen(true);
      runSearchByFilter(searchQuery, tabId);
    } else {
      setLivePostcodeResults([]);
      setPlacePredictions([]);
      setTotalSearchCount(0);
      setSearchPage(1);
    }
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
        try {
          const res = await gridService.resolvePoint({ lat: details.lat, lon: details.lng });
          const resolvedCode =
            res?.data?.cell?.hierarchyCode ||
            res?.data?.cell?.code ||
            res?.data?.postcode ||
            res?.data?.postcodeDisplay;
          if (
            res?.success &&
            res.data &&
            resolvedCode &&
            res.data.status !== "OUT_OF_BOUNDS" &&
            res.data.status !== "NOT_FOUND"
          ) {
            const customItem = buildSearchResultFromResolve(res.data, details.lat, details.lng);
            customItem.name = pred.mainText;
            customItem.buildingName = pred.mainText;
            customItem.addressLine = details.formattedAddress || pred.description;
            handleSelectItem(customItem);
            return;
          }
        } catch {
          // Do not draw static grids on resolve failure
        }
        updatePinMarker(details.lat, details.lng);
        mapInstanceRef.current?.flyTo([details.lat, details.lng], 16, { duration: 0.8 });
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

  // Handle submitting search strictly according to the selected category tab
  const handleSearchSubmit = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // 1. COORDINATES TAB: only allow lat,long coordinate lookup
    if (activeFilter === "coordinates") {
      const parsedCoord = parseLatLonInput(trimmed);
      if (parsedCoord) {
        await handleResolveSeededPoint(parsedCoord.lat, parsedCoord.lon);
      } else {
        setServiceNotice("Please enter valid coordinates (e.g. 25.1972, 55.2744) in the Coordinates tab.");
      }
      return;
    }

    // 2. POSTCODE TAB: only allow postcode or grid hierarchy code lookup
    if (activeFilter === "postcode") {
      if (parseLatLonInput(trimmed) || /[a-zA-Z\u0600-\u06FF]/.test(trimmed) || !/\d/.test(trimmed)) {
        setServiceNotice("Please enter a valid numeric postcode or grid code in the Postcode tab.");
        return;
      }
      if (livePostcodeResults.length > 0) {
        handleSelectItem(livePostcodeResults[0]);
        return;
      }
      const dotOrDashCodeMatch = trimmed.match(/^(\d{2})(?:[.-](\d{2}))?(?:[.-](\d{2}))?(?:[.-](\d{2}))?$/);
      const eightDigitMatch = trimmed.match(/^(\d{2})(\d{2})(\d{2})(\d{2})$/);
      const codeTokens = dotOrDashCodeMatch
        ? [dotOrDashCodeMatch[1], dotOrDashCodeMatch[2], dotOrDashCodeMatch[3], dotOrDashCodeMatch[4]].filter(Boolean)
        : eightDigitMatch
          ? [eightDigitMatch[1], eightDigitMatch[2], eightDigitMatch[3], eightDigitMatch[4]]
          : null;

      if (codeTokens && codeTokens.length >= 1) {
        const nextTier: TierLevel =
          codeTokens.length >= 3 ? 4 : codeTokens.length === 2 ? 3 : 2;
        const fullCode = codeTokens.join(".");
        updateHierarchyParts(codeTokens);
        setActiveTier(nextTier);
        selectedCellIdRef.current = fullCode;
        setSelectedCellId(fullCode);
        renderGrid(nextTier, selectedResult, null, false, codeTokens, fullCode);
        return;
      }
      return;
    }

    // 3. ADDRESS TAB: only allow address/building/place search
    if (activeFilter === "address") {
      if (parseLatLonInput(trimmed) || /^[\d.\-\s]+$/.test(trimmed)) {
        setServiceNotice("Please select the Postcode or Coordinates tab to search by numbers or coordinates.");
        return;
      }
      if (filteredResults.length > 0) {
        handleSelectItem(filteredResults[0]);
      }
      return;
    }

    // 4. MAKANI / ONWANI TABS:
    if (filteredResults.length > 0) {
      handleSelectItem(filteredResults[0]);
    }
  };

  // Handle resetting search
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setPlacePredictions([]);
    setLivePostcodeResults([]);
    setSearchPage(1);
    setTotalSearchCount(0);
    setIsSuggestionsOpen(false);
    setIsResultsPanelOpen(false);
    setIsResultsPanelCollapsed(false);
    setSelectedResult(null);
    clearPinMarker();
    setRightPanelOpen(true);
    setActiveTier(1);
    selectedCellIdRef.current = "";
    setSelectedCellId("");
    setSelectedCellProps(null);
    updateHierarchyParts([]);
    renderGrid(1, null, null, false, []);
  };

  // Switch Tier Level via bottom bar or breadcrumbs
  // Uses the active hierarchyParts to know which parent code belongs to each tier.
  const handleSwitchTier = (tier: TierLevel) => {
    const currentParts = hierarchyPartsRef.current;

    // Enforce tier availability: T2 requires >= 1 code part, T3 requires >= 2, T4 requires >= 3
    if (tier === 2 && currentParts.length < 1) return;
    if (tier === 3 && currentParts.length < 2) return;
    if (tier === 4 && currentParts.length < 3) return;

    if (gridTypeRef.current === "default-search" || gridTypeRef.current === "hide-grids") {
      setActiveTier(tier);
      return;
    }

    // Remember the child cell at `tier` so it can be highlighted when stepping back
    const highlightCode =
      currentParts.length >= tier ? currentParts.slice(0, tier).join(".") : "";

    // Slice hierarchy parts to the parent parts needed for `tier` (0 for T1, 1 for T2, 2 for T3, 3 for T4)
    const nextParts = tier === 4 ? currentParts.slice(0, 3) : currentParts.slice(0, tier - 1);
    const parentCode = nextParts.join(".");

    updateHierarchyParts(nextParts);
    setActiveTier(tier);

    if (tier === 1) {
      if (!selectedResult) {
        setSelectedCellProps(null);
      }
      selectedCellIdRef.current = "";
      setSelectedCellId("");
      renderGrid(1, selectedResult, null, false, [], highlightCode);
    } else {
      selectedCellIdRef.current = parentCode;
      setSelectedCellId(parentCode);
      renderGrid(
        tier,
        selectedResult,
        { code: parentCode, hierarchyCode: parentCode, tier: tier - 1 },
        false,
        nextParts,
        highlightCode
      );
    }
  };

  // Mode Switcher handler (All Grids, UAE, Hide Grids, All Tiers, Default Search)
  const handleSelectMode = (mode: PortalGridMode) => {
    setGridType(mode);
    gridTypeRef.current = mode;

    if (mode === "all-tiers") {
      handleSwitchTier(1);
    } else if (mode === "hide-grids") {
      renderSeqRef.current++;
      setIsGridLoading(false);
      setTier1Error(null);
      setTier1Empty(false);
      setServiceNotice(null);
      if (gridLayerGroupRef.current) {
        gridLayerGroupRef.current.clearLayers();
      }
      if (poiLayerGroupRef.current) {
        poiLayerGroupRef.current.clearLayers();
      }
      clearAllSvgLabels();
      if (selectedResult?.latitude && selectedResult?.longitude) {
        updatePinMarker(selectedResult.latitude, selectedResult.longitude);
      }
    } else if (mode === "default-search") {
      if (gridLayerGroupRef.current) {
        gridLayerGroupRef.current.clearLayers();
      }
      clearAllSvgLabels();
      setActiveTier(1);
      if (selectedResult) {
        updatePinMarker(selectedResult.latitude, selectedResult.longitude);
      }
    } else {
      renderGrid(activeTier, selectedResult, selectedCellProps, true, hierarchyPartsRef.current);
    }
  };

  // Breadcrumb Click Navigation
  const handleBreadcrumbClick = (step: BreadcrumbStep) => {
    handleSwitchTier(step.tier);
  };

  // Coordinate Resolution Handler via POST /api/grid/resolve
  const handleResolveSeededPoint = async (lat: number, lon: number) => {
    setIsGridLoading(true);
    setServiceNotice(null);
    try {
      const res = await gridService.resolvePoint({ lat, lon });
      const resolvedCode =
        res?.data?.cell?.hierarchyCode ||
        res?.data?.cell?.code ||
        res?.data?.postcode ||
        res?.data?.postcodeDisplay;
      if (
        res?.success &&
        res.data &&
        resolvedCode &&
        res.data.status !== "OUT_OF_BOUNDS" &&
        res.data.status !== "NOT_FOUND"
      ) {
        const item = buildSearchResultFromResolve(res.data, lat, lon);
        setLivePostcodeResults([item]);
        setSearchPage(1);
        setTotalSearchCount(1);
        await handleSelectItem(item);
        setSearchQuery(`${lat}, ${lon}`);
      } else {
        setServiceNotice("No grid cell resolved for the given coordinates.");
      }
    } catch (err: any) {
      if (err?.status === 401) {
        setServiceNotice("Your session has expired. Redirecting to login...");
      } else if (err?.status === 502 || err?.status === 503) {
        setServiceNotice("Service is starting up. Please try again shortly.");
      } else {
        setServiceNotice(sanitizeErrorMessage(err, "Failed to resolve point."));
      }
    } finally {
      setIsGridLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: { xs: "12px", md: "16px 20px", lg: "24px" },
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        gap: { xs: "16px", lg: "24px" },
        bgcolor: "#F9FBFD",
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

      {/* Main Map View Area (Search Map blue in Figma) */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          position: "relative",
          borderRadius: "8px",
          border: "1px solid #DEDEDE",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          bgcolor: "#EBF1F5",
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
              zIndex: 70,
              height: 3,
              bgcolor: "transparent",
              "& .MuiLinearProgress-bar": { bgcolor: "#0000FF" },
            }}
          />
        )}

        {/* Loading Backdrop with Circular Progress covering the map view area */}
        <Backdrop
          open={isGridLoading}
          sx={{
            position: "absolute",
            zIndex: 65,
            bgcolor: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          <CircularProgress
            size={42}
            thickness={4}
            sx={{
              color: "#0000FF",
            }}
          />
          <Typography
            sx={{
              fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
              fontSize: "13.5px",
              fontWeight: 600,
              color: "#0F172A",
              bgcolor: "rgba(255, 255, 255, 0.9)",
              px: 2,
              py: 0.6,
              borderRadius: "20px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              userSelect: "none",
            }}
          >
            Loading Grid Cells & Availability...
          </Typography>
        </Backdrop>

        {/* Tier 1 Server Error / Empty Notice Banner with Retry */}
        {tier1Error && !isGridLoading && gridType !== "hide-grids" && (
          <Box
            sx={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 45,
              bgcolor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "8px",
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", fontSize: "13px", color: "#B91C1C", fontWeight: 600 }}>
              {tier1Error}
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={() => renderGrid(1, null, null, false, [])}
              sx={{
                bgcolor: "#DC2626",
                color: "#FFFFFF",
                fontSize: "12px",
                textTransform: "none",
                fontWeight: 600,
                px: 1.5,
                py: 0.3,
                "&:hover": { bgcolor: "#B91C1C" },
              }}
            >
              Retry
            </Button>
          </Box>
        )}

        {tier1Empty && !isGridLoading && !tier1Error && gridType !== "hide-grids" && (
          <Box
            sx={{
              position: "absolute",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 45,
              bgcolor: "#F8FAFC",
              border: "1px solid #CBD5E1",
              borderRadius: "8px",
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", fontSize: "13px", color: "#475569", fontWeight: 600 }}>
              No grid cells returned by the server.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => renderGrid(1, null, null, false, [])}
              sx={{
                fontSize: "12px",
                textTransform: "none",
                fontWeight: 600,
                px: 1.5,
                py: 0.3,
              }}
            >
              Reload
            </Button>
          </Box>
        )}


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
            left: "16px",
            right: "16px",
            zIndex: 30,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          {/* Top Left: Search Bar & Dropdowns (330px width matching Figma) */}
          <ClickAwayListener
            onClickAway={() => {
              setIsSearchFocused(false);
              if (!searchQuery.trim() && !selectedResult) {
                setIsResultsPanelOpen(false);
              }
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "auto", width: 330 }}>
              {/* Search Input Box (330x38 matching Figma screenshot) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #D0E2F5",
                  height: 38,
                  pl: 1.5,
                  pr: 0,
                  overflow: "hidden",
                }}
              >
                <InputBase
                  placeholder="Search by building, street, postal code, emirates or coordinates..."
                  value={searchQuery}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsResultsPanelOpen(true);
                  }}
                  onClick={() => {
                    setIsSearchFocused(true);
                    setIsResultsPanelOpen(true);
                  }}
                  onChange={(e) => {
                    handleSearchInputChange(e.target.value);
                    setIsResultsPanelOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  sx={{
                    flex: 1,
                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                    fontSize: "13.5px",
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
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    title="Clear search"
                    sx={{ color: "#64748B", p: 0.4, mr: 0.5, "&:hover": { color: "#0F172A" } }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M5.75 5.75L10.25 10.25M10.25 5.75L5.75 10.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </IconButton>
                )}

                {/* Light Blue Magnifier Search Action Button matching screenshot */}
                <Box
                  component="button"
                  onClick={() => {
                    setIsResultsPanelOpen(true);
                    handleSearchSubmit();
                  }}
                  sx={{
                    width: 44,
                    height: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#DCEBFA",
                    color: "#0066CC",
                    border: "none",
                    borderLeft: "1px solid #D0E2F5",
                    cursor: "pointer",
                    p: 0,
                    flexShrink: 0,
                    transition: "background-color 0.15s ease",
                    "&:hover": { bgcolor: "#C8E0F8" },
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                      fill="currentColor"
                    />
                  </svg>
                </Box>
              </Box>

              {/* Filter Category Tabs (Vertical Icon + Label Pills) matching uploaded screenshot */}
              {showFilterTabs && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#FFFFFF",
                    p: "4px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    border: "1px solid #E2E8F0",
                    height: 54,
                    boxSizing: "border-box",
                  }}
                >
                  {filterTabs.map((tab, idx) => {
                    const isSelected = activeFilter === tab.id;
                    return (
                      <React.Fragment key={tab.id}>
                        {idx > 0 && (
                          <Box sx={{ width: "1px", height: "22px", bgcolor: "#F1F5F9", flexShrink: 0 }} />
                        )}
                        <Box
                          onClick={() => handleSelectFilterTab(tab.id)}
                          sx={{
                            flex: 1,
                            height: 46,
                            borderRadius: "6px",
                            bgcolor: isSelected ? "#F2F7FD" : "transparent",
                            color: isSelected ? "#0066CC" : "#1E293B",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                            cursor: "pointer",
                            userSelect: "none",
                            fontSize: "12px",
                            lineHeight: "15px",
                            fontWeight: isSelected ? 600 : 400,
                            fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                            transition: "all 0.15s ease",
                            px: 0.5,
                            "&:hover": {
                              bgcolor: isSelected ? "#F2F7FD" : "#F8FAFC",
                            },
                          }}
                        >
                          {tab.icon}
                          <span style={{ whiteSpace: "nowrap" }}>{tab.label}</span>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>
              )}

            {/* Collapsible Search Results Card (Live Backend Results Only) */}
            {isResultsPanelOpen && filteredResults.length > 0 && (
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
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    height: "30px",
                    userSelect: "none",
                    flexShrink: 0,
                    pb: isResultsPanelCollapsed ? 0 : "4px",
                  }}
                >
                  <Typography
                    onClick={() => setIsResultsPanelCollapsed(!isResultsPanelCollapsed)}
                    sx={{
                      fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                      fontStyle: "normal",
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "30px",
                      color: "#000000",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    Search Results ({displayResultsCount})
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => setIsResultsPanelCollapsed(!isResultsPanelCollapsed)}
                      title={isResultsPanelCollapsed ? "Expand Results" : "Collapse Results"}
                      sx={{ p: 0.4, color: "#64748B" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{
                          transform: isResultsPanelCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsResultsPanelOpen(false);
                      }}
                      title="Close Results"
                      sx={{ p: 0.4, color: "#64748B", "&:hover": { color: "#DC2626" } }}
                    >
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
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
                                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
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
                                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
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
                                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
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
                                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
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
                                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
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
                        component="button"
                        type="button"
                        disabled={searchPage <= 1}
                        onClick={() => {
                          if (searchPage > 1) {
                            const prev = searchPage - 1;
                            setSearchPage(prev);
                            fetchLivePostcodes(searchQuery, prev);
                          }
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "52px",
                          height: "36px",
                          cursor: searchPage > 1 ? "pointer" : "not-allowed",
                          opacity: searchPage > 1 ? 1 : 0.3,
                          border: "none",
                          bgcolor: "transparent",
                          p: 0,
                          transition: "opacity 0.15s ease",
                          "&:hover": searchPage > 1 ? { bgcolor: "#F1F5F9", borderRadius: "6px" } : {},
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke={searchPage > 1 ? "#000000" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Box>

                      {/* Number Frame */}
                      <Typography
                        sx={{
                          fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                          fontStyle: "normal",
                          fontWeight: 500,
                          fontSize: "14px",
                          lineHeight: "30px",
                          color: "#334155",
                          userSelect: "none",
                        }}
                      >
                        {searchPage} of {totalPages}
                      </Typography>

                      {/* Next Frame */}
                      <Box
                        component="button"
                        type="button"
                        disabled={searchPage >= totalPages}
                        onClick={() => {
                          if (searchPage < totalPages) {
                            const next = searchPage + 1;
                            setSearchPage(next);
                            fetchLivePostcodes(searchQuery, next);
                          }
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "52px",
                          height: "36px",
                          cursor: searchPage < totalPages ? "pointer" : "not-allowed",
                          opacity: searchPage < totalPages ? 1 : 0.3,
                          border: "none",
                          bgcolor: "transparent",
                          p: 0,
                          transition: "opacity 0.15s ease",
                          "&:hover": searchPage < totalPages ? { bgcolor: "#F1F5F9", borderRadius: "6px" } : {},
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M9 6L15 12L9 18" stroke={searchPage < totalPages ? "#0000FF" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </ClickAwayListener>

          {/* Top Right: Grid Switcher (All Grids | UAE | Hide Grids) */}
          <Box
            sx={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            {/* Grid Type Switcher: All Grids | UAE | Hide Grids */}
            {gridType !== "default-search" && (
              <Box
                sx={{
                  height: 40,
                  bgcolor: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #DEDEDE",
                  p: "3px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  boxSizing: "border-box",
                  userSelect: "none",
                }}
              >
                <Box
                  onClick={() => handleSelectMode("full-grid")}
                  sx={{
                    px: 1.6,
                    height: 32,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    cursor: "pointer",
                    bgcolor: gridType === "full-grid" ? "#0000FF" : "transparent",
                    color: gridType === "full-grid" ? "#FFFFFF" : "#64748B",
                    fontWeight: gridType === "full-grid" ? 700 : 500,
                    fontSize: "13px",
                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: gridType === "full-grid" ? "#0000FF" : "#F1F5F9",
                    },
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  <span>All Grids</span>
                </Box>
                <Box
                  onClick={() => handleSelectMode("unmasked")}
                  sx={{
                    px: 1.6,
                    height: 32,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    cursor: "pointer",
                    bgcolor: gridType === "unmasked" ? "#0000FF" : "transparent",
                    color: gridType === "unmasked" ? "#FFFFFF" : "#64748B",
                    fontWeight: gridType === "unmasked" ? 700 : 500,
                    fontSize: "13px",
                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: gridType === "unmasked" ? "#0000FF" : "#F1F5F9",
                    },
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M13.5 2.5C9.5 2.5 5 6 3 13C5 12 8 11.5 10 9L13.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M7 8L10 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span>UAE</span>
                </Box>
                <Box
                  onClick={() => handleSelectMode("hide-grids")}
                  sx={{
                    px: 1.6,
                    height: 32,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    cursor: "pointer",
                    bgcolor: gridType === "hide-grids" ? "#0000FF" : "transparent",
                    color: gridType === "hide-grids" ? "#FFFFFF" : "#64748B",
                    fontWeight: gridType === "hide-grids" ? 700 : 500,
                    fontSize: "13px",
                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: gridType === "hide-grids" ? "#0000FF" : "#F1F5F9",
                    },
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M6.5 6.5A2 2 0 009.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M4.2 4.3C2.8 5.3 1.8 6.6 1.3 8C2.5 11.1 5 13 8 13C9.3 13 10.6 12.6 11.7 11.8M6.2 3.2C6.8 3.1 7.4 3 8 3C11 3 13.5 4.9 14.7 8C14.2 9.1 13.5 10.1 12.6 10.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Hide Grids</span>
                </Box>
              </Box>
            )}

            {/* Toggle Right Panel Button (if closed) */}
            {!rightPanelOpen && (
              <Button
                variant="contained"
                onClick={() => setRightPanelOpen(true)}
                sx={{
                  bgcolor: "#FFFFFF",
                  color: "#0000FF",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #DEDEDE",
                  height: 40,
                  px: 1.5,
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                {selectedResult ? "View Details" : "View Statistics"}
              </Button>
            )}
          </Box>
        </Box>

        {/* Floating Breadcrumb Trail (rendered above Grid Level bar when drilled down) */}
        {breadcrumbs.length > 1 && gridType !== "default-search" && gridType !== "hide-grids" && (
          <Box
            sx={{
              position: "absolute",
              bottom: "76px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 30,
              bgcolor: "#FFFFFF",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
              border: "1px solid #DEDEDE",
              px: 1.5,
              py: 0.8,
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              userSelect: "none",
              pointerEvents: "auto",
            }}
          >
            <Typography sx={{ fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", fontSize: "12px", fontWeight: 600, color: "#64748B" }}>
              Lineage:
            </Typography>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <Box key={crumb.code + crumb.tier} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  {idx > 0 && (
                    <Typography sx={{ color: "#94A3B8", fontSize: "11px", fontWeight: 600 }}>
                      ›
                    </Typography>
                  )}
                  <Box
                    onClick={() => {
                      if (!isLast) {
                        handleSwitchTier(crumb.tier);
                      }
                    }}
                    sx={{
                      cursor: isLast ? "default" : "pointer",
                      fontSize: "12px",
                      fontWeight: isLast ? 700 : 500,
                      color: isLast ? "#0000FF" : "#64748B",
                      fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                      px: 0.8,
                      py: 0.3,
                      borderRadius: "4px",
                      bgcolor: isLast ? "rgba(0, 0, 255, 0.08)" : "transparent",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        color: isLast ? "#0000FF" : "#1D4ED8",
                        bgcolor: isLast ? "rgba(0, 0, 255, 0.08)" : "#F1F5F9",
                      },
                    }}
                  >
                    {crumb.label}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Bottom Center Floating: Grid Level (T1, T2, T3, T4) matching Figma - Exactly 377px x 50px (Hidden in Default Search and Hide Grids) */}
        {gridType !== "default-search" && gridType !== "hide-grids" && (
          <Box
            sx={{
              position: "absolute",
              bottom: "16px",
              left: "50%",
              transform: "translateX(-50%)",
            zIndex: 30,
            width: 377,
            height: 50,
            bgcolor: "#FFFFFF",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            border: "1px solid #DEDEDE",
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            userSelect: "none",
            pointerEvents: "auto",
            boxSizing: "border-box",
          }}
        >
          <Typography sx={{ fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif", fontSize: "14px", fontWeight: 600, color: "#5F646D" }}>
            Grid Level:
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {[
              {
                tier: 1,
                label: "T1",
                activeBg: "#0000FF",
                activeColor: "#FFFFFF",
                icon: (
                  <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                    <path d="M4 14L2 8L7 3L13 2L17 6L18 12L13 17L8 16L4 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                tier: 2,
                label: "T2",
                activeBg: "#EB861F",
                activeColor: "#FFFFFF",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                  </svg>
                ),
              },
              {
                tier: 3,
                label: "T3",
                activeBg: "#3F8E50",
                activeColor: "#FFFFFF",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                  </svg>
                ),
              },
              {
                tier: 4,
                label: "T4",
                activeBg: "#7E1BFE",
                activeColor: "#FFFFFF",
                icon: (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="1" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="1" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                    <rect x="9.5" y="9.5" width="5.5" height="5.5" stroke="currentColor" strokeWidth="1.5" rx="1" />
                  </svg>
                ),
              },
            ].map(({ tier, label, icon, activeBg, activeColor }) => {
              const isSelected = activeTier === tier;
              const isEnabled =
                tier === 1 || (tier <= activeTier && hierarchyParts.length >= tier - 1);
              return (
                <Box
                  component="button"
                  type="button"
                  key={tier}
                  disabled={!isEnabled}
                  title={
                    isEnabled
                      ? `Switch to Tier ${tier}`
                      : `Select a grid cell in Tier ${tier - 1} first`
                  }
                  onClick={() => {
                    if (isEnabled) {
                      handleSwitchTier(tier as TierLevel);
                    }
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.6,
                    height: 34,
                    px: 1.4,
                    borderRadius: "6px",
                    cursor: isEnabled ? "pointer" : "not-allowed",
                    opacity: isEnabled ? 1 : 0.45,
                    bgcolor: isSelected ? activeBg : isEnabled ? "#F8FAFC" : "#F1F5F9",
                    border: isSelected ? "none" : "1px solid #E2E8F0",
                    color: isSelected ? activeColor : isEnabled ? "#0F172A" : "#94A3B8",
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                    "&:hover": isEnabled
                      ? {
                          opacity: 0.9,
                          bgcolor: isSelected ? activeBg : "#F1F5F9",
                        }
                      : {},
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </Box>
              );
            })}
          </Box>
        </Box>
        )}

        {/* Bottom Right Floating Map Controls: Single vertical card matching Figma 40x160 */}
        <Box
          sx={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            zIndex: 30,
            width: 40,
            height: 160,
            bgcolor: "#FFFFFF",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            border: "1px solid #DEDEDE",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
            boxSizing: "border-box",
          }}
        >
          {/* Zoom In Button (+), height 40 */}
          <Box
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In"
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderBottom: "1px solid #F1F5F9",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M8 3V13" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Box>

          {/* Zoom Out Button (-), height 40 */}
          <Box
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out"
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderBottom: "1px solid #F1F5F9",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Box>

          {/* Compass / Reset North, height 40 */}
          <Box
            onClick={() => {
              if (selectedResult) {
                mapInstanceRef.current?.flyTo([selectedResult.latitude, selectedResult.longitude], 17);
              } else {
                mapInstanceRef.current?.setView([24.4539, 54.3773], 7);
              }
            }}
            title="Reset North / Orientation"
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderBottom: "1px solid #F1F5F9",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="12 2 15 11 12 9 9 11 12 2" fill="#DC2626" />
              <polygon points="12 22 9 13 12 15 15 13 12 22" fill="#64748B" />
              <circle cx="12" cy="12" r="1.5" fill="#0F172A" />
            </svg>
          </Box>

          {/* Target / Locate Me Button, height 40 */}
          <Box
            onClick={() => {
              if (selectedResult) {
                mapInstanceRef.current?.flyTo([selectedResult.latitude, selectedResult.longitude], 17);
              } else {
                mapInstanceRef.current?.flyTo([24.4, 54.4], 7);
              }
            }}
            title="Locate / Center Target"
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background-color 0.15s ease",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="#000000" strokeWidth="1.5" />
              <circle cx="10" cy="10" r="2.5" stroke="#000000" strokeWidth="1.5" />
              <path d="M10 1V4M10 16V19M1 10H4M16 10H19" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Box>
        </Box>
      </Box>

      {/* Right Side Panel (Grid Statistics or Postcode Details) matching Figma 330px width */}
      <Box
        sx={{
          width: rightPanelOpen ? { xs: "280px", sm: "300px", lg: "330px" } : "0px",
          minWidth: rightPanelOpen ? { xs: "280px", sm: "300px", lg: "330px" } : "0px",
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
            <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
              Google Maps API: RefererNotAllowedMapError
            </Typography>
            <Typography sx={{ fontSize: "11.5px", color: "#64748B", fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif" }}>
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

      {/* Backend Service Transient Alert (Render 502 / Wakeup / Empty Tier Notice) */}
      <Snackbar
        open={Boolean(serviceNotice)}
        autoHideDuration={8000}
        onClose={() => setServiceNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{
          bottom: { xs: 24, md: 32 },
          right: rightPanelOpen ? { xs: 16, md: 440 } : { xs: 16, md: 32 },
          transition: "right 0.25s ease",
          zIndex: 40,
        }}
      >
        <Alert
          severity="info"
          sx={{
            fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
            fontSize: "12.5px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
          }}
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  renderGrid(
                    activeTier,
                    selectedResult,
                    selectedCellProps,
                    false,
                    hierarchyPartsRef.current
                  )
                }
                sx={{
                  fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
                  fontSize: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 1,
                  py: 0.2,
                }}
              >
                Retry
              </Button>
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setServiceNotice(null)}
                sx={{ p: 0.4 }}
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          }
        >
          {serviceNotice}
        </Alert>
      </Snackbar>
    </Box>
  );
}

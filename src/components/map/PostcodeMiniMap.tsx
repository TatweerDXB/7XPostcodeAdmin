"use client";

import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { Map as LeafletMap, LayerGroup, LatLngBounds } from "leaflet";
import {
  gridService,
  GeoJsonFeature,
  GeoJsonGeometry,
  GridCellProperties,
  getMaskState,
} from "@/services/gridService";
import type { PostcodeHierarchyItem } from "@/data/postcodeListData";

export interface PostcodeTierChips {
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
}

interface PostcodeMiniMapProps {
  latitude: number;
  longitude: number;
  activeTier?: 1 | 2 | 3 | 4;
  chips?: PostcodeTierChips;
  chipTier4?: string;
  geometryGeoJson?: unknown;
  hierarchy?: PostcodeHierarchyItem[];
  onSelectTier?: (tier: 1 | 2 | 3 | 4) => void;
  onExpandMap?: () => void;
}

// Session-level caches so switching T1 / T2 / T3 / T4 is instant
const tierCellsCache = new Map<string, Promise<GeoJsonFeature[]>>();
const partialCellsCache = new Map<string, Promise<GeoJsonFeature[]>>();

/** Converts GeoJSON Polygon or MultiPolygon coordinates ([lon, lat]) into Leaflet LatLng tuples ([lat, lon]). */
export function extractPolygonLatLngs(
  geometry: GeoJsonGeometry | string | unknown | undefined | null
): [number, number][] | [number, number][][] | null {
  if (!geometry) return null;
  let geomObj: GeoJsonGeometry;
  if (typeof geometry === "string") {
    try {
      geomObj = JSON.parse(geometry) as GeoJsonGeometry;
    } catch {
      return null;
    }
  } else {
    geomObj = geometry as GeoJsonGeometry;
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

/** Resolves full dot-separated hierarchy code and 2-digit short code from cell properties. */
export function resolveFeatureCodes(
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

/** Fetches grid cells for a given tier & parent code, expanding any PARTIAL boundary cells. */
export async function fetchTierGridFeatures(
  tier: 1 | 2 | 3 | 4,
  parentCode?: string
): Promise<GeoJsonFeature[]> {
  const key = `${tier}:${parentCode || "ALL"}`;
  let pending = tierCellsCache.get(key);
  if (!pending) {
    pending = (async () => {
      try {
        const res = await gridService.getCells(
          {
            tier,
            code: parentCode,
            Page: 1,
            PageSize: 1000,
          },
          { retries: 0 }
        );
        if (!res?.success || !Array.isArray(res.data?.features)) {
          tierCellsCache.delete(key);
          return [];
        }
        return res.data.features;
      } catch {
        tierCellsCache.delete(key);
        return [];
      }
    })();
    tierCellsCache.set(key, pending);
  }
  return pending;
}

export async function fetchPartialSubFeatures(gridId: string): Promise<GeoJsonFeature[]> {
  let pending = partialCellsCache.get(gridId);
  if (!pending) {
    pending = (async () => {
      try {
        const res = await gridService.getPartialCells(gridId, { retries: 0 });
        if (res?.success && Array.isArray(res.data?.features)) {
          return res.data.features;
        }
        return [];
      } catch {
        partialCellsCache.delete(gridId);
        return [];
      }
    })();
    partialCellsCache.set(gridId, pending);
  }
  return pending;
}

export interface RenderPostcodeTierOptions {
  L: typeof import("leaflet");
  map: LeafletMap;
  gridLayer: LayerGroup;
  activeTier: 1 | 2 | 3 | 4;
  chips: PostcodeTierChips;
  latitude: number;
  longitude: number;
  geometryGeoJson?: unknown;
  hierarchy?: PostcodeHierarchyItem[];
  isMiniMap?: boolean;
  onSelectTier?: (tier: 1 | 2 | 3 | 4) => void;
  isCancelled: () => boolean;
}

/**
 * Shared Search-Console-style Grid & Polygon renderer used by both
 * PostcodeMiniMap and PostcodeExpandedMapModal.
 */
export async function renderPostcodeTierOnMap({
  L,
  map,
  gridLayer,
  activeTier,
  chips,
  latitude,
  longitude,
  geometryGeoJson,
  hierarchy,
  isMiniMap = true,
  onSelectTier,
  isCancelled,
}: RenderPostcodeTierOptions): Promise<LatLngBounds | null> {
  gridLayer.clearLayers();

  const parts = [
    chips.tier1 || "00",
    chips.tier2 || "00",
    chips.tier3 || "00",
    chips.tier4 || "00",
  ];

  const parentCode =
    activeTier === 1
      ? undefined
      : activeTier === 2
      ? parts[0]
      : activeTier === 3
      ? `${parts[0]}.${parts[1]}`
      : `${parts[0]}.${parts[1]}.${parts[2]}`;

  const expectedSelectedCode = parts.slice(0, activeTier).join(".");
  const expectedShortCode = parts[activeTier - 1];

  // 1. Add Red Pin Marker at exact [latitude, longitude] (matching Search Console GoogleMapView.tsx)
  const addPinMarker = () => {
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
    L.marker([latitude, longitude], {
      icon: pinIcon,
      zIndexOffset: 1200,
    }).addTo(gridLayer);
  };

  // Helper to add a 2-digit cell label at a center point
  const addCellLabel = (center: import("leaflet").LatLng, text: string, isSelected: boolean, isMasked: boolean) => {
    const fontSize = activeTier === 1 ? "12px" : activeTier === 2 ? "11.5px" : "11px";
    const color = isSelected ? "#0000FF" : isMasked ? "#64748B" : "#0F172A";
    const labelHtml = `<div style="font-family: var(--font-titillium), 'Titillium Web', sans-serif; font-size: ${fontSize}; font-weight: 700; color: ${color}; text-align: center; line-height: 1; user-select: none; white-space: nowrap; text-shadow: -1.5px -1.5px 0 rgba(255,255,255,0.95), 1.5px -1.5px 0 rgba(255,255,255,0.95), -1.5px 1.5px 0 rgba(255,255,255,0.95), 1.5px 1.5px 0 rgba(255,255,255,0.95);">${text}</div>`;
    const labelIcon = L.divIcon({
      className: "grid-cell-label",
      html: labelHtml,
      iconSize: [28, 16],
      iconAnchor: [14, 8],
    });
    L.marker(center, { icon: labelIcon, interactive: false }).addTo(gridLayer);
  };

  // 2. Check immediate geometry from GET /api/postcodes/{postcode} hierarchy
  const tierHierarchyEntry = hierarchy?.find((h) => h.tier === activeTier);
  const rawTargetGeom =
    tierHierarchyEntry?.geometryGeoJson ?? (activeTier === 4 ? geometryGeoJson : undefined);
  const targetLatLngs = extractPolygonLatLngs(rawTargetGeom);
  let targetPolyBounds: LatLngBounds | null = null;

  const parentHierarchyEntry =
    activeTier > 1 ? hierarchy?.find((h) => h.tier === activeTier - 1) : undefined;
  const parentLatLngs = extractPolygonLatLngs(parentHierarchyEntry?.geometryGeoJson);
  const parentPolyBounds: LatLngBounds | null = parentLatLngs
    ? L.polygon(parentLatLngs).getBounds()
    : null;

  // Immediately draw the target polygon from GET /api/postcodes/{postcode} so there is zero delay
  if (targetLatLngs) {
    const immPoly = L.polygon(targetLatLngs, {
      color: "#0000FF",
      weight: 2.5,
      fill: true,
      fillColor: "rgba(0, 0, 255, 0.08)",
      fillOpacity: 0.12,
    }).addTo(gridLayer);
    targetPolyBounds = immPoly.getBounds();
    addCellLabel(targetPolyBounds.getCenter(), expectedShortCode, true, false);
  }
  addPinMarker();

  // Compute best camera bounds helper
  const applyCameraBounds = (allGridBounds: LatLngBounds | null, selBounds: LatLngBounds | null) => {
    const focusBounds = selBounds || targetPolyBounds;
    if (activeTier === 4) {
      if (isMiniMap && focusBounds?.isValid()) {
        map.fitBounds(focusBounds.pad(2.2), { padding: [16, 16], maxZoom: 18 });
        return focusBounds.pad(2.2);
      }
      if (allGridBounds?.isValid()) {
        map.fitBounds(allGridBounds, { padding: [24, 24], maxZoom: 18 });
        return allGridBounds;
      }
      if (focusBounds?.isValid()) {
        map.fitBounds(focusBounds.pad(2.5), { padding: [20, 20], maxZoom: 18 });
        return focusBounds.pad(2.5);
      }
    } else if (activeTier === 3 || activeTier === 2) {
      if (isMiniMap && focusBounds?.isValid()) {
        map.fitBounds(focusBounds.pad(1.8), { padding: [16, 16] });
        return focusBounds.pad(1.8);
      }
      if (allGridBounds?.isValid()) {
        map.fitBounds(allGridBounds, { padding: [24, 24] });
        return allGridBounds;
      }
      if (parentPolyBounds?.isValid()) {
        map.fitBounds(parentPolyBounds, { padding: [20, 20] });
        return parentPolyBounds;
      }
      if (focusBounds?.isValid()) {
        map.fitBounds(focusBounds.pad(1.8), { padding: [20, 20] });
        return focusBounds.pad(1.8);
      }
    } else {
      // Tier 1
      if (isMiniMap && focusBounds?.isValid()) {
        map.fitBounds(focusBounds.pad(1.2), { padding: [16, 16] });
        return focusBounds.pad(1.2);
      }
      if (allGridBounds?.isValid()) {
        map.fitBounds(allGridBounds, { padding: [24, 24] });
        return allGridBounds;
      }
      if (focusBounds?.isValid()) {
        map.fitBounds(focusBounds.pad(1.2), { padding: [20, 20] });
        return focusBounds.pad(1.2);
      }
    }
    map.setView([latitude, longitude], activeTier === 4 ? 17 : activeTier === 3 ? 14 : activeTier === 2 ? 11 : 8);
    return null;
  };

  // Fit immediately using hierarchy geometry if available
  applyCameraBounds(parentPolyBounds, targetPolyBounds);

  // 3. Fetch full sibling grid for activeTier via GET /api/grid/cells (just like /search)
  const features = await fetchTierGridFeatures(activeTier, parentCode);
  if (isCancelled()) return targetPolyBounds;

  if (features.length > 0) {
    // Expand any PARTIAL cells
    const partialIds: string[] = [];
    features.forEach((f) => {
      if (getMaskState(f.properties || {}) === "PARTIAL") {
        const gId = String(f.properties?.gridId || f.properties?.id || f.id || "");
        if (gId && !partialIds.includes(gId)) partialIds.push(gId);
      }
    });

    const partialMap = new Map<string, GeoJsonFeature[]>();
    if (partialIds.length > 0) {
      await Promise.all(
        partialIds.map(async (gId) => {
          const subs = await fetchPartialSubFeatures(gId);
          if (subs.length > 0) partialMap.set(gId, subs);
        })
      );
      if (isCancelled()) return targetPolyBounds;
    }

    // Re-draw gridLayer with all sibling cells + selected cell + pin
    gridLayer.clearLayers();
    const allBounds = L.latLngBounds([]);
    let foundSelectedBounds: LatLngBounds | null = null;
    const labeledCodes = new Set<string>();

    const drawFeaturePolygon = (
      feat: GeoJsonFeature,
      parentBoundsOverride: LatLngBounds | null,
      shouldLabel: boolean
    ) => {
      const props = feat.properties || {};
      const { fullCode, shortCode } = resolveFeatureCodes(props, parentCode);
      if (!fullCode) return;

      const latlngs = extractPolygonLatLngs(feat.geometry);
      if (!latlngs) return;

      const maskState = getMaskState(props);
      const isMasked = maskState === "MASKED";
      const isSelected = Boolean(
        fullCode === expectedSelectedCode ||
          (activeTier === 1 && shortCode === expectedShortCode) ||
          shortCode === expectedShortCode
      );
      const isTier4 = activeTier === 4;

      const fillColor = isSelected
        ? "rgba(0, 0, 255, 0.08)"
        : isTier4
        ? "#0000FF"
        : isMasked
        ? "rgba(148, 163, 184, 0.35)"
        : "#FFFFFF";
      const fillOpacity = isSelected ? 0.14 : isTier4 ? 0 : isMasked ? 0.45 : 0.35;
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
      }).addTo(gridLayer);

      const effectiveBounds = parentBoundsOverride || poly.getBounds();
      allBounds.extend(poly.getBounds());

      if (isSelected) {
        foundSelectedBounds = effectiveBounds;
        poly.bringToFront();
      }

      if (activeTier < 4 && onSelectTier) {
        poly.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectTier((activeTier + 1) as 1 | 2 | 3 | 4);
        });
      }

      if (shouldLabel && shortCode) {
        addCellLabel(effectiveBounds.getCenter(), shortCode, isSelected, isMasked);
      }
    };

    features.forEach((feat) => {
      const props = feat.properties || {};
      const { fullCode } = resolveFeatureCodes(props, parentCode);
      const parentLatLngsFeat = extractPolygonLatLngs(feat.geometry);
      const pBounds = parentLatLngsFeat ? L.polygon(parentLatLngsFeat).getBounds() : null;

      if (getMaskState(props) === "PARTIAL") {
        const gId = String(props.gridId || props.id || feat.id || "");
        const subs = gId ? partialMap.get(gId) : undefined;
        if (subs && subs.length > 0) {
          const sortedSubs = [...subs].sort((a, b) => {
            const aUnmasked = getMaskState(a.properties || {}) === "UNMASKED" ? 0 : 1;
            const bUnmasked = getMaskState(b.properties || {}) === "UNMASKED" ? 0 : 1;
            return aUnmasked - bUnmasked;
          });
          sortedSubs.forEach((subFeat) => {
            const subProps: GridCellProperties = {
              ...props,
              ...(subFeat.properties || {}),
              hierarchyCode: subFeat.properties?.hierarchyCode || props.hierarchyCode,
              code: subFeat.properties?.code || props.code,
            };
            const bindOnce = Boolean(fullCode && !labeledCodes.has(fullCode));
            if (bindOnce && fullCode) labeledCodes.add(fullCode);
            drawFeaturePolygon({ ...subFeat, properties: subProps }, pBounds, bindOnce);
          });
          return;
        }
      }

      const bindOnce = Boolean(fullCode && !labeledCodes.has(fullCode));
      if (bindOnce && fullCode) labeledCodes.add(fullCode);
      drawFeaturePolygon(feat, pBounds, bindOnce);
    });

    // If the target cell wasn't returned in features, still draw its exact geometry from hierarchy
    if (!foundSelectedBounds && targetLatLngs) {
      const targetPoly = L.polygon(targetLatLngs, {
        color: "#0000FF",
        weight: 2.5,
        fill: true,
        fillColor: "rgba(0, 0, 255, 0.08)",
        fillOpacity: 0.14,
      }).addTo(gridLayer);
      foundSelectedBounds = targetPoly.getBounds();
      allBounds.extend(foundSelectedBounds);
      addCellLabel(foundSelectedBounds.getCenter(), expectedShortCode, true, false);
    }

    addPinMarker();
    return applyCameraBounds(allBounds, foundSelectedBounds);
  }

  return targetPolyBounds;
}

export default function PostcodeMiniMap({
  latitude,
  longitude,
  activeTier = 4,
  chips,
  chipTier4 = "00",
  geometryGeoJson,
  hierarchy,
  onSelectTier,
  onExpandMap,
}: PostcodeMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const gridLayerRef = useRef<LayerGroup | null>(null);
  const lastBoundsRef = useRef<LatLngBounds | null>(null);

  const effectiveChips: PostcodeTierChips = chips || {
    tier1: "00",
    tier2: "00",
    tier3: "00",
    tier4: chipTier4,
  };

  // Initialize Leaflet map instance once per mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };
      const container = mapContainerRef.current as LeafletContainer;
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 17,
        minZoom: 6,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;
      gridLayerRef.current = L.layerGroup().addTo(map);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // Google Maps Roadmap layer (same as Search Console)
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
      }).addTo(map);
    });

    return () => {
      isMounted = false;
      gridLayerRef.current = null;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render grid and polygons whenever postcode, coordinates, hierarchy, or activeTier changes
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const L = await import("leaflet");
      if (cancelled) return;

      // Wait briefly if map is still initializing
      let attempts = 0;
      while ((!mapInstanceRef.current || !gridLayerRef.current) && attempts < 10) {
        await new Promise((r) => setTimeout(r, 40));
        if (cancelled) return;
        attempts++;
      }

      const map = mapInstanceRef.current;
      const gridLayer = gridLayerRef.current;
      if (!map || !gridLayer) return;

      map.invalidateSize();

      const bounds = await renderPostcodeTierOnMap({
        L,
        map,
        gridLayer,
        activeTier,
        chips: effectiveChips,
        latitude,
        longitude,
        geometryGeoJson,
        hierarchy,
        isMiniMap: true,
        onSelectTier,
        isCancelled: () => cancelled,
      });
      if (!cancelled) {
        lastBoundsRef.current = bounds;
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    latitude,
    longitude,
    activeTier,
    effectiveChips.tier1,
    effectiveChips.tier2,
    effectiveChips.tier3,
    effectiveChips.tier4,
    geometryGeoJson,
    hierarchy,
    onSelectTier,
  ]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) {
      if (lastBoundsRef.current?.isValid()) {
        mapInstanceRef.current.fitBounds(lastBoundsRef.current, { padding: [16, 16] });
      } else {
        mapInstanceRef.current.setView([latitude, longitude], 17);
      }
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 240,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
      }}
    >
      <Box
        ref={mapContainerRef}
        sx={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Top Right: Expand Map Icon Button */}
      {onExpandMap && (
        <Tooltip title="Expand Map" placement="left">
          <Box
            onClick={onExpandMap}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 28,
              height: 28,
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 500,
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "#F8FAFC",
                transform: "scale(1.05)",
              },
            }}
          >
            {/* Diagonal Expand Arrows SVG */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2H14V6M14 2L9.5 6.5M6 14H2V10M2 14L6.5 9.5"
                stroke="#1E293B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Tooltip>
      )}

      {/* Right Edge: Vertical Map Action Controls (Location, Zoom +, Zoom -, Layers) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          right: 10,
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* Recenter / My Location Button */}
        <Tooltip title="Recenter" placement="left">
          <Box
            onClick={handleRecenter}
            sx={{
              width: 24,
              height: 24,
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="7" stroke="#475569" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.5" fill="#475569" />
              <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Box>
        </Tooltip>

        {/* Zoom In */}
        <Box
          onClick={handleZoomIn}
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "4px 4px 0 0",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderBottom: "1px solid #F1F5F9",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13M8 3V13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        {/* Zoom Out */}
        <Box
          onClick={handleZoomOut}
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        {/* Layers Button */}
        <Box
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "4px",
            boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            mt: "2px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import type { Map as LeafletMap, LayerGroup, Marker, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { gridService, type GeoJsonFeature, type GeoJsonGeometry } from "@/services/gridService";
import { sanitizeHtml } from "@/utils/security";
import { TIER_THEMES } from "./AddAddressMap";

/** One real grid cell of the record's hierarchy (T1 → T4). */
export interface RegistryGridCell {
  tier: 1 | 2 | 3 | 4;
  gridId: string;
  /** The cell's own segment of its hierarchy code, e.g. "65" for "27.85.14.65" */
  segment: string;
  geometry: GeoJsonGeometry | null;
}

interface AddressRegistryGridMapProps {
  activeTier: 1 | 2 | 3 | 4;
  /** The record's cells, T1 → T4 (from its coordinates, see loadHierarchyAtPoint) */
  hierarchy: RegistryGridCell[];
  latitude?: number;
  longitude?: number;
  /** The hierarchy request is still running */
  loading?: boolean;
}

/** Last segment of a hierarchy code ("27.85.14.65" / "27-85-14-65" → "65"). */
export function codeSegment(code?: string | null): string {
  if (!code) return "";
  return code.split(/[.-]/).pop() || code;
}

/** Outlines are a JSON string on detail responses and an object on list features. */
export function parseGeometry(geometry: unknown): GeoJsonGeometry | null {
  if (!geometry) return null;
  if (typeof geometry === "string") {
    try {
      return JSON.parse(geometry) as GeoJsonGeometry;
    } catch {
      return null;
    }
  }
  return geometry as GeoJsonGeometry;
}

const UAE_CENTER: [number, number] = [24.8, 54.0];
const UAE_ZOOM = 7;

// Cells of one tier per parent ("root" = all T1 cells). In memory per tab; the routes are also browser-cached.
const siblingsCache = new Map<string, Promise<GeoJsonFeature[]>>();

function loadSiblings(parentGridId: string | null): Promise<GeoJsonFeature[]> {
  const key = parentGridId ?? "root";
  let cached = siblingsCache.get(key);
  if (!cached) {
    const request = parentGridId
      ? gridService.getCellChildren(parentGridId, { PageSize: 100 }, { retries: 0 })
      : gridService.getCells({ tier: 1, PageSize: 1000 }, { retries: 0 });
    cached = request
      .then((res) => (Array.isArray(res?.data?.features) ? res.data.features : []))
      .catch((err) => {
        siblingsCache.delete(key);
        throw err;
      });
    siblingsCache.set(key, cached);
  }
  return cached;
}

// Hierarchy per point; in memory per tab (resolve has its own budget: 120 per user per minute)
const hierarchyCache = new Map<string, Promise<RegistryGridCell[]>>();

/**
 * The T1 → T4 cells containing a point, with their outlines (contract §4 "Lazy grid loading"):
 * POST /api/grid/resolve (codes + ids, no geometry), then one GET /api/grid/cells/by-codes for the outlines.
 * RESOLVED gives T1–T4; RESOLVED_COARSE stops at T3; OUTSIDE_GRID gives no cells.
 */
export function loadHierarchyAtPoint(latitude: number, longitude: number): Promise<RegistryGridCell[]> {
  const key = `${latitude},${longitude}`;
  let cached = hierarchyCache.get(key);
  if (!cached) {
    cached = (async () => {
      const res = await gridService.resolvePoint({ lat: latitude, lon: longitude, srid: 4326 }, { retries: 0 });
      const r = res?.data;
      if (!r || (r.status !== "RESOLVED" && r.status !== "RESOLVED_COARSE")) return [];

      // hierarchy[] plus the resolved cell itself, one entry per tier
      const byTier = new Map<number, { gridId: string; code: string }>();
      (r.hierarchy ?? []).forEach((h) => {
        if (h.gridId && h.tier >= 1 && h.tier <= 4) {
          byTier.set(h.tier, { gridId: String(h.gridId), code: h.hierarchyCode ?? h.code ?? "" });
        }
      });
      const cellTier = Number(r.cell?.tier);
      if (r.cell?.gridId && cellTier >= 1 && cellTier <= 4) {
        byTier.set(cellTier, { gridId: String(r.cell.gridId), code: r.cell.hierarchyCode ?? r.cell.code ?? "" });
      }

      // Outlines of those cells in one call (codes sorted so the browser cache gets identical URLs)
      const codes = [...byTier.values()].map((c) => c.code).filter(Boolean).sort();
      let features: GeoJsonFeature[] = [];
      if (codes.length > 0) {
        try {
          const outlines = await gridService.getCellsByCodes(codes, { retries: 0 });
          features = Array.isArray(outlines?.data?.features) ? outlines.data.features : [];
        } catch {
          // no outlines: chips still work, the map draws the tiers' sibling cells
        }
      }

      return [...byTier.entries()]
        .sort(([a], [b]) => a - b)
        .map(([tier, c]) => {
          const feature = features.find((f) => {
            const p = f.properties ?? {};
            return String(p.gridId ?? p.id ?? f.id ?? "") === c.gridId || p.hierarchyCode === c.code;
          });
          return {
            tier: tier as 1 | 2 | 3 | 4,
            gridId: c.gridId,
            segment: codeSegment(c.code),
            geometry: parseGeometry(feature?.geometry),
          };
        });
    })().catch((err) => {
      hierarchyCache.delete(key);
      throw err;
    });
    hierarchyCache.set(key, cached);
  }
  return cached;
}

const PIN_HTML = `
  <div style="position: relative; width: 32px; height: 38px;">
    <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="registryPinShadow" x="0" y="0" width="32" height="38" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
      </filter>
      <g filter="url(#registryPinShadow)">
        <path d="M16 2C9.37 2 4 7.37 4 14C4 22.5 16 34 16 34C16 34 28 22.5 28 14C28 7.37 22.63 2 16 2Z" fill="#DC2626"/>
        <circle cx="16" cy="14" r="5" fill="#FFFFFF"/>
      </g>
    </svg>
  </div>
`;

const noteSx = {
  position: "absolute",
  left: 8,
  bottom: 8,
  zIndex: 1000,
  bgcolor: "rgba(255,255,255,0.92)",
  borderRadius: "4px",
  p: "4px 8px",
} as const;

/**
 * Read-only map of a registry record on the real postcode grid (contract §4 "Lazy grid loading"):
 * the cells of the active tier (T1: all T1 cells; T2–T4: children of the record's parent cell),
 * the record's own cell highlighted, and the pin on the record's coordinates.
 */
export default function AddressRegistryGridMap({
  activeTier,
  hierarchy,
  latitude,
  longitude,
  loading = false,
}: AddressRegistryGridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [drawnKey, setDrawnKey] = useState<string | null>(null);
  const [siblingsFailed, setSiblingsFailed] = useState(false);

  const activeCell = hierarchy.find((c) => c.tier === activeTier) ?? null;
  const parentGridId = activeTier > 1 ? hierarchy.find((c) => c.tier === activeTier - 1)?.gridId ?? null : null;
  const drawKey = activeCell ? `${activeTier}:${activeCell.gridId}` : null;
  const isDrawing = drawKey !== null && drawnKey !== drawKey;

  // Create the map once
  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | null = null;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        center: UAE_CENTER,
        zoom: UAE_ZOOM,
        minZoom: 5,
        maxZoom: 20,
        zoomSnap: 0.1,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      observer = new ResizeObserver(() => map.invalidateSize());
      observer.observe(containerRef.current);
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Pin on the record's coordinates (no grid yet: centre on it)
  useEffect(() => {
    if (!mapReady) return;
    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (!map) return;
      markerRef.current?.remove();
      markerRef.current = null;
      if (latitude == null || longitude == null) return;
      const icon = L.divIcon({ className: "registry-map-pin", html: PIN_HTML, iconSize: [32, 38], iconAnchor: [16, 34] });
      markerRef.current = L.marker([latitude, longitude], { icon, interactive: false, zIndexOffset: 1000 }).addTo(map);
      if (!drawKey) map.setView([latitude, longitude], 16, { animate: false });
    });
    // drawKey only decides the initial centring
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, latitude, longitude]);

  // Cells of the active tier
  useEffect(() => {
    if (!mapReady || !activeCell || !drawKey) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      let siblings: GeoJsonFeature[] = [];
      let failed = false;
      try {
        siblings = await loadSiblings(parentGridId);
      } catch {
        failed = true; // e.g. 403 without Grid_Read: the record's own cell only
      }
      const map = mapRef.current;
      const layer = layerRef.current;
      if (cancelled || !map || !layer) return;

      layer.clearLayers();
      const theme = TIER_THEMES[activeTier];
      const fontSize = activeTier === 1 ? "9px" : "11px";
      const area: { bounds: LatLngBounds | null; active: LatLngBounds | null } = { bounds: null, active: null };

      const addCell = (geometry: GeoJsonGeometry, label: string, isActive: boolean) => {
        const shape = L.geoJSON(geometry as unknown as GeoJSON.Geometry, {
          style: {
            color: isActive ? theme.color : theme.stroke,
            weight: isActive ? 2 : theme.strokeWeight,
            fillColor: isActive ? theme.activeCellFill : theme.fill,
            fillOpacity: isActive ? 0.45 : theme.fillOpacity,
          },
          interactive: false,
        }).addTo(layer);
        const b = shape.getBounds();
        if (!b.isValid()) return;
        area.bounds = area.bounds ? area.bounds.extend(b) : L.latLngBounds(b.getSouthWest(), b.getNorthEast());
        if (isActive) area.active = b;
        if (!label) return;
        L.marker(b.getCenter(), {
          icon: L.divIcon({
            className: "registry-grid-label",
            html: `<div style="color: ${isActive ? "#FFFFFF" : theme.fontColor}; font-family: Cairo, sans-serif; font-size: ${fontSize}; font-weight: ${isActive ? 700 : 600}; text-align: center; line-height: 1; user-select: none; pointer-events: none; text-shadow: ${isActive ? "none" : "0 0 2px #FFFFFF"};">${sanitizeHtml(label)}</div>`,
            iconSize: [20, 14],
            iconAnchor: [10, 7],
          }),
          interactive: false,
        }).addTo(layer);
      };

      let activeDrawn = false;
      siblings.forEach((f) => {
        const geometry = parseGeometry(f.geometry);
        if (!geometry) return;
        const p = f.properties ?? {};
        const id = String(p.gridId ?? p.id ?? f.id ?? "");
        const isActive = id === activeCell.gridId;
        activeDrawn = activeDrawn || isActive;
        addCell(geometry, codeSegment(String(p.hierarchyCode ?? p.code ?? "")), isActive);
      });
      if (!activeDrawn && activeCell.geometry) {
        addCell(activeCell.geometry, activeCell.segment, true);
      }

      // T1: the UAE; T2–T4: the record's cell with two cells of context on each side (≈ 5 × 5 cells)
      if (activeTier === 1 && siblings.length > 0) {
        map.setView(UAE_CENTER, UAE_ZOOM, { animate: false });
      } else if (area.active) {
        map.fitBounds(area.active.pad(2), { animate: false });
      } else if (area.bounds) {
        map.fitBounds(area.bounds, { animate: false });
      }

      setSiblingsFailed(failed);
      setDrawnKey(drawKey);
    })();

    return () => {
      cancelled = true;
    };
    // activeCell / parentGridId derive from hierarchy + activeTier (both in drawKey / deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, drawKey, hierarchy]);

  // No cell for this tier: clear the previous drawing
  useEffect(() => {
    if (mapReady && !drawKey) layerRef.current?.clearLayers();
  }, [mapReady, drawKey]);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <Box ref={containerRef} sx={{ width: "100%", height: "100%" }} />

      {(loading || isDrawing || !mapReady) && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1000,
            bgcolor: "rgba(255,255,255,0.92)",
            borderRadius: "4px",
            p: "4px 8px",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CircularProgress size={12} sx={{ color: "#0000FF" }} />
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>Loading grid…</Typography>
        </Box>
      )}

      {!loading && !activeCell && (
        <Box sx={noteSx}>
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
            Grid cells not available for this address
          </Typography>
        </Box>
      )}

      {siblingsFailed && activeCell && !isDrawing && (
        <Box sx={noteSx}>
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#5A5A5A" }}>
            Showing this address&apos;s cell only
          </Typography>
        </Box>
      )}
    </Box>
  );
}

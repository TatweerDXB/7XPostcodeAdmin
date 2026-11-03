"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import {
  gridService,
  GeoJsonFeature,
  GridCellProperties,
} from "@/services/gridService";
import { postcodeService } from "@/services/postcodeService";

type Tier = 1 | 2 | 3 | 4;
const TIERS: Tier[] = [1, 2, 3, 4];
const TIER_STYLE: Record<Tier, { color: string; fill: number; weight: number }> = {
  1: { color: "#6b7280", fill: 0.04, weight: 2 },
  2: { color: "#2563eb", fill: 0.06, weight: 1.6 },
  3: { color: "#16a34a", fill: 0.1, weight: 1.2 },
  4: { color: "#dc2626", fill: 0.2, weight: 1 },
};

const MAX_POSTCODE_PAGES = 30;
const PAGE_SIZE = 1000;
const CONCURRENCY = 5;

/** "25-07-37-65" | "25073765" | "2507-3765" -> ["25","07","37","65"] (null when not 8 digits). */
function parseParts(input: string): string[] | null {
  const d = input.replace(/\D/g, "");
  if (d.length !== 8) return null;
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4, 6), d.slice(6, 8)];
}

/** Cell code at tier `t` from the parts, dot separated (the `code` filter form). */
const dotCode = (parts: string[], t: number) => parts.slice(0, t).join(".");

async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(lanes);
}

export default function LandmarkGridMap({ map }: { map: LeafletMap | null }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const tierLayersRef = useRef<Record<Tier, LayerGroup | null>>({ 1: null, 2: null, 3: null, 4: null });
  const searchLayerRef = useRef<LayerGroup | null>(null);
  /** Cell ids already drawn per tier, so overlapping fetches never double-draw. */
  const drawnRef = useRef<Record<Tier, Set<string>>>({
    1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(),
  });

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [visible, setVisible] = useState<Record<Tier, boolean>>({ 1: true, 2: true, 3: true, 4: true });
  const [counts, setCounts] = useState<Record<Tier, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [landmarkCount, setLandmarkCount] = useState(0);
  const [query, setQuery] = useState("");

  // ---- attach to the host map (owned by GoogleMapView) ----
  useEffect(() => {
    if (!map) return;
    let cancelled = false;
    const created: LayerGroup[] = [];
    (async () => {
      const L = await import("leaflet");
      if (cancelled) return;
      leafletRef.current = L;
      mapRef.current = map;
      // One pane per tier so T4 always sits above T3 > T2 > T1 regardless of load order.
      TIERS.forEach((t) => {
        const name = `tier${t}`;
        (map.getPane(name) ?? map.createPane(name)).style.zIndex = String(400 + t * 10);
        const g = L.layerGroup().addTo(map);
        tierLayersRef.current[t] = g;
        created.push(g);
      });
      (map.getPane("searchPane") ?? map.createPane("searchPane")).style.zIndex = "480";
      const sg = L.layerGroup().addTo(map);
      searchLayerRef.current = sg;
      created.push(sg);
      setReady(true);
    })();
    return () => {
      cancelled = true;
      created.forEach((g) => g.remove());
      mapRef.current = null;
      drawnRef.current = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };
      setReady(false);
    };
  }, [map]);

  // ---- tier visibility ----
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    TIERS.forEach((t) => {
      const g = tierLayersRef.current[t];
      if (!g) return;
      if (visible[t]) { if (!m.hasLayer(g)) g.addTo(m); }
      else if (m.hasLayer(g)) m.removeLayer(g);
    });
  }, [visible, ready]);

  const addFeatures = useCallback(
    (tier: Tier, features: GeoJsonFeature[], target?: LayerGroup | null, highlight?: string) => {
      const L = leafletRef.current;
      const group = target ?? tierLayersRef.current[tier];
      if (!L || !group) return 0;
      const drawn = drawnRef.current[tier];
      const fresh = target
        ? features
        : features.filter((f) => {
            const id = String(f.properties?.id ?? f.properties?.gridId ?? f.id ?? "");
            if (!id || drawn.has(id)) return false;
            drawn.add(id);
            return true;
          });
      if (!fresh.length) return 0;
      const st = TIER_STYLE[tier];
      L.geoJSON({ type: "FeatureCollection", features: fresh } as never, {
        pane: target ? "searchPane" : `tier${tier}`,
        style: (f) => {
          const p = (f?.properties ?? {}) as GridCellProperties;
          const hit = highlight && (p.postcode === highlight || p.hierarchyCode === highlight);
          return {
            color: hit ? "#000000" : st.color,
            weight: hit ? 3 : st.weight,
            fillColor: hit ? "#facc15" : st.color,
            fillOpacity: hit ? 0.55 : st.fill,
          };
        },
        onEachFeature: (f, layer) => {
          const p = (f.properties ?? {}) as GridCellProperties;
          const code = String(p.hierarchyCode ?? p.code ?? "");
          const postcode = p.postcode ? ` · ${String(p.postcode)}` : "";
          const place = p.localityNameEn ? `<br/>${String(p.localityNameEn).replace(/[<>&]/g, "")}` : "";
          layer.bindTooltip(`T${tier} ${code.replace(/[<>&]/g, "")}${postcode.replace(/[<>&]/g, "")}${place}`, { sticky: true });
        },
      }).addTo(group);
      return fresh.length;
    },
    []
  );

  const fetchTier = useCallback(
    async (tier: Tier, parentParts: string[] | null) => {
      const code = parentParts ? dotCode(parentParts, tier - 1) : undefined;
      const res = await gridService.getCells({ tier, code, Page: 1, PageSize: PAGE_SIZE });
      return res.data?.features ?? [];
    },
    []
  );

  // ---- load all landmarks: every T4 postcode in the DB -> its 10x10 at each tier ----
  const loadLandmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    setProgress(0);
    try {
      const t3Parents = new Map<string, string[]>(); // "25.16.84" -> parts
      let rows = 0;
      let capped = false;
      for (let page = 1; page <= MAX_POSTCODE_PAGES; page++) {
        const res = await postcodeService.searchPostcodes({ Page: page, PageSize: PAGE_SIZE });
        const list = res.data ?? [];
        rows += list.length;
        for (const r of list) {
          const parts = parseParts(r.postcode ?? "");
          if (parts) t3Parents.set(dotCode(parts, 3), parts);
        }
        if (list.length < PAGE_SIZE) break;
        if (page === MAX_POSTCODE_PAGES) capped = true;
      }
      setLandmarkCount(t3Parents.size);
      if (!t3Parents.size) {
        setNotice("No Tier-4 postcodes were returned by /api/postcodes.");
        return;
      }
      if (capped) setNotice(`Stopped after ${rows} postcodes; the list may be incomplete.`);

      // Each landmark contributes the 10x10 at every tier (4 x 100 = 400 cells); shared parents are fetched once.
      const jobs: { tier: Tier; parts: string[] | null }[] = [{ tier: 1, parts: null }];
      const seen = new Set<string>(["1"]);
      t3Parents.forEach((parts) => {
        ([2, 3, 4] as Tier[]).forEach((tier) => {
          const key = `${tier}:${dotCode(parts, tier - 1)}`;
          if (!seen.has(key)) { seen.add(key); jobs.push({ tier, parts }); }
        });
      });

      let done = 0;
      await runPool(jobs, async ({ tier, parts }) => {
        try {
          const feats = await fetchTier(tier, parts);
          const added = addFeatures(tier, feats);
          if (added) setCounts((c) => ({ ...c, [tier]: c[tier] + added }));
        } catch {
          /* one failed chunk must not hide the rest */
        }
        done++;
        setProgress(Math.round((done / jobs.length) * 100));
      });

      const m = mapRef.current;
      const L = leafletRef.current;
      if (m && L) {
        const bounds = L.latLngBounds([]);
        TIERS.forEach((t) => tierLayersRef.current[t]?.eachLayer((l) => {
          const b = (l as import("leaflet").FeatureGroup).getBounds?.();
          if (b?.isValid()) bounds.extend(b);
        }));
        if (bounds.isValid()) m.fitBounds(bounds.pad(0.05));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load landmark grid.");
    } finally {
      setLoading(false);
    }
  }, [addFeatures, fetchTier]);

  // ---- direct postcode search: its T4 + the 99 siblings (10x10), with the T1-T3 context ----
  const searchPostcode = useCallback(async () => {
    const parts = parseParts(query);
    if (!parts) {
      setError("Enter a full postcode, e.g. 25-07-37-65.");
      return;
    }
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const canonical = parts.join("");
      const detail = await postcodeService.getPostcodeDetail(canonical);
      if (!detail.success) throw new Error(detail.message || "Postcode not found.");
      const display = parts.join("-");

      searchLayerRef.current?.clearLayers();
      for (const tier of [2, 3, 4] as Tier[]) {
        const feats = await fetchTier(tier, parts);
        addFeatures(tier, feats, searchLayerRef.current, tier === 4 ? display : undefined);
      }
      const m = mapRef.current;
      const L = leafletRef.current;
      const geom = detail.data?.geometryGeoJson;
      if (m && L && geom) {
        const g = typeof geom === "string" ? JSON.parse(geom) : geom;
        const b = L.geoJSON(g as never).getBounds();
        if (b.isValid()) m.fitBounds(b.pad(6));
      }
      setNotice(`Postcode ${display}: Tier-4 cell highlighted with its 10x10 neighbours (T2/T3/T4 grids shown).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }, [query, fetchTier, addFeatures]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) void loadLandmarks();
  }, [ready, loadLandmarks]);

  return (
    <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
      <Box
        sx={{
          pointerEvents: "auto", position: "absolute", bottom: 16, left: 12, width: 360, p: 1.5,
          bgcolor: "rgba(255,255,255,0.96)", borderRadius: 2, boxShadow: 3,
          display: "flex", flexDirection: "column", gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Landmark grid (Release 1)
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small" fullWidth placeholder="Postcode, e.g. 25-07-37-65"
            value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void searchPostcode(); }}
          />
          <Button variant="contained" disabled={loading} onClick={() => void searchPostcode()}>
            Find
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {TIERS.map((t) => (
            <Chip
              key={t} size="small" clickable
              label={`T${t}: ${counts[t]}`}
              onClick={() => setVisible((v) => ({ ...v, [t]: !v[t] }))}
              variant={visible[t] ? "filled" : "outlined"}
              sx={visible[t] ? { bgcolor: TIER_STYLE[t].color, color: "#fff" } : { borderColor: TIER_STYLE[t].color }}
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {landmarkCount} landmark area(s) (distinct Tier-3 parents of the Tier-4 postcodes). Each shows the 10x10
          grid at T1-T4. Click a chip to toggle a tier.
        </Typography>
        {loading && <LinearProgress variant={progress ? "determinate" : "indeterminate"} value={progress} />}
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {notice && <Alert severity="info" onClose={() => setNotice(null)}>{notice}</Alert>}
        <Button size="small" disabled={loading} onClick={() => { searchLayerRef.current?.clearLayers(); }}>
          Clear search highlight
        </Button>
      </Box>
    </Box>
  );
}

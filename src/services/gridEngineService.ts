import {
  gridService,
  getMaskState,
  type GeoJsonFeature,
  type GeoJsonGeometry,
  type GridTierStatDto,
} from "./gridService";
import { addressRegistryService, type ConnectedAddressDto, type ConnectedAddressLevel } from "./addressRegistryService";

/**
 * Postcode Grid Engine (contract §2, §4 "Lazy grid loading", §8 portal/grid rows).
 * The matrix shows the real cells of one tier: all T1 cells, or the children of the cell picked one tier up.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GridTier = 1 | 2 | 3 | 4;

export interface GridBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

/** One real grid cell, as the Grid Engine screen draws it. */
export interface GridEngineCell {
  gridId: string;
  tier: GridTier;
  /** Hierarchy code as returned ("27.85.14") */
  code: string;
  /** Hierarchy code for display ("27-85-14") */
  displayCode: string;
  /** The cell's own two digits ("14") */
  segment: string;
  /** Position in its parent's 10 × 10 block: first digit = row counted from the south, second = column from the west */
  row: number;
  col: number;
  parentGridId: string | null;
  postcodeCount: number | null;
  childCount: number | null;
  /** maskStatusCode MASKED: outside the territory (hatched) */
  masked: boolean;
  postcode: string | null;
  postcodeDisplay: string | null;
  emirateCode: string | null;
  centroid: { lat: number; lng: number } | null;
  bounds: GridBounds | null;
  geometry: GeoJsonGeometry | null;
}

export interface GridTierInfo {
  tier: GridTier;
  nameEn: string;
  cellSizeM: number | null;
}

export type GridDensity = "high" | "medium" | "low";

/** A postcode inside a cell: one T4 cell. */
export interface CellPostcode {
  gridId: string;
  /** 8 digits ("27851465"), whatever form the server stores */
  postcode: string;
  emirateCode: string | null;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const lastSegment = (code: string) => code.split(/[.-]/).pop() || code;

/** Min / max of every coordinate in a Polygon or MultiPolygon. */
function boundsOf(geometry: GeoJsonGeometry | null): GridBounds | null {
  if (!geometry?.coordinates) return null;
  let north = -Infinity;
  let south = Infinity;
  let west = Infinity;
  let east = -Infinity;
  const visit = (node: unknown): void => {
    if (Array.isArray(node) && typeof node[0] === "number" && typeof node[1] === "number") {
      const [lng, lat] = node as [number, number];
      north = Math.max(north, lat);
      south = Math.min(south, lat);
      west = Math.min(west, lng);
      east = Math.max(east, lng);
    } else if (Array.isArray(node)) {
      node.forEach(visit);
    }
  };
  visit(geometry.coordinates);
  return Number.isFinite(north) ? { north, south, west, east } : null;
}

function toEngineCell(feature: GeoJsonFeature, expectedTier: GridTier): GridEngineCell | null {
  const p = feature.properties ?? {};
  const gridId = String(p.gridId ?? p.id ?? feature.id ?? "");
  const code = String(p.hierarchyCode ?? p.code ?? "");
  const tier = Number(p.tier ?? expectedTier);
  if (!gridId || !code || tier < 1 || tier > 4) return null;

  const segment = lastSegment(code).padStart(2, "0");
  const geometry = typeof feature.geometry === "string" ? JSON.parse(feature.geometry) : feature.geometry ?? null;
  const bounds = boundsOf(geometry);
  const lat = typeof p.centroidLatitude === "number" ? p.centroidLatitude : null;
  const lng = typeof p.centroidLongitude === "number" ? p.centroidLongitude : null;

  return {
    gridId,
    tier: tier as GridTier,
    code,
    displayCode: code.replace(/\./g, "-"),
    segment,
    row: Number(segment[0]),
    col: Number(segment[1]),
    parentGridId: p.parentGridId ? String(p.parentGridId) : null,
    postcodeCount: typeof p.postcodeCount === "number" ? p.postcodeCount : null,
    childCount: typeof p.childCount === "number" ? p.childCount : null,
    masked: getMaskState(p) === "MASKED",
    postcode: p.postcode ?? null,
    postcodeDisplay: p.postcodeDisplay ?? null,
    emirateCode: p.emirateCode ?? null,
    centroid:
      lat != null && lng != null
        ? { lat, lng }
        : bounds
        ? { lat: (bounds.north + bounds.south) / 2, lng: (bounds.west + bounds.east) / 2 }
        : null,
    bounds,
    geometry,
  };
}

/** Density of a cell relative to the busiest cell on screen. */
export function densityOf(count: number | null, max: number): GridDensity {
  if (!count || max <= 0) return "low";
  const ratio = count / max;
  if (ratio >= 0.5) return "high";
  if (ratio >= 0.15) return "medium";
  return "low";
}

/**
 * Whether a tier's first code digit counts rows from the north (true) or the south (false), read from the
 * cells' own coordinates. The deployed grid counts from the north; the seeder in the backend repo counts
 * from the south, so the screen does not assume either.
 */
export function rowsCountFromNorth(cells: GridEngineCell[]): boolean {
  const located = cells.filter((c) => c.centroid);
  if (located.length < 2) return true;
  const minRow = Math.min(...located.map((c) => c.row));
  const maxRow = Math.max(...located.map((c) => c.row));
  if (minRow === maxRow) return true;
  const avgLat = (row: number) => {
    const same = located.filter((c) => c.row === row);
    return same.reduce((sum, c) => sum + c.centroid!.lat, 0) / same.length;
  };
  return avgLat(minRow) > avgLat(maxRow);
}

/** "70 km" / "700 m" from the tier's cell size in metres. */
export function formatCellSize(cellSizeM: number | null | undefined): string {
  if (!cellSizeM) return "—";
  return cellSizeM >= 1000 ? `${+(cellSizeM / 1000).toFixed(1)} km` : `${cellSizeM} m`;
}

/** 1234 → "1.2K", for the small matrix tiles. */
export function formatCompact(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/** "ABU_DHABI" → "Abu Dhabi" (the grid returns codes only). */
export function emirateLabel(code: string | null | undefined): string {
  if (!code) return "—";
  return code
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Loaders (all API calls go through gridService / addressRegistryService)
// ---------------------------------------------------------------------------

// Cells per parent ("root" = T1) and "has a sub-grid" per cell code. In memory per tab.
const cellsCache = new Map<string, Promise<GridEngineCell[]>>();
const hasChildrenCache = new Map<string, Promise<boolean>>();

const toCells = (features: GeoJsonFeature[] | undefined, tier: GridTier) =>
  (Array.isArray(features) ? features : [])
    .map((f) => toEngineCell(f, tier))
    .filter((c): c is GridEngineCell => c !== null)
    .sort((a, b) => a.code.localeCompare(b.code));

export const gridEngineService = {
  /**
   * Cells of one tier: all T1 cells (no parent), or the children of a cell.
   * GET /api/grid/cells?tier=1 · GET /api/grid/cells/{gridId}/children, falling back to
   * GET /api/grid/cells?tier=<n>&code=<parent code> when the children route returns nothing
   * (on the dev server some children do not point at their parent's current id).
   */
  loadCells: (parent: GridEngineCell | null): Promise<GridEngineCell[]> => {
    const key = parent?.gridId ?? "root";
    let cached = cellsCache.get(key);
    if (!cached) {
      cached = (async () => {
        if (!parent) {
          const res = await gridService.getCells({ tier: 1, PageSize: 1000 }, { retries: 0 });
          return toCells(res?.data?.features, 1);
        }
        const tier = (parent.tier + 1) as GridTier;
        const byId = await gridService.getCellChildren(parent.gridId, { PageSize: 100 }, { retries: 0 });
        const cells = toCells(byId?.data?.features, tier);
        if (cells.length > 0) return cells;
        const byCode = await gridService.getCells({ tier, code: parent.code, PageSize: 100 }, { retries: 0 });
        return toCells(byCode?.data?.features, tier);
      })().catch((err) => {
        cellsCache.delete(key);
        throw err;
      });
      cellsCache.set(key, cached);
    }
    return cached;
  },

  /**
   * Whether a cell has a sub-grid on this server (the dev grid is only partly populated).
   * childCount > 0 is trusted; otherwise one GET /api/grid/cells?tier=<n>&code=<code>&pageSize=1.
   */
  hasChildren: (cell: GridEngineCell): Promise<boolean> => {
    if (cell.tier === 4) return Promise.resolve(false);
    if ((cell.childCount ?? 0) > 0) return Promise.resolve(true);
    let cached = hasChildrenCache.get(cell.code);
    if (!cached) {
      cached = gridService
        .getCells({ tier: cell.tier + 1, code: cell.code, Page: 1, PageSize: 1 }, { retries: 0 })
        .then((res) => Array.isArray(res?.data?.features) && res.data.features.length > 0)
        .catch((err) => {
          hasChildrenCache.delete(cell.code);
          throw err;
        });
      hasChildrenCache.set(cell.code, cached);
    }
    return cached;
  },

  /**
   * Tier names and cell sizes, for the size badge and the table's Size column.
   * GET /api/grid/tiers
   */
  loadTiers: async (): Promise<GridTierInfo[]> => {
    const res = await gridService.getGridTiers({ retries: 0 });
    // data = { tiers: [...] } (ListGridTiersResult); accept a bare array too
    const data = res?.data as { tiers?: unknown } | unknown[] | null | undefined;
    const raw = Array.isArray(data) ? data : Array.isArray((data as { tiers?: unknown })?.tiers) ? (data as { tiers: unknown[] }).tiers : [];
    const list = raw as Record<string, unknown>[];
    return list
      .map((t) => ({
        tier: Number(t.gridTierId ?? t.tierLevel) as GridTier,
        nameEn: String(t.nameEn ?? ""),
        cellSizeM: typeof t.cellSizeM === "number" ? t.cellSizeM : null,
      }))
      .filter((t) => t.tier >= 1 && t.tier <= 4);
  },

  /**
   * UAE-wide cell count per tier, for the KPI cards.
   * GET /api/grid/statistics
   */
  loadTierTotals: async (): Promise<Partial<Record<GridTier, number>>> => {
    const res = await gridService.getGridStatistics(undefined, { retries: 0 });
    const tiers = res?.data?.tiers;
    const totals: Partial<Record<GridTier, number>> = {};
    if (Array.isArray(tiers)) {
      tiers.forEach((t: GridTierStatDto) => {
        if (t.gridTierId >= 1 && t.gridTierId <= 4) totals[t.gridTierId as GridTier] = t.cellCount;
      });
    }
    return totals;
  },

  /**
   * Postcodes inside a cell = its T4 cells, found by code prefix.
   * GET /api/grid/cells?tier=4&code=<cell code>
   * (Not GET /api/postcodes?search=: on the DEV grid postcodes are stored as NN-NN-NN-NN, so its
   * digit-prefix match finds nothing there.)
   */
  loadCellPostcodes: async (
    cell: GridEngineCell,
    pageSize = 50
  ): Promise<{ items: CellPostcode[]; totalCount: number }> => {
    const res = await gridService.getCells({ tier: 4, code: cell.code, PageSize: pageSize }, { retries: 0 });
    const items = toCells(res?.data?.features, 4)
      .map((c) => ({
        gridId: c.gridId,
        postcode: (c.postcode ?? c.code).replace(/\D/g, ""),
        emirateCode: c.emirateCode,
      }))
      .filter((p) => p.postcode.length > 0);
    return { items, totalCount: res?.totalCount ?? items.length };
  },

  /**
   * Addresses in a T4 cell (buildings, units, individual addresses). A T4 cell is one postcode, so they are
   * matched by postcode: GET /api/registry/by-postcode/{8 digits}. by-grid matches the grid id stored on each
   * record, and on DEV those ids no longer match the current cells. by-grid stays as the fallback for a cell
   * without a postcode.
   */
  loadCellAddresses: async (
    cell: GridEngineCell,
    level: ConnectedAddressLevel,
    pageSize = 20
  ): Promise<{ items: ConnectedAddressDto[]; totalCount: number }> => {
    const postcode = (cell.postcode ?? (cell.tier === 4 ? cell.code : "")).replace(/\D/g, "");
    const params = { level, page: 1, pageSize };
    const res =
      postcode.length === 8
        ? await addressRegistryService.listByPostcode(postcode, params, { retries: 0 })
        : await addressRegistryService.listByGrid(cell.gridId, params, { retries: 0 });
    const items = Array.isArray(res?.data?.items) ? res.data.items : [];
    return { items, totalCount: res?.data?.totalCount ?? res?.totalCount ?? items.length };
  },
};

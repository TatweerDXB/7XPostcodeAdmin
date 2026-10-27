import { apiClient, RequestOptions } from "./apiClient";

// GeoJSON Types according to Swagger
export interface GeoJsonGeometry {
  type: "Polygon" | "MultiPolygon" | "Point" | string;
  coordinates: [number, number][][];
}

export interface GridCellProperties {
  id?: string;
  gridId?: string;
  tier?: number;
  code?: string;
  hierarchyCode?: string;
  parentGridId?: string | null;
  name?: string;
  nameEn?: string;
  nameAr?: string;
  postcodeCount?: number;
  childCount?: number;
  maskStatusCode?: string;
  mask_status_code?: string;
  isMasked?: boolean;
  emirate?: string;
  emirateCode?: string;
  [key: string]: unknown;
}

export type MaskState = "MASKED" | "UNMASKED" | "UNKNOWN";

export function getMaskState(p: GridCellProperties): MaskState {
  const raw = p.maskStatusCode ?? p.mask_status_code;
  if (typeof raw !== "string") {
    if (typeof p.isMasked === "boolean") {
      return p.isMasked ? "MASKED" : "UNMASKED";
    }
    return "UNKNOWN";
  }
  const v = raw.trim().toUpperCase();
  return v === "UNMASKED" ? "UNMASKED" : v === "MASKED" ? "MASKED" : "UNKNOWN";
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: GeoJsonGeometry;
  properties: GridCellProperties;
  id?: string | number;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface BaseResponse<T> {
  logId?: string | null;
  success: boolean;
  message?: string | null;
  data: T;
  totalCount?: number | null;
}

export interface HierarchyItemDto {
  tier: number;
  code: string;
  nameEn?: string;
  nameAr?: string;
  gridId?: string;
}

export interface GridCellDetailDto {
  cell: GridCellProperties;
  geometryGeoJson?: GeoJsonGeometry | string;
  hierarchy?: HierarchyItemDto[];
}

export interface GridTierStatDto {
  gridTierId: number;
  cellCount: number;
  labelledCellCount?: number;
}

export interface GridStatisticsDto {
  tiers?: number | GridTierStatDto[];
  postcodeCount?: number;
  maskedCellCount?: number;
  unmaskedCellCount?: number;
  buildingCount?: number;
  addressCount?: number;
  unitCount?: number;
  makaniListedCount?: number;
  makaniMappedCount?: number;
  onwaniListedCount?: number;
  onwaniMappedCount?: number;
  verifiedAddressCount?: number;
  buildingCoveragePercent?: number;
  postcodesWithoutBuildingsCount?: number;
  [key: string]: unknown;
}

export interface ResolvePointRequest {
  lat: number;
  lon: number;
  srid?: number;
}

export interface ResolvePointResponse {
  status: "RESOLVED" | "OUT_OF_BOUNDS" | "NOT_FOUND" | string;
  cell?: GridCellProperties;
  hierarchy?: HierarchyItemDto[];
  postcode?: string;
  postcodeDisplay?: string;
  normalized?: {
    lat: number;
    lon: number;
  };
}

export interface ResolveBatchItemRequest {
  ref?: string;
  lat: number;
  lon: number;
}

export interface ResolveBatchResponse {
  results: Array<{
    ref?: string;
    status: string;
    cell?: GridCellProperties;
    postcode?: string;
    postcodeDisplay?: string;
  }>;
}

export interface NeighborCellDto {
  cellId: string;
  hierarchyCode: string;
  relationshipType: "TOUCHES" | "CROSSES" | string;
  tier: number;
  geometry?: GeoJsonGeometry;
}

export interface GridCellsParams {
  tier?: number;
  parentId?: string;
  bbox?: string;
  code?: string;
  emirate?: string;
  Page?: number;
  PageSize?: number;
}

export interface GridStatisticsParams {
  emirate?: string;
  code?: string;
}

export const gridService = {
  /**
   * Resolves a coordinate (lat, lon) to a grid cell and postcode hierarchy
   * POST /api/grid/resolve
   */
  resolvePoint: async (
    payload: ResolvePointRequest,
    options?: RequestOptions
  ): Promise<BaseResponse<ResolvePointResponse>> => {
    return apiClient.post<BaseResponse<ResolvePointResponse>>(
      "/api/grid/resolve",
      payload,
      options
    );
  },

  /**
   * Batch resolves multiple coordinates
   * POST /api/grid/resolve/batch
   */
  resolveBatch: async (
    items: ResolveBatchItemRequest[],
    options?: RequestOptions
  ): Promise<BaseResponse<ResolveBatchResponse>> => {
    return apiClient.post<BaseResponse<ResolveBatchResponse>>(
      "/api/grid/resolve/batch",
      items,
      options
    );
  },

  /**
   * Retrieves grid cells as GeoJson FeatureCollection with filtering
   * GET /api/grid/cells
   */
  getCells: async (
    params?: GridCellsParams,
    options?: RequestOptions
  ): Promise<BaseResponse<GeoJsonFeatureCollection>> => {
    return apiClient.get<BaseResponse<GeoJsonFeatureCollection>>(
      "/api/grid/cells",
      {
        ...options,
        params: params as Record<string, string | number | boolean | undefined>,
      }
    );
  },

  /**
   * Retrieves a single grid cell by ID
   * GET /api/grid/cells/{id}
   */
  getCellById: async (
    id: string,
    options?: RequestOptions
  ): Promise<BaseResponse<GridCellDetailDto>> => {
    return apiClient.get<BaseResponse<GridCellDetailDto>>(
      `/api/grid/cells/${encodeURIComponent(id)}`,
      options
    );
  },

  /**
   * Retrieves a grid cell by hierarchy code (e.g. "46", "46.32", "46-32-82-78")
   * GET /api/grid/cells/by-code/{code}
   */
  getCellByCode: async (
    code: string,
    includeHierarchy = true,
    options?: RequestOptions
  ): Promise<BaseResponse<GridCellDetailDto>> => {
    return apiClient.get<BaseResponse<GridCellDetailDto>>(
      `/api/grid/cells/by-code/${encodeURIComponent(code)}`,
      {
        ...options,
        params: { includeHierarchy },
      }
    );
  },

  /**
   * Retrieves cells for multiple codes
   * GET /api/grid/cells/by-codes?codes=...
   */
  getCellsByCodes: async (
    codes: string[],
    options?: RequestOptions
  ): Promise<BaseResponse<GeoJsonFeatureCollection>> => {
    return apiClient.get<BaseResponse<GeoJsonFeatureCollection>>(
      "/api/grid/cells/by-codes",
      {
        ...options,
        params: { codes: codes.join(",") },
      }
    );
  },

  /**
   * Retrieves child cells for a parent cell ID
   * GET /api/grid/cells/{id}/children
   */
  getCellChildren: async (
    id: string,
    params?: { Page?: number; PageSize?: number },
    options?: RequestOptions
  ): Promise<BaseResponse<GeoJsonFeatureCollection>> => {
    return apiClient.get<BaseResponse<GeoJsonFeatureCollection>>(
      `/api/grid/cells/${encodeURIComponent(id)}/children`,
      {
        ...options,
        params: params as Record<string, string | number | boolean | undefined>,
      }
    );
  },

  /**
   * Retrieves adjacent neighbor cells
   * GET /api/grid/cells/{id}/neighbors
   */
  getCellNeighbors: async (
    id: string,
    options?: RequestOptions
  ): Promise<BaseResponse<NeighborCellDto[]>> => {
    return apiClient.get<BaseResponse<NeighborCellDto[]>>(
      `/api/grid/cells/${encodeURIComponent(id)}/neighbors`,
      options
    );
  },

  /**
   * Retrieves statistics for grid cells, optionally filtered by code or emirate
   * GET /api/grid/statistics
   */
  getGridStatistics: async (
    params?: GridStatisticsParams,
    options?: RequestOptions
  ): Promise<BaseResponse<GridStatisticsDto>> => {
    return apiClient.get<BaseResponse<GridStatisticsDto>>(
      "/api/grid/statistics",
      {
        ...options,
        params: params as Record<string, string | number | boolean | undefined>,
      }
    );
  },

  /**
   * Retrieves available grid tiers
   * GET /api/grid/tiers
   */
  getGridTiers: async (
    options?: RequestOptions
  ): Promise<BaseResponse<unknown>> => {
    return apiClient.get<BaseResponse<unknown>>(
      "/api/grid/tiers",
      options
    );
  },

  /**
   * Health check for grid service via Gateway
   * GET /health/grid
   */
  getGridHealth: async (
    options?: RequestOptions
  ): Promise<BaseResponse<string>> => {
    return apiClient.get<BaseResponse<string>>(
      "/health/grid",
      options
    );
  },
};

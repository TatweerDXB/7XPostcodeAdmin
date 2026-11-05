import { apiClient, RequestOptions } from "./apiClient";
import {
  BaseResponse,
  GridCellDetailDto,
  GridStatisticsDto,
  getMaskState,
  gridService,
} from "./gridService";
import { addressRegistryService, BuildingListRowDto } from "./addressRegistryService";
import type { LinkedRecordItem, PostcodeItem } from "@/data/postcodeListData";

export interface PostcodeRowDto {
  postcode: string;
  postcodeDisplay: string;
  gridId: string;
  centroidLatitude: number;
  centroidLongitude: number;
  emirateCode?: string | null;
  localityNameEn?: string | null;
  localityNameAr?: string | null;
  maskStatusCode?: string | null;
  [key: string]: unknown;
}

export interface PostcodeSearchParams {
  search?: string;
  emirate?: string;
  bbox?: string;
  Page?: number;
  PageSize?: number;
}

const EMIRATE_CODE_TO_NAME: Record<string, string> = {
  AUH: "Abu Dhabi",
  DXB: "Dubai",
  SHJ: "Sharjah",
  AJM: "Ajman",
  UAQ: "Umm Al-Quwain",
  RAK: "Ras Al Khaimah",
  FUJ: "Fujairah",
};

const EMIRATE_NAME_TO_CODE: Record<string, string> = {
  "abu dhabi": "AUH",
  dubai: "DXB",
  sharjah: "SHJ",
  ajman: "AJM",
  "umm al-quwain": "UAQ",
  "umm al quwain": "UAQ",
  "ras al khaimah": "RAK",
  fujairah: "FUJ",
};

/** Infers UAE Emirate name from centroid coordinates when emirateCode is null in the API response. */
export function inferEmirateFromCoords(lat?: number | null, lng?: number | null): string {
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return "UAE";
  }
  // Fujairah & East Coast
  if (lng >= 56.15 && lat >= 24.95 && lat <= 25.65) return "Fujairah";
  // Ras Al Khaimah
  if (lat >= 25.62 && lng >= 55.65) return "Ras Al Khaimah";
  // Umm Al-Quwain
  if (lat >= 25.47 && lat < 25.62 && lng >= 55.5 && lng <= 55.95) return "Umm Al-Quwain";
  // Ajman (e.g. 25.417373, 55.4399553)
  if (lat >= 25.37 && lat < 25.47 && lng >= 55.42 && lng <= 55.63) return "Ajman";
  // Sharjah
  if (lat >= 25.25 && lat < 25.47 && lng >= 55.33 && lng <= 56.0) return "Sharjah";
  // Dubai
  if (lat >= 24.75 && lat < 25.32 && lng >= 54.85 && lng <= 55.65) return "Dubai";
  // Abu Dhabi
  if (lat >= 22.5 && lat < 24.95 && lng >= 51.5 && lng <= 56.0) return "Abu Dhabi";
  return "UAE";
}

/** Maps backend emirateCode (e.g. "DXB") or name to UI Emirate display name, with coordinate fallback. */
export function formatEmirateName(
  codeOrName?: string | null,
  lat?: number | null,
  lng?: number | null
): string {
  if (codeOrName && codeOrName.trim()) {
    const trimmed = codeOrName.trim();
    const upper = trimmed.toUpperCase();
    if (EMIRATE_CODE_TO_NAME[upper]) {
      return EMIRATE_CODE_TO_NAME[upper];
    }
    const byName = EMIRATE_NAME_TO_CODE[trimmed.toLowerCase()];
    if (byName && EMIRATE_CODE_TO_NAME[byName]) {
      return EMIRATE_CODE_TO_NAME[byName];
    }
    return trimmed;
  }
  return inferEmirateFromCoords(lat, lng);
}

/** Maps UI Emirate filter option (e.g. "Dubai") to backend emirateCode (e.g. "DXB"). */
export function toEmirateQueryParam(emirateFilter?: string): string | undefined {
  if (!emirateFilter || emirateFilter === "All Emirates") return undefined;
  const trimmed = emirateFilter.trim();
  const mapped = EMIRATE_NAME_TO_CODE[trimmed.toLowerCase()];
  return mapped || trimmed;
}

/**
 * Normalizes user search input for GET /api/postcodes?search=...
 * Backend stores postcodes in hyphenated form e.g. "15-98-43-00".
 */
export function normalizePostcodeSearchInput(search?: string): string | undefined {
  if (!search) return undefined;
  const trimmed = search.trim();
  if (!trimmed) return undefined;
  const digits = trimmed.replace(/\D/g, "");
  // If user typed 8 digits (e.g. "15984300" or "15.98.43.00" or "15-98-43-00"), format as "15-98-43-00"
  if (digits.length === 8 && /^[\d.\-\s]+$/.test(trimmed)) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  }
  // If user typed dot-separated prefix like "15.98" or "15.98.43", convert dots to hyphens "15-98"
  if (/^\d{2}(\.\d{2}){1,3}$/.test(trimmed)) {
    return trimmed.replace(/\./g, "-");
  }
  return trimmed;
}

/** Parses postcode / postcodeDisplay / hierarchyCode into 4 tier chips and canonical strings. */
export function parsePostcodeParts(
  postcode?: string | null,
  postcodeDisplay?: string | null,
  hierarchyCode?: string | null
): {
  chips: { tier1: string; tier2: string; tier3: string; tier4: string };
  formatted: string;
  canonical: string;
  hierarchyCode: string;
} {
  const rawSource = postcode || postcodeDisplay || hierarchyCode || "";
  const digits = rawSource.replace(/\D/g, "");

  if (digits.length >= 8) {
    const tier1 = digits.slice(0, 2);
    const tier2 = digits.slice(2, 4);
    const tier3 = digits.slice(4, 6);
    const tier4 = digits.slice(6, 8);
    return {
      chips: { tier1, tier2, tier3, tier4 },
      formatted: `${tier1}-${tier2}-${tier3}-${tier4}`,
      canonical: `${tier1}-${tier2}-${tier3}-${tier4}`,
      hierarchyCode: hierarchyCode || `${tier1}.${tier2}.${tier3}.${tier4}`,
    };
  }

  const splitParts = (hierarchyCode || postcodeDisplay || rawSource)
    .split(/[.\-\s]+/)
    .filter(Boolean);
  const tier1 = (splitParts[0] || digits.slice(0, 2) || "00").padStart(2, "0").slice(0, 2);
  const tier2 = (splitParts[1] || digits.slice(2, 4) || "00").padStart(2, "0").slice(0, 2);
  const tier3 = (splitParts[2] || digits.slice(4, 6) || "00").padStart(2, "0").slice(0, 2);
  const tier4 = (splitParts[3] || digits.slice(6, 8) || "00").padStart(2, "0").slice(0, 2);

  return {
    chips: { tier1, tier2, tier3, tier4 },
    formatted: `${tier1}-${tier2}-${tier3}-${tier4}`,
    canonical: `${tier1}-${tier2}-${tier3}-${tier4}`,
    hierarchyCode: hierarchyCode || `${tier1}.${tier2}.${tier3}.${tier4}`,
  };
}

/** Converts a PostcodeRowDto from GET /api/postcodes into a PostcodeItem for the table & detail card. */
export function mapPostcodeRowToItem(row: PostcodeRowDto, rowNumber: number): PostcodeItem {
  const parsed = parsePostcodeParts(row.postcode, row.postcodeDisplay, undefined);
  const lat = Number(row.centroidLatitude ?? 0);
  const lng = Number(row.centroidLongitude ?? 0);
  const emirateName = formatEmirateName(row.emirateCode, lat, lng);
  const locality = row.localityNameEn?.trim() || row.localityNameAr?.trim() || "";

  const maskState = getMaskState(row);
  const status: "Published" | "Masked" = maskState === "MASKED" ? "Masked" : "Published";

  const subtitleParts = ["UAE", emirateName];
  if (locality && locality.toLowerCase() !== emirateName.toLowerCase()) {
    subtitleParts.push(locality);
  } else {
    subtitleParts.push(`Grid ${parsed.hierarchyCode}`);
  }

  return {
    id: row.gridId || row.postcode || parsed.formatted || `pc-${rowNumber}`,
    rowNumber,
    postcode: parsed.formatted,
    rawPostcode: row.postcode || parsed.formatted,
    postcodeDisplay: row.postcodeDisplay || parsed.formatted,
    gridId: row.gridId,
    hierarchyCode: parsed.hierarchyCode,
    emirateCode: row.emirateCode || undefined,
    localityNameAr: row.localityNameAr || undefined,
    maskStatusCode: row.maskStatusCode || "UNMASKED",
    chips: parsed.chips,
    emirate: emirateName,
    status,
    title: `Postcode ${parsed.formatted}`,
    subtitle: subtitleParts.join(" > "),
    area: locality || emirateName,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    gridInfo: {
      tierLabel: `T4-${parsed.chips.tier4}`,
      buildingsCount: 0,
      unitsCount: 0,
      recipientsCount: 0,
    },
    locationDetails: {
      location: locality || `Grid ${parsed.hierarchyCode}`,
      emirate: emirateName,
      area: locality || emirateName,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    },
    linkedRecords: {
      totalCount: 0,
      items: [],
    },
  };
}

/** Merges GET /api/postcodes/{postcode} (GridCellDetailDto) into a PostcodeItem. */
export function mergeDetailIntoPostcodeItem(
  baseItem: PostcodeItem,
  detail: GridCellDetailDto,
  stats?: GridStatisticsDto | null,
  buildings?: BuildingListRowDto[] | null,
  buildingsTotal?: number
): PostcodeItem {
  const cell = detail?.cell || {};
  const parsed = parsePostcodeParts(
    cell.postcode ?? baseItem.rawPostcode,
    cell.postcodeDisplay ?? baseItem.postcodeDisplay,
    cell.hierarchyCode ?? baseItem.hierarchyCode
  );

  // Extract tier codes from hierarchy array if provided
  const chips = { ...parsed.chips };
  if (Array.isArray(detail?.hierarchy)) {
    for (const h of detail.hierarchy) {
      const code = h.hierarchyCode || h.code || "";
      const seg = code.split(/[.\-]/).pop()?.trim();
      if (seg && /^\d{2}$/.test(seg)) {
        if (h.tier === 1) chips.tier1 = seg;
        if (h.tier === 2) chips.tier2 = seg;
        if (h.tier === 3) chips.tier3 = seg;
        if (h.tier === 4) chips.tier4 = seg;
      }
    }
  }

  const maskState = getMaskState(cell);
  const status: "Published" | "Masked" =
    maskState === "MASKED"
      ? "Masked"
      : maskState === "UNMASKED" || maskState === "PARTIAL"
      ? "Published"
      : baseItem.status;

  const lat = Number(cell.centroidLatitude ?? baseItem.latitude ?? 0);
  const lng = Number(cell.centroidLongitude ?? baseItem.longitude ?? 0);
  const emirateCode = cell.emirateCode ?? baseItem.emirateCode;
  const emirateName = formatEmirateName(emirateCode, lat, lng);
  const locality =
    (typeof cell.nameEn === "string" && cell.nameEn.trim()) ||
    (typeof cell.name === "string" && cell.name.trim()) ||
    (baseItem.area && baseItem.area !== baseItem.emirate ? baseItem.area : "") ||
    "";

  const buildingsCount =
    stats?.buildingCount ??
    (typeof buildingsTotal === "number" ? buildingsTotal : baseItem.gridInfo.buildingsCount);
  const unitsCount = stats?.unitCount ?? baseItem.gridInfo.unitsCount;
  const recipientsCount =
    stats?.addressCount ?? stats?.verifiedAddressCount ?? baseItem.gridInfo.recipientsCount;

  const mappedLinkedItems: LinkedRecordItem[] = Array.isArray(buildings)
    ? buildings.map((b) => ({
        id: b.buildingId,
        type: "Building" as const,
        nameOrIdentifier: b.buildingNameEn || b.buildingNameAr || b.buildingId.slice(0, 8),
        canonicalAddress: [
          b.postcodeDisplay || parsed.formatted,
          formatEmirateName(b.emirateCode || emirateCode, b.latitude ?? lat, b.longitude ?? lng),
        ]
          .filter(Boolean)
          .join(", "),
        status:
          b.recordStatusCode?.toUpperCase() === "VERIFIED" ||
          b.recordStatusCode?.toUpperCase() === "ACTIVE"
            ? ("Verified" as const)
            : ("Published" as const),
      }))
    : baseItem.linkedRecords.items;

  const linkedTotal =
    typeof buildingsTotal === "number" && buildingsTotal > 0
      ? buildingsTotal
      : mappedLinkedItems.length > 0
      ? mappedLinkedItems.length
      : buildingsCount + unitsCount + recipientsCount;

  const resolvedHierarchyCode = cell.hierarchyCode || parsed.hierarchyCode;
  const subtitleParts = ["UAE", emirateName];
  if (locality && locality.toLowerCase() !== emirateName.toLowerCase() && locality !== "UAE") {
    subtitleParts.push(locality);
  } else if (resolvedHierarchyCode) {
    subtitleParts.push(`Grid ${resolvedHierarchyCode}`);
  }

  return {
    ...baseItem,
    id: cell.gridId || baseItem.id,
    postcode: `${chips.tier1}-${chips.tier2}-${chips.tier3}-${chips.tier4}`,
    rawPostcode: cell.postcode || baseItem.rawPostcode || parsed.formatted,
    postcodeDisplay: cell.postcodeDisplay || baseItem.postcodeDisplay || parsed.formatted,
    gridId: cell.gridId || baseItem.gridId,
    hierarchyCode: resolvedHierarchyCode,
    emirateCode: emirateCode || undefined,
    maskStatusCode: cell.maskStatusCode || baseItem.maskStatusCode || "UNMASKED",
    tier: cell.tier ?? baseItem.tier ?? 4,
    childCount: cell.childCount ?? baseItem.childCount,
    postcodeCount: cell.postcodeCount ?? baseItem.postcodeCount,
    geometryGeoJson: detail.geometryGeoJson ?? baseItem.geometryGeoJson,
    hierarchy: Array.isArray(detail.hierarchy)
      ? detail.hierarchy.map((h) => ({
          tier: h.tier,
          gridId: h.gridId,
          hierarchyCode: h.hierarchyCode || h.code,
          emirateCode: h.emirateCode,
          geometryGeoJson: h.geometryGeoJson,
        }))
      : baseItem.hierarchy,
    chips,
    emirate: emirateName,
    status,
    title: `Postcode ${chips.tier1}-${chips.tier2}-${chips.tier3}-${chips.tier4}`,
    subtitle: subtitleParts.join(" > "),
    area: locality || emirateName,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    gridInfo: {
      tierLabel: `T${cell.tier ?? 4}-${chips.tier4}`,
      buildingsCount,
      unitsCount,
      recipientsCount,
    },
    locationDetails: {
      building: mappedLinkedItems[0]?.nameOrIdentifier || baseItem.locationDetails.building,
      location: locality ? `${locality} (${resolvedHierarchyCode})` : `Grid ${resolvedHierarchyCode}`,
      emirate: emirateName,
      area: locality || emirateName,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    },
    linkedRecords: {
      totalCount: linkedTotal,
      items: mappedLinkedItems,
    },
  };
}

/** Extracts GridCellDetailDto whether response is wrapped in BaseResponse or direct. */
function unwrapDetailResponse(res: unknown): GridCellDetailDto | null {
  if (!res || typeof res !== "object") return null;
  const obj = res as Record<string, unknown>;
  if (obj.data && typeof obj.data === "object") {
    const dataObj = obj.data as Record<string, unknown>;
    if (dataObj.cell || dataObj.hierarchy || dataObj.geometryGeoJson) {
      return obj.data as GridCellDetailDto;
    }
  }
  if (obj.cell || obj.hierarchy || obj.geometryGeoJson) {
    return obj as unknown as GridCellDetailDto;
  }
  return null;
}

// Session-level cache for GET /api/postcodes/{postcode} details
const detailCache = new Map<string, Promise<GridCellDetailDto | null>>();

export const postcodeService = {
  /**
   * Searches postcodes with prefix or filters
   * GET /api/postcodes
   */
  searchPostcodes: async (
    params?: PostcodeSearchParams,
    options?: RequestOptions
  ): Promise<BaseResponse<PostcodeRowDto[]>> => {
    const cleanParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      if (params.search !== undefined && params.search !== "") cleanParams.search = params.search;
      if (params.emirate !== undefined && params.emirate !== "") cleanParams.emirate = params.emirate;
      if (params.bbox !== undefined && params.bbox !== "") cleanParams.bbox = params.bbox;
      if (params.Page !== undefined) cleanParams.Page = params.Page;
      if (params.PageSize !== undefined) cleanParams.PageSize = params.PageSize;
    }
    return apiClient.get<BaseResponse<PostcodeRowDto[]>>("/api/postcodes", {
      ...options,
      params: cleanParams,
    });
  },

  /**
   * Retrieves postcode details including grid cell and full hierarchy
   * GET /api/postcodes/{postcode}
   */
  getPostcodeDetail: async (
    postcode: string,
    options?: RequestOptions
  ): Promise<BaseResponse<GridCellDetailDto>> => {
    return apiClient.get<BaseResponse<GridCellDetailDto>>(
      `/api/postcodes/${encodeURIComponent(postcode)}`,
      options
    );
  },

  /**
   * Fetches cached or live detail from GET /api/postcodes/{postcode}.
   * Preserves hyphenated format ("15-98-43-00") which matches the backend postcode column.
   */
  getPostcodeDetailCached: async (
    postcode: string,
    options?: RequestOptions
  ): Promise<GridCellDetailDto | null> => {
    const parsed = parsePostcodeParts(postcode, postcode, undefined);
    const primaryKey = parsed.formatted; // e.g. "15-98-43-00"
    const fallbackDigits = postcode.replace(/\D/g, ""); // e.g. "15984300"
    if (!primaryKey) return null;

    let pending = detailCache.get(primaryKey);
    if (!pending) {
      pending = (async () => {
        try {
          const res = await postcodeService.getPostcodeDetail(primaryKey, {
            ...options,
            retries: 0,
          });
          const detail = unwrapDetailResponse(res);
          if (detail) return detail;
        } catch {
          // Try un-dashed fallback below if hyphenated call failed
        }
        if (fallbackDigits && fallbackDigits !== primaryKey) {
          try {
            const resFallback = await postcodeService.getPostcodeDetail(fallbackDigits, {
              ...options,
              retries: 0,
            });
            const detailFallback = unwrapDetailResponse(resFallback);
            if (detailFallback) return detailFallback;
          } catch {
            // Both failed
          }
        }
        detailCache.delete(primaryKey);
        return null;
      })();
      detailCache.set(primaryKey, pending);
    }
    return pending;
  },

  /**
   * Enriches a page of PostcodeItems with GET /api/postcodes/{postcode} details.
   */
  enrichPostcodeItems: async (
    items: PostcodeItem[],
    signal?: AbortSignal
  ): Promise<PostcodeItem[]> => {
    const results = await Promise.allSettled(
      items.map((item) =>
        postcodeService.getPostcodeDetailCached(item.rawPostcode || item.postcode, { signal })
      )
    );

    return items.map((item, idx) => {
      const r = results[idx];
      if (r.status !== "fulfilled" || !r.value) return item;
      return mergeDetailIntoPostcodeItem(item, r.value);
    });
  },

  /**
   * Full detail loader when a postcode row is clicked in the Postcode List:
   * Calls GET /api/postcodes/{postcode} and enriches with cell statistics & linked buildings.
   */
  fetchFullPostcodeDetail: async (
    item: PostcodeItem,
    signal?: AbortSignal
  ): Promise<PostcodeItem> => {
    const codeKey = item.rawPostcode || item.postcode;
    const detail = await postcodeService.getPostcodeDetailCached(codeKey, { signal });
    const hierarchyCode = detail?.cell?.hierarchyCode || item.hierarchyCode;

    const [statsRes, buildingsRes] = await Promise.allSettled([
      hierarchyCode
        ? gridService.getGridStatistics({ code: hierarchyCode }, { signal, retries: 0 })
        : Promise.resolve(null),
      addressRegistryService.listBuildings(
        { postcode: codeKey, page: 1, pageSize: 20 },
        { signal, retries: 0 }
      ),
    ]);

    const stats =
      statsRes.status === "fulfilled" && statsRes.value?.success ? statsRes.value.data : null;
    const buildingsData =
      buildingsRes.status === "fulfilled" && buildingsRes.value?.success
        ? buildingsRes.value.data
        : null;

    if (detail) {
      return mergeDetailIntoPostcodeItem(
        item,
        detail,
        stats,
        buildingsData?.items ?? null,
        buildingsData?.totalCount
      );
    }

    return item;
  },
};

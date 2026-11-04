import { apiClient, RequestOptions } from "./apiClient";
import { BaseResponse } from "./gridService";
import type { AddressRegistryItem } from "@/data/addressRegistryData";

/**
 * Address Registry service (frontend contract §9).
 * All routes go through the gateway with the session cookies (apiClient sends credentials: "include").
 * Registry data includes personal data: never cache it in localStorage / IndexedDB (§9.2).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Paged registry lists carry their rows in data.items[] (§9.2). */
export interface RegistryPagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type RegistryCodeDomain = "EMIRATE" | "RECORD_STATUS" | "BUILDING_TYPE";

export interface RegistryCodeValueDto {
  code: string;
  nameEn: string;
  nameAr?: string | null;
  sortOrder?: number | null;
}

export interface BuildingListRowDto {
  buildingId: string;
  buildingNameEn: string;
  buildingNameAr?: string | null;
  buildingTypeCode: string;
  emirateCode?: string | null;
  postcodeDisplay?: string | null;
  gridId?: string | null;
  recordStatusCode: string;
  isIconicMvp: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface BuildingListParams {
  emirate?: string;
  buildingType?: string;
  postcode?: string;
  status?: string;
  nameStartsWith?: string;
  page?: number;
  pageSize?: number;
}

export interface ExternalIdentifierDto {
  id: string;
  identifierTypeCode: string; // MAKANI | ONWANI | OTHER
  identifierValue: string;
  buildingId?: string | null;
  addressId?: string | null;
  isVerified: boolean;
  createdAt: string;
  version: number;
}

/** Filters of the Address Registry list screen. */
export interface RegistryListQuery {
  /** BUILDING_TYPE code — the "Class" filter */
  buildingType?: string;
  search?: string;
  /** EMIRATE code */
  emirate?: string;
  /** RECORD_STATUS code */
  status?: string;
  page: number;
  pageSize: number;
}

/** Code values the list screen needs for labels and filter dropdowns. */
export interface RegistryLookups {
  emirates: RegistryCodeValueDto[];
  statuses: RegistryCodeValueDto[];
  buildingTypes: RegistryCodeValueDto[];
}

export interface RegistryListResult {
  items: AddressRegistryItem[];
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type QueryParams = Record<string, string | number | boolean | undefined>;

const EMPTY = "-";

/** Drops empty values so they are not sent as `?status=`. */
function cleanParams(params?: object): QueryParams | undefined {
  if (!params) return undefined;
  const out: QueryParams = {};
  Object.entries(params as QueryParams).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    out[k] = v;
  });
  return out;
}

/** "27851465" or "2785-1465" (spaces allowed) → true. */
function isRegistryPostcode(value: string): boolean {
  return /^\d{4}-?\d{4}$/.test(value.replace(/\s+/g, ""));
}

/** Code → English label from a lookup; falls back to the code itself. */
const label = (list: RegistryCodeValueDto[] | undefined, code?: string | null): string => {
  if (!code) return EMPTY;
  return list?.find((c) => c.code === code)?.nameEn || code;
};

/** Short, readable id for the table; the full GUID stays in `id`. */
const shortId = (guid: string) => guid.replace(/-/g, "").slice(0, 8).toUpperCase();

/** First value of a type, with "+n" when there are more. */
const formatIdentifiers = (ids: ExternalIdentifierDto[], type: string): string => {
  const values = ids.filter((i) => i.identifierTypeCode === type).map((i) => i.identifierValue);
  if (values.length === 0) return EMPTY;
  return values.length === 1 ? values[0] : `${values[0]} +${values.length - 1}`;
};

/** Building list row → table row. */
function mapBuildingRow(row: BuildingListRowDto, lk?: RegistryLookups): AddressRegistryItem {
  return {
    id: row.buildingId,
    addressId: shortId(row.buildingId),
    addressLabel: row.buildingNameEn || EMPTY,
    classType: label(lk?.buildingTypes, row.buildingTypeCode),
    makani: EMPTY,
    onwani: EMPTY,
    status: label(lk?.statuses, row.recordStatusCode),
    emirate: label(lk?.emirates, row.emirateCode),
    postcode: row.postcodeDisplay ?? undefined,
    buildingName: row.buildingNameEn,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
}

// In memory only (per tab): code values are reference data, not personal data.
const codeValueCache = new Map<RegistryCodeDomain, Promise<RegistryCodeValueDto[]>>();

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const addressRegistryService = {
  /**
   * Retrieves a page of buildings with filters
   * GET /api/buildings
   */
  listBuildings: async (
    params?: BuildingListParams,
    options?: RequestOptions
  ): Promise<BaseResponse<RegistryPagedResult<BuildingListRowDto>>> => {
    return apiClient.get<BaseResponse<RegistryPagedResult<BuildingListRowDto>>>("/api/buildings", {
      ...options,
      params: cleanParams(params),
    });
  },

  /**
   * Retrieves the external identifiers (Makani, Onwani, Other) of a building
   * GET /api/buildings/{buildingId}/identifiers
   */
  getBuildingIdentifiers: async (
    buildingId: string,
    options?: RequestOptions
  ): Promise<BaseResponse<ExternalIdentifierDto[]>> => {
    return apiClient.get<BaseResponse<ExternalIdentifierDto[]>>(
      `/api/buildings/${encodeURIComponent(buildingId)}/identifiers`,
      options
    );
  },

  /**
   * Retrieves the code values of one domain
   * GET /api/registry/code-values?domain=
   */
  getCodeValues: async (
    domain: RegistryCodeDomain,
    options?: RequestOptions
  ): Promise<BaseResponse<RegistryCodeValueDto[]>> => {
    return apiClient.get<BaseResponse<RegistryCodeValueDto[]>>("/api/registry/code-values", {
      ...options,
      params: { domain },
    });
  },

  /**
   * Loads the lookups of the list screen, once per session (§9.9). A failed domain falls back to [].
   */
  loadLookups: async (): Promise<RegistryLookups> => {
    const get = (domain: RegistryCodeDomain): Promise<RegistryCodeValueDto[]> => {
      let cached = codeValueCache.get(domain);
      if (!cached) {
        cached = addressRegistryService
          .getCodeValues(domain)
          .then((res) => (Array.isArray(res?.data) ? res.data : []))
          .catch((err) => {
            codeValueCache.delete(domain);
            throw err;
          });
        codeValueCache.set(domain, cached);
      }
      return cached.catch(() => []);
    };

    const [emirates, statuses, buildingTypes] = await Promise.all([
      get("EMIRATE"),
      get("RECORD_STATUS"),
      get("BUILDING_TYPE"),
    ]);
    return { emirates, statuses, buildingTypes };
  },

  /**
   * One page of the Address Registry list (buildings), mapped to table rows.
   * The search box sends a postcode as `postcode`, any other text as `nameStartsWith`.
   */
  fetchList: async (
    query: RegistryListQuery,
    lookups?: RegistryLookups,
    signal?: AbortSignal
  ): Promise<RegistryListResult> => {
    const search = (query.search ?? "").trim();
    const postcode = search && isRegistryPostcode(search) ? search.replace(/\s+/g, "") : undefined;

    const res = await addressRegistryService.listBuildings(
      {
        emirate: query.emirate,
        buildingType: query.buildingType,
        status: query.status,
        postcode,
        nameStartsWith: search && !postcode ? search : undefined,
        page: query.page,
        pageSize: query.pageSize,
      },
      { signal, retries: 0 }
    );

    const items = Array.isArray(res?.data?.items) ? res.data.items : [];
    return {
      items: items.map((row) => mapBuildingRow(row, lookups)),
      totalCount: res?.data?.totalCount ?? res?.totalCount ?? items.length,
    };
  },

  /**
   * Fills Makani / Onwani for the rows on the current page (list rows carry no identifiers).
   * One call per row; a failed call leaves "-".
   */
  enrichWithIdentifiers: async (
    items: AddressRegistryItem[],
    signal?: AbortSignal
  ): Promise<AddressRegistryItem[]> => {
    const results = await Promise.allSettled(
      items.map((item) => addressRegistryService.getBuildingIdentifiers(item.id, { signal, retries: 0 }))
    );

    return items.map((item, i) => {
      const r = results[i];
      if (r.status !== "fulfilled" || !Array.isArray(r.value?.data)) return item;
      return {
        ...item,
        makani: formatIdentifiers(r.value.data, "MAKANI"),
        onwani: formatIdentifiers(r.value.data, "ONWANI"),
      };
    });
  },
};

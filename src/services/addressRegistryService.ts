import { apiClient, RequestOptions } from "./apiClient";
import { BaseResponse } from "./gridService";

/**
 * Address Registry service (frontend contract §9).
 * All routes go through the gateway with the session cookies (apiClient sends credentials: "include").
 * Registry data includes personal data: never cache it in localStorage / IndexedDB (§9.2).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Row model of the Address Registry table and side panel. */
export interface AddressRegistryItem {
  id: string;
  addressId: string; // e.g. VA-2026-1002
  addressLabel: string; // e.g. Ref. Tower, Al Garhoud
  classType: string; // display label (backend: BUILDING_TYPE nameEn, e.g. Residential)
  makani: string; // e.g. 26892789... or Restricted or -
  onwani: string; // e.g. Z2.E12.P19 or -
  status: string; // display label (backend: RECORD_STATUS nameEn, e.g. Active)
  emirate: string; // e.g. Dubai, Abu Dhabi, Sharjah, etc.
  postcode?: string;
  t1?: string;
  t2?: string;
  t3?: string;
  t4?: string;
  unitNumber?: string;
  buildingName?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

/** Paged registry lists carry their rows in data.items[] (§9.2). */
export interface RegistryPagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export type RegistryCodeDomain =
  | "EMIRATE"
  | "RECORD_STATUS"
  | "BUILDING_TYPE"
  | "UNIT_TYPE"
  | "INDIVIDUAL_ADDRESS_TYPE"
  | "ADDRESS_LEVEL_TYPE";

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

/** Level filter of the connected-address routes (§9.9): "All" or an ADDRESS_LEVEL_TYPE code (case-insensitive). */
export type ConnectedAddressLevel = string;

/** A row of GET /api/registry/by-grid/{gridId}: buildings, units and individual addresses in one list. */
export interface ConnectedAddressDto {
  /** ADDRESS_LEVEL_TYPE code (labels: addressRegistryService.loadLevelTypes) */
  level: string;
  id: string;
  buildingId?: string | null;
  unitId?: string | null;
  /** Building: English name or number; unit: number or name; individual: the type code unless Address_Manage */
  displayName?: string | null;
  typeCode?: string | null;
  statusCode?: string | null;
  gridId?: string | null;
  postcode?: string | null;
  postcodeDisplay?: string | null;
  lat?: number | null;
  lon?: number | null;
  inheritedFrom?: string | null;
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

/** Search input that is a postcode: 8 digits, with or without hyphens / spaces ("34335438", "3433-5438", "34-33-54-38"). */
function isRegistryPostcode(value: string): boolean {
  return /^\d{8}$/.test(value.replace(/[\s-]+/g, ""));
}

/** Postcode as shown in the registry: a hyphen between each pair of digits ("3433-5438" → "34-33-54-38"). */
export function formatPostcode(value?: string | null): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  return digits ? digits.match(/.{1,2}/g)!.join("-") : undefined;
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
    postcode: formatPostcode(row.postcodeDisplay),
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
   * Retrieves everything at a postcode: buildings, units and individual addresses (matched on the effective postcode)
   * GET /api/registry/by-postcode/{postcode}
   */
  listByPostcode: async (
    postcode: string,
    params?: { level?: ConnectedAddressLevel; page?: number; pageSize?: number },
    options?: RequestOptions
  ): Promise<BaseResponse<RegistryPagedResult<ConnectedAddressDto>>> => {
    return apiClient.get<BaseResponse<RegistryPagedResult<ConnectedAddressDto>>>(
      `/api/registry/by-postcode/${encodeURIComponent(postcode.replace(/\D/g, ""))}`,
      { ...options, params: cleanParams(params) }
    );
  },

  /**
   * Retrieves everything in a T4 grid cell: buildings, units and individual addresses
   * GET /api/registry/by-grid/{gridId}
   */
  listByGrid: async (
    gridId: string,
    params?: { level?: ConnectedAddressLevel; page?: number; pageSize?: number },
    options?: RequestOptions
  ): Promise<BaseResponse<RegistryPagedResult<ConnectedAddressDto>>> => {
    return apiClient.get<BaseResponse<RegistryPagedResult<ConnectedAddressDto>>>(
      `/api/registry/by-grid/${encodeURIComponent(gridId)}`,
      { ...options, params: cleanParams(params) }
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
    const [emirates, statuses, buildingTypes] = await Promise.all([
      cachedCodeValues("EMIRATE"),
      cachedCodeValues("RECORD_STATUS"),
      cachedCodeValues("BUILDING_TYPE"),
    ]);
    return { emirates, statuses, buildingTypes };
  },

  /**
   * Address levels (BUILDING, UNIT, INDIVIDUAL) with their labels, in display order. Once per session.
   * GET /api/registry/code-values?domain=ADDRESS_LEVEL_TYPE
   */
  loadLevelTypes: async (): Promise<RegistryCodeValueDto[]> => {
    const list = await cachedCodeValues("ADDRESS_LEVEL_TYPE");
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },

  /**
   * English label per type code, for rows that mix levels (building, unit and individual address types).
   * Once per session; a failed domain is left out, so its codes show as-is.
   */
  loadTypeLabels: async (): Promise<Record<string, string>> => {
    const lists = await Promise.all(
      (["BUILDING_TYPE", "UNIT_TYPE", "INDIVIDUAL_ADDRESS_TYPE"] as RegistryCodeDomain[]).map(cachedCodeValues)
    );
    const labels: Record<string, string> = {};
    lists.flat().forEach((c) => {
      if (c.code && c.nameEn) labels[c.code] = c.nameEn;
    });
    return labels;
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
    const postcode = search && isRegistryPostcode(search) ? search.replace(/[\s-]+/g, "") : undefined;

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

/** Code values of one domain, once per session (in memory). A failed request is retried next time and yields []. */
function cachedCodeValues(domain: RegistryCodeDomain): Promise<RegistryCodeValueDto[]> {
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
}

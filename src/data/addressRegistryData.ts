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

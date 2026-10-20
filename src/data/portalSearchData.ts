export interface GridStatItem {
  id: string;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  borderColor: string;
  iconType:
    | "grid-amber"
    | "grid-red"
    | "grid-purple"
    | "postcodes-teal"
    | "buildings-pink"
    | "addresses-orange"
    | "units-blue"
    | "makani-purple"
    | "onwani-brown"
    | "makani-mapped-green"
    | "onwani-mapped-lime"
    | "verified-green"
    | "coverage-blue"
    | "postcodes-alert-rose";
}

export const GRID_STATISTICS_DATA: GridStatItem[] = [
  {
    id: "total-grid-cells",
    label: "Total Grid Cells",
    value: 100,
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.08)",
    borderColor: "rgba(245, 158, 11, 0.25)",
    iconType: "grid-amber",
  },
  {
    id: "masked-cells",
    label: "Masked Cells",
    value: 62,
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.25)",
    iconType: "grid-red",
  },
  {
    id: "unmasked-cells",
    label: "UnMasked Cells",
    value: 38,
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.25)",
    iconType: "grid-purple",
  },
  {
    id: "total-postcodes",
    label: "Total Postcodes",
    value: "2900",
    color: "#0D9488",
    bgColor: "rgba(13, 148, 136, 0.08)",
    borderColor: "rgba(13, 148, 136, 0.25)",
    iconType: "postcodes-teal",
  },
  {
    id: "total-buildings",
    label: "Total Buildings",
    value: "1,389",
    color: "#EC4899",
    bgColor: "rgba(236, 72, 153, 0.08)",
    borderColor: "rgba(236, 72, 153, 0.25)",
    iconType: "buildings-pink",
  },
  {
    id: "total-addresses",
    label: "Total Addresses",
    value: "3,390",
    color: "#F97316",
    bgColor: "rgba(249, 115, 22, 0.08)",
    borderColor: "rgba(249, 115, 22, 0.25)",
    iconType: "addresses-orange",
  },
  {
    id: "total-units",
    label: "Total Units",
    value: "5,099",
    color: "#2563EB",
    bgColor: "rgba(37, 99, 235, 0.08)",
    borderColor: "rgba(37, 99, 235, 0.25)",
    iconType: "units-blue",
  },
  {
    id: "makani-listed",
    label: "Makani Listed",
    value: "1,299",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.08)",
    borderColor: "rgba(139, 92, 246, 0.25)",
    iconType: "makani-purple",
  },
  {
    id: "onwani-listed",
    label: "Onwani Listed",
    value: "2,299",
    color: "#B45309",
    bgColor: "rgba(180, 83, 9, 0.08)",
    borderColor: "rgba(180, 83, 9, 0.25)",
    iconType: "onwani-brown",
  },
  {
    id: "makani-mapped",
    label: "Makani Mapped to Postcode",
    value: "1,100",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.25)",
    iconType: "makani-mapped-green",
  },
  {
    id: "onwani-mapped",
    label: "Onwani Mapped to Postcode",
    value: "2,000",
    color: "#22C55E",
    bgColor: "rgba(34, 197, 94, 0.08)",
    borderColor: "rgba(34, 197, 94, 0.25)",
    iconType: "onwani-mapped-lime",
  },
  {
    id: "verified-addresses",
    label: "Verified Addresses",
    value: "2,598",
    color: "#16A34A",
    bgColor: "rgba(22, 163, 74, 0.08)",
    borderColor: "rgba(22, 163, 74, 0.25)",
    iconType: "verified-green",
  },
  {
    id: "coverage",
    label: "Building Listing coverage",
    value: "88%",
    color: "#2563EB",
    bgColor: "rgba(37, 99, 235, 0.08)",
    borderColor: "rgba(37, 99, 235, 0.25)",
    iconType: "coverage-blue",
  },
  {
    id: "postcodes-without-buildings",
    label: "Postcodes Without Buildings",
    value: "150",
    color: "#F43F5E",
    bgColor: "rgba(244, 63, 94, 0.08)",
    borderColor: "rgba(244, 63, 94, 0.25)",
    iconType: "postcodes-alert-rose",
  },
];

// UAE Tier 1 unmasked land cells (38 cells strictly within UAE territory, excluding Qatar, Bahrain, Iran, and foreign land)
export const UAE_UNMASKED_CELLS: string[] = [
  "28",
  "37", "38", "39",
  "44", "45", "46", "47", "48", "49",
  "52", "53", "54", "55", "56", "57", "58", "59",
  "62", "63", "64", "65", "66", "67", "68", "69",
  "72", "73", "74", "75", "76", "77", "78",
  "83", "84", "85", "86", "87"
];

export interface SearchResultItem {
  id: string;
  name: string;
  type: "building" | "mall" | "restaurant" | "location";
  status: "Verified" | "Non Verified";
  addressLine: string;
  postCode: string;
  tiers: {
    tier1: string;
    tier2: string;
    tier3: string;
    tier4: string;
  };
  latitude: number;
  longitude: number;
  makaniNumber: string;
  onwaniAddress: string;
  coordinates: string;
  buildingName: string;
  addressType: string;
  addressIdentifier: string;
  floors: number;
  units: number;
  street: string;
  areaLocality: string;
  emirateAdminArea: string;
  countryCode: string;
  countryName: string;
  lastUpdate: string;
  gridLineage: {
    tier1: { code: string; label: string; desc: string };
    tier2: { code: string; label: string; desc: string };
    tier3: { code: string; label: string; desc: string };
    tier4: { code: string; label: string; desc: string };
  };
}

export const PORTAL_SEARCH_ITEMS: SearchResultItem[] = [
  {
    id: "sr-1",
    name: "Burj Khalifa",
    type: "building",
    status: "Verified",
    addressLine: "1, Mohammed Bin Rashid Boulevard, Za'abeel, Dubai, Dubai Municipality",
    postCode: "45-05-45-24",
    tiers: {
      tier1: "46",
      tier2: "45",
      tier3: "65",
      tier4: "76",
    },
    latitude: 25.1972,
    longitude: 55.2744,
    makaniNumber: "26144 87868",
    onwaniAddress: "-",
    coordinates: "25.19019, 55.27126",
    buildingName: "Burj Khalifa",
    addressType: "Building",
    addressIdentifier: "DXB-474867",
    floors: 120,
    units: 1908,
    street: "Mohammed Bin Rashid",
    areaLocality: "Burj Khalifa",
    emirateAdminArea: "Dubai",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "12 sep 2026",
    gridLineage: {
      tier1: { code: "42", label: "Tier 1", desc: "Dubai" },
      tier2: { code: "42-05", label: "Tier 2", desc: "Dubai Municipality" },
      tier3: { code: "42-05-45", label: "Tier 3", desc: "Za'abeel, Dubai" },
      tier4: { code: "42-05-45-76", label: "Tier 4", desc: "Plot 76" },
    },
  },
  {
    id: "sr-2",
    name: "Burjman",
    type: "mall",
    status: "Verified",
    addressLine: "Mall • 2, Sheikh Khalifa Bin Zayed road, 2, 28a street, Bur Dubai, Dubai,",
    postCode: "45-05-45-24",
    tiers: {
      tier1: "45",
      tier2: "05",
      tier3: "45",
      tier4: "24",
    },
    latitude: 25.2532,
    longitude: 55.3024,
    makaniNumber: "29871 94102",
    onwaniAddress: "02 10103 89221",
    coordinates: "25.25320, 55.30240",
    buildingName: "Burjman Centre",
    addressType: "Mall / Commercial",
    addressIdentifier: "DXB-450545",
    floors: 6,
    units: 320,
    street: "Sheikh Khalifa Bin Zayed Rd",
    areaLocality: "Bur Dubai",
    emirateAdminArea: "Dubai",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "10 sep 2026",
    gridLineage: {
      tier1: { code: "45", label: "Tier 1", desc: "Dubai North" },
      tier2: { code: "45-05", label: "Tier 2", desc: "Bur Dubai Sector" },
      tier3: { code: "45-05-45", label: "Tier 3", desc: "Al Mankhool" },
      tier4: { code: "45-05-45-24", label: "Tier 4", desc: "Plot 24" },
    },
  },
  {
    id: "sr-3",
    name: "Burger King",
    type: "restaurant",
    status: "Verified",
    addressLine: "Fast food restaurant • 108 places • Dubai Land, Dubai, Dubai Municipality",
    postCode: "45-05-45-24",
    tiers: {
      tier1: "45",
      tier2: "05",
      tier3: "45",
      tier4: "24",
    },
    latitude: 25.1950,
    longitude: 55.2780,
    makaniNumber: "26189 87812",
    onwaniAddress: "-",
    coordinates: "25.19500, 55.27800",
    buildingName: "Burger King Outlet",
    addressType: "Commercial / Dining",
    addressIdentifier: "DXB-987122",
    floors: 2,
    units: 1,
    street: "Financial Center Blvd",
    areaLocality: "Dubai Land",
    emirateAdminArea: "Dubai",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "08 sep 2026",
    gridLineage: {
      tier1: { code: "45", label: "Tier 1", desc: "Dubai" },
      tier2: { code: "45-05", label: "Tier 2", desc: "Dubai Municipality" },
      tier3: { code: "45-05-45", label: "Tier 3", desc: "Downtown South" },
      tier4: { code: "45-05-45-24", label: "Tier 4", desc: "Plot 24" },
    },
  },
  {
    id: "sr-4",
    name: "Burj Khalifa",
    type: "location",
    status: "Non Verified",
    addressLine: "1, Mohammed Bin Rashid Boulevard, Za'abeel, Dubai, Dubai Municipality",
    postCode: "45-05-45-24",
    tiers: {
      tier1: "46",
      tier2: "45",
      tier3: "65",
      tier4: "76",
    },
    latitude: 25.1972,
    longitude: 55.2744,
    makaniNumber: "26144 87868",
    onwaniAddress: "-",
    coordinates: "25.19019, 55.27126",
    buildingName: "Burj Khalifa Observation Deck",
    addressType: "Tourism Landmark",
    addressIdentifier: "DXB-474899",
    floors: 148,
    units: 12,
    street: "Mohammed Bin Rashid Blvd",
    areaLocality: "Za'abeel",
    emirateAdminArea: "Dubai",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "05 sep 2026",
    gridLineage: {
      tier1: { code: "42", label: "Tier 1", desc: "Dubai" },
      tier2: { code: "42-05", label: "Tier 2", desc: "Dubai Municipality" },
      tier3: { code: "42-05-45", label: "Tier 3", desc: "Za'abeel, Dubai" },
      tier4: { code: "42-05-45-76", label: "Tier 4", desc: "Plot 76" },
    },
  },
  {
    id: "sr-5",
    name: "Burj Khalifa",
    type: "building",
    status: "Non Verified",
    addressLine: "1, Mohammed Bin Rashid Boulevard, Za'abeel, Dubai, Dubai Municipality",
    postCode: "45-05-45-24",
    tiers: {
      tier1: "46",
      tier2: "45",
      tier3: "65",
      tier4: "76",
    },
    latitude: 25.1968,
    longitude: 55.2738,
    makaniNumber: "26144 87870",
    onwaniAddress: "-",
    coordinates: "25.19680, 55.27380",
    buildingName: "The Residence at Burj Khalifa",
    addressType: "Residential Tower",
    addressIdentifier: "DXB-474801",
    floors: 108,
    units: 900,
    street: "Sheikh Mohammed bin Rashid Blvd",
    areaLocality: "Downtown Dubai",
    emirateAdminArea: "Dubai",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "01 sep 2026",
    gridLineage: {
      tier1: { code: "42", label: "Tier 1", desc: "Dubai" },
      tier2: { code: "42-05", label: "Tier 2", desc: "Dubai Municipality" },
      tier3: { code: "42-05-45", label: "Tier 3", desc: "Downtown" },
      tier4: { code: "42-05-45-76", label: "Tier 4", desc: "Plot 76" },
    },
  },
  {
    id: "sr-6",
    name: "Burj Khalifa",
    type: "building",
    status: "Non Verified",
    addressLine: "1, Mohammed Bin Rashid Boulevard, Za'abeel, Dubai, Dubai Municipality",
    postCode: "45-05-45-24",
    tiers: {
      tier1: "46",
      tier2: "45",
      tier3: "65",
      tier4: "76",
    },
    latitude: 25.1960,
    longitude: 55.2750,
    makaniNumber: "26144 87875",
    onwaniAddress: "-",
    coordinates: "25.19600, 55.27500",
    buildingName: "Burj Khalifa Lake Annex",
    addressType: "Commercial / Leisure",
    addressIdentifier: "DXB-474850",
    floors: 4,
    units: 24,
    street: "Mohammed Bin Rashid Blvd",
    areaLocality: "Downtown Dubai",
    emirateAdminArea: "Dubai",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    lastUpdate: "28 aug 2026",
    gridLineage: {
      tier1: { code: "42", label: "Tier 1", desc: "Dubai" },
      tier2: { code: "42-05", label: "Tier 2", desc: "Dubai Municipality" },
      tier3: { code: "42-05-45", label: "Tier 3", desc: "Za'abeel, Dubai" },
      tier4: { code: "42-05-45-76", label: "Tier 4", desc: "Plot 76" },
    },
  },
];

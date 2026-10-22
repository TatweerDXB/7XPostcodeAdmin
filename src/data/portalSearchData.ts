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

// UAE Tier 1 unmasked land cells matching Figma Search Console Full Grid design
export const UAE_UNMASKED_CELLS: string[] = [
  "06", "07",
  "16", "17", "18",
  "25", "26", "27", "28", "29",
  "35", "36", "37", "38", "39",
  "41", "42", "43", "44", "45", "46", "47", "48",
  "51", "52", "53", "54", "55", "56", "57",
  "62", "63", "64", "65", "66",
];

// Exact UAE boundary polygon coordinates enclosing only UAE inside the enabled grid cells
export const UAE_BORDER_COORDINATES: [number, number][] = [
  [24.59573, 57.1941],
  [24.58028, 56.73546],
  [24.61066, 56.48346],
  [25.32137, 56.48346],
  [25.45732, 56.35053],
  [25.45732, 56.15775],
  [25.50264, 56.11365],
  [25.66899, 56.06892],
  [25.89559, 56.06892],
  [25.94091, 56.09853],
  [26.16803, 56.08404],
  [26.21334, 56.02482],
  [26.21334, 55.96497],
  [26.13764, 55.87614],
  [25.98623, 55.86165],
  [25.95636, 55.83204],
  [25.95636, 55.65438],
  [25.98623, 55.62477],
  [25.97129, 54.67725],
  [26.00168, 54.61803],
  [25.88065, 54.60291],
  [25.88065, 55.28394],
  [25.62367, 55.29906],
  [25.59328, 55.10628],
  [25.47226, 55.01745],
  [25.39655, 55.01745],
  [25.3363, 54.97335],
  [25.3363, 54.8253],
  [25.23072, 54.79569],
  [25.21527, 54.70686],
  [25.12463, 54.69174],
  [25.12463, 54.61803],
  [25.03399, 54.5292],
  [24.95829, 54.5292],
  [24.88258, 54.46998],
  [24.88258, 54.39564],
  [24.82233, 54.33642],
  [24.82233, 54.2772],
  [24.76156, 54.2772],
  [24.65598, 54.17388],
  [24.64105, 54.08505],
  [24.399, 54],
  [24.399, 54],
  [24.27797, 54],
  [24.23265, 54],
  [24.23265, 54],
  [24.12656, 54],
  [24.02099, 53.55207],
  [24.02099, 53.32968],
  [23.96073, 53.19675],
  [23.94528, 52.88553],
  [23.89996, 52.82631],
  [23.6883, 52.81182],
  [23.6883, 52.61904],
  [23.80932, 52.53021],
  [23.83971, 52.26372],
  [23.9149, 52.18938],
  [23.86958, 52.04133],
  [23.86958, 51.68601],
  [23.89996, 51.6564],
  [23.89996, 51.53796],
  [23.93035, 51.50835],
  [24.00605, 51.50835],
  [23.8325, 51.5115],
  [23.575, 51.4926],
  [23.369, 51.48],
  [23.17433, 51.47874],
  [23.11356, 51.47874],
  [22.90189, 51.64191],
  [22.72061, 52.30782],
  [22.67529, 52.63416],
  [22.61504, 52.70787],
  [22.61504, 52.7967],
  [22.55427, 52.84143],
  [22.53933, 53.13753],
  [22.46363, 53.31519],
  [22.47856, 53.81856],
  [22.53933, 53.89227],
  [22.53933, 54.78057],
  [22.49401, 54.79569],
  [22.49401, 54.8253],
  [22.53933, 54.83979],
  [22.55427, 54.89901],
  [22.67529, 54.91413],
  [22.81125, 55.09179],
  [22.99305, 55.15101],
  [23.11356, 55.31355],
  [23.23458, 55.31355],
  [23.34067, 55.47672],
  [23.43131, 55.52082],
  [23.59766, 55.52082],
  [23.73362, 55.58004],
  [24.0967, 55.56555],
  [24.18733, 55.65438],
  [24.1724, 55.92087],
  [23.79439, 55.95048],
  [23.73362, 55.99521],
  [23.6883, 56.14326],
  [23.764, 56.18736],
  [23.764, 56.27619],
  [23.79439, 56.27619],
  [23.79439, 56.05443],
  [23.83971, 55.98009],
  [24.05138, 55.98009],
  [24.0967, 56.08404],
  [24.20227, 56.11365],
  [24.20227, 56.43936],
  [23.9149, 56.45385],
  [23.9149, 56.48346],
  [24.47471, 56.49858],
  [24.47471, 57.1941],
  [24.59573, 57.1941],
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


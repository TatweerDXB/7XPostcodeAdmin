export interface LinkedRecordItem {
  id: string;
  type: "Building" | "Unit" | "Individual Recipient" | "Makani" | "Onwani";
  nameOrIdentifier: string;
  canonicalAddress: string;
  status: "Verified" | "Published" | "Pending";
}

export interface PostcodeItem {
  id: string;
  rowNumber: number;
  postcode: string;
  chips: {
    tier1: string;
    tier2: string;
    tier3: string;
    tier4: string;
  };
  emirate: string;
  status: "Published" | "Masked";
  title: string;
  subtitle: string;
  area: string;
  latitude: number;
  longitude: number;
  gridInfo: {
    tierLabel: string;
    buildingsCount: number;
    unitsCount: number;
    recipientsCount: number;
  };
  locationDetails: {
    location: string;
    emirate: string;
    area: string;
    latitude: number;
    longitude: number;
  };
  linkedRecords: {
    totalCount: number;
    items: LinkedRecordItem[];
  };
}

export const POSTCODE_ITEMS: PostcodeItem[] = [
  {
    id: "pc-1",
    rowNumber: 1,
    postcode: "47-48-67-90",
    chips: { tier1: "47", tier2: "48", tier3: "67", tier4: "90" },
    emirate: "Abu Dhabi",
    status: "Published",
    title: "Postcode 47-48-67-90",
    subtitle: "Dubai,Burj Khalifa",
    area: "Downtown Dubai",
    latitude: 25.1972,
    longitude: 55.2744,
    gridInfo: {
      tierLabel: "T4-90",
      buildingsCount: 134,
      unitsCount: 1567,
      recipientsCount: 467,
    },
    locationDetails: {
      location: "Burj Khalifa - Downtown",
      emirate: "Dubai",
      area: "Downtown",
      latitude: 25.1972,
      longitude: 55.2744,
    },
    linkedRecords: {
      totalCount: 1843,
      items: [
        {
          id: "rec-1",
          type: "Building",
          nameOrIdentifier: "Burj Khalifa Tower A",
          canonicalAddress: "1 Sheikh Mohammed bin Rashid Blvd",
          status: "Verified",
        },
        {
          id: "rec-2",
          type: "Unit",
          nameOrIdentifier: "Unit 4402 - Luxury Suite",
          canonicalAddress: "Level 44, Burj Khalifa",
          status: "Verified",
        },
        {
          id: "rec-3",
          type: "Individual Recipient",
          nameOrIdentifier: "Emaar Properties Corp",
          canonicalAddress: "PO Box 9440, Dubai",
          status: "Verified",
        },
        {
          id: "rec-4",
          type: "Makani",
          nameOrIdentifier: "26144 87868",
          canonicalAddress: "Downtown Dubai Plot 47-48-67-90",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-2",
    rowNumber: 2,
    postcode: "51-53-72-95",
    chips: { tier1: "51", tier2: "53", tier3: "72", tier4: "95" },
    emirate: "Sharjah",
    status: "Masked",
    title: "Postcode 51-53-72-95",
    subtitle: "Sharjah, Al Majaz Waterfront",
    area: "Al Majaz 2",
    latitude: 25.3289,
    longitude: 55.3852,
    gridInfo: {
      tierLabel: "T4-95",
      buildingsCount: 88,
      unitsCount: 940,
      recipientsCount: 312,
    },
    locationDetails: {
      location: "Al Majaz Waterfront - Corniche",
      emirate: "Sharjah",
      area: "Al Majaz",
      latitude: 25.3289,
      longitude: 55.3852,
    },
    linkedRecords: {
      totalCount: 1250,
      items: [
        {
          id: "rec-5",
          type: "Building",
          nameOrIdentifier: "Al Majaz Tower 1",
          canonicalAddress: "Corniche St, Al Majaz 2",
          status: "Verified",
        },
        {
          id: "rec-6",
          type: "Unit",
          nameOrIdentifier: "Apartment 1204",
          canonicalAddress: "Floor 12, Al Majaz Tower 1",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-3",
    rowNumber: 3,
    postcode: "55-58-75-92",
    chips: { tier1: "55", tier2: "58", tier3: "75", tier4: "92" },
    emirate: "Ajman",
    status: "Published",
    title: "Postcode 55-58-75-92",
    subtitle: "Ajman, Corniche Avenue",
    area: "Al Rumailah",
    latitude: 25.4111,
    longitude: 55.4439,
    gridInfo: {
      tierLabel: "T4-92",
      buildingsCount: 64,
      unitsCount: 680,
      recipientsCount: 198,
    },
    locationDetails: {
      location: "Ajman Corniche Plaza",
      emirate: "Ajman",
      area: "Al Rumailah 1",
      latitude: 25.4111,
      longitude: 55.4439,
    },
    linkedRecords: {
      totalCount: 878,
      items: [
        {
          id: "rec-7",
          type: "Building",
          nameOrIdentifier: "Corniche Residence",
          canonicalAddress: "Sheikh Humaid Bin Rashid Al Nuaimi St",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-4",
    rowNumber: 4,
    postcode: "60-61-80-98",
    chips: { tier1: "60", tier2: "61", tier3: "80", tier4: "98" },
    emirate: "Ras Al Khaimah",
    status: "Published",
    title: "Postcode 60-61-80-98",
    subtitle: "Ras Al Khaimah, Al Marjan Island",
    area: "Al Marjan Island",
    latitude: 25.6741,
    longitude: 55.7428,
    gridInfo: {
      tierLabel: "T4-98",
      buildingsCount: 42,
      unitsCount: 520,
      recipientsCount: 145,
    },
    locationDetails: {
      location: "Al Marjan Island Boulevard",
      emirate: "Ras Al Khaimah",
      area: "Al Marjan",
      latitude: 25.6741,
      longitude: 55.7428,
    },
    linkedRecords: {
      totalCount: 665,
      items: [
        {
          id: "rec-8",
          type: "Building",
          nameOrIdentifier: "Pacific Residences Tower B",
          canonicalAddress: "Al Marjan Island Blvd",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-5",
    rowNumber: 5,
    postcode: "64-66-78-99",
    chips: { tier1: "64", tier2: "66", tier3: "78", tier4: "99" },
    emirate: "Fujairah",
    status: "Masked",
    title: "Postcode 64-66-78-99",
    subtitle: "Fujairah, Al Faseel Beach",
    area: "Al Faseel",
    latitude: 25.1472,
    longitude: 56.3468,
    gridInfo: {
      tierLabel: "T4-99",
      buildingsCount: 38,
      unitsCount: 390,
      recipientsCount: 110,
    },
    locationDetails: {
      location: "Al Faseel Coastal Strip",
      emirate: "Fujairah",
      area: "Al Faseel",
      latitude: 25.1472,
      longitude: 56.3468,
    },
    linkedRecords: {
      totalCount: 500,
      items: [
        {
          id: "rec-9",
          type: "Building",
          nameOrIdentifier: "Fujairah Grand Plaza",
          canonicalAddress: "Al Faseel Street",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-6",
    rowNumber: 6,
    postcode: "68-70-82-89",
    chips: { tier1: "68", tier2: "70", tier3: "82", tier4: "89" },
    emirate: "Umm Al-Quwain",
    status: "Published",
    title: "Postcode 68-70-82-89",
    subtitle: "Umm Al-Quwain, Old Town Area",
    area: "Al Khor",
    latitude: 25.5647,
    longitude: 55.5552,
    gridInfo: {
      tierLabel: "T4-89",
      buildingsCount: 29,
      unitsCount: 280,
      recipientsCount: 88,
    },
    locationDetails: {
      location: "Al Khor Historical Sector",
      emirate: "Umm Al-Quwain",
      area: "Al Khor",
      latitude: 25.5647,
      longitude: 55.5552,
    },
    linkedRecords: {
      totalCount: 368,
      items: [
        {
          id: "rec-10",
          type: "Building",
          nameOrIdentifier: "UAQ Municipal Complex",
          canonicalAddress: "King Faisal Street",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-7",
    rowNumber: 7,
    postcode: "73-76-84-97",
    chips: { tier1: "73", tier2: "76", tier3: "84", tier4: "97" },
    emirate: "Dubai",
    status: "Masked",
    title: "Postcode 73-76-84-97",
    subtitle: "Dubai, Dubai Marina",
    area: "Dubai Marina",
    latitude: 25.0805,
    longitude: 55.1403,
    gridInfo: {
      tierLabel: "T4-97",
      buildingsCount: 195,
      unitsCount: 2800,
      recipientsCount: 850,
    },
    locationDetails: {
      location: "Marina Promenade Sector",
      emirate: "Dubai",
      area: "Dubai Marina",
      latitude: 25.0805,
      longitude: 55.1403,
    },
    linkedRecords: {
      totalCount: 3650,
      items: [
        {
          id: "rec-11",
          type: "Building",
          nameOrIdentifier: "Marina Gate Tower 1",
          canonicalAddress: "Marina Walkway, Dubai Marina",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-8",
    rowNumber: 8,
    postcode: "77-80-88-96",
    chips: { tier1: "77", tier2: "80", tier3: "88", tier4: "96" },
    emirate: "Abu Dhabi",
    status: "Published",
    title: "Postcode 77-80-88-96",
    subtitle: "Abu Dhabi, Al Maryah Island",
    area: "Al Maryah Island",
    latitude: 24.5008,
    longitude: 54.3891,
    gridInfo: {
      tierLabel: "T4-96",
      buildingsCount: 75,
      unitsCount: 1120,
      recipientsCount: 380,
    },
    locationDetails: {
      location: "ADGM Financial Square",
      emirate: "Abu Dhabi",
      area: "Al Maryah Island",
      latitude: 24.5008,
      longitude: 54.3891,
    },
    linkedRecords: {
      totalCount: 1500,
      items: [
        {
          id: "rec-12",
          type: "Building",
          nameOrIdentifier: "Al Khatem Tower",
          canonicalAddress: "ADGM Square, Al Maryah Island",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-9",
    rowNumber: 9,
    postcode: "81-83-91-94",
    chips: { tier1: "81", tier2: "83", tier3: "91", tier4: "94" },
    emirate: "Sharjah",
    status: "Published",
    title: "Postcode 81-83-91-94",
    subtitle: "Sharjah, University City",
    area: "University City",
    latitude: 25.3117,
    longitude: 55.4851,
    gridInfo: {
      tierLabel: "T4-94",
      buildingsCount: 55,
      unitsCount: 620,
      recipientsCount: 290,
    },
    locationDetails: {
      location: "AUS Campus District",
      emirate: "Sharjah",
      area: "University City",
      latitude: 25.3117,
      longitude: 55.4851,
    },
    linkedRecords: {
      totalCount: 910,
      items: [
        {
          id: "rec-13",
          type: "Building",
          nameOrIdentifier: "Sharjah Research & Innovation Park",
          canonicalAddress: "University City Road",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-10",
    rowNumber: 10,
    postcode: "85-87-93-91",
    chips: { tier1: "85", tier2: "87", tier3: "93", tier4: "91" },
    emirate: "Ajman",
    status: "Published",
    title: "Postcode 85-87-93-91",
    subtitle: "Ajman, Al Jurf Industrial",
    area: "Al Jurf",
    latitude: 25.4339,
    longitude: 55.5127,
    gridInfo: {
      tierLabel: "T4-91",
      buildingsCount: 68,
      unitsCount: 710,
      recipientsCount: 225,
    },
    locationDetails: {
      location: "Al Jurf Commercial Park",
      emirate: "Ajman",
      area: "Al Jurf 2",
      latitude: 25.4339,
      longitude: 55.5127,
    },
    linkedRecords: {
      totalCount: 935,
      items: [
        {
          id: "rec-14",
          type: "Building",
          nameOrIdentifier: "Ajman Chamber Building",
          canonicalAddress: "Sheikh Rashid Bin Humaid Al Nuaimi St",
          status: "Verified",
        },
      ],
    },
  },
  {
    id: "pc-11",
    rowNumber: 11,
    postcode: "89-92-95-90",
    chips: { tier1: "89", tier2: "92", tier3: "95", tier4: "90" },
    emirate: "Ras Al Khaimah",
    status: "Published",
    title: "Postcode 89-92-95-90",
    subtitle: "Ras Al Khaimah, Mina Al Arab",
    area: "Mina Al Arab",
    latitude: 25.7197,
    longitude: 55.8821,
    gridInfo: {
      tierLabel: "T4-90",
      buildingsCount: 46,
      unitsCount: 490,
      recipientsCount: 160,
    },
    locationDetails: {
      location: "Bermuda Waterfront Island",
      emirate: "Ras Al Khaimah",
      area: "Mina Al Arab",
      latitude: 25.7197,
      longitude: 55.8821,
    },
    linkedRecords: {
      totalCount: 650,
      items: [
        {
          id: "rec-15",
          type: "Building",
          nameOrIdentifier: "Granada Villa Complex",
          canonicalAddress: "Mina Al Arab Way",
          status: "Verified",
        },
      ],
    },
  },
];

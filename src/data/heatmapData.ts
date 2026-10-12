export type HeatmapMetric = "deliveries" | "repeat" | "unstructured";

export type TierLevel = 1 | 2 | 3 | 4;

export interface HeatmapCell {
  id: number;
  row: number;
  col: number;
  displayCode: string;
  deliveries: number;
  repeatRate: number;
  unstructuredRate: number;
  colorLevel: 0 | 1 | 2 | 3 | 4 | 5;
  postcode?: string;
}

export interface TierConfig {
  tier: TierLevel;
  label: string;
  targetCellId: number;
  targetRow: number;
  targetCol: number;
  activeColor: string;
  activeHexFill: string;
  bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  center: [number, number];
  zoom: number;
  name: string;
}

export const TIER_CONFIGS: Record<TierLevel, TierConfig> = {
  1: {
    tier: 1,
    label: "Tier 1 → 27",
    targetCellId: 25, // row 2, col 5: labeled "27"
    targetRow: 2,
    targetCol: 5,
    activeColor: "#0000FF",
    activeHexFill: "#0000FF",
    bounds: {
      south: 22.40,
      west: 51.30,
      north: 26.20,
      east: 56.40,
    },
    center: [24.40, 54.10],
    zoom: 7.2,
    name: "UAE National Grid",
  },
  2: {
    tier: 2,
    label: "Tier 2 → 45",
    targetCellId: 45, // row 4, col 5
    targetRow: 4,
    targetCol: 5,
    activeColor: "#4F5D6B",
    activeHexFill: "#4F5D6B",
    bounds: {
      south: 25.06,
      west: 55.14,
      north: 25.32,
      east: 55.42,
    },
    center: [25.19, 55.28],
    zoom: 11.2,
    name: "Dubai Metropolitan Grid",
  },
  3: {
    tier: 3,
    label: "Tier 3 → 65",
    targetCellId: 65, // row 6, col 5
    targetRow: 6,
    targetCol: 5,
    activeColor: "#3F8E50",
    activeHexFill: "#3F8E50",
    bounds: {
      south: 25.183,
      west: 55.260,
      north: 25.211,
      east: 55.292,
    },
    center: [25.197, 55.276],
    zoom: 14.5,
    name: "Downtown Dubai Grid",
  },
  4: {
    tier: 4,
    label: "Tier 4 → 95",
    targetCellId: 64, // active plot with red pin
    targetRow: 6,
    targetCol: 4,
    activeColor: "#EB861F",
    activeHexFill: "#EB861F",
    bounds: {
      south: 25.1905,
      west: 55.2705,
      north: 25.1965,
      east: 55.2765,
    },
    center: [25.1935, 55.2735],
    zoom: 17.2,
    name: "Burj Park & Boulevard Grid",
  },
};

// Hex palette colors matching Figma layers
export const DENSITY_PALETTE: Record<0 | 1 | 2 | 3 | 4 | 5, { hex: string; opacity: number; label: string }> = {
  0: { hex: "#5ADDFF", opacity: 0.12, label: "Minimal" },
  1: { hex: "#89ECC1", opacity: 0.38, label: "Low" },
  2: { hex: "#FACC15", opacity: 0.48, label: "Medium-Low" },
  3: { hex: "#EB861F", opacity: 0.58, label: "Medium" },
  4: { hex: "#EF4444", opacity: 0.68, label: "High" },
  5: { hex: "#7C3AED", opacity: 0.78, label: "Peak" },
};

// Postcode prefixes for Tier 4 cells matching Screenshot 3
const TIER4_POSTCODES_BY_ROW: string[][] = [
  ["45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19"],
  ["72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11"],
  ["63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29"],
  ["81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18"],
  ["54-21-67-34", "54-21-67-34", "54-21-67-34", "54-21-67-34", "54-21-67-34", "54-21-67-34", "54-21-67-34", "54-21-67-34", "54-21-67-34", "54-21-67-34"],
  ["62-60-80-10", "62-60-80-10", "62-60-80-10", "62-60-80-10", "62-60-80-10", "62-60-80-10", "62-60-80-10", "62-60-80-10", "62-60-80-10", "62-60-80-10"],
  ["45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19", "45-32-78-19"],
  ["72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11", "72-34-44-11"],
  ["63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29", "63-12-55-29"],
  ["81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18", "81-45-33-18"],
];

export function generateTierCells(tier: TierLevel): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  const config = TIER_CONFIGS[tier];
  const targetRow = config.targetRow;
  const targetCol = config.targetCol;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const id = r * 10 + c;

      // In Tier 1: numbering matches Screenshot 1:
      // Row 0: 2..11, Row 1: 12..21, Row 2: 22..31 (row 2, col 5 is "27")
      // In Tiers 2, 3, 4: numbering is 00..99
      let displayCode: string;
      if (tier === 1) {
        displayCode = (id + 2).toString();
      } else {
        displayCode = id.toString().padStart(2, "0");
      }

      const isTarget = r === targetRow && c === targetCol;

      // Distance to cluster center
      const dist = Math.sqrt(Math.pow(r - targetRow, 2) + Math.pow(c - targetCol, 2));

      let colorLevel: 0 | 1 | 2 | 3 | 4 | 5 = 1;
      if (isTarget) {
        colorLevel = 5;
      } else if (dist <= 1.2) {
        colorLevel = 5;
      } else if (dist <= 2.2) {
        colorLevel = 4;
      } else if (dist <= 3.5) {
        colorLevel = 3;
      } else if (dist <= 5.0) {
        colorLevel = 2;
      } else if (dist <= 6.5) {
        colorLevel = 1;
      } else {
        colorLevel = tier === 1 ? 0 : 1;
      }

      // Realistic metrics
      const baseDeliveries = Math.round(
        colorLevel === 5 ? 78400 + (id % 13) * 1150 :
        colorLevel === 4 ? 46200 + (id % 11) * 940 :
        colorLevel === 3 ? 25100 + (id % 7) * 680 :
        colorLevel === 2 ? 12400 + (id % 5) * 420 :
        3800 + (id % 3) * 190
      );

      const repeatRate = Number((colorLevel * 3.8 + (id % 7) * 0.4).toFixed(1));
      const unstructuredRate = Number((52 - colorLevel * 4.2 + (id % 5) * 0.5).toFixed(1));

      const postcode = tier === 4 ? TIER4_POSTCODES_BY_ROW[r][c] : undefined;

      cells.push({
        id,
        row: r,
        col: c,
        displayCode,
        deliveries: baseDeliveries,
        repeatRate,
        unstructuredRate,
        colorLevel,
        postcode,
      });
    }
  }

  return cells;
}

export interface StatisticsData {
  deliveries: string;
  deliveriesSubtitle: string;
  postcodes: string;
  postcodesSubtitle: string;
  gridCells: string;
  gridCellsSubtitle: string;
  repeatAttempts: string;
  repeatAttemptsSubtitle: string;
  unstructuredAddresses: string;
  unstructuredAddressesSubtitle: string;
}

export const HEATMAP_STATISTICS: StatisticsData = {
  deliveries: "6.45 M",
  deliveriesSubtitle: "100.0% of mapped",
  postcodes: "2,567",
  postcodesSubtitle: "of 2,567 Provisional",
  gridCells: "18,567",
  gridCellsSubtitle: "of 18,567 with deliveries",
  repeatAttempts: "17.0%",
  repeatAttemptsSubtitle: "+3 Recorded Attempts",
  unstructuredAddresses: "45.0%",
  unstructuredAddressesSubtitle: "Free-text. No Area/Unit",
};

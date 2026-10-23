export interface GridMatrixCell {
  code: string;
  count: number;
  density: "high" | "medium" | "low";
  isOutsideUae: boolean;
  isUaeBorder?: boolean;
  north: string;
  south: string;
  west: string;
  east: string;
  latitude: number;
  longitude: number;
  size: string;
  postcodesCount: number;
  addressesCount: number;
}

// 100 spatial grid cells corresponding to 00..99 in UAE national grid
export const GRID_MATRIX_CELLS: GridMatrixCell[] = (() => {
  // Define cells that are outside UAE
  const outsideUaeSet = new Set([
    "00", "01", "02", "03", "04", "05", "09",
    "10", "11", "12", "13", "14", "15", "19",
    "20", "21", "22", "23", "24", "29",
    "30", "31", "32", "33", "34", "39",
    "49",
    "58", "59",
    "60", "68", "69",
    "70", "71", "77", "78", "79",
    "80", "81", "82", "83", "84", "85", "86", "87", "88", "89",
    "90", "91", "92", "93", "94", "95", "96", "97", "98", "99",
  ]);

  // Specific counts and densities matching Figma frame 8170:44740 & Screenshot 1
  const cellOverrides: Record<string, { count: number; density: "high" | "medium" | "low" }> = {
    "06": { count: 5, density: "low" },
    "07": { count: 5, density: "low" },
    "08": { count: 5, density: "low" },
    "16": { count: 5, density: "low" },
    "17": { count: 816, density: "high" },
    "18": { count: 817, density: "high" },
    "25": { count: 65, density: "medium" },
    "26": { count: 825, density: "high" },
    "27": { count: 826, density: "high" },
    "28": { count: 827, density: "high" },
    "30": { count: 65, density: "medium" },
    "35": { count: 65, density: "medium" },
    "36": { count: 835, density: "high" },
    "37": { count: 65, density: "medium" },
    "38": { count: 837, density: "high" },
    "39": { count: 8, density: "low" },
    "40": { count: 839, density: "high" },
    "41": { count: 65, density: "medium" },
    "42": { count: 841, density: "high" },
    "43": { count: 842, density: "high" },
    "44": { count: 843, density: "high" },
    "45": { count: 844, density: "high" },
    "46": { count: 845, density: "high" },
    "47": { count: 65, density: "medium" },
    "48": { count: 2, density: "low" },
    "50": { count: 2, density: "low" },
    "51": { count: 850, density: "high" },
    "52": { count: 851, density: "high" },
    "53": { count: 65, density: "medium" },
    "54": { count: 5, density: "low" },
    "55": { count: 854, density: "high" },
    "56": { count: 5, density: "low" },
    "62": { count: 65, density: "medium" },
    "63": { count: 862, density: "high" },
    "64": { count: 863, density: "high" },
    "65": { count: 864, density: "high" },
    "66": { count: 65, density: "medium" },
  };

  const list: GridMatrixCell[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const code = `${r}${c}`;
      const isOutside = outsideUaeSet.has(code);
      const override = cellOverrides[code];
      const count = override ? override.count : 0;
      const density = override ? override.density : "low";

      // Geocoordinates around UAE (lat ~24..26, lon ~54..56)
      const lat = 25.2096 - r * 0.15;
      const lng = 54.8000 + c * 0.15;

      list.push({
        code,
        count,
        density,
        isOutsideUae: isOutside,
        isUaeBorder: !isOutside,
        north: lat.toFixed(7),
        south: (lat - 0.0063).toFixed(7),
        west: lng.toFixed(7),
        east: (lng + 0.0063).toFixed(7),
        latitude: lat,
        longitude: lng,
        size: "70*70 Km",
        postcodesCount: isOutside ? 0 : 140,
        addressesCount: isOutside ? 0 : 1890,
      });
    }
  }

  return list;
})();

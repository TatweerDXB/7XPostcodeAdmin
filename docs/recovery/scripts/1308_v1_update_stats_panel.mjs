import fs from "fs";

let content = fs.readFileSync("src/components/grid/GridStatisticsPanel.tsx", "utf8");

// Normalize line endings to CRLF
content = content.replace(/\r?\n/g, "\r\n");

// 1. Add activeTier to GridStatisticsPanelProps
content = content.replace(
  `interface GridStatisticsPanelProps {\r\n  onClose?: () => void;\r\n  code?: string;\r\n  emirate?: string;\r\n}`,
  `interface GridStatisticsPanelProps {\r\n  onClose?: () => void;\r\n  code?: string;\r\n  emirate?: string;\r\n  activeTier?: number;\r\n}`
);

// 2. Add activeTier to function params
content = content.replace(
  `export default function GridStatisticsPanel({ onClose, code, emirate }: GridStatisticsPanelProps) {`,
  `export default function GridStatisticsPanel({ onClose, code, emirate, activeTier }: GridStatisticsPanelProps) {`
);

// 3. Update total-grid-cells calculation
const oldBlock = `              case "total-grid-cells": {\r\n                val = (d.maskedCellCount ?? 0) + (d.unmaskedCellCount ?? 0);\r\n                break;\r\n              }`;

const newBlock = `              case "total-grid-cells": {\r\n                if (Array.isArray(d.tiers) && d.tiers.length > 0) {\r\n                  const currentTierStat = activeTier\r\n                    ? d.tiers.find((t: any) => t.gridTierId === activeTier)\r\n                    : d.tiers[0];\r\n                  if (currentTierStat && typeof currentTierStat.cellCount === "number") {\r\n                    val = currentTierStat.cellCount;\r\n                    break;\r\n                  }\r\n                }\r\n                val = (d.maskedCellCount ?? 0) + (d.unmaskedCellCount ?? 0);\r\n                break;\r\n              }`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync("src/components/grid/GridStatisticsPanel.tsx", content, "utf8");
console.log("File written. Contains activeTier:", content.includes("activeTier?: number"));

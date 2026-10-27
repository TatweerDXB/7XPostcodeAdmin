import fs from "fs";

let content = fs.readFileSync("src/components/map/GoogleMapView.tsx", "utf8");

content = content.replace(
  `<GridStatisticsPanel\r\n            code={selectedCellId || undefined}\r\n            emirate={selectedCellProps?.emirate || undefined}\r\n            onClose={() => setRightPanelOpen(false)}\r\n          />`,
  `<GridStatisticsPanel\r\n            code={selectedCellId || undefined}\r\n            emirate={selectedCellProps?.emirate || undefined}\r\n            activeTier={activeTier}\r\n            onClose={() => setRightPanelOpen(false)}\r\n          />`
);

if (!content.includes("activeTier={activeTier}")) {
  content = content.replace(
    `<GridStatisticsPanel\n            code={selectedCellId || undefined}\n            emirate={selectedCellProps?.emirate || undefined}\n            onClose={() => setRightPanelOpen(false)}\n          />`,
    `<GridStatisticsPanel\n            code={selectedCellId || undefined}\n            emirate={selectedCellProps?.emirate || undefined}\n            activeTier={activeTier}\n            onClose={() => setRightPanelOpen(false)}\n          />`
  );
}

fs.writeFileSync("src/components/map/GoogleMapView.tsx", content, "utf8");
console.log("Updated GoogleMapView.tsx. Contains activeTier prop:", content.includes("activeTier={activeTier}"));

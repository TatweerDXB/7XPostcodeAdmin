import fs from "fs";

let content = fs.readFileSync("src/components/map/GoogleMapView.tsx", "utf8");

// Normalize line endings to LF first for reliable regex/string matching
const isCRLF = content.includes("\r\n");
content = content.replace(/\r\n/g, "\n");

// 1. Create custom panes in map initialization:
const targetInit = `      gridLayerGroupRef.current = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = L.layerGroup().addTo(map);`;

const replacementInit = `      // Dedicated label pane inside Leaflet overlayPane so labels & SVG cells scale in identical coordinate system
      const labelsPane = map.createPane("gridLabelsPane");
      labelsPane.style.zIndex = "450";
      labelsPane.style.pointerEvents = "none";

      gridLayerGroupRef.current = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = L.layerGroup().addTo(map);`;

if (!content.includes(targetInit)) {
  console.error("targetInit not found!");
} else {
  content = content.replace(targetInit, replacementInit);
}

// 2. Add pane: "gridLabelsPane" to all label markers
// Replace L.marker(..., { icon: labelIcon, interactive: false })
content = content.replace(
  /L\.marker\(([^,\)]+),\s*\{\s*icon:\s*labelIcon,\s*interactive:\s*false\s*\}\)/g,
  'L.marker($1, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" })'
);

// Also in fallback where interactive was on next line or separate
content = content.replace(
  /L\.marker\(\[([^\]]+)\],\s*\{\s*\n\s*icon:\s*labelIcon,\s*\n\s*interactive:\s*false,\s*\n\s*\}\)/g,
  'L.marker([$1], {\n              icon: labelIcon,\n              interactive: false,\n              pane: "gridLabelsPane",\n            })'
);

if (isCRLF) {
  content = content.replace(/\n/g, "\r\n");
}

fs.writeFileSync("src/components/map/GoogleMapView.tsx", content, "utf8");

const matches = (content.match(/gridLabelsPane/g) || []).length;
console.log("Success! Total gridLabelsPane occurrences:", matches);

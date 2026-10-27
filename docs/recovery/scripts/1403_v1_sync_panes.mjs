import fs from "fs";

let content = fs.readFileSync("src/components/map/GoogleMapView.tsx", "utf8");

// 1. Create custom panes in map initialization:
// 'gridCellsPane' with zIndex 400 (just above tileLayer)
// 'gridLabelsPane' with zIndex 450 (above grid cells, inside overlayPane transform)
const oldMapInit = `      gridLayerGroupRef.current = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = L.layerGroup().addTo(map);`;

const newMapInit = `      // Create dedicated panes inside overlayPane so cells and labels share the exact same SVG/overlay transform
      const cellsPane = map.createPane("gridCellsPane");
      cellsPane.style.zIndex = "400";

      const labelsPane = map.createPane("gridLabelsPane");
      labelsPane.style.zIndex = "450";
      labelsPane.style.pointerEvents = "none";

      gridLayerGroupRef.current = L.layerGroup().addTo(map);
      poiLayerGroupRef.current = L.layerGroup().addTo(map);`;

content = content.replace(oldMapInit, newMapInit);

// 2. Add pane: "gridLabelsPane" to all label markers
// Pattern 1: T1 fallback enabled label
content = content.replace(
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
            }).addTo(gridLayerGroupRef.current);`,
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
              pane: "gridLabelsPane",
            }).addTo(gridLayerGroupRef.current);`
);

// Pattern 2: T1 fallback disabled label
content = content.replace(
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
            }).addTo(gridLayerGroupRef.current);`,
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
              pane: "gridLabelsPane",
            }).addTo(gridLayerGroupRef.current);`
);

// Pattern 3: T2 fallback label
content = content.replace(
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
            icon: labelIcon,
            interactive: false,
          }).addTo(gridLayerGroupRef.current);`,
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
            icon: labelIcon,
            interactive: false,
            pane: "gridLabelsPane",
          }).addTo(gridLayerGroupRef.current);`
);

// Pattern 4: T3 fallback label
content = content.replace(
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
            icon: labelIcon,
            interactive: false,
          }).addTo(gridLayerGroupRef.current);`,
  `L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
            icon: labelIcon,
            interactive: false,
            pane: "gridLabelsPane",
          }).addTo(gridLayerGroupRef.current);`
);

// Pattern 5: T4 fallback label
content = content.replace(
  `L.marker([cLat, cLng], { icon: labelIcon, interactive: false }).addTo(
            gridLayerGroupRef.current
          );`,
  `L.marker([cLat, cLng], { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
            gridLayerGroupRef.current
          );`
);

// Pattern 6: T1 API label
content = content.replace(
  `L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                    gridLayerGroupRef.current!
                  );`,
  `L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                    gridLayerGroupRef.current!
                  );`
);

// Pattern 7: T1 API disabled label
content = content.replace(
  `L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                    gridLayerGroupRef.current!
                  );`,
  `L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                    gridLayerGroupRef.current!
                  );`
);

// Pattern 8: T2 API label
content = content.replace(
  `L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                  gridLayerGroupRef.current!
                );`,
  `L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                  gridLayerGroupRef.current!
                );`
);

// Pattern 9: T3 API label
content = content.replace(
  `L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                  gridLayerGroupRef.current!
                );`,
  `L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                  gridLayerGroupRef.current!
                );`
);

// Pattern 10: T4 API label
content = content.replace(
  `L.marker(center, { icon: labelIcon, interactive: false }).addTo(
                  gridLayerGroupRef.current!
                );`,
  `L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                  gridLayerGroupRef.current!
                );`
);

// Replace CRLF or LF safely
fs.writeFileSync("src/components/map/GoogleMapView.tsx", content, "utf8");
console.log("Updated GoogleMapView.tsx. Contains gridLabelsPane:", content.includes("gridLabelsPane"));

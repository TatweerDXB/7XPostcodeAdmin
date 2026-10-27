import fs from "fs";

let content = fs.readFileSync("src/components/map/GoogleMapView.tsx", "utf8");

// Convert CRLF to LF
const isCRLF = content.includes("\r\n");
content = content.replace(/\r\n/g, "\n");

// 1. In renderFallbackTier1:
// Replace L.marker with rect.bindTooltip
const oldT1FallbackEnabled = `            rect.addTo(gridLayerGroupRef.current);

            const textColor = isSelected ? "#FFFFFF" : "#0F172A";
            const labelHtml = \`
              <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: \${textColor}; text-align: center; line-height: 1.2; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}; user-select: none; pointer-events: none;">
                \${cellId}
              </div>
            \`;
            const labelIcon = L.divIcon({
              className: "t1-cell-label",
              html: labelHtml,
              iconSize: [32, 26],
              iconAnchor: [16, 13],
            });
            L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
              pane: "gridLabelsPane",
            }).addTo(gridLayerGroupRef.current);`;

const newT1FallbackEnabled = `            rect.addTo(gridLayerGroupRef.current);

            const textColor = isSelected ? "#FFFFFF" : "#0F172A";
            rect.bindTooltip(
              \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: \${textColor}; text-align: center; line-height: 1.2; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}; user-select: none;">\${cellId}</div>\`,
              { permanent: true, direction: "center", className: "grid-cell-tooltip" }
            );`;

content = content.replace(oldT1FallbackEnabled, newT1FallbackEnabled);

const oldT1FallbackDisabled = `            rect.addTo(gridLayerGroupRef.current);

            const labelHtml = \`
              <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: #94A3B8; text-align: center; line-height: 1.2; user-select: none; pointer-events: none;">
                \${cellId}
              </div>
            \`;
            const labelIcon = L.divIcon({
              className: "t1-cell-label disabled-cell-label",
              html: labelHtml,
              iconSize: [32, 26],
              iconAnchor: [16, 13],
            });
            L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
              pane: "gridLabelsPane",
            }).addTo(gridLayerGroupRef.current);`;

const newT1FallbackDisabled = `            rect.addTo(gridLayerGroupRef.current);

            rect.bindTooltip(
              \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: #94A3B8; text-align: center; line-height: 1.2; user-select: none;">\${cellId}</div>\`,
              { permanent: true, direction: "center", className: "grid-cell-tooltip" }
            );`;

content = content.replace(oldT1FallbackDisabled, newT1FallbackDisabled);

// 2. In renderFallbackTier2:
const oldT2Fallback = `          rect.addTo(gridLayerGroupRef.current);

          const textColor = isSelected ? "#FFFFFF" : "#0F172A";
          const labelIcon = L.divIcon({
            className: "t2-cell-label",
            html: \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${cellId}</div>\`,
            iconSize: [26, 16],
            iconAnchor: [13, 8],
          });

          L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
              pane: "gridLabelsPane",
            }).addTo(gridLayerGroupRef.current);`;

const newT2Fallback = `          rect.addTo(gridLayerGroupRef.current);

          const textColor = isSelected ? "#FFFFFF" : "#0F172A";
          rect.bindTooltip(
            \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${cellId}</div>\`,
            { permanent: true, direction: "center", className: "grid-cell-tooltip" }
          );`;

content = content.replace(oldT2Fallback, newT2Fallback);

// 3. In renderFallbackTier3:
const oldT3Fallback = `          rect.addTo(gridLayerGroupRef.current);

          const textColor = isSelected ? "#FFFFFF" : "#0F172A";
          const labelIcon = L.divIcon({
            className: "t3-cell-label",
            html: \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${cellId}</div>\`,
            iconSize: [24, 15],
            iconAnchor: [12, 7],
          });

          L.marker([(cellNorth + cellSouth) / 2, (cellWest + cellEast) / 2], {
              icon: labelIcon,
              interactive: false,
              pane: "gridLabelsPane",
            }).addTo(gridLayerGroupRef.current);`;

const newT3Fallback = `          rect.addTo(gridLayerGroupRef.current);

          const textColor = isSelected ? "#FFFFFF" : "#0F172A";
          rect.bindTooltip(
            \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${cellId}</div>\`,
            { permanent: true, direction: "center", className: "grid-cell-tooltip" }
          );`;

content = content.replace(oldT3Fallback, newT3Fallback);

// 4. In renderFallbackTier4:
const oldT4Fallback = `          rect.addTo(gridLayerGroupRef.current);

          const cLat = (cellNorth + cellSouth) / 2;
          const cLng = (cellWest + cellEast) / 2;
          const textColor = isSelected ? "#FFFFFF" : "#1E293B";

          const labelIcon = L.divIcon({
            className: "t4-cell-label",
            html: \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center;">\${cellId}</div>\`,
            iconSize: [22, 14],
            iconAnchor: [11, 7],
          });

          L.marker([cLat, cLng], { icon: labelIcon, interactive: false }).addTo(
            gridLayerGroupRef.current
          );`;

const newT4Fallback = `          rect.addTo(gridLayerGroupRef.current);

          const textColor = isSelected ? "#FFFFFF" : "#1E293B";
          rect.bindTooltip(
            \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center;">\${cellId}</div>\`,
            { permanent: true, direction: "center", className: "grid-cell-tooltip" }
          );`;

content = content.replace(oldT4Fallback, newT4Fallback);

// 5. In renderGrid Tier 1:
const oldT1ApiEnabled = `                  poly.addTo(gridLayerGroupRef.current!);

                  // Centroid Label
                  const bounds = poly.getBounds();
                  const center = bounds.getCenter();
                  const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                  const labelHtml = \`
                    <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: \${textColor}; text-align: center; line-height: 1.2; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}; user-select: none; pointer-events: none;">
                      \${code}
                    </div>
                  \`;
                  const labelIcon = L.divIcon({
                    className: "t1-cell-label",
                    html: labelHtml,
                    iconSize: [32, 26],
                    iconAnchor: [16, 13],
                  });
                  L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                    gridLayerGroupRef.current!
                  );`;

const newT1ApiEnabled = `                  poly.addTo(gridLayerGroupRef.current!);

                  const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                  poly.bindTooltip(
                    \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: \${textColor}; text-align: center; line-height: 1.2; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}; user-select: none;">\${code}</div>\`,
                    { permanent: true, direction: "center", className: "grid-cell-tooltip" }
                  );`;

content = content.replace(oldT1ApiEnabled, newT1ApiEnabled);

const oldT1ApiDisabled = `                  poly.addTo(gridLayerGroupRef.current!);

                  const bounds = poly.getBounds();
                  const center = bounds.getCenter();
                  const labelHtml = \`
                    <div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: #94A3B8; text-align: center; line-height: 1.2; user-select: none; pointer-events: none;">
                      \${code}
                    </div>
                  \`;
                  const labelIcon = L.divIcon({
                    className: "t1-cell-label disabled-cell-label",
                    html: labelHtml,
                    iconSize: [32, 26],
                    iconAnchor: [16, 13],
                  });
                  L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                    gridLayerGroupRef.current!
                  );`;

const newT1ApiDisabled = `                  poly.addTo(gridLayerGroupRef.current!);

                  poly.bindTooltip(
                    \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 700; color: #94A3B8; text-align: center; line-height: 1.2; user-select: none;">\${code}</div>\`,
                    { permanent: true, direction: "center", className: "grid-cell-tooltip" }
                  );`;

content = content.replace(oldT1ApiDisabled, newT1ApiDisabled);

// 6. In renderGrid Tier 2:
const oldT2Api = `                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const center = poly.getBounds().getCenter();
                const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                const labelIcon = L.divIcon({
                  className: "t2-cell-label",
                  html: \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${displayCode}</div>\`,
                  iconSize: [26, 16],
                  iconAnchor: [13, 8],
                });
                L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                  gridLayerGroupRef.current!
                );`;

const newT2Api = `                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                poly.bindTooltip(
                  \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 12px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${displayCode}</div>\`,
                  { permanent: true, direction: "center", className: "grid-cell-tooltip" }
                );`;

content = content.replace(oldT2Api, newT2Api);

// 7. In renderGrid Tier 3:
const oldT3Api = `                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const center = poly.getBounds().getCenter();
                const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                const labelIcon = L.divIcon({
                  className: "t3-cell-label",
                  html: \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${displayCode}</div>\`,
                  iconSize: [24, 15],
                  iconAnchor: [12, 7],
                });
                L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                  gridLayerGroupRef.current!
                );`;

const newT3Api = `                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const textColor = isSelected ? "#FFFFFF" : "#0F172A";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                poly.bindTooltip(
                  \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center; text-shadow: \${isSelected ? "none" : "0 0 3px rgba(255,255,255,0.9), 0 0 1px #FFFFFF"}">\${displayCode}</div>\`,
                  { permanent: true, direction: "center", className: "grid-cell-tooltip" }
                );`;

content = content.replace(oldT3Api, newT3Api);

// 8. In renderGrid Tier 4:
const oldT4Api = `                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const center = poly.getBounds().getCenter();
                const textColor = isTargetPlot ? "#FFFFFF" : "#1E293B";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                const labelIcon = L.divIcon({
                  className: "t4-cell-label",
                  html: \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center;">\${displayCode}</div>\`,
                  iconSize: [22, 14],
                  iconAnchor: [11, 7],
                });
                L.marker(center, { icon: labelIcon, interactive: false, pane: "gridLabelsPane" }).addTo(
                  gridLayerGroupRef.current!
                );`;

const newT4Api = `                poly.addTo(gridLayerGroupRef.current!);
                allBounds.extend(poly.getBounds());

                const textColor = isTargetPlot ? "#FFFFFF" : "#1E293B";
                const displayCode = code.includes(".") ? code.split(".").pop() : code;
                poly.bindTooltip(
                  \`<div style="font-family: var(--font-cairo), Cairo, sans-serif; font-size: 11px; font-weight: 700; color: \${textColor}; text-align: center;">\${displayCode}</div>\`,
                  { permanent: true, direction: "center", className: "grid-cell-tooltip" }
                );`;

content = content.replace(oldT4Api, newT4Api);

if (isCRLF) {
  content = content.replace(/\n/g, "\r\n");
}

fs.writeFileSync("src/components/map/GoogleMapView.tsx", content, "utf8");
console.log("Successfully replaced markers with bindTooltip! Tooltip occurrences:", (content.match(/bindTooltip/g) || []).length);

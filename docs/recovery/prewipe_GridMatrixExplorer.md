# Pre-wipe reference: `GridMatrixExplorer.tsx` (UAE outline overlay)

Verbatim from the IDE diff shown after the wipe (the removed lines). This is the final pre-wipe version
(it supersedes archived edit `1103`; it equals the result of edit `1166`).

## 1. Constants - directly below the imports, above `interface GridMatrixExplorerProps`
```tsx
// UAE outline traced from the approved reference screenshot. Points are pixel
// positions measured on that screenshot (grid area x 14..497, y 80..545) and
// normalised into the 0..100 viewBox of the matrix overlay.
const UAE_OUTLINE_REF_PX: Array<[number, number]> = [
  [402, 100], [412, 100], [412, 130], [402, 132], [402, 160], [395, 165],
  [395, 215], [400, 235], [497, 240], [497, 262], [440, 262], [430, 275],
  [415, 280], [415, 318], [425, 320], [430, 328], [400, 328], [398, 300],
  [385, 295], [380, 310], [355, 305], [340, 295], [320, 300], [300, 305],
  [285, 315], [280, 340], [285, 370], [275, 385], [255, 395], [240, 415],
  [215, 425], [190, 420], [160, 410], [120, 400], [100, 385], [85, 370],
  [72, 350], [70, 320], [62, 300], [55, 283], [60, 270], [70, 265],
  [70, 258], [100, 265], [130, 262], [180, 260], [205, 262], [235, 245],
  [255, 215], [262, 190], [275, 170], [300, 160], [300, 138], [310, 125],
  [330, 125], [352, 118], [352, 105],
];
const UAE_MATRIX_BOUNDARY_PATH =
  UAE_OUTLINE_REF_PX.map(([x, y], i) => {
    const ux = (((x - 14) / 483) * 100).toFixed(2);
    const uy = (((y - 80) / 465) * 100).toFixed(2);
    return `${i === 0 ? "M" : "L"}${ux} ${uy}`;
  }).join("") + "Z";
```

## 2. JSX
Wrap the existing CSS-grid `<Box sx={{ display: "grid", ... }}>` (the one rendering the cells) in a
positioned wrapper, and add the SVG as a sibling AFTER the grid Box (before the "Legend Row"):
```tsx
<Box sx={{ position: "relative", width: "100%" }}>
  <Box sx={{ display: "grid", /* ...unchanged... */ }}>
    {/* ...cells unchanged... */}
  </Box>

  {/* UAE Boundary Overlay: outer edge of all in-UAE cells */}
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden="true"
    style={{
      position: "absolute", top: 2, left: 2,
      width: "calc(100% - 4px)", height: "calc(100% - 4px)",
      pointerEvents: "none", zIndex: 3, overflow: "visible",
    }}
  >
    <path
      d={UAE_MATRIX_BOUNDARY_PATH}
      fill="none" stroke="#0000FF" strokeWidth={2} strokeDasharray="6 4"
      strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
    />
  </svg>
</Box>
```

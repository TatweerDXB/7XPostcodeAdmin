const bounds = {
  north: 27.789,
  south: 21.989,
  west: 50.363,
  east: 56.863,
};

const latStep = (bounds.north - bounds.south) / 10; // 0.58
const lngStep = (bounds.east - bounds.west) / 10;   // 0.65

console.log(`latStep: ${latStep}, lngStep: ${lngStep}\n`);

for (let r = 0; r < 10; r++) {
  const cellNorth = bounds.north - r * latStep;
  const cellSouth = bounds.north - (r + 1) * latStep;
  for (let c = 0; c < 10; c++) {
    const cellWest = bounds.west + c * lngStep;
    const cellEast = bounds.west + (c + 1) * lngStep;
    const cellId = `${r}${c}`;
    // Coordinates
    console.log(`Cell ${cellId}: Lat [${cellSouth.toFixed(3)}, ${cellNorth.toFixed(3)}], Lng [${cellWest.toFixed(3)}, ${cellEast.toFixed(3)}]`);
  }
}

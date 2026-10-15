const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('public/images/uae-map-shape.png');
let pos = 8;
const idatChunks = [];
let width, height;

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(pos + 8);
    height = buf.readUInt32BE(pos + 12);
  } else if (type === 'IDAT') {
    idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const raw = zlib.inflateSync(Buffer.concat(idatChunks));
const bpp = 4;
const stride = 1 + width * bpp;
const pixels = Buffer.alloc(width * height * bpp);

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

for (let y = 0; y < height; y++) {
  const filter = raw[y * stride];
  const srcRow = y * stride + 1;
  const dstRow = y * width * bpp;
  const prevDstRow = (y - 1) * width * bpp;

  for (let x = 0; x < width * bpp; x++) {
    const rawByte = raw[srcRow + x];
    const left = x >= bpp ? pixels[dstRow + x - bpp] : 0;
    const up = y > 0 ? pixels[prevDstRow + x] : 0;
    const upLeft = (y > 0 && x >= bpp) ? pixels[prevDstRow + x - bpp] : 0;

    let val = 0;
    switch (filter) {
      case 0: val = rawByte; break;
      case 1: val = (rawByte + left) & 0xff; break;
      case 2: val = (rawByte + up) & 0xff; break;
      case 3: val = (rawByte + Math.floor((left + up) / 2)) & 0xff; break;
      case 4: val = (rawByte + paeth(left, up, upLeft)) & 0xff; break;
    }
    pixels[dstRow + x] = val;
  }
}

// Alpha map (boolean: is opaque)
const isSolid = (x, y) => {
  if (x < 0 || x >= width || y < 0 || y >= height) return false;
  return pixels[(y * width + x) * bpp + 3] > 128;
};

// Find the first solid pixel on the boundary
let startX = -1, startY = -1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (isSolid(x, y)) {
      startX = x;
      startY = y;
      break;
    }
  }
  if (startX !== -1) break;
}

console.log('Start pixel:', startX, startY);

// Moore-Neighbor tracing
// 8 directions: [dx, dy]
// 0: right, 1: down-right, 2: down, 3: down-left, 4: left, 5: up-left, 6: up, 7: up-right
const dirs = [
  [1, 0], [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1], [0, -1], [1, -1]
];

let currX = startX;
let currY = startY;
let dir = 0; // enter from left (so previous was 4, backtrace search from 6)
let enterDir = 6;

const boundary = [];
boundary.push([currX, currY]);

let maxSteps = 100000;
let step = 0;

while (step < maxSteps) {
  let found = false;
  // search counter-clockwise or clockwise
  for (let i = 0; i < 8; i++) {
    const testDir = (enterDir + i) % 8;
    const nx = currX + dirs[testDir][0];
    const ny = currY + dirs[testDir][1];
    if (isSolid(nx, ny)) {
      currX = nx;
      currY = ny;
      enterDir = (testDir + 5) % 8; // opposite direction + 1
      boundary.push([currX, currY]);
      found = true;
      break;
    }
  }
  if (!found || (currX === startX && currY === startY && boundary.length > 2)) {
    break;
  }
  step++;
}

console.log('Traced boundary points:', boundary.length);

// Simplify path using Ramer-Douglas-Peucker (epsilon = 1.0 px)
function rdp(pts, epsilon) {
  if (pts.length <= 2) return pts;
  let dmax = 0;
  let index = 0;
  const start = pts[0];
  const end = pts[pts.length - 1];

  for (let i = 1; i < pts.length - 1; i++) {
    const pt = pts[i];
    // Distance from pt to line(start, end)
    const num = Math.abs((end[1] - start[1]) * pt[0] - (end[0] - start[0]) * pt[1] + end[0] * start[1] - end[1] * start[0]);
    const den = Math.hypot(end[1] - start[1], end[0] - start[0]);
    const d = den === 0 ? Math.hypot(pt[0] - start[0], pt[1] - start[1]) : num / den;
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = rdp(pts.slice(0, index + 1), epsilon);
    const rec2 = rdp(pts.slice(index), epsilon);
    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [start, end];
  }
}

const simplified = rdp(boundary, 1.2);
console.log('Simplified boundary points:', simplified.length);

// Scale points to target viewBox 663.57 x 484.87 (from 630 x 496)
const scaleX = 663.57 / width;
const scaleY = 484.87 / height;

let d = `M ${+(simplified[0][0] * scaleX).toFixed(2)} ${+(simplified[0][1] * scaleY).toFixed(2)}`;
for (let i = 1; i < simplified.length; i++) {
  d += ` L ${+(simplified[i][0] * scaleX).toFixed(2)} ${+(simplified[i][1] * scaleY).toFixed(2)}`;
}
d += ' Z';

fs.writeFileSync('scratch/uae-path.txt', d);
console.log('Path saved to scratch/uae-path.txt, length:', d.length);

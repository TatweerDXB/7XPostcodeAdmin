const fs = require("fs");
const text = fs.readFileSync("C:/Users/Umar Lodhi/.gemini/antigravity-ide/brain/8e0ff2b6-3050-4844-933e-ce454279c55e/.system_generated/logs/transcript_full.jsonl", "utf8");
// Find the last USER_INPUT step
const lines = text.trim().split("\n");
let userContent = "";
for (let i = lines.length - 1; i >= 0; i--) {
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.type === "USER_INPUT") {
      userContent = obj.content;
      break;
    }
  } catch (e) {}
}

const cellRegex = /\/\* Grid cell(?:\s+\d+)? \*\/\s*([\s\S]*?)(?=(?:\/\* Grid cell|\/\* Search console|\/\* Map control|\/\* Grid Level|$))/g;
let m;
const cells = [];
while ((m = cellRegex.exec(userContent)) !== null) {
  const block = m[1];
  const topM = block.match(/top:\s*([\d.]+)px/);
  const leftM = block.match(/left:\s*([\d.]+)px/);
  const bgM = block.match(/background:\s*([^;]+);/);
  if (topM && leftM) {
    const top = parseFloat(topM[1]);
    const left = parseFloat(leftM[1]);
    const r = Math.round((top - 12) / 57);
    const c = Math.round((left - 12) / 57);
    if (r >= 0 && r < 10 && c >= 0 && c < 10) {
      const isLines = block.includes("/* Lines */") || (bgM && bgM[1].includes("#F9FBFD"));
      const isWhite = bgM && (bgM[1].includes("#FFFFFF") || bgM[1].includes("rgba(0, 0, 255"));
      cells.push({ cellId: `${r}${c}`, r, c, top, left, bg: bgM ? bgM[1].trim() : "", enabled: Boolean(isWhite) });
    }
  }
}
console.log("Total grid cells found in CSS:", cells.length);
const enabledCells = Array.from(new Set(cells.filter(x => x.enabled).map(x => x.cellId))).sort();
console.log("Enabled cells count:", enabledCells.length);
console.log("Enabled cells from CSS:", JSON.stringify(enabledCells));

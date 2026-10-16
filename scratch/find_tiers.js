const fs = require('fs');
const content = fs.readFileSync('src/data/portalSearchData.ts', 'utf8');
const matches = content.match(/tier1:\s*"[^"]+"/g);
console.log('Tier 1 occurrences:', Array.from(new Set(matches)));

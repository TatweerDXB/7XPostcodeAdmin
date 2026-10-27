// Usage: node docs/recovery/apply_edit.mjs <edit-json-file> [--dry]
// Applies one archived edit (docs/recovery/edits/*.json) to the real file.
//  - Matches TargetContent exactly (after normalising CRLF -> LF for comparison).
//  - Writes the file back with its ORIGINAL line endings (this repo uses CRLF).
//  - NEVER forces a match. If a chunk does not match it is reported and skipped;
//    the human/agent must then integrate that chunk's ReplacementContent by hand.
import fs from 'fs';
import path from 'path';

const [, , editPath, flag] = process.argv;
if (!editPath) { console.error('usage: node apply_edit.mjs <edit.json> [--dry]'); process.exit(1); }
const dry = flag === '--dry';
const edit = JSON.parse(fs.readFileSync(editPath, 'utf8'));
const target = path.resolve(process.cwd(), edit.file);
const raw = fs.readFileSync(target, 'utf8');
const crlf = raw.includes('\r\n');
let src = raw.replace(/\r\n/g, '\n');
let applied = 0, failed = 0;

for (const [i, c] of edit.chunks.entries()) {
  const t = (c.TargetContent || '').replace(/\r\n/g, '\n');
  const r = (c.ReplacementContent || '').replace(/\r\n/g, '\n');
  const count = t ? src.split(t).length - 1 : 0;
  if (count === 1) { src = src.replace(t, () => r); applied++; console.log(`chunk ${i}: APPLIED`); }
  else if (count > 1) { failed++; console.log(`chunk ${i}: AMBIGUOUS (${count} matches) - integrate manually`); }
  else { failed++; console.log(`chunk ${i}: NO MATCH - integrate manually. First target line: ${t.split('\n')[0].trim().slice(0, 90)}`); }
}
if (!dry && applied) fs.writeFileSync(target, crlf ? src.replace(/\n/g, '\r\n') : src);
console.log(`${dry ? '[dry run] ' : ''}${edit.file}: ${applied} applied, ${failed} need manual integration`);
process.exit(failed ? 2 : 0);

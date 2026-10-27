# Recovery + Backend-Integration Plan (for Gemini / any agent)

> **Read this whole file before touching code.** It is self-contained. Everything it references lives in
> `docs/recovery/` (archive of the lost edits) or in the repo itself.
> Written 2026-10-27 after an agent mistake wiped uncommitted work. Repo: `c:\7x\7XPostcodeAdmin`
> (Next.js 16, React 19, MUI 9, Leaflet 1.9, TypeScript). Line endings are **CRLF** - preserve them.

---

## 0. Why this plan exists

1. An earlier agent ran `git checkout HEAD -- src/components` to undo a comment-stripping script.
   That also **deleted the user's uncommitted work** in 5 files:
   `GoogleMapView.tsx`, `GridStatisticsPanel.tsx`, `GridMatrixExplorer.tsx`, `PortalLayout.tsx`, `PostcodeDetailsPanel.tsx`.
   Git, the IDE local history and the `.next` cache do **not** contain it. A transcript of the edits does,
   and it has been exported to `docs/recovery/`.
2. Separately, the `/search` map does not use the backend's mask status correctly (Section 4).
3. The user wants the map + stats panel to match the reference image `public/figma_refs/cropped_map.png`
   with all grid data and state driven by the real API.

**Current baseline of the 5 files == git `HEAD` (commit `691f415`)**. Verified: none of the lost symbols exist
(`navigateToNextTier`, `bindSvgLabel`, `tileLayerRef`, `mapStyle`, `getHierarchyBounds`, `requestSeqRef`, `stat-skeleton`);
`PortalLayout.tsx` does not mount `KeepWarmListener`.
`src/styles/globals.css` **was not wiped** (its `transform-origin: 0 0 !important;` fix at ~line 95 is intact).
`src/services/*`, `src/data/portalSearchData.ts` have older uncommitted edits that are still present - do not revert them.

Work done by the user/agents **before** the first transcript line (older sessions, other tools) is **unrecoverable**.
If the user remembers features that are not in this plan, ask them; do not invent them.

---

## 1. Ground rules (violating any of these caused the incident)

- **NEVER run** `git checkout`, `git restore`, `git reset --hard`, `git stash drop`, `git clean` on `src/`.
- **Never bulk-edit files with scripts** (no comment stripping, no codemods). Edit by hand, one hunk at a time.
- **Do not remove code comments.** The user asked for that once; it was misunderstood and reverted. Leave all comments alone.
- **Do not fabricate data.** No hardcoded cell states, no mock statistics, no silent defaults when the API fails or a field is missing.
- Fix only what this plan says. No unrelated refactors.
- After every phase: `node node_modules/typescript/bin/tsc --noEmit` must print nothing (exit 0).
- The browser-automation tool is broken in this environment (Playwright driver download 404). Verify with tsc, grep and the
  API script in Section 5; ask the user to eyeball the UI at `http://localhost:3000/search`
  (dev servers already run on ports 3000 and 3001; do not start another).

---

## 2. Phase A - Safety net (do first, 2 minutes)

```powershell
# from c:\7x\7XPostcodeAdmin
git switch -c recovery/restore-work          # work on a branch so every step is reversible
Copy-Item -Recurse src "$env:TEMP\src_backup_$(Get-Date -Format yyyyMMdd_HHmm)"
git add -A docs; git commit -m "docs: recovery plan and edit archive"
```
After **each phase below**, commit (`git add -A; git commit -m "<phase>"`). If a phase goes wrong,
`git revert`/`git reset --hard <previous phase commit>` on this branch is then safe. (Ask the user before merging to `main`.)

---

## 3. Phase B - Restore the lost work (from the archive)

### 3.1 What the archive is
`docs/recovery/INDEX.txt` lists 50 entries (one line each). `docs/recovery/edits/NNNN_<File>.json` holds each original
edit: `{ transcriptLine, file, purpose, outcome, chunks:[{StartLine,EndLine,TargetContent,ReplacementContent}] }`.
`NNNN` is the order in which they were originally made - **apply in ascending order**.
`docs/recovery/scripts/*` are helper scripts that edited files in the original session (reference only; see 3.4).

### 3.2 How to apply one edit
```powershell
node docs/recovery/apply_edit.mjs docs/recovery/edits/0113_PortalLayout.tsx.json --dry   # preview
node docs/recovery/apply_edit.mjs docs/recovery/edits/0113_PortalLayout.tsx.json         # apply
```
The tool matches `TargetContent` exactly and **never forces**. A chunk reports `APPLIED`, `AMBIGUOUS` or `NO MATCH`.
For `NO MATCH`/`AMBIGUOUS`: open the JSON, read `ReplacementContent` (it is the intended end state of that region) and
integrate it by hand into the nearest equivalent code at HEAD, keeping surrounding code. A previous dry replay showed
**19 chunks will not match** because they depended on pre-conversation state; expect these (all in `GoogleMapView.tsx` unless noted):
`0385, 0417, 0443, 0611, 0977, 0995, 1007, 1118, 1137, 1226, 1880, 1890` and in `GridStatisticsPanel.tsx`: `1143, 1147, 1300`.
Run `tsc` after every file.

### 3.3 Order and what each group achieves (acceptance criteria)

**B1 - `PortalLayout.tsx`** - edit `0113`: mount `<KeepWarmListener />` (file `src/components/common/KeepWarmListener.tsx` exists; add the import).
Check: `grep KeepWarmListener src/components/layout/PortalLayout.tsx` shows import + usage.

**B2 - `GoogleMapView.tsx`** (edits `0381 -> 1890`, ascending). Many early edits (0381-1021) are Figma/geometry iterations that later edits
override; applying in order yields the correct end state. Final-state goals to verify after applying:
| # | Feature | Source edits | How to verify |
|---|---|---|---|
| a | Basemap tile layer ref + `mapStyle` state | 0381, 0385, 0417 | `tileLayerRef`, `mapStyle` exist |
| b | Breadcrumb trail rendered in bottom tier bar; `breadcrumbs` (not `_breadcrumbs`) | 0977, 1021 | breadcrumb UI renders; no unused-var lint |
| c | `getHierarchyBounds` helper + `flyToBounds` tier switching | 0973, 1017 | switching T1-T4 animates, keeps lineage |
| d | **Zoom-out bug root-cause fix**: the map-init `useEffect` must NOT depend on `renderGrid`/`handleSelectItem` (their identity changed every selection and re-initialised the map) | 1137 (+0393-0425 context) | clicking a cell zooms in once and stays |
| e | Backend row numbering: **row 0 is the southernmost row** | 1118, 1139, 0768-0782 | synthetic geometry agrees with backend `hierarchyCode` positions |
| f | No default selected cell / no hardcoded default tier codes ("46","32","82","78") / no `endsWith("")` -> cells were wrongly blue | 1182, 1226 | on first load no cell is blue |
| g | `bindSvgLabel` (SVG `<text>` bound to each polygon) + `navigateToNextTier` (two-phase camera: fit bounds, then render children) so labels stay glued to cells during zoom animation | 1880, 1890 | no label/cell misalignment during zoom |
| h | White translucent enabled-cell styling, SVG hatch pattern with opaque white bg | 0611-0639, 0812, 0995, 1007 | see Section 6 for final style |

> `scripts/1403_sync_panes`, `1409_sync_panes`, `1506_migrate_tooltips` were **intermediate** label approaches (panes, tooltips) that
> edits 1880/1890 replaced with `bindSvgLabel`. **Do not apply them.** `scripts/1308/1316` (activeTier for stats) were abandoned too.
> Also do **not** apply edits `1300`, `1303`.

After B2, grep must find: `navigateToNextTier`, `bindSvgLabel`, `tileLayerRef`, `getHierarchyBounds`; and `globals.css` keeps `transform-origin: 0 0 !important;`.

**B3 - `GridStatisticsPanel.tsx`** - do NOT replay edits; rebuild from `docs/recovery/prewipe_GridStatisticsPanel.md`
(verbatim fragments of the lost final version: request-sequence guard, skeleton, error + Retry, header with close button).
Apply the two corrections noted in that file (no "missing => 0" defaults; no hardcoded numbers).

**B4 - `GridMatrixExplorer.tsx`** - re-add the UAE outline overlay exactly as in `docs/recovery/prewipe_GridMatrixExplorer.md`.

**B5 - `PostcodeDetailsPanel.tsx`** - it was modified pre-wipe but no recorded edit touches it; **cannot be recovered**.
Compare with the UI; if something is visibly missing, ask the user. Do not guess.

Commit: `git commit -am "restore lost work"`.

---

## 4. Phase C - Correct backend integration (the main requirement)

### 4.1 Facts about the backend (verified from the real payload the user pasted)
- Endpoint: `GET /api/grid/cells?tier=1&PageSize=100` (via `gridService.getCells`, `src/services/gridService.ts`).
  Base URL: `NEXT_PUBLIC_API_BASE_URL` / `API_PROXY_TARGET`, default `https://epg-post-dev-gateway.onrender.com`.
  Needs the user's login token (cookie `X-User-Token`/`jwtToken`/`token`/`accessToken`); `apiClient.ts` adds `Authorization: Bearer`.
- Response: `BaseResponse<GeoJsonFeatureCollection>` -> `data.features[]`.
  Each feature: `geometry.coordinates[0]` = closed ring of `[lng, lat]`; `properties` =
  `{ gridId, tier, hierarchyCode ("00".."99"), postcode, postcodeDisplay, emirateCode, maskStatusCode, parentGridId, centroidLatitude, centroidLongitude, childCount, postcodeCount }`.
- **The mask field is `maskStatusCode` (camelCase, values `"MASKED"`/`"UNMASKED"`), not `isMasked`.** The user referred to it as
  `mask_status_code`; the payload they pasted uses `maskStatusCode`. Support both spellings in one mapping function (same backend field),
  but nothing else.
- **In that payload all 100 cells are `"UNMASKED"`** (`childCount` 100 / `postcodeCount` 21 only for cells 46 and 57; all others 0).
  So even a perfect frontend will show every cell enabled until the backend returns `MASKED` for non-UAE cells. That is a **backend** defect
  (draft message to the backend dev is in section 8). The frontend must not paper over it.

### 4.2 Root cause in the frontend (HEAD line numbers)
- `GoogleMapView.tsx:818` `const isUnmasked = !(props.isMasked ?? !UAE_UNMASKED_CELLS.includes(code));`
  -> `isMasked` never exists in the payload, so it **always** falls back to the hardcoded whitelist `UAE_UNMASKED_CELLS`
  (`src/data/portalSearchData.ts:154-163`). The API's `maskStatusCode` is never read.
- `GoogleMapView.tsx:457-555` `renderFallbackTier1` **generates a fake 10x10 grid** on the frontend (also using the whitelist, line 472)
  when the API returns nothing, and it is invoked at line ~910 and listed in a dependency array at ~1239.
- `gridService.ts:21` `isMasked?: boolean` - field the backend does not send.

### 4.3 Required changes
1. **`src/services/gridService.ts`**
   - In `GridCellProperties` replace `isMasked?: boolean` with `maskStatusCode?: string; mask_status_code?: string;`
     (keep the index signature).
   - Export a pure helper (no defaults to "unmasked"):
     ```ts
     export type MaskState = "MASKED" | "UNMASKED" | "UNKNOWN";
     export function getMaskState(p: GridCellProperties): MaskState {
       const raw = (p.maskStatusCode ?? p.mask_status_code);
       if (typeof raw !== "string") return "UNKNOWN";
       const v = raw.trim().toUpperCase();
       return v === "UNMASKED" ? "UNMASKED" : v === "MASKED" ? "MASKED" : "UNKNOWN";
     }
     ```
2. **`GoogleMapView.tsx` tier-1 branch of `renderGrid`**
   - Replace line 818 with `const maskState = getMaskState(props); const isUnmasked = maskState === "UNMASKED";`
   - `UNKNOWN` => render as disabled and `console.warn` **once** per load with the cell code (never enable it).
   - Delete `renderFallbackTier1` entirely, its call (~910) and its entry in the dependency array (~1239).
   - Replace the "no features" path with an **explicit state**, not a fake grid:
     - loading: keep existing `isGridLoading` overlay (~line 1684);
     - request failed: set a visible error (extend the existing `serviceNotice` Snackbar, ~3184, or add an inline overlay) with the real
       message and a **Retry** button that calls `renderGrid(1)`; do not limit it to 502 as today;
     - success but `features.length === 0`: show "No grid cells returned by the server." (explicit empty state).
   - Remove `UAE_UNMASKED_CELLS` from the import (line ~35) once unused.
3. **`src/data/portalSearchData.ts`** - delete `UAE_UNMASKED_CELLS` (lines 154-163) when no references remain
   (`Select-String -Path src -Pattern UAE_UNMASKED_CELLS` must be empty). **Keep `UAE_BORDER_COORDINATES`**: the country outline is not part
   of the cells payload (the payload has no national border); it is a presentation overlay, and the user approved its shape earlier.
4. **Enabled vs disabled behaviour** (already implemented structurally; keep): unmasked => clickable polygon (zoom to tier 2, children from
   `getCellChildren(gridId)`), masked => non-interactive hatched polygon in "Full Grid" mode and **not drawn** in "UnMasked Cells" mode
   (`gridTypeRef.current`).
5. **Tiers 2-4** still contain frontend-generated fallback grids (`renderFallbackTier2/3/4`, lines 557-770). They violate the
   no-fabrication rule too, but removing them is a larger change. **Out of scope unless the user asks** - report it, don't do it.
6. **Stats panel** values must come only from `GET /api/grid/statistics` (`gridService.getGridStatistics`, params `code`, `emirate`);
   see B3. `UnMasked Cells` card = `unmaskedCellCount`; `Total Grid Cells` = `maskedCellCount + unmaskedCellCount` (as in the lost version).

Commit: `git commit -am "mask status from API; remove tier-1 frontend fallback"`.

---

## 5. Verifying against the real backend (needs the user's token)

Ask the user to log in, copy the `X-User-Token` cookie value, then:
```powershell
$t = "<paste token>"
$r = Invoke-RestMethod "https://epg-post-dev-gateway.onrender.com/api/grid/cells?tier=1&PageSize=100" -Headers @{Authorization="Bearer $t"}
$r.data.features | Group-Object { $_.properties.maskStatusCode } | Select Name,Count   # expected: MASKED n / UNMASKED m
$r.data.features.Count                                                                  # expected 100
Invoke-RestMethod "https://epg-post-dev-gateway.onrender.com/api/grid/statistics" -Headers @{Authorization="Bearer $t"} | ConvertTo-Json -Depth 4
```
(Render free tier: the first call can return 502 for ~30-60 s - retry.) If `MASKED` count is 0, the backend still marks everything
UNMASKED: report it (section 8), do not change the frontend to compensate.

---

## 6. Phase D - Match the reference image (`public/figma_refs/cropped_map.png`)

Open the image and compare. Observed design:
- **Grid:** 10x10 squares, bold black centred numbers (~14 px, weight 700, Cairo) on **every** cell, including masked ones.
- **Enabled (unmasked) cell:** white fill, 1 px light-grey border (~`#E2E8F0`). **Masked cell:** same border, diagonal light-grey hatch
  (existing SVG pattern `uaeDisabledHatchPattern`, ensureSvgDefs ~line 286-338) on white.
- **UAE border:** dashed (about `4 4`), ~2 px, lavender-blue (~`#818CF8`) with a very light lavender fill (~`rgba(129,140,248,0.12)`),
  drawn **over** the cells but **non-interactive** so clicks pass through; labels stay above it.
  Use the existing `UAE_BORDER_COORDINATES`.
- **Top-left:** search pill with blue magnifier. **Top-right:** segmented toggle `Full Grid | UnMasked Cells` (icons) and a `UAE v` dropdown.
  **Bottom-right:** locate-me button. (All already exist - restore after B2, do not redesign.)
- **Right panel "Grid Statistics":** the reference shows **7 cards in a single column** (icon box left; label ~13 px regular; value ~22 px bold
  coloured): Total Grid Cells (amber), UnMasked Cells (purple), Total Buildings (pink), Total Units (blue), Onwani Listed (brown),
  Onwani Mapped to Postcode (green), Building Listing coverage (blue). Filter `GRID_STATISTICS_DATA` by ids
  `total-grid-cells, unmasked-cells, total-buildings, total-units, onwani-listed, onwani-mapped, coverage`.
  **The numbers in the image (100, 38, 1,389 ...) are design mock-ups; real values come from the API. Never hardcode them.**
- Enabled cell styling in code (tier-1): replace the near-transparent fill (`rgba(255,255,255,0.05)`, opacity 0.08) with
  `fillColor "#FFFFFF"`, `fillOpacity 0.85`, `color "rgba(226,232,240,0.9)"`, `weight 1`; masked polygons get the same stroke.

**Known discrepancy - report, do not hack around it:** the backend payload numbers cells **row 0 = southernmost** (cell `00` at lat ~21.6-22.2,
`99` at ~27.7) over lng 50.2-57.0, whereas the image shows `00` top-left and the UAE in rows 0-6. The backend geometry is the source of truth, so
cell *positions* cannot match the image 1:1 without altering backend data. Match styling/layout; tell the user.

---

## 7. Final checklist (Gemini must tick every line and report evidence)

- [ ] `tsc --noEmit` clean.
- [ ] `Select-String -Path src -Pattern "UAE_UNMASKED_CELLS|isMasked|renderFallbackTier1" -Recurse`-equivalent returns nothing
      (use `Get-ChildItem src -Recurse -Include *.ts,*.tsx | Select-String ...`).
- [ ] Symbols present: `navigateToNextTier`, `bindSvgLabel`, `getHierarchyBounds`, `getMaskState`, `requestSeqRef`, `stat-skeleton`; `KeepWarmListener` mounted.
- [ ] Section 5 script run with the user's token; report the `MASKED`/`UNMASKED` counts truthfully.
- [ ] Tier-1 failure path shows an explicit error + Retry (test by blocking the network in devtools or using a wrong base URL), empty path shows the empty message.
- [ ] No `git checkout`/`restore`/`reset --hard` was used on `src`.
- [ ] A short report to the user listing: what was restored, what could not be (PostcodeDetailsPanel, pre-session work), the backend all-UNMASKED finding,
      the row-numbering discrepancy, tiers 2-4 fallbacks left untouched.

---

## 8. Message to backend dev (Hesham) - send as is
> `GET /api/grid/cells?tier=1&PageSize=100` returns `maskStatusCode: "UNMASKED"` for all 100 cells, including sea/non-UAE cells. The UI enables
> a cell only when `maskStatusCode === "UNMASKED"`, so everything is clickable. Please return `"MASKED"` for cells outside UAE land (expected ~62 masked /
> 38 unmasked, matching `/api/grid/statistics`). Also: the payload has no UAE national/emirate boundary geometry - is there an endpoint for it,
> or should the frontend keep a static outline? Finally, `hierarchyCode "00"` is the south-west cell in the payload, while the design shows `00` at the
> top-left; please confirm which numbering is intended.

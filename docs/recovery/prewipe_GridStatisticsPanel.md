# Pre-wipe reference: `GridStatisticsPanel.tsx`

Verbatim fragments of the file as it existed **before** the accidental `git checkout`
(recovered from the IDE diff shown after the wipe: lines starting with `-` were the lost version).
Use together with `edits/1143_*`, `edits/1150_*` (complete replacement text for the effect/fetch logic).

Final pre-wipe component signature had **no** `activeTier` prop, so SKIP archived edits
`1300`, `1303` and scripts `1308`/`1316` (they were an abandoned approach).

## Imports (lost version)
```tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";

import { GRID_STATISTICS_DATA, GridStatItem } from "@/data/portalSearchData";
import { gridService, GridStatisticsDto } from "@/services/gridService";
```
(HEAD currently imports `RefreshIcon` + `Tooltip` instead of `useRef` + `Skeleton`; remove those if unused afterwards.)

## State + fetch (lost version)
```tsx
export default function GridStatisticsPanel({ onClose, code, emirate }: GridStatisticsPanelProps) {
  // Start in loading state with no data so placeholder numbers are never shown.
  const [statsData, setStatsData] = useState<GridStatItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const requestSeqRef = useRef(0);

  const fetchStatistics = useCallback(async () => {
    const seq = ++requestSeqRef.current;          // ignore stale responses
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await gridService.getGridStatistics({
        code: code || undefined,
        emirate: emirate || undefined,
      });
      if (seq !== requestSeqRef.current) return;

      if (!response || response.success === false) {
        setHasError(true);
        return;
      }

      // Successful response: missing data is treated as zeros.
      const d: GridStatisticsDto = (response.data ?? {}) as GridStatisticsDto;
      setStatsData(() =>
        GRID_STATISTICS_DATA.map((item) => {
          let val: string | number = item.value;
          switch (item.id) {
            case "total-grid-cells": {
              val = (d.maskedCellCount ?? 0) + (d.unmaskedCellCount ?? 0);
              break;
            }
            /* ...one case per item.id, each `d.<field> ?? 0` ... (see edits/1143_*.json) */
            case "coverage":
              val = d.buildingCoveragePercent != null ? `${d.buildingCoveragePercent}%` : "0%";
              break;
          }
          return { ...item, value: val };
        })
      );
    } catch {
      if (seq === requestSeqRef.current) setHasError(true);
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false);
    }
  }, [code, emirate]);

  useEffect(() => {
    let active = true;
    const load = async () => { if (active) { await fetchStatistics(); } };
    load();
    return () => { active = false; };
  }, [fetchStatistics]);
```
> NOTE for the new work: "treat missing as zero" conflicts with the user's rule *"do not substitute
> default values"*. When rebuilding, show `—` (or an explicit "not available") for a field the
> backend did not return, and keep real `0` only when the backend returned `0`.
> Also drop the `GRID_STATISTICS_DATA` hardcoded `value`s as display data: use it only for
> label/colour/icon metadata.

## Header (lost version)
- Title: `fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif"`, `fontSize: "20px"`, weight 700.
- Code badge: `color: "#0000FF"`, `bgcolor: "rgba(0, 0, 255, 0.08)"`.
- Right side: `{isLoading && statsData && <CircularProgress size={16} sx={{ color: "#0000FF", mr: 0.5 }} />}`
  then, `{onClose && (<IconButton size="small" onClick={onClose} sx={{ color: "#000000", p: 0.5, "&:hover": { bgcolor: "#F1F5F9" } }}>` containing
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="1.5" /><path d="M9 9L15 15M15 9L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" /></svg></IconButton>)}`

## Error state (lost version) - rendered when `hasError && !isLoading`
```tsx
<Box role="alert" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 4, textAlign: "center" }}>
  <Typography sx={{ fontFamily: "var(--font-cairo), Cairo, sans-serif", fontSize: 14, color: "#B91C1C" }}>
    Unable to load grid statistics.
  </Typography>
  <Box component="button" onClick={fetchStatistics}
    sx={{ cursor: "pointer", border: "1px solid #0000FF", color: "#0000FF", bgcolor: "transparent",
          borderRadius: "6px", px: 2, py: 0.5, fontSize: 13, "&:hover": { bgcolor: "rgba(0,0,255,0.06)" } }}>
    Retry
  </Box>
</Box>
```

## Loading skeleton (lost version) - rendered when `statsData === null || isLoading`
One card per `GRID_STATISTICS_DATA` item:
```tsx
<Box key={`sk-${item.id}`} data-testid="stat-skeleton"
  sx={{ border: `1px solid ${item.borderColor}`, borderRadius: "8px", p: "6px 8px", display: "flex", gap: "8px",
        minHeight: item.label.length > 18 ? 88 : 66, boxSizing: "border-box" }}>
  <Skeleton variant="rounded" width={28} height={28} sx={{ flexShrink: 0 }} />
  <Box sx={{ flex: 1 }}>
    <Skeleton variant="text" width="70%" height={16} />
    <Skeleton variant="text" width="45%" height={28} />
  </Box>
</Box>
```
Real cards render only when `statsData !== null && !isLoading`; the whole card grid is hidden in the error state.

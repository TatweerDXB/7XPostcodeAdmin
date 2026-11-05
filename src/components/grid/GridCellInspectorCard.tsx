"use client";

import React, { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import AddressRegistryGridMap, { type RegistryGridCell } from "@/components/address/AddressRegistryGridMap";
import { ApiError } from "@/services/apiClient";
import {
  addressRegistryService,
  formatPostcode,
  type ConnectedAddressDto,
  type ConnectedAddressLevel,
  type RegistryCodeValueDto,
} from "@/services/addressRegistryService";
import {
  gridEngineService,
  emirateLabel,
  type CellPostcode,
  type GridEngineCell,
  type GridTier,
} from "@/services/gridEngineService";

interface GridCellInspectorCardProps {
  /** The selected cell of the active tier; null until one is picked */
  cell: GridEngineCell | null;
  /** The cell picked at each tier, T1 → the selected cell */
  lineage: Partial<Record<GridTier, GridEngineCell>>;
  /** Cell size of the selected cell's tier, e.g. "70 km" */
  sizeLabel: string;
  activeTier: GridTier;
  onExpandMap?: () => void;
}

const POSTCODE_PAGE_SIZE = 50;

type Loaded<T> = { items: T[]; totalCount: number } | { error: string };

const errorText = (err: unknown, forbidden: string) =>
  err instanceof ApiError && err.status === 403 ? forbidden : "Could not load. Please try again.";

/** "34335438" → ["34", "33", "54", "38"] */
const postcodePairs = (postcode: string) => postcode.replace(/\D/g, "").match(/.{1,2}/g) ?? [];

const CHIP_COLORS = ["#5B67EA", "#4D4D4D", "#3F8E50", "#2979FF"];

/** The record's cells for the real-grid map, T1 → the selected cell's tier */
function toMapHierarchy(lineage: Partial<Record<GridTier, GridEngineCell>>, upTo: GridTier): RegistryGridCell[] {
  return ([1, 2, 3, 4] as GridTier[])
    .filter((t) => t <= upTo && lineage[t])
    .map((t) => {
      const c = lineage[t]!;
      return { tier: t, gridId: c.gridId, segment: c.segment, geometry: c.geometry };
    });
}

function AccordionHeader({
  open,
  onToggle,
  icon,
  title,
  count,
}: {
  open: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  count: React.ReactNode;
}) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: "12px 14px",
        bgcolor: "#FFFFFF",
        cursor: "pointer",
        userSelect: "none",
        borderBottom: open ? "1px solid #F1F5F9" : "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {icon}
        <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "14px", fontWeight: 700, color: "#000000" }}>
          {title}
        </Typography>
        <Box
          sx={{
            px: "8px",
            py: "1px",
            borderRadius: "10px",
            bgcolor: "rgba(0, 0, 255, 0.08)",
            color: "#0000FF",
            fontSize: "11.5px",
            fontWeight: 700,
            fontFamily: "var(--font-cairo)",
          }}
        >
          {count}
        </Box>
      </Box>
      <Box
        sx={{
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          display: "flex",
          color: "#1E293B",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 9L12 15L18 9" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Box>
    </Box>
  );
}

function ListMessage({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return (
    <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: error ? "#B42318" : "#64748B", py: "6px" }}>
      {children}
    </Typography>
  );
}

export default function GridCellInspectorCard({ cell, lineage, sizeLabel, activeTier, onExpandMap }: GridCellInspectorCardProps) {
  const [isPostcodesOpen, setIsPostcodesOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  const [addressTab, setAddressTab] = useState<ConnectedAddressLevel>("All");

  // Loaded lists, keyed by gridId (postcodes) and gridId:level (addresses)
  const [postcodes, setPostcodes] = useState<Record<string, Loaded<CellPostcode>>>({});
  const [addresses, setAddresses] = useState<Record<string, Loaded<ConnectedAddressDto>>>({});

  const gridId = cell?.gridId ?? null;
  const isT4 = cell?.tier === 4;

  // Lookups, loaded once: type code → label (BUILDING_GOVERNMENT → Government) and the address levels
  // (BUILDING / UNIT / INDIVIDUAL with their labels), which drive the tabs and the row badges
  const [typeLabels, setTypeLabels] = useState<Record<string, string>>({});
  const [levelTypes, setLevelTypes] = useState<RegistryCodeValueDto[]>([]);
  useEffect(() => {
    addressRegistryService.loadTypeLabels().then(setTypeLabels).catch(() => setTypeLabels({}));
    addressRegistryService.loadLevelTypes().then(setLevelTypes).catch(() => setLevelTypes([]));
  }, []);
  const addressTabs = [{ id: "All", label: "All" }, ...levelTypes.map((l) => ({ id: l.code, label: l.nameEn }))];
  const levelLabel = (level: string) => levelTypes.find((l) => l.code === level)?.nameEn ?? level;

  // Requests in flight, by result key. Results are keyed by cell, so a late answer never lands on another cell.
  const inFlight = useRef(new Set<string>());

  // Postcodes in the cell: loaded when the section is opened (GET /api/postcodes?search=<digits>)
  useEffect(() => {
    if (!cell || !isPostcodesOpen) return;
    const key = cell.gridId;
    if (postcodes[key] || inFlight.current.has(`pc:${key}`)) return;
    inFlight.current.add(`pc:${key}`);
    gridEngineService
      .loadCellPostcodes(cell, POSTCODE_PAGE_SIZE)
      .then((res) => setPostcodes((prev) => ({ ...prev, [key]: res })))
      .catch((err) =>
        setPostcodes((prev) => ({ ...prev, [key]: { error: errorText(err, "You do not have access to postcodes.") } }))
      )
      .finally(() => inFlight.current.delete(`pc:${key}`));
  }, [cell, isPostcodesOpen, postcodes]);

  // Addresses in a T4 cell: "All" for the header count, plus the selected tab (GET /api/registry/by-grid/{gridId})
  useEffect(() => {
    if (!cell || !gridId || !isT4) return;
    const levels: ConnectedAddressLevel[] = addressTab === "All" ? ["All"] : ["All", addressTab];
    levels.forEach((level) => {
      const key = `${gridId}:${level}`;
      if (addresses[key] || inFlight.current.has(`adr:${key}`)) return;
      inFlight.current.add(`adr:${key}`);
      gridEngineService
        .loadCellAddresses(cell, level)
        .then((res) => setAddresses((prev) => ({ ...prev, [key]: res })))
        .catch((err) =>
          setAddresses((prev) => ({ ...prev, [key]: { error: errorText(err, "You do not have access to registry addresses.") } }))
        )
        .finally(() => inFlight.current.delete(`adr:${key}`));
    });
  }, [cell, gridId, isT4, addressTab, addresses]);

  const cardSx = {
    width: "100%",
    bgcolor: "#FFFFFF",
    borderRadius: "16px",
    p: { xs: "16px", md: "20px" },
    boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  } as const;

  if (!cell) {
    return (
      <Box sx={cardSx}>
        <Typography sx={{ fontFamily: "var(--font-cairo), Cairo, sans-serif", fontWeight: 700, fontSize: "16px", color: "#000000" }}>
          Current Cell (T{activeTier})
        </Typography>
        <ListMessage>Select a cell in the grid to see its details.</ListMessage>
      </Box>
    );
  }

  const postcodeData = postcodes[cell.gridId];
  const allAddresses = addresses[`${cell.gridId}:All`];
  const tabAddresses = addresses[`${cell.gridId}:${addressTab}`];
  const addressCount = !isT4 ? "—" : allAddresses && "totalCount" in allAddresses ? allAddresses.totalCount.toLocaleString() : "…";

  return (
    <Box sx={cardSx}>
      {/* Header Row: Current Cell & Level Badge */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontFamily: "var(--font-cairo), Cairo, sans-serif", fontWeight: 700, fontSize: "16px", color: "#000000" }}>
          Current Cell (T{cell.tier})
        </Typography>

        {/* Level & Size Badge */}
        <Box
          sx={{
            px: "10px",
            py: "3px",
            borderRadius: "6px",
            bgcolor: "#EFE4FD",
            color: "#0000FF",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "var(--font-cairo)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="#0000FF" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="#0000FF" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="#0000FF" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="#0000FF" />
          </svg>
          T{cell.tier} {sizeLabel}
        </Box>
      </Box>

      {/* Large Cell Code */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
        <Typography
          sx={{
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "28px",
            lineHeight: "34px",
            color: "#000000",
          }}
        >
          {cell.displayCode}
        </Typography>
        {cell.emirateCode && (
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "13px", color: "#64748B" }}>
            {emirateLabel(cell.emirateCode)}
          </Typography>
        )}
      </Box>

      {/* Real-grid map: the selected cell among its siblings */}
      <Box sx={{ position: "relative", width: "100%", height: 240, borderRadius: "8px", overflow: "hidden", border: "1px solid #E2E8F0" }}>
        <AddressRegistryGridMap activeTier={cell.tier} hierarchy={toMapHierarchy(lineage, cell.tier)} />
        {onExpandMap && (
          <Box
            onClick={onExpandMap}
            title="Expand map"
            sx={{
              position: "absolute",
              right: 8,
              bottom: 8,
              zIndex: 1000,
              width: 30,
              height: 30,
              borderRadius: "6px",
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "#F0F6FC" },
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        )}
      </Box>

      {/* Accordion 1: Postcodes on The Grid */}
      <Box sx={{ border: "1px solid #F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
        <AccordionHeader
          open={isPostcodesOpen}
          onToggle={() => setIsPostcodesOpen(!isPostcodesOpen)}
          title="Postcodes on The Grid"
          count={cell.postcodeCount != null ? cell.postcodeCount.toLocaleString() : "—"}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="#0000FF" strokeWidth="1.8" />
            </svg>
          }
        />

        <Collapse in={isPostcodesOpen}>
          <Box sx={{ p: "10px 14px", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto" }}>
            {!postcodeData ? (
              <CircularProgress size={16} sx={{ color: "#0000FF", alignSelf: "center", my: 1 }} />
            ) : "error" in postcodeData ? (
              <ListMessage error>{postcodeData.error}</ListMessage>
            ) : postcodeData.items.length === 0 ? (
              <ListMessage>No postcodes in this cell.</ListMessage>
            ) : (
              <>
                {postcodeData.items.map((pc) => (
                  <Box
                    key={pc.gridId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      p: "8px 10px",
                      borderRadius: "6px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {postcodePairs(pc.postcode).map((pair, i) => (
                        <Box
                          key={i}
                          sx={{ px: "5px", py: "1px", borderRadius: "2px", bgcolor: CHIP_COLORS[i], color: "#FFF", fontSize: "11px", fontWeight: 600 }}
                        >
                          {pair}
                        </Box>
                      ))}
                    </Box>
                    <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#5A5A5A", textAlign: "right" }}>
                      {pc.emirateCode ? emirateLabel(pc.emirateCode) : ""}
                    </Typography>
                  </Box>
                ))}
                {postcodeData.totalCount > postcodeData.items.length && (
                  <ListMessage>
                    Showing {postcodeData.items.length} of {postcodeData.totalCount.toLocaleString()} postcodes
                  </ListMessage>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Accordion 2: Addresses on this grid, with type filters (T4 cells only) */}
      <Box sx={{ border: "1px solid #F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
        <AccordionHeader
          open={isAddressesOpen}
          onToggle={() => setIsAddressesOpen(!isAddressesOpen)}
          title="Addresses on This Grid"
          count={addressCount}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                stroke="#0000FF"
                strokeWidth="1.8"
              />
              <path
                d="M12 21C16 17 20 13.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 13.4183 8 17 12 21Z"
                stroke="#0000FF"
                strokeWidth="1.8"
              />
            </svg>
          }
        />

        <Collapse in={isAddressesOpen}>
          <Box sx={{ p: "12px 14px", bgcolor: "#FFFFFF", display: "flex", flexDirection: "column", gap: "10px" }}>
            {!isT4 ? (
              <ListMessage>Select a T4 cell to see its addresses.</ListMessage>
            ) : (
              <>
                {/* Filter Tabs */}
                <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {addressTabs.map((t) => {
                    const isSel = addressTab === t.id;
                    return (
                      <Box
                        key={t.id}
                        onClick={() => setAddressTab(t.id)}
                        sx={{
                          px: "10px",
                          py: "3px",
                          borderRadius: "14px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: isSel ? 700 : 500,
                          fontFamily: "var(--font-cairo)",
                          bgcolor: isSel ? "#0000FF" : "#F8FAFC",
                          color: isSel ? "#FFFFFF" : "#64748B",
                          border: isSel ? "1px solid #0000FF" : "1px solid #E2E8F0",
                          transition: "all 0.15s ease",
                          "&:hover": { bgcolor: isSel ? "#0000FF" : "#F1F5F9" },
                        }}
                      >
                        {t.label}
                      </Box>
                    );
                  })}
                </Box>

                {/* Address Records List */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                  {!tabAddresses ? (
                    <CircularProgress size={16} sx={{ color: "#0000FF", alignSelf: "center", my: 1 }} />
                  ) : "error" in tabAddresses ? (
                    <ListMessage error>{tabAddresses.error}</ListMessage>
                  ) : tabAddresses.items.length === 0 ? (
                    <ListMessage>No addresses of this type in this cell.</ListMessage>
                  ) : (
                    <>
                      {tabAddresses.items.map((adr) => (
                        <Box
                          key={`${adr.level}-${adr.id}`}
                          sx={{
                            p: "8px 10px",
                            borderRadius: "6px",
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12.5px", fontWeight: 700, color: "#1E293B" }}>
                              {adr.displayName || "-"}
                            </Typography>
                            <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11px", color: "#64748B" }}>
                              {[adr.typeCode ? typeLabels[adr.typeCode] ?? adr.typeCode : null, formatPostcode(adr.postcode ?? adr.postcodeDisplay)]
                                .filter(Boolean)
                                .join(" · ")}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              px: "6px",
                              py: "1px",
                              borderRadius: "4px",
                              fontSize: "10.5px",
                              fontWeight: 600,
                              bgcolor: "#ECFDF5",
                              color: "#047857",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {levelLabel(adr.level)}
                          </Box>
                        </Box>
                      ))}
                      {tabAddresses.totalCount > tabAddresses.items.length && (
                        <ListMessage>
                          Showing {tabAddresses.items.length} of {tabAddresses.totalCount.toLocaleString()}
                        </ListMessage>
                      )}
                    </>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

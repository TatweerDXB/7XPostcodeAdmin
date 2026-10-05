"use client";

import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import ClearIcon from "@mui/icons-material/Clear";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import BuildingDetailsCard from "./BuildingDetailsCard";
import { UAE_BUILDINGS, UAEBuilding } from "@/data/uaeBuildings";
import type { Map as LeafletMap, Rectangle, Marker } from "leaflet";

const filterTabs = [
  { id: "all", label: "All", icon: null, width: 85, placeholder: "Search postcodes, buildings, units, addresses..." },
  {
    id: "address",
    label: "Address",
    width: 105,
    placeholder: "Search by address or street name...",
    icon: (
      <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 7.453C7.649 7.453 8.58 6.522 8.58 5.373C8.58 4.224 7.649 3.293 6.5 3.293C5.351 3.293 4.42 4.224 4.42 5.373C4.42 6.522 5.351 7.453 6.5 7.453Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M0.913 4.161C2.227 -1.613 10.78 -1.606 12.087 4.167C12.853 7.554 10.747 10.421 8.9 12.194C7.56 13.487 5.44 13.487 4.093 12.194C2.253 10.421 0.147 7.547 0.913 4.161Z" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "postcode",
    label: "Postcode",
    width: 110,
    placeholder: "Search by 8-digit postcode (e.g. 47486790)...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5H14V13C14 13.55 13.55 14 13 14H3C2.45 14 2 13.55 2 13V5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M2 5L8 9.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M4 2H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "makani",
    label: "Makani",
    width: 105,
    placeholder: "Search by Makani number (e.g. 26144 87868)...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 15H1.6C0.72 15 0 14.28 0 13.4V2.46C0 0.51 1.48 0 3.31 0.88L6.71 2.53C7.44 2.89 8 3.84 8 4.65V15Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.25 9.87V12.75C15.25 14.39 14.48 15 12.84 15H8V6.18L11.82 7.39C12.82 7.61 13.64 8.12 13.69 9.58V9.87Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "onwani",
    label: "onwani",
    width: 105,
    placeholder: "Search by Onwani Unified address...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.5 15H15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.5 15V6L8 1L14.5 6V15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M6 15V9H10V15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "coordinates",
    label: "Coordinates",
    width: 120,
    placeholder: "Enter Lat, Lng coordinates (e.g. 25.19, 55.27)...",
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 13.5C11.0376 13.5 13.5 11.0376 13.5 8C13.5 4.96243 11.0376 2.5 8 2.5C4.96243 2.5 2.5 4.96243 2.5 8C2.5 11.0376 4.96243 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 1.5V0M0 8H1.5M8 14.5V16M14.5 8H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function GoogleMapView() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<UAEBuilding | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const gridRectanglesRef = useRef<{ [key: string]: Rectangle }>({});
  const activePinMarkerRef = useRef<Marker | null>(null);

  // Filter building suggestions based on user search query
  const queryTrimmed = searchQuery.trim().toLowerCase();
  const filteredBuildings = queryTrimmed
    ? UAE_BUILDINGS.filter(
        (b) =>
          b.name.toLowerCase().includes(queryTrimmed) ||
          b.subtitle.toLowerCase().includes(queryTrimmed) ||
          b.postCode.toLowerCase().includes(queryTrimmed) ||
          b.makaniNumber.toLowerCase().includes(queryTrimmed) ||
          b.street.toLowerCase().includes(queryTrimmed) ||
          b.areaLocality.toLowerCase().includes(queryTrimmed) ||
          b.addressIdentifier.toLowerCase().includes(queryTrimmed) ||
          b.gridId.toLowerCase().includes(queryTrimmed)
      )
    : UAE_BUILDINGS;

  const highlightCell = (cellId: string) => {
    setSelectedCell(cellId);
    Object.entries(gridRectanglesRef.current).forEach(([id, rect]) => {
      if (id === cellId) {
        rect.setStyle({
          fillColor: "#0000FF",
          fillOpacity: 0.35,
          color: "#0000FF",
          weight: 2,
          opacity: 0.9,
        });
      } else {
        rect.setStyle({
          fillColor: "#0000FF",
          fillOpacity: 0.05,
          color: "#0000FF",
          weight: 0.8,
          opacity: 0.35,
        });
      }
    });
  };

  const handleSelectBuilding = (building: UAEBuilding) => {
    setSelectedBuilding(building);
    setSearchQuery(building.name);
    setIsSuggestionsOpen(false);
    highlightCell(building.tiers.tier1);

    if (mapInstanceRef.current) {
      import("leaflet").then((L) => {
        if (!mapInstanceRef.current) return;

        // Remove old marker if exists
        if (activePinMarkerRef.current) {
          mapInstanceRef.current.removeLayer(activePinMarkerRef.current);
        }

        // Add pin marker
        const pinIcon = L.divIcon({
          className: "selected-building-pin",
          html: `
            <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(0, 0, 255, 0.25); animation: pulse 1.5s infinite;"></div>
              <div style="position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #0000FF; border: 2.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        activePinMarkerRef.current = L.marker([building.latitude, building.longitude], {
          icon: pinIcon,
        }).addTo(mapInstanceRef.current);

        mapInstanceRef.current.flyTo([building.latitude, building.longitude], 13, {
          duration: 1.2,
        });
      });
    }
  };

  const handleSearchSubmit = () => {
    if (filteredBuildings.length > 0) {
      handleSelectBuilding(filteredBuildings[0]);
    } else if (queryTrimmed) {
      if (/^\d{2}$/.test(queryTrimmed)) {
        highlightCell(queryTrimmed);
        const match = UAE_BUILDINGS.find((b) => b.tiers.tier1 === queryTrimmed);
        if (match) {
          handleSelectBuilding(match);
        }
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSuggestionsOpen(false);
  };

  // Initialize interactive map with OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [24.4, 54.3],
        zoom: 7,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Free high-quality OpenStreetMap layer (no API keys, zero watermarks)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Create 10x10 Postcode Grid Layer across UAE
      const north = 26.2;
      const south = 22.2;
      const west = 51.4;
      const east = 56.6;

      const latStep = (north - south) / 10;
      const lngStep = (east - west) / 10;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cellId = `${r}${c}`;
          const cellNorth = north - r * latStep;
          const cellSouth = north - (r + 1) * latStep;
          const cellWest = west + c * lngStep;
          const cellEast = west + (c + 1) * lngStep;

          const bounds: [[number, number], [number, number]] = [
            [cellSouth, cellWest],
            [cellNorth, cellEast],
          ];

          const rect = L.rectangle(bounds, {
            color: "#0000FF",
            weight: 0.8,
            opacity: 0.35,
            fillColor: "#0000FF",
            fillOpacity: 0.05,
          }).addTo(map);

          gridRectanglesRef.current[cellId] = rect;

          // Center label
          const centerLat = (cellNorth + cellSouth) / 2;
          const centerLng = (cellWest + cellEast) / 2;

          const labelIcon = L.divIcon({
            className: "grid-cell-label",
            html: `<div style="color: #0000FF; font-family: var(--font-cairo), Cairo, sans-serif; font-size: 13px; font-weight: 400; text-align: center; pointer-events: none; opacity: 0.9;">${cellId}</div>`,
            iconSize: [28, 18],
            iconAnchor: [14, 9],
          });

          L.marker([centerLat, centerLng], {
            icon: labelIcon,
            interactive: false,
          }).addTo(map);

          // Interaction on grid cell
          rect.on("mouseover", () => {
            if (selectedCell !== cellId) {
              rect.setStyle({ fillOpacity: 0.18, opacity: 0.65 });
            }
          });
          rect.on("mouseout", () => {
            if (selectedCell !== cellId) {
              rect.setStyle({ fillOpacity: 0.05, opacity: 0.35 });
            }
          });
          rect.on("click", () => {
            highlightCell(cellId);
            const found = UAE_BUILDINGS.find((b) => b.tiers.tier1 === cellId);
            if (found) {
              handleSelectBuilding(found);
            } else {
              // Open default building for demonstration
              setSelectedBuilding(UAE_BUILDINGS[0]);
            }
          });
        }
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([24.4, 54.3], 7, { duration: 1 });
    }
  };

  const currentTabInfo = filterTabs.find((t) => t.id === activeFilter) || filterTabs[0];

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        bgcolor: "#F9FBFD",
      }}
    >
      {/* Map Canvas Container */}
      <Box
        ref={mapContainerRef}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Floating Top Search & Filter Bar (overflow visible so suggestion dropdown is NEVER clipped) */}
      <Box
        sx={{
          position: "absolute",
          top: "16px",
          left: "24px",
          right: "24px",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          overflow: "visible",
          pointerEvents: "auto",
        }}
      >
        {/* Search Input Box */}
        <ClickAwayListener onClickAway={() => setIsSuggestionsOpen(false)}>
          <Box sx={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0, overflow: "visible" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRight: "none",
                borderRadius: "4px 0 0 4px",
                height: 30,
                width: 320,
                px: 1.2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                boxSizing: "border-box",
              }}
            >
              <InputBase
                placeholder={currentTabInfo.placeholder}
                value={searchQuery}
                onFocus={() => setIsSuggestionsOpen(true)}
                onClick={() => setIsSuggestionsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                sx={{
                  flex: 1,
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "12px",
                  color: "#000000",
                  "& input::placeholder": {
                    color: "#919191",
                    opacity: 1,
                  },
                }}
              />

              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ color: "#919191", p: 0.2 }}
                >
                  <ClearIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Blue Search Action Button */}
            <Button
              variant="contained"
              onClick={handleSearchSubmit}
              sx={{
                minWidth: 34,
                width: 34,
                height: 30,
                p: 0,
                borderRadius: "0 4px 4px 0",
                bgcolor: "#0000FF",
                boxShadow: "none",
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "#0000CC",
                  boxShadow: "none",
                },
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                  fill="white"
                />
              </svg>
            </Button>

            {/* Suggestions Dropdown Popup */}
            {isSuggestionsOpen && (
              <Paper
                elevation={6}
                sx={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  width: 354,
                  zIndex: 100,
                  bgcolor: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
                  maxHeight: 320,
                  overflowY: "auto",
                  p: 0.8,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    px: 1,
                    py: 0.5,
                  }}
                >
                  Suggestions
                </Typography>

                {filteredBuildings.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "12px", color: "#64748B", fontFamily: "var(--font-cairo)" }}>
                      No buildings found matching &quot;{searchQuery}&quot;
                    </Typography>
                  </Box>
                ) : (
                  filteredBuildings.map((b) => (
                    <Box
                      key={b.id}
                      onClick={() => handleSelectBuilding(b)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        p: "8px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                        "&:hover": { bgcolor: "#F1F5F9" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "4px",
                          bgcolor: "#EFF6FF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0000FF",
                          flexShrink: 0,
                        }}
                      >
                        <LocationCityOutlinedIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#000000",
                            fontFamily: "var(--font-cairo)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {b.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "11px",
                            color: "#64748B",
                            fontFamily: "var(--font-cairo)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {b.subtitle}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 0.8,
                          py: 0.2,
                          borderRadius: "4px",
                          bgcolor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#0000FF",
                          fontFamily: "var(--font-cairo)",
                        }}
                      >
                        {b.postCode}
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            )}
          </Box>
        </ClickAwayListener>

        {/* Filter Pills */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <Box
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  setIsSuggestionsOpen(true);
                }}
                sx={{
                  height: 30,
                  width: tab.width,
                  borderRadius: "7.5px",
                  bgcolor: "#FFFFFF",
                  border: isSelected ? "1.5px solid #0000FF" : "1px solid #DEDEDE",
                  color: isSelected ? "#0000FF" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  cursor: "pointer",
                  userSelect: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                  boxSizing: "border-box",
                  "&:hover": {
                    borderColor: isSelected ? "#0000FF" : "#94A3B8",
                  },
                }}
              >
                {tab.icon && (
                  <Box sx={{ display: "flex", alignItems: "center", color: isSelected ? "#0000FF" : "#000000" }}>
                    {tab.icon}
                  </Box>
                )}
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "12px",
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "#0000FF" : "#000000",
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Building Details Card Popup (Opens when building or cell is selected) */}
      {selectedBuilding && (
        <Box
          sx={{
            position: "absolute",
            top: "60px",
            left: "24px",
            zIndex: 40,
            animation: "fadeIn 0.2s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(-6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <BuildingDetailsCard
            building={selectedBuilding}
            onClose={() => {
              setSelectedBuilding(null);
            }}
          />
        </Box>
      )}

      {/* Floating Bottom-Right Map Controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: "32px",
          right: "32px",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Current Location Button */}
        <Box
          onClick={handleResetLocation}
          title="Reset Location"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "4px",
            bgcolor: "#FFFFFF",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 9.429C11.72 9.429 13.12 8.033 13.12 6.309C13.12 4.586 11.72 3.189 10 3.189C8.28 3.189 6.88 4.586 6.88 6.309C6.88 8.033 8.28 9.429 10 9.429Z"
              stroke="#0000FF"
              strokeWidth="1.5"
            />
            <path
              d="M1.62 4.49C3.59 -4.17 16.42 -4.16 18.38 4.5C19.53 9.58 16.37 13.88 13.6 16.54C11.59 18.48 8.41 18.48 6.39 16.54C3.63 13.88 0.47 9.57 1.62 4.49Z"
              stroke="#0000FF"
              strokeWidth="1.5"
            />
          </svg>
        </Box>

        {/* Zoom In Plus Button */}
        <Box
          onClick={handleZoomIn}
          title="Zoom In"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "4px",
            bgcolor: "#FFFFFF",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.17 10H15.83M10 4.166V15.834" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        {/* Zoom Out Minus Button */}
        <Box
          onClick={handleZoomOut}
          title="Zoom Out"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "4px",
            bgcolor: "#FFFFFF",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.15s ease",
            "&:hover": {
              bgcolor: "#F8FAFC",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.17 10H15.83" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}

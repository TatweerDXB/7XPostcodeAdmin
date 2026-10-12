"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getPlacePredictions,
  geocodePlaceId,
  geocodeAddress,
  reverseGeocodeCoords,
  calculateTiersFromCoords,
  PlacePrediction,
  GeocodeResultDetails,
} from "@/services/googleMaps";

export interface TierBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

export const TIER1_DEFAULT_BOUNDS: TierBounds = {
  north: 27.789,
  south: 21.989,
  west: 50.363,
  east: 56.863,
};

export function getSubCellBounds(parent: TierBounds, cellId: string): TierBounds {
  const r = parseInt(cellId[0], 10) || 0;
  const c = parseInt(cellId[1], 10) || 0;
  const latStep = (parent.north - parent.south) / 10;
  const lngStep = (parent.east - parent.west) / 10;
  return {
    north: parent.north - r * latStep,
    south: parent.north - (r + 1) * latStep,
    west: parent.west + c * lngStep,
    east: parent.west + (c + 1) * lngStep,
  };
}

export const TIER_THEMES = {
  1: {
    color: "#0000FF",
    bgActive: "#0000FF",
    stroke: "rgba(0, 0, 255, 0.45)",
    strokeWeight: 0.75,
    fill: "rgba(0, 0, 255, 0.08)",
    fillOpacity: 0.12,
    activeCellFill: "#0000FF",
    fontColor: "#0000FF",
  },
  2: {
    color: "#4F46E5",
    bgActive: "#4F46E5",
    stroke: "rgba(79, 70, 229, 0.5)",
    strokeWeight: 1.0,
    fill: "rgba(79, 70, 229, 0.08)",
    fillOpacity: 0.14,
    activeCellFill: "#4F46E5",
    fontColor: "#4338CA",
  },
  3: {
    color: "#10B981",
    bgActive: "#10B981",
    stroke: "rgba(16, 185, 129, 0.5)",
    strokeWeight: 1.1,
    fill: "rgba(16, 185, 129, 0.08)",
    fillOpacity: 0.15,
    activeCellFill: "#10B981",
    fontColor: "#047857",
  },
  4: {
    color: "#EA7A24",
    bgActive: "#EA7A24",
    stroke: "rgba(234, 122, 36, 0.6)",
    strokeWeight: 1.2,
    fill: "rgba(234, 122, 36, 0.1)",
    fillOpacity: 0.18,
    activeCellFill: "#EA7A24",
    fontColor: "#C2410C",
  },
};

interface AddAddressMapProps {
  activeTier: 1 | 2 | 3 | 4;
  tier1Cell: string;
  tier2Cell: string;
  tier3Cell: string;
  tier4Cell: string;
  coords: { lat: number; lng: number };
  onCellSelect: (tier: 1 | 2 | 3 | 4, cellId: string, centerLat: number, centerLng: number) => void;
  onCoordsChange: (coords: { lat: number; lng: number }) => void;
  onAddressDetailsChange?: (details: GeocodeResultDetails) => void;
  onAllTiersChange?: (tiers: { tier1: string; tier2: string; tier3: string; tier4: string }) => void;
}

export default function AddAddressMap({
  activeTier,
  tier1Cell,
  tier2Cell,
  tier3Cell,
  tier4Cell,
  coords,
  onCellSelect,
  onCoordsChange,
  onAddressDetailsChange,
  onAllTiersChange,
}: AddAddressMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const gridGroupRef = useRef<LayerGroup | null>(null);
  const markerRef = useRef<any>(null);
  const [mapSearch, setMapSearch] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const getBounds = (tier: 1 | 2 | 3 | 4): { bounds: TierBounds; activeCell: string } => {
    const b1 = TIER1_DEFAULT_BOUNDS;
    const b2 = getSubCellBounds(b1, tier1Cell);
    const b3 = getSubCellBounds(b2, tier2Cell);
    const b4 = getSubCellBounds(b3, tier3Cell);

    if (tier === 1) return { bounds: b1, activeCell: tier1Cell };
    if (tier === 2) return { bounds: b2, activeCell: tier2Cell };
    if (tier === 3) return { bounds: b3, activeCell: tier3Cell };
    return { bounds: b4, activeCell: tier4Cell };
  };

  const drawGrid = (L: any, map: LeafletMap, tier: 1 | 2 | 3 | 4) => {
    if (!gridGroupRef.current) {
      gridGroupRef.current = L.layerGroup().addTo(map);
    } else {
      gridGroupRef.current.clearLayers();
    }

    const { bounds: b, activeCell } = getBounds(tier);
    const { north, south, west, east } = b;
    const latStep = (north - south) / 10;
    const lngStep = (east - west) / 10;
    const theme = TIER_THEMES[tier];

    const size = map.getSize();
    if (size.x > 0 && size.y > 0) {
      const centerLat = (north + south) / 2;
      const centerLng = (west + east) / 2;

      if (tier === 1) {
        map.setView([24.8, 54.0], 7.0, { animate: false });
      } else if (tier === 2) {
        map.setView([centerLat, centerLng], 9.8, { animate: true });
      } else if (tier === 3) {
        map.setView([centerLat, centerLng], 12.8, { animate: true });
      } else if (tier === 4) {
        map.setView([centerLat, centerLng], 16.2, { animate: true });
      }
    }

    const fontSize = tier === 1 ? "9px" : "11px";

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cellId = `${r}${c}`;
        const cNorth = north - r * latStep;
        const cSouth = north - (r + 1) * latStep;
        const cWest = west + c * lngStep;
        const cEast = west + (c + 1) * lngStep;
        const isSelected = cellId === activeCell;

        const cellBounds: [[number, number], [number, number]] = [
          [cSouth, cWest],
          [cNorth, cEast],
        ];

        const rect = L.rectangle(cellBounds, {
          color: isSelected ? theme.color : theme.stroke,
          weight: isSelected ? 2 : theme.strokeWeight,
          fillColor: isSelected ? theme.activeCellFill : theme.fill,
          fillOpacity: isSelected ? 0.45 : theme.fillOpacity,
          className: "interactive-tier-cell",
          interactive: true,
        });

        rect.on("mouseover", () => {
          if (!isSelected) {
            rect.setStyle({ fillOpacity: 0.28, weight: 1.5 });
          }
        });

        rect.on("mouseout", () => {
          if (!isSelected) {
            rect.setStyle({ fillOpacity: theme.fillOpacity, weight: theme.strokeWeight });
          }
        });

        rect.on("click", async (e: any) => {
          if (e && e.originalEvent) e.originalEvent.stopPropagation();
          const cellCenterLat = (cNorth + cSouth) / 2;
          const cellCenterLng = (cWest + cEast) / 2;
          if (tier === 4 && markerRef.current) {
            markerRef.current.setLatLng([cellCenterLat, cellCenterLng]);
            const tiers = calculateTiersFromCoords(cellCenterLat, cellCenterLng);
            onAllTiersChange?.(tiers);
            reverseGeocodeCoords(cellCenterLat, cellCenterLng)
              .then((details) => {
                if (details) onAddressDetailsChange?.(details);
              })
              .catch(() => {});
          }
          onCellSelect(tier, cellId, cellCenterLat, cellCenterLng);
        });

        rect.addTo(gridGroupRef.current!);

        // Cell number label
        const centerLat = (cNorth + cSouth) / 2;
        const centerLng = (cWest + cEast) / 2;

        const labelIcon = L.divIcon({
          className: "grid-cell-num-label",
          html: `<div style="color: ${isSelected ? '#FFFFFF' : theme.fontColor}; font-family: Cairo, sans-serif; font-size: ${fontSize}; font-weight: ${isSelected ? 700 : 600}; text-align: center; line-height: 1; user-select: none; pointer-events: none; text-shadow: ${isSelected ? 'none' : '0 0 2px #FFFFFF'};">${cellId}</div>`,
          iconSize: [20, 14],
          iconAnchor: [10, 7],
        });

        L.marker([centerLat, centerLng], {
          icon: labelIcon,
          interactive: false,
        }).addTo(gridGroupRef.current!);
      }
    }

    // Pin marker for Tier 4 - positioned exactly in active cell
    if (tier === 4) {
      const t4r = parseInt(activeCell[0], 10) || 0;
      const t4c = parseInt(activeCell[1], 10) || 0;
      const targetLat = north - (t4r + 0.5) * latStep;
      const targetLng = west + (t4c + 0.5) * lngStep;

      if (!markerRef.current) {
        const pinHtml = `
          <div style="position: relative; width: 32px; height: 38px;">
            <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <filter id="addPinShadow" x="0" y="0" width="32" height="38" filterUnits="userSpaceOnUse">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
              </filter>
              <g filter="url(#addPinShadow)">
                <path d="M16 2C9.37 2 4 7.37 4 14C4 22.5 16 34 16 34C16 34 28 22.5 28 14C28 7.37 22.63 2 16 2Z" fill="#DC2626"/>
                <circle cx="16" cy="14" r="5" fill="#FFFFFF"/>
              </g>
            </svg>
          </div>
        `;

        const pinIcon = L.divIcon({
          className: "add-map-pin",
          html: pinHtml,
          iconSize: [32, 38],
          iconAnchor: [16, 34],
        });

        markerRef.current = L.marker([targetLat, targetLng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        markerRef.current.on("dragend", async () => {
          const pos = markerRef.current.getLatLng();
          onCoordsChange({ lat: pos.lat, lng: pos.lng });
          const tiers = calculateTiersFromCoords(pos.lat, pos.lng);
          onAllTiersChange?.(tiers);
          try {
            const details = await reverseGeocodeCoords(pos.lat, pos.lng);
            if (details) {
              onAddressDetailsChange?.(details);
            }
          } catch (err) {
            console.warn("Reverse geocode error:", err);
          }
        });
      } else {
        markerRef.current.setLatLng([targetLat, targetLng]);
        markerRef.current.addTo(map);
      }
    } else {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    let observer: ResizeObserver | null = null;

    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    import("leaflet").then((L) => {
      if (!isMounted || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        gridGroupRef.current = null;
        markerRef.current = null;
      }

      const initMap = () => {
        if (!containerRef.current) return;
        if ((containerRef.current as any)._leaflet_id) {
          delete (containerRef.current as any)._leaflet_id;
        }

        const map = L.map(containerRef.current, {
          center: [24.8, 54.0],
          zoom: 7.0,
          minZoom: 4,
          maxZoom: 20,
          zoomSnap: 0.25,
          zoomDelta: 0.5,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
        });

        mapRef.current = map;

        // Tile layer
        L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
          subdomains: ["0", "1", "2", "3"],
          maxZoom: 20,
        }).addTo(map);

        // Initial draw
        drawGrid(L, map, activeTier);

        // Periodic invalidation triggers
        const timer1 = setTimeout(() => {
          map.invalidateSize();
          drawGrid(L, map, activeTier);
        }, 100);
        const timer2 = setTimeout(() => {
          map.invalidateSize();
          drawGrid(L, map, activeTier);
        }, 250);
        const timer3 = setTimeout(() => {
          map.invalidateSize();
          drawGrid(L, map, activeTier);
        }, 450);

        if (typeof ResizeObserver !== "undefined" && containerRef.current) {
          observer = new ResizeObserver(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          });
          observer.observe(containerRef.current);
        }

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
        };
      };

      initMap();
    });

    return () => {
      isMounted = false;
      if (observer) observer.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        gridGroupRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update grid on tier or cell changes
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (mapRef.current) {
        drawGrid(L, mapRef.current, activeTier);
      }
    });
  }, [activeTier, tier1Cell, tier2Cell, tier3Cell, tier4Cell]);

  const applyLocationDetails = (details: GeocodeResultDetails) => {
    onCoordsChange({ lat: details.lat, lng: details.lng });
    const tiers = calculateTiersFromCoords(details.lat, details.lng);
    onAllTiersChange?.(tiers);
    onAddressDetailsChange?.(details);
    onCellSelect(4, tiers.tier4, details.lat, details.lng);
    if (mapRef.current) {
      mapRef.current.setView([details.lat, details.lng], 16.5, { animate: true });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([details.lat, details.lng]);
    }
  };

  const handleSearchChange = (val: string) => {
    setMapSearch(val);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (!val || val.trim().length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setShowDropdown(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const preds = await getPlacePredictions(val);
        setPredictions(preds);
      } catch (err) {
        setPredictions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
  };

  const handleSelectPrediction = async (pred: PlacePrediction) => {
    setShowDropdown(false);
    setMapSearch(pred.mainText);
    setIsSearching(true);
    try {
      const details = await geocodePlaceId(pred.placeId);
      if (details) {
        applyLocationDetails(details);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (!mapSearch || mapSearch.trim().length < 2) return;
    setIsSearching(true);
    try {
      const details = await geocodeAddress(mapSearch);
      if (details) {
        applyLocationDetails(details);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("Address geocoding failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapRef.current) mapRef.current.zoomOut();
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 260,
        minHeight: 260,
        maxHeight: 260,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #CBD5E1",
        flexShrink: 0,
        bgcolor: "#F1F5F9",
      }}
    >
      {/* Leaflet DOM container */}
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          height: "100%",
          minHeight: "260px",
          zIndex: 1,
          "& .leaflet-container": {
            width: "100%",
            height: "100%",
            backgroundColor: "#E2E8F0",
          },
        }}
      />

      {/* Top Overlays: Search Postcode Bar & Fullscreen/Expand Button */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 500,
          pointerEvents: "none",
        }}
      >
        {/* Search Box */}
        <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
          <Box sx={{ position: "relative", pointerEvents: "auto" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)",
                borderRadius: "4px",
                overflow: "hidden",
                bgcolor: "#FFFFFF",
              }}
            >
              <Box
                sx={{
                  bgcolor: "#FFFFFF",
                  border: "1px solid #DEDEDE",
                  borderRight: "none",
                  borderRadius: "4px 0 0 4px",
                  height: 31,
                  width: { xs: 150, sm: 200 },
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <InputBase
                  placeholder="Search UAE location..."
                  value={mapSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (predictions.length > 0) setShowDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  sx={{
                    width: "100%",
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "12px",
                    color: "#000000",
                    "& input::placeholder": {
                      color: "#919191",
                      opacity: 1,
                    },
                  }}
                />
                {isSearching && <CircularProgress size={12} sx={{ color: "#0000FF", ml: 0.5 }} />}
              </Box>
              <Button
                variant="contained"
                onClick={handleSearchSubmit}
                sx={{
                  minWidth: 34,
                  width: 34,
                  height: 31,
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
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                    fill="white"
                  />
                </svg>
              </Button>
            </Box>

            {/* Google Places Autocomplete dropdown */}
            {showDropdown && predictions.length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  width: { xs: 200, sm: 260 },
                  bgcolor: "#FFFFFF",
                  borderRadius: "6px",
                  border: "1px solid #DEDEDE",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  zIndex: 2000,
                  maxHeight: 200,
                  overflowY: "auto",
                  p: 0.5,
                }}
              >
                {predictions.map((p) => (
                  <Box
                    key={p.placeId}
                    onClick={() => handleSelectPrediction(p)}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      p: "6px 8px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#F1F5F9" },
                    }}
                  >
                    <PlaceOutlinedIcon sx={{ fontSize: 15, color: "#0000FF", mt: "2px", flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#0F172A",
                          fontFamily: "var(--font-cairo)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.mainText}
                      </Typography>
                      {p.secondaryText && (
                        <Typography
                          sx={{
                            fontSize: "10.5px",
                            color: "#64748B",
                            fontFamily: "var(--font-cairo)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.secondaryText}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </ClickAwayListener>

        {/* Expand / Compress Button */}
        <Box
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "3px",
            boxShadow: "0px 1.08px 4.34px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            pointerEvents: "auto",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      </Box>

      {/* Bottom Right Zoom Controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          right: 8,
          zIndex: 500,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Box
          onClick={handleZoomIn}
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "3px",
            boxShadow: "0px 1.08px 4.34px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13M8 3V13" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>
        <Box
          onClick={handleZoomOut}
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "3px",
            boxShadow: "0px 1.08px 4.34px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}

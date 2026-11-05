"use client";

import React, { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { Map as LeafletMap, LayerGroup, LatLngBounds } from "leaflet";
import { PostcodeItem } from "@/data/postcodeListData";
import { renderPostcodeTierOnMap } from "@/components/map/PostcodeMiniMap";

interface PostcodeExpandedMapModalProps {
  open: boolean;
  onClose: () => void;
  item: PostcodeItem | null;
}

export default function PostcodeExpandedMapModal({
  open,
  onClose,
  item,
}: PostcodeExpandedMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const gridLayerRef = useRef<LayerGroup | null>(null);
  const lastBoundsRef = useRef<LatLngBounds | null>(null);
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(4);
  const [searchVal, setSearchVal] = useState("");

  const lat = item?.latitude || 25.1972;
  const lng = item?.longitude || 55.2744;
  const t1 = item?.chips.tier1 || "00";
  const t2 = item?.chips.tier2 || "00";
  const t3 = item?.chips.tier3 || "00";
  const t4 = item?.chips.tier4 || "00";

  useEffect(() => {
    if (open) {
      setActiveTier(4);
    }
  }, [open, item?.postcode]);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    let cancelled = false;

    const initAndRender = async () => {
      const L = await import("leaflet");
      if (cancelled || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };
        const container = mapContainerRef.current as LeafletContainer;
        if (container._leaflet_id) {
          delete container._leaflet_id;
        }

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 17,
          minZoom: 6,
          maxZoom: 20,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
        });

        mapInstanceRef.current = map;
        gridLayerRef.current = L.layerGroup().addTo(map);

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);

        // Google Roadmap Layer
        L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
          subdomains: ["0", "1", "2", "3"],
          maxZoom: 20,
        }).addTo(map);
      }

      const map = mapInstanceRef.current;
      const gridLayer = gridLayerRef.current;
      if (!map || !gridLayer) return;

      map.invalidateSize();

      const bounds = await renderPostcodeTierOnMap({
        L,
        map,
        gridLayer,
        activeTier,
        chips: { tier1: t1, tier2: t2, tier3: t3, tier4: t4 },
        latitude: lat,
        longitude: lng,
        geometryGeoJson: item?.geometryGeoJson,
        hierarchy: item?.hierarchy,
        isMiniMap: false,
        onSelectTier: setActiveTier,
        isCancelled: () => cancelled,
      });
      if (!cancelled) {
        lastBoundsRef.current = bounds;
      }
    };

    void initAndRender();

    return () => {
      cancelled = true;
    };
  }, [open, lat, lng, t1, t2, t3, t4, activeTier, item?.geometryGeoJson, item?.hierarchy]);

  useEffect(() => {
    if (!open && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      gridLayerRef.current = null;
    }
  }, [open]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      if (lastBoundsRef.current?.isValid()) {
        mapInstanceRef.current.fitBounds(lastBoundsRef.current, { padding: [24, 24] });
      } else {
        mapInstanceRef.current.setView([lat, lng], 17);
      }
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: "#F8FAFC",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      {/* Map Surface */}
      <Box
        ref={mapContainerRef}
        sx={{
          width: "100vw",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* Top Floating Controls: Search Bar + Exit Fullscreen Button */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        {/* Search Input Bar matching Screenshot 3 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: { xs: "calc(100% - 60px)", sm: 420 },
            bgcolor: "#FFFFFF",
            borderRadius: "6px",
            border: "1px solid #DEDEDE",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.12)",
            px: "14px",
            height: 42,
            boxSizing: "border-box",
            pointerEvents: "auto",
          }}
        >
          <InputBase
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search postcodes, buildings, units, addresses....."
            sx={{
              flex: 1,
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "13.5px",
              color: "#000000",
              "& input::placeholder": {
                color: "#919191",
                opacity: 1,
              },
            }}
          />
          <IconButton size="small" sx={{ p: 0.5, color: "#0000FF" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.5 0C10.089 0 12.999 2.91 13 6.5C13 7.938 12.532 9.267 11.742 10.344C11.782 10.373 11.82 10.406 11.856 10.442L15.707 14.293C16.097 14.683 16.097 15.317 15.707 15.707C15.316 16.098 14.683 16.098 14.292 15.707L10.442 11.856C10.406 11.82 10.373 11.782 10.343 11.742C9.267 12.532 7.938 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1C3.462 1 1 3.462 1 6.5C1 9.538 3.462 12 6.5 12C9.537 12 12 9.538 12 6.5C12 3.462 9.537 1 6.5 1Z"
                fill="#0000FF"
              />
            </svg>
          </IconButton>
        </Box>

        {/* Exit Fullscreen / Minimize Button (Screenshot 3 Top Right) */}
        <Tooltip title="Exit Fullscreen" placement="bottom">
          <Box
            onClick={onClose}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#FFFFFF",
              borderRadius: "50%",
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              pointerEvents: "auto",
              transition: "transform 0.15s ease, background-color 0.15s ease",
              "&:hover": {
                bgcolor: "#F8FAFC",
                transform: "scale(1.08)",
              },
            }}
          >
            {/* Contract / Minimize Diagonal Inward Arrows SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 14H10M10 14V20M10 14L3 21M20 10H14M14 10V4M14 10L21 3"
                stroke="#1E293B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Tooltip>
      </Box>

      {/* Bottom Left Floating Bar: Grid Level Tabs (Screenshot 3) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 24,
          left: 20,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          bgcolor: "#FFFFFF",
          p: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.15)",
          border: "1px solid #E2E8F0",
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontSize: "13px",
            fontWeight: 500,
            color: "#64748B",
            pr: 0.5,
          }}
        >
          Grid Level:
        </Typography>

        {/* T1 */}
        <Box
          onClick={() => setActiveTier(1)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            px: "8px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 1 ? "rgba(0, 0, 255, 0.05)" : "transparent",
            border: activeTier === 1 ? "1px solid #0000FF" : "1px solid transparent",
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(0, 0, 255, 0.04)" },
          }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#0000FF" }} />
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600, color: "#1E293B" }}>
            T1 <span style={{ color: "#0000FF" }}>({t1})</span>
          </Typography>
        </Box>

        {/* T2 */}
        <Box
          onClick={() => setActiveTier(2)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            px: "8px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 2 ? "rgba(0, 0, 255, 0.05)" : "transparent",
            border: activeTier === 2 ? "1px solid #0000FF" : "1px solid transparent",
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(0, 0, 255, 0.04)" },
          }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#64748B" }} />
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600, color: "#1E293B" }}>
            T2 <span style={{ color: "#64748B" }}>({t2})</span>
          </Typography>
        </Box>

        {/* T3 */}
        <Box
          onClick={() => setActiveTier(3)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            px: "8px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 3 ? "rgba(0, 0, 255, 0.05)" : "transparent",
            border: activeTier === 3 ? "1px solid #0000FF" : "1px solid transparent",
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(0, 0, 255, 0.04)" },
          }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#10B981" }} />
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600, color: "#1E293B" }}>
            T3 <span style={{ color: "#10B981" }}>({t3})</span>
          </Typography>
        </Box>

        {/* T4 (Active in Screenshot 3) */}
        <Box
          onClick={() => setActiveTier(4)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            px: "8px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 4 ? "rgba(0, 0, 255, 0.05)" : "transparent",
            border: activeTier === 4 ? "1.5px solid #0000FF" : "1px solid transparent",
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(0, 0, 255, 0.04)" },
          }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "#0288D1" }} />
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 600, color: "#1E293B" }}>
            T4 <span style={{ color: "#0288D1" }}>({t4})</span>
          </Typography>
        </Box>
      </Box>

      {/* Bottom Right Floating Controls (Location, Zoom, Layers) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 24,
          right: 20,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <Tooltip title="Recenter" placement="left">
          <Box
            onClick={handleRecenter}
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#FFFFFF",
              borderRadius: "6px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="7" stroke="#475569" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.5" fill="#475569" />
              <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Box>
        </Tooltip>

        <Box
          onClick={handleZoomIn}
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#FFFFFF",
            borderRadius: "6px 6px 0 0",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderBottom: "1px solid #F1F5F9",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13M8 3V13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        <Box
          onClick={handleZoomOut}
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#FFFFFF",
            borderRadius: "0 0 6px 6px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        <Tooltip title="Layers" placement="left">
          <Box
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#FFFFFF",
              borderRadius: "6px",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              mt: "4px",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </Box>
        </Tooltip>
      </Box>
    </Dialog>
  );
}

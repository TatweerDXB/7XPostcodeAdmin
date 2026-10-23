"use client";

import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { Map as LeafletMap } from "leaflet";

interface PostcodeMiniMapProps {
  latitude: number;
  longitude: number;
  activeTier?: number;
  chipTier4?: string;
  onExpandMap?: () => void;
}

export default function PostcodeMiniMap({
  latitude,
  longitude,
  activeTier = 4,
  chipTier4 = "76",
  onExpandMap,
}: PostcodeMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      type LeafletContainer = HTMLDivElement & { _leaflet_id?: number };
      const container = mapContainerRef.current as LeafletContainer;
      if (container._leaflet_id) {
        delete container._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 17,
        minZoom: 12,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      // Google Maps Roadmap layer
      L.tileLayer("https://mt{s}.google.com/vt/lyrs=m,transit,poi&hl=en&x={x}&y={y}&z={z}", {
        subdomains: ["0", "1", "2", "3"],
        maxZoom: 20,
      }).addTo(map);

      // Add 10x10 sub-grid with numbers 00..99 matching Screenshot 4 & 5
      const gridLayer = L.layerGroup().addTo(map);
      const span = 0.0036;
      const step = span / 10;
      const north = latitude + span / 2;
      const west = longitude - span / 2;

      const targetCellNum = parseInt(chipTier4, 10);
      const targetR = !isNaN(targetCellNum) ? Math.floor(targetCellNum / 10) : 7;
      const targetC = !isNaN(targetCellNum) ? targetCellNum % 10 : 6;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cNorth = north - r * step;
          const cSouth = north - (r + 1) * step;
          const cWest = west + c * step;
          const cEast = west + (c + 1) * step;
          const cellCode = `${r}${c}`;
          const isTarget = r === targetR && c === targetC;

          // Check if cell is in the central active cluster (rows 4..8, cols 4..8)
          const inCluster = r >= 4 && r <= 8 && c >= 4 && c <= 8;

          const fillColor = isTarget
            ? "#29B6F6"
            : inCluster
            ? "rgba(179, 229, 252, 0.45)"
            : "rgba(255, 255, 255, 0.25)";
          const fillOpacity = isTarget ? 0.75 : inCluster ? 0.45 : 0.15;
          const strokeColor = isTarget ? "#0288D1" : "rgba(100, 116, 139, 0.4)";

          L.rectangle(
            [
              [cSouth, cWest],
              [cNorth, cEast],
            ],
            {
              color: strokeColor,
              weight: isTarget ? 1.5 : 0.5,
              dashArray: isTarget ? undefined : "2, 2",
              fillColor,
              fillOpacity,
            }
          ).addTo(gridLayer);

          // Add cell number text label
          const centerLat = (cNorth + cSouth) / 2;
          const centerLng = (cWest + cEast) / 2;
          const labelHtml = `<div style="font-family: var(--font-cairo), sans-serif; font-size: 8px; font-weight: ${
            isTarget ? "700" : "500"
          }; color: ${isTarget ? "#000000" : "#475569"}; text-align: center; line-height: 1; user-select: none;">${cellCode}</div>`;

          const labelIcon = L.divIcon({
            className: "grid-cell-label",
            html: labelHtml,
            iconSize: [16, 10],
            iconAnchor: [8, 5],
          });

          L.marker([centerLat, centerLng], { icon: labelIcon, interactive: false }).addTo(gridLayer);
        }
      }

      // Add Red Location Pin on target cell center
      const targetNorth = north - targetR * step;
      const targetSouth = north - (targetR + 1) * step;
      const targetWest = west + targetC * step;
      const targetEast = west + (targetC + 1) * step;
      const pinLat = (targetNorth + targetSouth) / 2;
      const pinLng = (targetWest + targetEast) / 2;

      const pinHtml = `
        <div style="position: relative; width: 28px; height: 36px; transform: translate(-50%, -100%);">
          <svg width="28" height="36" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="miniPinShadow" x="0" y="0" width="32" height="40" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.35"/>
            </filter>
            <g filter="url(#miniPinShadow)">
              <path d="M16 2C9.37 2 4 7.37 4 14C4 22.5 16 36 16 36C16 36 28 22.5 28 14C28 7.37 22.63 2 16 2Z" fill="#E11D48"/>
              <circle cx="16" cy="14" r="5" fill="#FFFFFF"/>
            </g>
          </svg>
        </div>
      `;

      const pinIcon = L.divIcon({
        className: "mini-map-pin",
        html: pinHtml,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });

      L.marker([pinLat, pinLng], { icon: pinIcon }).addTo(map);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, activeTier, chipTier4]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 17);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 240,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
      }}
    >
      <Box
        ref={mapContainerRef}
        sx={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Top Right: Expand Map Icon Button (matches Screenshot 4 & 5) */}
      {onExpandMap && (
        <Tooltip title="Expand Map" placement="left">
          <Box
            onClick={onExpandMap}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 28,
              height: 28,
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 500,
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "#F8FAFC",
                transform: "scale(1.05)",
              },
            }}
          >
            {/* Diagonal Expand Arrows SVG */}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2H14V6M14 2L9.5 6.5M6 14H2V10M2 14L6.5 9.5"
                stroke="#1E293B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Tooltip>
      )}

      {/* Right Edge: Vertical Map Action Controls (Location, Zoom +, Zoom -, Layers) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          right: 10,
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* Recenter / My Location Button */}
        <Tooltip title="Recenter" placement="left">
          <Box
            onClick={handleRecenter}
            sx={{
              width: 24,
              height: 24,
              bgcolor: "#FFFFFF",
              borderRadius: "4px",
              boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="7" stroke="#475569" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.5" fill="#475569" />
              <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Box>
        </Tooltip>

        {/* Zoom In */}
        <Box
          onClick={handleZoomIn}
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "4px 4px 0 0",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderBottom: "1px solid #F1F5F9",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13M8 3V13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        {/* Zoom Out */}
        <Box
          onClick={handleZoomOut}
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>

        {/* Layers Button */}
        <Box
          sx={{
            width: 24,
            height: 24,
            bgcolor: "#FFFFFF",
            borderRadius: "4px",
            boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            mt: "2px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
            <path d="M2 17L12 22L22 17" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="#7E1BFE" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import type { Map as LeafletMap } from "leaflet";

interface PostcodeMiniMapProps {
  latitude: number;
  longitude: number;
  activeTier?: number;
  chipTier4?: string;
}

export default function PostcodeMiniMap({
  latitude,
  longitude,
  activeTier = 4,
  chipTier4 = "95",
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

      // Add 10x10 orange sub-grid over the area
      const gridLayer = L.layerGroup().addTo(map);
      const span = 0.0035;
      const step = span / 10;
      const north = latitude + span / 2;
      const west = longitude - span / 2;

      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          const cNorth = north - r * step;
          const cSouth = north - (r + 1) * step;
          const cWest = west + c * step;
          const cEast = west + (c + 1) * step;
          const isSelected = r === 5 && c === 4;

          L.rectangle(
            [
              [cSouth, cWest],
              [cNorth, cEast],
            ],
            {
              color: isSelected ? "#EB861F" : "rgba(235, 134, 31, 0.4)",
              weight: isSelected ? 1.5 : 0.6,
              fillColor: isSelected ? "#EB861F" : "rgba(235, 134, 31, 0.2)",
              fillOpacity: isSelected ? 0.4 : 0.15,
            }
          ).addTo(gridLayer);
        }
      }

      // Add Pin Marker
      const pinHtml = `
        <div style="position: relative; width: 28px; height: 34px; transform: translate(-50%, -100%);">
          <svg width="28" height="34" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="miniShadow" x="0" y="0" width="32" height="38" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
            </filter>
            <g filter="url(#miniShadow)">
              <path d="M16 2C9.37 2 4 7.37 4 14C4 22.5 16 34 16 34C16 34 28 22.5 28 14C28 7.37 22.63 2 16 2Z" fill="#DC2626"/>
              <circle cx="16" cy="14" r="5" fill="#FFFFFF"/>
            </g>
          </svg>
        </div>
      `;

      const pinIcon = L.divIcon({
        className: "mini-map-pin",
        html: pinHtml,
        iconSize: [28, 34],
        iconAnchor: [14, 34],
      });

      L.marker([latitude, longitude], { icon: pinIcon }).addTo(map);
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

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 210,
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

      {/* Mini Map Zoom Controls (Top Right or Bottom Right) */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Box
          onClick={handleZoomIn}
          sx={{
            width: 20,
            height: 20,
            bgcolor: "#FFFFFF",
            borderRadius: "3px",
            boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13M8 3V13" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>
        <Box
          onClick={handleZoomOut}
          sx={{
            width: 20,
            height: 20,
            bgcolor: "#FFFFFF",
            borderRadius: "3px",
            boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8H13" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Box>
      </Box>
    </Box>
  );
}

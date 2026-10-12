"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import { AddressRegistryItem } from "@/data/addressRegistryData";
import AddAddressMap, { TIER_THEMES } from "./AddAddressMap";

interface AddressRegistryInlinePanelProps {
  mode: "view" | "edit";
  item: AddressRegistryItem;
  onClose: () => void;
  onSwitchToEdit?: () => void;
  onSwitchToView?: () => void;
  onSave?: (updatedItem: AddressRegistryItem) => void;
}

export default function AddressRegistryInlinePanel({
  mode,
  item,
  onClose,
  onSwitchToEdit,
  onSwitchToView,
  onSave,
}: AddressRegistryInlinePanelProps) {
  const isEditMode = mode === "edit";

  // Tier cell states
  const [activeTier, setActiveTier] = useState<1 | 2 | 3 | 4>(4);
  const [tier1Cell, setTier1Cell] = useState("47");
  const [tier2Cell, setTier2Cell] = useState("45");
  const [tier3Cell, setTier3Cell] = useState("65");
  const [tier4Cell, setTier4Cell] = useState("95");

  // Map coordinates
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 25.1972,
    lng: 55.2744,
  });

  // Editable Form fields
  const [addressClass, setAddressClass] = useState("All Classes");
  const [building, setBuilding] = useState("");
  const [streetPlot, setStreetPlot] = useState("");
  const [areaLocality, setAreaLocality] = useState("Downtown Dubai");
  const [districtSector, setDistrictSector] = useState("Near Dubai Mall");
  const [emirate, setEmirate] = useState("Dubai");
  const [addressEnglish, setAddressEnglish] = useState("");
  const [consentChecked, setConsentChecked] = useState(true);

  // Sync state whenever the selected item changes
  useEffect(() => {
    if (item) {
      setCoords({
        lat: item.latitude || 25.1972,
        lng: item.longitude || 55.2744,
      });
      setAddressClass(item.classType || "All Classes");
      setBuilding(item.buildingName || item.addressLabel || "");
      setStreetPlot(item.onwani !== "-" ? item.onwani : "Sheikh Zayed Road, Plot 45");
      setAreaLocality(item.area || "Downtown Dubai");
      setDistrictSector("Near Dubai Mall");
      setEmirate(item.emirate || "Dubai");
      setAddressEnglish(item.addressLabel || "");
      setConsentChecked(true);
      setActiveTier(4);

      setTier1Cell(item.t1?.replace("Cell ", "") || "47");
      setTier2Cell(item.t2?.replace("Cell ", "") || "45");
      setTier3Cell(item.t3?.replace("Cell ", "") || "65");
      setTier4Cell(item.t4?.replace("Cell ", "") || "95");
    }
  }, [item]);

  const handleCellSelect = (
    tier: 1 | 2 | 3 | 4,
    cellId: string,
    centerLat: number,
    centerLng: number
  ) => {
    if (tier === 1) setTier1Cell(cellId);
    if (tier === 2) setTier2Cell(cellId);
    if (tier === 3) setTier3Cell(cellId);
    if (tier === 4) setTier4Cell(cellId);

    setCoords({ lat: centerLat, lng: centerLng });
  };

  const handleCoordsChange = (newCoords: { lat: number; lng: number }) => {
    setCoords(newCoords);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      alert("Please check consent before saving.");
      return;
    }

    const updatedItem: AddressRegistryItem = {
      ...item,
      addressLabel: building.trim() || addressEnglish.trim() || item.addressLabel,
      buildingName: building.trim() || item.buildingName,
      classType: (addressClass === "All Classes" ? item.classType : addressClass) as any,
      area: areaLocality.trim() || item.area,
      emirate: emirate.trim() || item.emirate,
      onwani: streetPlot.trim() || item.onwani,
      latitude: coords.lat,
      longitude: coords.lng,
      t1: `Cell ${tier1Cell}`,
      t2: `Cell ${tier2Cell}`,
      t3: `Cell ${tier3Cell}`,
      t4: `Cell ${tier4Cell}`,
      postcode: `${tier1Cell}${tier2Cell}-${tier3Cell}${tier4Cell}`,
    };

    if (onSave) {
      onSave(updatedItem);
    }
    if (onSwitchToView) {
      onSwitchToView();
    }
  };

  const postcodeDisplay = item.postcode || `${tier1Cell}${tier2Cell}-${tier3Cell}${tier4Cell}`;

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "460px", lg: "500px", xl: "540px" },
        flexShrink: 0,
        bgcolor: "#FFFFFF",
        borderRadius: "8px",
        boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.25)",
        p: { xs: "16px", sm: "20px" },
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxSizing: "border-box",
        maxHeight: "calc(100vh - 170px)",
        overflowY: "auto",
        transition: "all 0.25s ease-in-out",
        "&::-webkit-scrollbar": {
          width: "5px",
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "#CBD5E1",
          borderRadius: "4px",
        },
      }}
    >
      {/* Top Header Row with Title & Close (X) button */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 36,
          }}
        >
          {isEditMode ? (
            <Typography
              sx={{
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: { xs: "20px", sm: "24px" },
                lineHeight: "32px",
                color: "#000000",
                letterSpacing: "-0.01em",
              }}
            >
              Search or Pin the Location
            </Typography>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Typography
                sx={{
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "20px", sm: "24px" },
                  lineHeight: "32px",
                  color: "#000000",
                  letterSpacing: "-0.01em",
                }}
              >
                Postcode {postcodeDisplay}
              </Typography>

              {/* Status Badge */}
              <Box
                sx={{
                  px: "8px",
                  py: "2px",
                  borderRadius: "3px",
                  bgcolor: "#F3FAF4",
                  color: "#3F8E50",
                  fontSize: "12px",
                  fontWeight: 500,
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                    stroke="#3F8E50"
                    strokeWidth="1.75"
                  />
                  <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="#3F8E50" strokeWidth="1.75" />
                </svg>
                {item.status}
              </Box>
            </Box>
          )}

          {/* Circular Close Button matching Figma */}
          <IconButton
            onClick={onClose}
            size="small"
            title="Close Panel"
            sx={{
              p: "4px",
              color: "#000000",
              transition: "all 0.15s ease",
              "&:hover": {
                bgcolor: "#F0F6FC",
                color: "#0000FF",
              },
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.17 14.83L14.83 9.17"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.83 14.83L9.17 9.17"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </Box>

        {!isEditMode && (
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              color: "#5A5A5A",
              lineHeight: "20px",
            }}
          >
            {item.addressLabel}
            {item.area ? `, ${item.area}` : ""}, {item.emirate}
          </Typography>
        )}
      </Box>

      {/* Multi-color Tier Selector Chips */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        {/* Tier 1 (Blue) */}
        <Box
          onClick={() => isEditMode && setActiveTier(1)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            px: "10px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 1 ? TIER_THEMES[1].bgActive : "#F0F6FC",
            border: activeTier === 1 ? "none" : "1px solid rgba(0, 0, 255, 0.2)",
            color: activeTier === 1 ? "#FFFFFF" : TIER_THEMES[1].color,
            cursor: isEditMode ? "pointer" : "default",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            transition: "all 0.15s ease",
          }}
        >
          Tier 1 &rarr; {tier1Cell}
        </Box>

        {/* Tier 2 (Indigo) */}
        <Box
          onClick={() => isEditMode && setActiveTier(2)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            px: "10px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 2 ? TIER_THEMES[2].bgActive : "rgba(79, 70, 229, 0.08)",
            border: activeTier === 2 ? "none" : "1px solid rgba(79, 70, 229, 0.2)",
            color: activeTier === 2 ? "#FFFFFF" : TIER_THEMES[2].color,
            cursor: isEditMode ? "pointer" : "default",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            transition: "all 0.15s ease",
          }}
        >
          Tier 2 &rarr; {tier2Cell}
        </Box>

        {/* Tier 3 (Emerald) */}
        <Box
          onClick={() => isEditMode && setActiveTier(3)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            px: "10px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 3 ? TIER_THEMES[3].bgActive : "rgba(16, 185, 129, 0.08)",
            border: activeTier === 3 ? "none" : "1px solid rgba(16, 185, 129, 0.2)",
            color: activeTier === 3 ? "#FFFFFF" : TIER_THEMES[3].color,
            cursor: isEditMode ? "pointer" : "default",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            transition: "all 0.15s ease",
          }}
        >
          Tier 3 &rarr; {tier3Cell}
        </Box>

        {/* Tier 4 (Orange - matching Figma highlighted badge) */}
        <Box
          onClick={() => isEditMode && setActiveTier(4)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            px: "10px",
            py: "4px",
            borderRadius: "4px",
            bgcolor: activeTier === 4 ? TIER_THEMES[4].bgActive : "rgba(234, 122, 36, 0.08)",
            border: activeTier === 4 ? "none" : "1px solid rgba(234, 122, 36, 0.2)",
            color: activeTier === 4 ? "#FFFFFF" : TIER_THEMES[4].color,
            cursor: isEditMode ? "pointer" : "default",
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
            fontWeight: 600,
            fontSize: "12px",
            transition: "all 0.15s ease",
          }}
        >
          Tier 4 &rarr; {tier4Cell}
        </Box>
      </Box>

      {/* Map Section */}
      <Box sx={{ width: "100%", height: 210, flexShrink: 0, borderRadius: "6px", overflow: "hidden" }}>
        <AddAddressMap
          activeTier={activeTier}
          tier1Cell={tier1Cell}
          tier2Cell={tier2Cell}
          tier3Cell={tier3Cell}
          tier4Cell={tier4Cell}
          coords={coords}
          onCellSelect={handleCellSelect}
          onCoordsChange={handleCoordsChange}
        />
      </Box>

      {/* Form / Structured Address Details */}
      {isEditMode ? (
        <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Section Header */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                color: "#000000",
              }}
            >
              Complete The Structured Address
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12px",
                color: "#717171",
              }}
            >
              Auto-filled from the map — every field can be edited
            </Typography>
          </Box>

          {/* Address Class Dropdown */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#000000",
              }}
            >
              Address Class
            </Typography>
            <Select
              value={addressClass}
              onChange={(e) => setAddressClass(e.target.value)}
              size="small"
              sx={{
                height: 36,
                borderRadius: "4px",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "13px",
                bgcolor: "#FFFFFF",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DEDEDE",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                },
              }}
            >
              <MenuItem value="All Classes">All Classes</MenuItem>
              <MenuItem value="Building">Building</MenuItem>
              <MenuItem value="Unit">Unit</MenuItem>
              <MenuItem value="Villa">Villa</MenuItem>
              <MenuItem value="Plot">Plot</MenuItem>
            </Select>
          </Box>

          {/* Building & Street/Plot (Row) */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#000" }}>
                Building
              </Typography>
              <InputBase
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="Al Noor Tower"
                sx={{
                  border: "1px solid #DEDEDE",
                  borderRadius: "4px",
                  height: 36,
                  px: 1.2,
                  fontFamily: "var(--font-cairo)",
                  fontSize: "13px",
                  "&:focus-within": { borderColor: "#0000FF" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#000" }}>
                Street/Plot
              </Typography>
              <InputBase
                value={streetPlot}
                onChange={(e) => setStreetPlot(e.target.value)}
                placeholder="Sheikh Zayed Road, Plot 45"
                sx={{
                  border: "1px solid #DEDEDE",
                  borderRadius: "4px",
                  height: 36,
                  px: 1.2,
                  fontFamily: "var(--font-cairo)",
                  fontSize: "13px",
                  "&:focus-within": { borderColor: "#0000FF" },
                }}
              />
            </Box>
          </Box>

          {/* Area/Locality & District/Sector (Row) */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#000" }}>
                Area/Locality
              </Typography>
              <InputBase
                value={areaLocality}
                onChange={(e) => setAreaLocality(e.target.value)}
                placeholder="Downtown Dubai"
                sx={{
                  border: "1px solid #DEDEDE",
                  borderRadius: "4px",
                  height: 36,
                  px: 1.2,
                  fontFamily: "var(--font-cairo)",
                  fontSize: "13px",
                  "&:focus-within": { borderColor: "#0000FF" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#000" }}>
                District / sector
              </Typography>
              <InputBase
                value={districtSector}
                onChange={(e) => setDistrictSector(e.target.value)}
                placeholder="Near Dubai Mall"
                sx={{
                  border: "1px solid #DEDEDE",
                  borderRadius: "4px",
                  height: 36,
                  px: 1.2,
                  fontFamily: "var(--font-cairo)",
                  fontSize: "13px",
                  "&:focus-within": { borderColor: "#0000FF" },
                }}
              />
            </Box>
          </Box>

          {/* Emirate & Address (English) (Row) */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#000" }}>
                Emirate
              </Typography>
              <InputBase
                value={emirate}
                onChange={(e) => setEmirate(e.target.value)}
                placeholder="Dubai"
                sx={{
                  border: "1px solid #DEDEDE",
                  borderRadius: "4px",
                  height: 36,
                  px: 1.2,
                  fontFamily: "var(--font-cairo)",
                  fontSize: "13px",
                  "&:focus-within": { borderColor: "#0000FF" },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", fontWeight: 500, color: "#000" }}>
                Address (English)
              </Typography>
              <InputBase
                value={addressEnglish}
                onChange={(e) => setAddressEnglish(e.target.value)}
                placeholder="English Address"
                sx={{
                  border: "1px solid #DEDEDE",
                  borderRadius: "4px",
                  height: 36,
                  px: 1.2,
                  fontFamily: "var(--font-cairo)",
                  fontSize: "13px",
                  "&:focus-within": { borderColor: "#0000FF" },
                }}
              />
            </Box>
          </Box>

          {/* Consent Checkbox matching Figma */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mt: 0.5 }}>
            <Checkbox
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              size="small"
              sx={{
                p: 0,
                color: "#0000FF",
                "&.Mui-checked": { color: "#0000FF" },
              }}
            />
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "11px",
                color: "#000000",
                lineHeight: "15px",
                cursor: "pointer",
              }}
              onClick={() => setConsentChecked(!consentChecked)}
            >
              I confirm this information is accurate and consent to verification.
            </Typography>
          </Box>

          {/* Action Button: Save Edits matching Figma */}
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 1,
              height: 38,
              bgcolor: "#0000FF",
              color: "#FFFFFF",
              borderRadius: "4px",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#0000CC",
                boxShadow: "none",
              },
            }}
          >
            Save Edits
          </Button>
        </Box>
      ) : (
        /* View Details Mode */
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                color: "#000000",
              }}
            >
              Structured Address Details
            </Typography>

            <Button
              onClick={onSwitchToEdit}
              variant="outlined"
              size="small"
              startIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13.26 3.6L5.05 12.29C4.74 12.62 4.44 13.27 4.38 13.72L4.01 16.96C3.88 18.13 4.72 18.93 5.88 18.73L9.1 18.18C9.55 18.1 10.18 17.77 10.49 17.43L18.7 8.74C20.12 7.24 20.76 5.53 18.55 3.45C16.35 1.4 14.68 2.1 13.26 3.6Z"
                    stroke="#0000FF"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M11.89 5.05C12.32 7.81 14.56 9.92 17.34 10.2" stroke="#0000FF" strokeWidth="1.5" />
                </svg>
              }
              sx={{
                height: 30,
                borderColor: "#0000FF",
                color: "#0000FF",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
                fontFamily: "var(--font-cairo)",
                "&:hover": {
                  borderColor: "#0000CC",
                  bgcolor: "#F0F6FC",
                },
              }}
            >
              Edit
            </Button>
          </Box>

          {/* 2-Column Key Value Tiles */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Address ID
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {item.addressId}
              </Typography>
            </Box>

            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Class Type
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {item.classType}
              </Typography>
            </Box>

            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Building / Label
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {item.buildingName || item.addressLabel}
              </Typography>
            </Box>

            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Street / Onwani
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {item.onwani}
              </Typography>
            </Box>

            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Area / Locality
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {item.area || "Downtown Dubai"}
              </Typography>
            </Box>

            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Emirate
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {item.emirate}
              </Typography>
            </Box>

            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Makani
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {item.makani}
              </Typography>
            </Box>

            <Box sx={{ p: "10px 12px", bgcolor: "#F9FBFD", borderRadius: "6px", border: "1px solid #EDF2F7" }}>
              <Typography sx={{ fontSize: "11px", color: "#717171", fontFamily: "var(--font-cairo)" }}>
                Coordinates
              </Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#000", fontFamily: "var(--font-cairo)" }}>
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

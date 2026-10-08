"use client";

import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
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

interface AddAddressDialogProps {
  open: boolean;
  onClose: () => void;
  onAddAddress?: (newAddress: AddressRegistryItem) => void;
  onUpdateAddress?: (updatedAddress: AddressRegistryItem) => void;
  initialData?: AddressRegistryItem | null;
}

export default function AddAddressDialog({
  open,
  onClose,
  onAddAddress,
  onUpdateAddress,
  initialData,
}: AddAddressDialogProps) {
  const isEditMode = Boolean(initialData);

  // Active tier tab (1..4) and selected cell IDs
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

  // Form Fields State
  const [addressClass, setAddressClass] = useState("All Classes");
  const [building, setBuilding] = useState("");
  const [streetPlot, setStreetPlot] = useState("");
  const [areaLocality, setAreaLocality] = useState("Downtown Dubai");
  const [districtSector, setDistrictSector] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [addressEnglish, setAddressEnglish] = useState("");
  const [consentChecked, setConsentChecked] = useState(true);

  // Reset or pre-populate form when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Prepopulate with existing address for editing
        setCoords({
          lat: initialData.latitude || 25.1972,
          lng: initialData.longitude || 55.2744,
        });
        setAddressClass(initialData.classType || "All Classes");
        setBuilding(initialData.buildingName || initialData.addressLabel || "");
        setStreetPlot(initialData.onwani !== "-" ? initialData.onwani : "Sheikh Zayed Road, Plot 45");
        setAreaLocality(initialData.area || "Downtown Dubai");
        setDistrictSector("Near Dubai Mall");
        setEmirate(initialData.emirate || "Dubai");
        setAddressEnglish(initialData.addressLabel || "");
        setConsentChecked(true);
        setActiveTier(4);

        setTier1Cell(initialData.t1?.replace("Cell ", "") || "47");
        setTier2Cell(initialData.t2?.replace("Cell ", "") || "45");
        setTier3Cell(initialData.t3?.replace("Cell ", "") || "65");
        setTier4Cell(initialData.t4?.replace("Cell ", "") || "95");
      } else {
        // Reset for Add New Address
        setCoords({ lat: 25.1972, lng: 55.2744 });
        setAddressClass("All Classes");
        setBuilding("");
        setStreetPlot("");
        setAreaLocality("Downtown Dubai");
        setDistrictSector("");
        setEmirate("Dubai");
        setAddressEnglish("");
        setConsentChecked(true);
        setActiveTier(1);
        setTier1Cell("27");
        setTier2Cell("45");
        setTier3Cell("65");
        setTier4Cell("95");
      }
    }
  }, [open, initialData]);

  // Handle cell selection from map
  const handleCellSelect = (
    tier: 1 | 2 | 3 | 4,
    cellId: string,
    centerLat: number,
    centerLng: number
  ) => {
    if (tier === 1) {
      setTier1Cell(cellId);
      setActiveTier(2);
    } else if (tier === 2) {
      setTier2Cell(cellId);
      setActiveTier(3);
    } else if (tier === 3) {
      setTier3Cell(cellId);
      setActiveTier(4);
    } else {
      setTier4Cell(cellId);
      setCoords({ lat: centerLat, lng: centerLng });
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      alert("Please confirm the verification consent before submitting.");
      return;
    }

    const randomIdNum = Math.floor(1000 + Math.random() * 9000);
    const validClassType: AddressRegistryItem["classType"] =
      addressClass === "Unit"
        ? "Unit"
        : addressClass === "Individual Recipient"
        ? "Individual Recipient"
        : addressClass === "Land / Plot"
        ? "Land / Plot"
        : addressClass === "Facility"
        ? "Facility"
        : "Building";

    const postcodeFormatted = `${tier1Cell}${tier2Cell}-${tier3Cell}${tier4Cell}`;

    if (isEditMode && initialData) {
      const updatedItem: AddressRegistryItem = {
        ...initialData,
        addressLabel: building || streetPlot || addressEnglish || initialData.addressLabel,
        classType: validClassType,
        emirate: emirate,
        t1: `Cell ${tier1Cell}`,
        t2: `Cell ${tier2Cell}`,
        t3: `Cell ${tier3Cell}`,
        t4: `Cell ${tier4Cell}`,
        postcode: postcodeFormatted,
        latitude: coords.lat,
        longitude: coords.lng,
        buildingName: building || undefined,
        area: areaLocality || undefined,
      };

      if (onUpdateAddress) {
        onUpdateAddress(updatedItem);
      }
    } else {
      const newAddressItem: AddressRegistryItem = {
        id: `addr-${Date.now()}`,
        addressId: `VA-2026-${randomIdNum}`,
        addressLabel: building || streetPlot || addressEnglish || "New Registered Address",
        classType: validClassType,
        makani: `${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}`,
        onwani: `${Math.floor(1000 + Math.random() * 9000)} / ${Math.floor(10 + Math.random() * 90)}`,
        emirate: emirate,
        status: "Verified",
        t1: `Cell ${tier1Cell}`,
        t2: `Cell ${tier2Cell}`,
        t3: `Cell ${tier3Cell}`,
        t4: `Cell ${tier4Cell}`,
        postcode: postcodeFormatted,
        latitude: coords.lat,
        longitude: coords.lng,
        buildingName: building || undefined,
        area: areaLocality || undefined,
      };

      if (onAddAddress) {
        onAddAddress(newAddressItem);
      }
    }

    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(1.5px)",
          },
        },
        paper: {
          sx: {
            width: { xs: "100%", sm: "520px", md: "566px" },
            height: "100vh",
            maxHeight: "100vh",
            bgcolor: "#FFFFFF",
            p: 0,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            boxShadow: "-8px 0px 30px rgba(0, 0, 0, 0.15)",
            borderLeft: "1px solid #E2E8F0",
            zIndex: 1400,
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Scrollable Container with dedicated padding */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          height: "100%",
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          p: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxSizing: "border-box",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: "4px",
          },
        }}
      >
        {/* Header Section: Title & Close Button */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 36,
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "26px",
                lineHeight: "36px",
                color: "#000000",
                letterSpacing: "-0.01em",
              }}
            >
              Search or Pin the Location
            </Typography>

            {/* Circular Close Button */}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                p: "4px",
                color: "#000000",
                "&:hover": { bgcolor: "#F0F6FC" },
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          {/* Divider */}
          <Box sx={{ width: "100%", height: "1px", bgcolor: "#F0F6FC", my: "4px" }} />
        </Box>

        {/* Multi-color Tier Selector Chips matching /portal/postcode-list */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            flexShrink: 0,
          }}
        >
          {/* Tier 1 (Blue) */}
          <Box
            onClick={() => setActiveTier(1)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              px: "12px",
              py: "6px",
              height: 38,
              boxSizing: "border-box",
              borderRadius: "8px",
              cursor: "pointer",
              bgcolor: activeTier === 1 ? TIER_THEMES[1].bgActive : "#FFFFFF",
              border: activeTier === 1 ? "none" : "1px solid #E2E8F0",
              color: activeTier === 1 ? "#FFFFFF" : "#000000",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "15px",
              fontWeight: activeTier === 1 ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            <span>Tier 1</span>
            <span style={{ fontSize: "13px", opacity: 0.85 }}>→</span>
            <span>{tier1Cell}</span>
          </Box>

          {/* Tier 2 (Indigo) */}
          <Box
            onClick={() => setActiveTier(2)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              px: "12px",
              py: "6px",
              height: 38,
              boxSizing: "border-box",
              borderRadius: "8px",
              cursor: "pointer",
              bgcolor: activeTier === 2 ? TIER_THEMES[2].bgActive : "#FFFFFF",
              border: activeTier === 2 ? "none" : "1px solid #E2E8F0",
              color: activeTier === 2 ? "#FFFFFF" : "#000000",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "15px",
              fontWeight: activeTier === 2 ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            <span>Tier 2</span>
            <span style={{ fontSize: "13px", opacity: 0.85 }}>→</span>
            <span>{tier2Cell}</span>
          </Box>

          {/* Tier 3 (Emerald / Green) */}
          <Box
            onClick={() => setActiveTier(3)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              px: "12px",
              py: "6px",
              height: 38,
              boxSizing: "border-box",
              borderRadius: "8px",
              cursor: "pointer",
              bgcolor: activeTier === 3 ? TIER_THEMES[3].bgActive : "#FFFFFF",
              border: activeTier === 3 ? "none" : "1px solid #E2E8F0",
              color: activeTier === 3 ? "#FFFFFF" : "#000000",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "15px",
              fontWeight: activeTier === 3 ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            <span>Tier 3</span>
            <span style={{ fontSize: "13px", opacity: 0.85 }}>→</span>
            <span>{tier3Cell}</span>
          </Box>

          {/* Tier 4 (Orange / Amber) */}
          <Box
            onClick={() => setActiveTier(4)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              px: "12px",
              py: "6px",
              height: 38,
              boxSizing: "border-box",
              borderRadius: "8px",
              cursor: "pointer",
              bgcolor: activeTier === 4 ? TIER_THEMES[4].bgActive : "#FFFFFF",
              border: activeTier === 4 ? "none" : "1px solid #E2E8F0",
              color: activeTier === 4 ? "#FFFFFF" : "#000000",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "15px",
              fontWeight: activeTier === 4 ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            <span>Tier 4</span>
            <span style={{ fontSize: "13px", opacity: 0.85 }}>→</span>
            <span>{tier4Cell}</span>
          </Box>
        </Box>

        {/* Map Preview Component with Dynamic Theme per Tier */}
        {open && (
          <AddAddressMap
            activeTier={activeTier}
            tier1Cell={tier1Cell}
            tier2Cell={tier2Cell}
            tier3Cell={tier3Cell}
            tier4Cell={tier4Cell}
            coords={coords}
            onCellSelect={handleCellSelect}
            onCoordsChange={setCoords}
          />
        )}

        {/* Structured Address Form Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            pb: "8px",
            borderBottom: "1px solid #DEDEDE",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "26px",
              color: "#000000",
            }}
          >
            Complete The Structured Address
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "22px",
              color: "#5A5A5A",
            }}
          >
            Auto-filled from the map — every field can be edited
          </Typography>
        </Box>

        {/* Field: Address Class (Full Width Select) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "#000000",
            }}
          >
            Address Class
          </Typography>
          <Select
            value={addressClass}
            onChange={(e) => setAddressClass(e.target.value)}
            size="small"
            displayEmpty
            sx={{
              height: 40,
              borderRadius: "4px",
              bgcolor: "#FFFFFF",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#DEDEDE",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#0000FF",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#0000FF",
              },
            }}
          >
            <MenuItem value="All Classes">All Classes</MenuItem>
            <MenuItem value="Building">Building</MenuItem>
            <MenuItem value="Unit">Unit</MenuItem>
            <MenuItem value="Individual Recipient">Individual Recipient</MenuItem>
            <MenuItem value="Land / Plot">Land / Plot</MenuItem>
            <MenuItem value="Facility">Facility</MenuItem>
          </Select>
        </Box>

        {/* Row 1: Building & Street/Plot */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexShrink: 0 }}>
          {/* Building */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "#000000",
              }}
            >
              Building
            </Typography>
            <Box
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRadius: "4px",
                px: "12px",
                display: "flex",
                alignItems: "center",
                "&:focus-within": { borderColor: "#0000FF" },
              }}
            >
              <InputBase
                placeholder="Building, villa or landmark name"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                fullWidth
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
                  "& input::placeholder": { color: "#919191", opacity: 1 },
                }}
              />
            </Box>
          </Box>

          {/* Street/Plot */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "#000000",
              }}
            >
              Street/Plot
            </Typography>
            <Box
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRadius: "4px",
                px: "12px",
                display: "flex",
                alignItems: "center",
                "&:focus-within": { borderColor: "#0000FF" },
              }}
            >
              <InputBase
                placeholder="Street name or plot number"
                value={streetPlot}
                onChange={(e) => setStreetPlot(e.target.value)}
                fullWidth
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
                  "& input::placeholder": { color: "#919191", opacity: 1 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Row 2: Area/Locality & District / sector */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexShrink: 0 }}>
          {/* Area/Locality */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "#000000",
              }}
            >
              Area/Locality
            </Typography>
            <Box
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRadius: "4px",
                px: "12px",
                display: "flex",
                alignItems: "center",
                "&:focus-within": { borderColor: "#0000FF" },
              }}
            >
              <InputBase
                placeholder="Auto-fills from map"
                value={areaLocality}
                onChange={(e) => setAreaLocality(e.target.value)}
                fullWidth
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
                  "& input::placeholder": { color: "#919191", opacity: 1 },
                }}
              />
            </Box>
          </Box>

          {/* District / sector */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "#000000",
              }}
            >
              District / sector
            </Typography>
            <Box
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRadius: "4px",
                px: "12px",
                display: "flex",
                alignItems: "center",
                "&:focus-within": { borderColor: "#0000FF" },
              }}
            >
              <InputBase
                placeholder="Optional"
                value={districtSector}
                onChange={(e) => setDistrictSector(e.target.value)}
                fullWidth
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
                  "& input::placeholder": { color: "#919191", opacity: 1 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Row 3: Emirate & Address (English) */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", flexShrink: 0 }}>
          {/* Emirate */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "#000000",
              }}
            >
              Emirate
            </Typography>
            <Select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value)}
              size="small"
              sx={{
                height: 40,
                borderRadius: "4px",
                bgcolor: "#FFFFFF",
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "14px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#DEDEDE",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0000FF",
                },
              }}
            >
              <MenuItem value="Dubai">Dubai</MenuItem>
              <MenuItem value="Abu Dhabi">Abu Dhabi</MenuItem>
              <MenuItem value="Sharjah">Sharjah</MenuItem>
              <MenuItem value="Ajman">Ajman</MenuItem>
              <MenuItem value="Ras Al Khaimah">Ras Al Khaimah</MenuItem>
              <MenuItem value="Fujairah">Fujairah</MenuItem>
              <MenuItem value="Umm Al Quwain">Umm Al Quwain</MenuItem>
            </Select>
          </Box>

          {/* Address (English) */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontWeight: 400,
                fontSize: "14px",
                color: "#000000",
              }}
            >
              Address (English)
            </Typography>
            <Box
              sx={{
                height: 40,
                bgcolor: "#FFFFFF",
                border: "1px solid #DEDEDE",
                borderRadius: "4px",
                px: "12px",
                display: "flex",
                alignItems: "center",
                "&:focus-within": { borderColor: "#0000FF" },
              }}
            >
              <InputBase
                placeholder="e.g. Al Garhoud, Dubai"
                value={addressEnglish}
                onChange={(e) => setAddressEnglish(e.target.value)}
                fullWidth
                sx={{
                  fontFamily: "var(--font-cairo), Cairo, sans-serif",
                  fontSize: "14px",
                  "& input::placeholder": { color: "#919191", opacity: 1 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Verification Consent Checkbox */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "4px", flexShrink: 0 }}>
          <Checkbox
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            sx={{
              p: 0,
              color: "#0000FF",
              "&.Mui-checked": {
                color: "#0000FF",
              },
            }}
          />
          <Typography
            onClick={() => setConsentChecked(!consentChecked)}
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              color: "#000000",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            I confirm this information is accurate and consent to verification.
          </Typography>
        </Box>

        {/* Submit / Save Button */}
        <Box sx={{ mt: "8px", pb: "8px", flexShrink: 0 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              height: 42,
              bgcolor: "#0000FF",
              color: "#FFFFFF",
              borderRadius: "4px",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#0000CC",
                boxShadow: "none",
              },
            }}
          >
            {isEditMode ? "Save Edits" : "Submit Request"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

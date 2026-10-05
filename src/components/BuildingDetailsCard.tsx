"use client";

import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { UAEBuilding } from "@/data/uaeBuildings";

interface BuildingDetailsCardProps {
  building: UAEBuilding;
  onClose: () => void;
}

export default function BuildingDetailsCard({
  building,
  onClose,
}: BuildingDetailsCardProps) {
  const fields = [
    { label: "Address Identifier", value: building.addressIdentifier },
    { label: "Grid ID", value: building.gridId },
    { label: "Latitude", value: building.latitude.toString() },
    { label: "Longitude", value: building.longitude.toString() },
    { label: "Makani number", value: building.makaniNumber },
    { label: "Onwani address", value: building.onwaniAddress },
    { label: "Recipient Name", value: building.recipientName },
    { label: "Organization Name", value: building.organizationName },
    { label: "Unit Type", value: building.unitType },
    { label: "Unit Number", value: building.unitNumber },
    { label: "Street", value: building.street },
    { label: "Area Locality", value: building.areaLocality },
    { label: "Emirate Admin Area", value: building.emirateAdminArea },
    { label: "Postal Code", value: building.postalCode },
  ];

  return (
    <Paper
      elevation={4}
      sx={{
        width: 320,
        maxWidth: "90vw",
        bgcolor: "#FFFFFF",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
        p: 2,
        maxHeight: "calc(100vh - 160px)",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#CBD5E1",
          borderRadius: 2,
        },
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            color: "#000000",
          }}
        >
          PostCode: {building.postCode}
        </Typography>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="close details"
          sx={{
            color: "#64748B",
            p: 0.3,
            "&:hover": {
              bgcolor: "#F1F5F9",
              color: "#000000",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Badges Row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.2 }}>
        <Box
          sx={{
            px: 1,
            py: 0.3,
            borderRadius: "4px",
            bgcolor: "#EFF6FF",
            color: "#0000FF",
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
          }}
        >
          Address
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.4,
            px: 1,
            py: 0.3,
            borderRadius: "4px",
            bgcolor: "#ECFDF5",
            color: "#10B981",
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "var(--font-cairo), Cairo, sans-serif",
          }}
        >
          Verified
          <CheckCircleOutlinedIcon sx={{ fontSize: 12, color: "#10B981" }} />
        </Box>
      </Box>

      {/* Address Text Paragraphs */}
      <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#334155", lineHeight: 1.4 }}>
          {building.addressLine1}
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#334155", lineHeight: 1.4 }}>
          {building.addressLine2}
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#334155", lineHeight: 1.4 }}>
          {building.addressLine3}
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "12px", color: "#000000", fontWeight: 600, lineHeight: 1.4 }}>
          {building.addressLine4}
        </Typography>
      </Box>

      {/* Section Title */}
      <Typography
        sx={{
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "13px",
          fontWeight: 700,
          color: "#000000",
          mb: 1,
          borderTop: "1px solid #F1F5F9",
          pt: 1.2,
        }}
      >
        Postal Address
      </Typography>

      {/* Key-Value Details Table */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
        {/* Postcode 4-Tier Chips Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 0.2,
          }}
        >
          <Typography sx={{ fontFamily: "var(--font-cairo)", fontSize: "11.5px", color: "#64748B", fontWeight: 500 }}>
            Postcode
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "3px",
                bgcolor: "#0000FF",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-cairo)",
              }}
            >
              {building.tiers.tier1}
            </Box>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "3px",
                bgcolor: "#64748B",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-cairo)",
              }}
            >
              {building.tiers.tier2}
            </Box>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "3px",
                bgcolor: "#10B981",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-cairo)",
              }}
            >
              {building.tiers.tier3}
            </Box>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "3px",
                bgcolor: "#F97316",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-cairo)",
              }}
            >
              {building.tiers.tier4}
            </Box>
          </Box>
        </Box>

        {/* Remaining Key-Value pairs */}
        {fields.map((field) => (
          <Box
            key={field.label}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 0.2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-cairo)",
                fontSize: "11.5px",
                color: "#64748B",
                fontWeight: 500,
                flex: 1,
              }}
            >
              {field.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "var(--font-cairo)",
                fontSize: "11.5px",
                color: "#000000",
                fontWeight: 600,
                textAlign: "right",
                maxWidth: 160,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {field.value || "-"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

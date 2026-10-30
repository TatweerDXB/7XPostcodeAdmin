"use client";

import React, { useState } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface TopHeaderProps {
  title?: string;
}

const pageTitles: Record<string, string> = {
  "/search": "Search Console",
  "/portal": "Search Console",
  "/postcode-list": "Postcode List",
  "/portal/postcode-list": "Postcode List",
  "/grid-engine": "Postcode Grid Engine",
  "/portal/grid-engine": "Postcode Grid Engine",
  "/address-registry": "Address Registry",
  "/portal/address-registry": "Address Registry",
  "/heatmap": "Heat Map",
  "/portal/heatmap": "Heat Map",
};

export default function TopHeader({ title }: TopHeaderProps) {
  const pathname = usePathname();
  const currentTitle = pageTitles[pathname] || title || "Search Console";
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const displayName =
    user?.displayName || user?.userName || "Mohamed";

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseMenu();
    await logout();
  };

  return (
    <Box
      component="header"
      sx={{
        height: 70,
        bgcolor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "40px",
        position: "sticky",
        top: 0,
        zIndex: 1100,
        boxShadow: "0px 0px 10px rgba(206, 213, 216, 0.33)",
      }}
    >
      {/* Page Title in Titillium Web Bold */}
      <Typography
        variant="h1"
        sx={{
          fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
          fontWeight: 700,
          fontSize: "24px",
          color: "#000000",
          lineHeight: "31px",
          letterSpacing: "-0.01em",
        }}
      >
        {currentTitle}
      </Typography>

      {/* Right Header: User Profile */}
      <Box
        onClick={handleOpenMenu}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
          userSelect: "none",
          p: "4px 6px",
          borderRadius: "24px",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.02)",
          },
        }}
      >
        {/* Avatar Circle */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            bgcolor: "#F1F5F9",
          }}
        >
          <Image
            src="/mohamed.jpg"
            alt={displayName}
            width={40}
            height={40}
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>

        {/* User Name in Titillium Web 600 */}
        <Typography
          sx={{
            fontFamily: "var(--font-titillium), 'Titillium Web', sans-serif",
            fontSize: "16px",
            fontWeight: 600,
            color: "#000000",
            lineHeight: "24px",
          }}
        >
          {displayName}
        </Typography>

        {/* Chevron Dropdown Arrow SVG from Figma */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            transform: openMenu ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5.64 5.95312C5.44 5.95312 5.23 5.87752 5.07 5.71532L1.25 1.90002C0.94 1.58652 0.94 1.06772 1.25 0.754323C1.57 0.440923 2.09 0.440923 2.4 0.754323L5.64 3.99682L8.89 0.754323C9.2 0.440923 9.72 0.440923 10.03 0.754323C10.34 1.06772 10.34 1.58652 10.03 1.90002L6.22 5.71532C6.05 5.87752 5.85 5.95312 5.64 5.95312Z"
              fill="black"
            />
          </svg>
        </Box>
      </Box>

      {/* User Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 180,
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.2 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#000000",
            }}
          >
            {displayName}
          </Typography>
          {user?.email && (
            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "12px",
                color: "#64748B",
              }}
            >
              {user.email}
            </Typography>
          )}
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ py: 1, color: "#EF4444" }}>
          <ListItemIcon sx={{ color: "#EF4444", minWidth: 30 }}>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Log out
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

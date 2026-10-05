"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SevenXLogo from "./SevenXLogo";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Search Console",
    href: "/portal",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 22L20 20"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Postcode List",
    href: "/portal/postcode-list",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.3701 6.881H15.6201" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.3799 6.881L5.1299 7.631L7.3799 5.381" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.3701 13.881H15.6201" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.3799 13.881L5.1299 14.631L7.3799 12.381" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 20H13C18 20 20 18 20 13V7C20 2 18 0 13 0H7C2 0 0 2 0 7V13C0 18 2 20 7 20Z" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Postcode Grid Engine",
    href: "/portal/grid-engine",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6.52V1.98C20 0.57 19.36 0 17.77 0H13.73C12.14 0 11.5 0.57 11.5 1.98V6.51C11.5 7.93 12.14 8.49 13.73 8.49H17.77C19.36 8.5 20 7.93 20 6.52Z" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 17.77V13.73C20 12.14 19.36 11.5 17.77 11.5H13.73C12.14 11.5 11.5 12.14 11.5 13.73V17.77C11.5 19.36 12.14 20 13.73 20H17.77C19.36 20 20 19.36 20 17.77Z" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 6.52V1.98C8.5 0.57 7.86 0 6.27 0H2.23C0.64 0 0 0.57 0 1.98V6.51C0 7.93 0.64 8.49 2.23 8.49H6.27C7.86 8.5 8.5 7.93 8.5 6.52Z" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 17.77V13.73C8.5 12.14 7.86 11.5 6.27 11.5H2.23C0.64 11.5 0 12.14 0 13.73V17.77C0 19.36 0.64 20 2.23 20H6.27C7.86 20 8.5 19.36 8.5 17.77Z" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Address Registry",
    href: "/portal/address-registry",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 6.25V16C16 19 14.21 20 12 20H4C1.79 20 0 19 0 16V6.25C0 3 1.79 2.25 4 2.25C4 2.87 4.25 3.43 4.66 3.84C5.07 4.25 5.63 4.5 6.25 4.5H9.75C10.99 4.5 12 3.49 12 2.25C14.21 2.25 16 3 16 6.25Z" transform="translate(4, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2.25C12 3.49 10.99 4.5 9.75 4.5H6.25C5.63 4.5 5.07 4.25 4.66 3.84C4.25 3.43 4 2.87 4 2.25C4 1.01 5.01 0 6.25 0H9.75C10.37 0 10.93 0.25 11.34 0.66C11.75 1.07 12 1.63 12 2.25Z" transform="translate(4, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 11H8" transform="translate(4, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15H12" transform="translate(4, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Heatmap",
    href: "/portal/heatmap",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 20H13C18 20 20 18 20 13V7C20 2 18 0 13 0H7C2 0 0 2 0 7V13C0 18 2 20 7 20Z" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 0L11.95 20" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.53 10.221L0 13.001" transform="translate(2, 2)" stroke={active ? "#FFFFFF" : "#DEDEDE"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 236,
        height: "100vh",
        bgcolor: "#000000",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 1200,
        boxSizing: "border-box",
      }}
    >
      {/* Top Section */}
      <Box>
        {/* Logo Container */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 94.5,
            width: "100%",
          }}
        >
          <SevenXLogo width={80} height={47.06} color="#FFFFFF" />
        </Box>

        {/* Divider line matching Figma SVG */}
        <Box
          sx={{
            width: "100%",
            height: "1px",
            bgcolor: "#DEDEDE",
            opacity: 0.2,
          }}
        />

        {/* Tabs Container: Compact and clean (starts at y=119px in Figma) */}
        <Box
          sx={{
            pt: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/portal"
                ? pathname === "/portal" || pathname === "/portal/"
                : pathname === item.href;

            return (
              <Box
                key={item.label}
                component={Link}
                href={item.href}
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  height: 48,
                  width: "100%",
                  px: "22px",
                  borderRadius: "4px",
                  bgcolor: isActive ? "rgba(0, 0, 255, 0.4)" : "transparent",
                  color: isActive ? "#FFFFFF" : "#DEDEDE",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    bgcolor: isActive ? "rgba(0, 0, 255, 0.5)" : "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                {/* Active Indicator Bar on Left Edge */}
                {isActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: "8px",
                      bottom: "8px",
                      width: "4px",
                      bgcolor: "#FFFFFF",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}

                {/* Icon */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    mr: "14px",
                    flexShrink: 0,
                  }}
                >
                  {item.icon(isActive)}
                </Box>

                {/* Label */}
                <Typography
                  sx={{
                    fontFamily: "var(--font-cairo), Cairo, sans-serif",
                    fontSize: "15px",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#FFFFFF" : "#DEDEDE",
                    lineHeight: "22px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Bottom Section: Log out */}
      <Box sx={{ pb: "24px" }}>
        <Box
          onClick={handleLogout}
          sx={{
            display: "flex",
            alignItems: "center",
            height: 48,
            width: "100%",
            px: "22px",
            color: "#DEDEDE",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.05)",
              color: "#FFFFFF",
              "& svg path": {
                stroke: "#FFFFFF",
              },
            },
          }}
        >
          {/* Logout SVG icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              mr: "14px",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.8999 5.56C7.2099 1.96 9.0599 0.49 13.1099 0.49H13.2399C17.7099 0.49 19.4999 2.28 19.4999 6.75V13.27C19.4999 17.74 17.7099 19.53 13.2399 19.53H13.1099C9.0899 19.53 7.2399 18.08 6.9099 14.54"
                transform="translate(2, 2)"
                stroke="#DEDEDE"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.0001 10H1.62012"
                transform="translate(2, 2)"
                stroke="#DEDEDE"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.85 6.65L0.5 10L3.85 13.35"
                transform="translate(2, 2)"
                stroke="#DEDEDE"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>

          <Typography
            sx={{
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              color: "#DEDEDE",
              lineHeight: "22px",
            }}
          >
            Log out
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

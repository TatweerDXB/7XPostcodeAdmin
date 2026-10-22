"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Search Console",
    href: "/search",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="11.5"
          cy="11.5"
          r="7.5"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 20L17 17"
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
    href: "/postcode-list",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
        <path
          d="M7.5 8H8.5M7.5 12H8.5M7.5 16H8.5"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M11.5 8H16.5M11.5 12H16.5M11.5 16H16.5"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Postcode Grid Engine",
    href: "/grid-engine",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="3"
          y="3"
          width="7.5"
          height="7.5"
          rx="2"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
        <rect
          x="13.5"
          y="3"
          width="7.5"
          height="7.5"
          rx="2"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
        <rect
          x="3"
          y="13.5"
          width="7.5"
          height="7.5"
          rx="2"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
        <rect
          x="13.5"
          y="13.5"
          width="7.5"
          height="7.5"
          rx="2"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    label: "Address Registry",
    href: "/address-registry",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 3.5H16C17.1 3.5 18 4.4 18 5.5V18.5C18 19.6 17.1 20.5 16 20.5H8C6.9 20.5 6 19.6 6 18.5V5.5C6 4.4 6.9 3.5 8 3.5Z"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
        <path
          d="M10 2V4.5C10 4.8 10.2 5 10.5 5H13.5C13.8 5 14 4.8 14 4.5V2"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9.5 10H14.5M9.5 14H14.5"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Heatmap",
    href: "/heatmap",
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="6"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
        <path
          d="M12 3V21M3 12H21"
          stroke={active ? "#FFFFFF" : "#DEDEDE"}
          strokeWidth="1.5"
        />
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
        background: "linear-gradient(180deg, #081D40 0%, #0E2555 100%)",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 1200,
        boxSizing: "border-box",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Top Section */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        {/* Logo Container (width: 158px, height: 64px) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 94,
            width: "100%",
            px: "16px",
            boxSizing: "border-box",
          }}
        >
          <Image
            src="/images/epg-logo.png"
            alt="Emirates Post Group"
            width={158}
            height={64}
            style={{
              width: "158px",
              height: "64px",
              objectFit: "contain",
            }}
            priority
          />
        </Box>

        {/* Divider Line 1 */}
        <Box
          sx={{
            width: "100%",
            height: "1px",
            bgcolor: "#DEDEDE",
            opacity: 0.2,
          }}
        />

        {/* Tabs Container */}
        <Box
          sx={{
            pt: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
          }}
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/search"
                ? pathname === "/search" || pathname === "/search/" || pathname === "/portal" || pathname === "/portal/"
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
                  height: 50,
                  width: "100%",
                  bgcolor: isActive ? "#0000FF" : "transparent",
                  color: isActive ? "#FFFFFF" : "#DEDEDE",
                  cursor: "pointer",
                  textDecoration: "none",
                  borderRadius: "4px",
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#0000FF" : "rgba(255, 255, 255, 0.06)",
                    color: "#FFFFFF",
                    "& svg path, & svg circle, & svg rect": {
                      stroke: "#FFFFFF",
                    },
                  },
                }}
              >
                {/* Active Indicator Bar on Left Edge */}
                <Box
                  sx={{
                    width: 4,
                    height: 32,
                    bgcolor: isActive ? "#FFFFFF" : "transparent",
                    opacity: isActive ? 1 : 0,
                    borderRadius: "0px 20px 20px 0px",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                />

                {/* Content Container (Icon + Label) */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    pl: "12px",
                    pr: "16px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Icon (24x24) */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon(isActive)}
                  </Box>

                  {/* Label (Cairo font, 18px, 600 weight) */}
                  <Typography
                    sx={{
                      fontFamily: "var(--font-cairo), Cairo, sans-serif",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: isActive ? "#FFFFFF" : "#DEDEDE",
                      lineHeight: "34px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Bottom Section: UAE Map Graphic + Log out */}
      <Box sx={{ position: "relative", width: "100%" }}>
        {/* UAE Border Map Graphic */}
        <Box
          sx={{
            position: "absolute",
            bottom: "64px",
            left: 0,
            width: 236,
            height: "auto",
            pointerEvents: "none",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            opacity: 0.9,
          }}
        >
          <Image
            src="/images/uae-border.png"
            alt="UAE Map"
            width={236}
            height={218}
            style={{
              width: "236px",
              height: "auto",
              objectFit: "contain",
              pointerEvents: "none",
            }}
            priority
          />
        </Box>

        {/* Log out Button */}
        <Box
          onClick={handleLogout}
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            height: 50,
            width: "100%",
            mb: "24px",
            color: "#DEDEDE",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.06)",
              color: "#FFFFFF",
              "& svg path": {
                stroke: "#FFFFFF",
              },
            },
          }}
        >
          {/* Spacer matching tab indicator */}
          <Box sx={{ width: 4, height: 32, opacity: 0, flexShrink: 0 }} />

          {/* Content (Logout Icon + Label) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              pl: "12px",
              pr: "16px",
              flex: 1,
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
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.9 7.56C9.21 3.96 11.06 2.49 15.11 2.49H15.24C19.71 2.49 21.5 4.28 21.5 8.75V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24 20.08 8.91 16.54"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12H2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 8.5L2 12L5.5 15.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>

            <Typography
              sx={{
                fontFamily: "var(--font-cairo), Cairo, sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                color: "inherit",
                lineHeight: "34px",
              }}
            >
              Log out
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

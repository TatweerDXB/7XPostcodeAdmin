"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/" || pathname === "/login";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F9FBFD" }}>
      {/* Left Sidebar Menu (236px width) */}
      <Sidebar />

      {/* Main Container Area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Top Header (70px height) */}
        <TopHeader />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            height: "calc(100vh - 70px)",
            overflow: "auto",
            position: "relative",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

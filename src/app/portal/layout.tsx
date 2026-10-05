import React from "react";
import Box from "@mui/material/Box";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export const metadata = {
  title: "Search Console - 7X UAE Postcode Digital Addressing",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <TopHeader title="Search Console" />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            height: "calc(100vh - 70px)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

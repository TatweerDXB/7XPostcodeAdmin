"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import StoreProvider from "@/store/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

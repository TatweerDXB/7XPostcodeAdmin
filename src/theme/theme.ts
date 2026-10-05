"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0000FF", // Figma royal blue #0000FF
      dark: "#0000CC",
      light: "#3333FF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#101828",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F0F6FC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#101828",
      secondary: "#6A7282",
    },
    divider: "#DEDEDE",
  },
  typography: {
    fontFamily: [
      "var(--font-cairo)",
      "Cairo",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      "sans-serif",
    ].join(","),
    h1: {
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: "36px",
      lineHeight: "46px",
    },
    h2: {
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      fontWeight: 700,
      fontSize: "32px",
      lineHeight: "41px",
    },
    h3: {
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      fontWeight: 600,
    },
    body1: {
      fontFamily: "var(--font-cairo), Cairo, sans-serif",
    },
    body2: {
      fontFamily: "var(--font-cairo), Cairo, sans-serif",
    },
    button: {
      fontFamily: "var(--font-cairo), Cairo, sans-serif",
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontFamily: "var(--font-cairo), Cairo, sans-serif",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 255, 0.2)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontFamily: "var(--font-cairo), Cairo, sans-serif",
          "& fieldset": {
            borderColor: "#DEDEDE",
          },
          "&:hover fieldset": {
            borderColor: "#ADADAD",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#0000FF",
            borderWidth: "1.5px",
          },
        },
      },
    },
  },
});


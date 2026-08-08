"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#155EEF", dark: "#0B3EB8", contrastText: "#FFFFFF" },
    text: { primary: "#172033", secondary: "#5A657A" },
    background: { default: "#F7F9FC", paper: "#FFFFFF" },
    divider: "#DDE3EC",
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: "var(--font-noto-sans-jp), sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.18 },
    h2: { fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.25 },
    h3: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.4 },
    body1: { lineHeight: 1.9 },
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 52,
          borderRadius: 999,
          paddingInline: 28,
          boxShadow: "none",
          "&:focus-visible": { outline: "3px solid #82ADFF", outlineOffset: 3 },
        },
      },
    },
  },
});

"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#294B9A", dark: "#102C68", light: "#82ADFF", contrastText: "#FFFFFF" },
    secondary: { main: "#D8A836", light: "#F3D788", contrastText: "#071B49" },
    text: { primary: "#10275E", secondary: "#526486" },
    background: { default: "#DCE9FB", paper: "rgba(247,251,255,.92)" },
    divider: "rgba(94,128,180,.3)",
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
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
          letterSpacing: ".03em",
          "&:focus-visible": { outline: "3px solid #82ADFF", outlineOffset: 3 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(94,128,180,.28)",
          borderRadius: 24,
          background: "rgba(247,251,255,.86)",
          backdropFilter: "blur(18px)",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
  },
});

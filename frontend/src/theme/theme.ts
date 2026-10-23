"use client";

import { createTheme } from "@mui/material/styles";

export const palette = {
  ocean: "#0F2A25",
  /** Controls over the map: one step lighter than the ocean. */
  oceanRaised: "#183832",
  land: "#335D4C",
  moss: "#2F5D46",
  ochre: "#E7B04A",
  ochreDeep: "#8A5A12",
  mineral: "#EDF1EC",
  paper: "#F8FAF7",
  ink: "#1B2A24",
  inkSoft: "#46564D",
  line: "#C9D4CC",
  /** Resting and hover surface on the light panel: a step in tone instead of a border. */
  tile: "#EDF2EC",
  tileHover: "#E0E9E1",
  onOcean: "#EAF1EB",
  onOceanSoft: "#A9BDB1",
};

const display = "var(--font-display), 'Segoe UI', sans-serif";

export const theme = createTheme({
  palette: {
    primary: { main: palette.moss },
    secondary: { main: palette.ochreDeep },
    background: { default: palette.mineral, paper: palette.paper },
    text: { primary: palette.ink, secondary: palette.inkSoft },
    divider: palette.line,
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-body), system-ui, sans-serif",
    h1: { fontFamily: display, fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontFamily: display, fontWeight: 700 },
    h3: { fontFamily: display, fontWeight: 700 },
    h4: { fontFamily: display, fontWeight: 700 },
    h5: { fontFamily: display, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.2 },
    h6: { fontFamily: display, fontWeight: 600 },
    subtitle1: { fontWeight: 700, lineHeight: 1.3 },
    subtitle2: { fontFamily: display, fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 },
    body1: { lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "button, a, [role='button'], input": { touchAction: "manipulation" },
        "h1, h2, h3, h4, h5, h6": { textWrap: "balance" },
        ":focus-visible": { outline: `2px solid ${palette.ochreDeep}`, outlineOffset: 2 },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { elevation: 0 } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: palette.tile,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: palette.line },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: palette.moss, borderWidth: 2 },
        },
      },
    },
  },
});

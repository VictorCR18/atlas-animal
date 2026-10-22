"use client";

import { createTheme } from "@mui/material/styles";

export const palette = {
  ocean: "#0F2A25",
  land: "#335D4C",
  moss: "#2F5D46",
  ochre: "#E7B04A",
  ochreDeep: "#8A5A12",
  mineral: "#EDF1EC",
  paper: "#F8FAF7",
  ink: "#1B2A24",
  inkSoft: "#46564D",
  line: "#C9D4CC",
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
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "var(--font-body), system-ui, sans-serif",
    h1: { fontFamily: display, fontWeight: 700 },
    h2: { fontFamily: display, fontWeight: 700 },
    h3: { fontFamily: display, fontWeight: 700 },
    h4: { fontFamily: display, fontWeight: 700 },
    h5: { fontFamily: display, fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontFamily: display, fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: { defaultProps: { elevation: 0 } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

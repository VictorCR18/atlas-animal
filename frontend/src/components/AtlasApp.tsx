"use client";

import { Box } from "@mui/material";
import { useAtlasStore } from "@/store/atlasStore";
import { AtlasMap } from "./AtlasMap";
import { Footer } from "./Footer";
import { MobileSheet, PanelContent } from "./SidePanel";

export function AtlasApp() {
  const selected = useAtlasStore((state) => state.regionSlug !== null);

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: "fixed",
          top: 8,
          left: 8,
          zIndex: 10,
          p: 1.5,
          bgcolor: "background.paper",
          color: "text.primary",
          borderRadius: 1,
          boxShadow: 3,
          transform: "translateY(-150%)",
          "&:focus": { transform: "translateY(0)" },
        }}
      >
        Pular para os animais
      </Box>
      <Box
        component="main"
        id="main-content"
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 440px" },
          gridTemplateRows: {
            xs: selected ? "minmax(0, 42%) minmax(0, 1fr)" : "minmax(0, 1fr)",
            md: "minmax(0, 1fr)",
          },
        }}
      >
        <AtlasMap />
        <Box
          component="aside"
          aria-label="Animais da região"
          sx={{
            display: { xs: "none", md: "block" },
            minHeight: 0,
            borderLeft: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <PanelContent />
        </Box>
        <MobileSheet open={selected} />
      </Box>
      <Footer />
    </Box>
  );
}

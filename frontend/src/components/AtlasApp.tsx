"use client";

import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useAtlasStore } from "@/store/atlasStore";
import { AtlasMap } from "./AtlasMap";
import { Footer } from "./Footer";
import { MapCard } from "./mobile/MapCard";
import { MobileHeader } from "./mobile/MobileHeader";
import { MobileNav } from "./mobile/MobileNav";
import { AboutPanel, ExplorePanel } from "./mobile/TabPanels";
import { PanelContent } from "./SidePanel";

export function AtlasApp() {
  const theme = useTheme();
  // Phone-only parts are mounted only on phones, so the desktop never fetches or renders them.
  const isPhone = useMediaQuery(theme.breakpoints.down("md"));
  const onMapTab = useAtlasStore((state) => state.mobileTab === "mapa");

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
          display: { xs: "flex", md: "grid" },
          flexDirection: "column",
          gridTemplateColumns: { md: "minmax(0, 1fr) 440px" },
          gridTemplateRows: { md: "minmax(0, 1fr)" },
        }}
      >
        {isPhone && onMapTab && <MobileHeader />}
        <Box sx={{ position: "relative", flex: 1, minHeight: 0, minWidth: 0, display: "flex" }}>
          <AtlasMap overlay={isPhone && onMapTab ? <MapCard /> : null} />
          {isPhone && (
            <>
              <ExplorePanel />
              <AboutPanel />
            </>
          )}
        </Box>
        {!isPhone && (
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
        )}
        <MobileNav />
      </Box>
      <Footer />
    </Box>
  );
}

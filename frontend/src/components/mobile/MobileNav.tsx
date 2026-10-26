"use client";

import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { useAtlasStore, type MobileTab } from "@/store/atlasStore";
import { palette } from "@/theme/theme";

const ACTIONS: { value: MobileTab; label: string; icon: React.ReactNode }[] = [
  { value: "mapa", label: "Mapa", icon: <MapOutlinedIcon /> },
  { value: "explorar", label: "Explorar", icon: <TravelExploreIcon /> },
  { value: "sobre", label: "Sobre", icon: <InfoOutlinedIcon /> },
];

export function MobileNav() {
  const tab = useAtlasStore((state) => state.mobileTab);
  const setMobileTab = useAtlasStore((state) => state.setMobileTab);

  return (
    <BottomNavigation
      component="nav"
      aria-label="Seções do aplicativo"
      showLabels
      value={tab}
      onChange={(_event, value: MobileTab) => setMobileTab(value)}
      sx={{
        display: { xs: "flex", md: "none" },
        flexShrink: 0,
        height: "calc(64px + env(safe-area-inset-bottom))",
        pb: "env(safe-area-inset-bottom)",
        bgcolor: palette.ocean,
        borderTop: 1,
        borderColor: "rgba(255,255,255,0.12)",
        "& .MuiBottomNavigationAction-root": {
          color: palette.onOceanSoft,
          minWidth: 64,
          transition: "color 150ms ease",
          "&:hover": { color: palette.onOcean },
        },
        "& .MuiBottomNavigationAction-root.Mui-selected": { color: palette.ochre },
        "& .MuiBottomNavigationAction-label": { fontSize: 12, fontWeight: 600 },
      }}
    >
      {ACTIONS.map((action) => (
        <BottomNavigationAction key={action.value} value={action.value} label={action.label} icon={action.icon} />
      ))}
    </BottomNavigation>
  );
}

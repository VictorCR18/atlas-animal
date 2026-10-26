"use client";

import { Box, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAnimalDetail } from "@/hooks/useAnimalDetail";
import { displayName } from "@/lib/format";
import { useAtlasStore } from "@/store/atlasStore";
import { palette } from "@/theme/theme";

/** Card over the bottom of the map: the current selection and the way into the list. */
export function MapCard() {
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const selectionName = useAtlasStore((state) => state.selectionName);
  const animalId = useAtlasStore((state) => state.animalId);
  const selectAnimal = useAtlasStore((state) => state.selectAnimal);
  const setMobileTab = useAtlasStore((state) => state.setMobileTab);
  const { data: animal } = useAnimalDetail(animalId, regionSlug);

  const showingAnimal = animalId !== null;
  const label = showingAnimal ? "Registros no mapa" : "Região selecionada";
  const title = showingAnimal ? (animal ? displayName(animal) : "Carregando…") : (selectionName ?? "Bioma");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minHeight: 72,
        p: 1.5,
        pl: 2,
        borderRadius: 2,
        bgcolor: palette.oceanRaised,
        color: palette.onOcean,
        boxShadow: "0 8px 24px rgba(6, 20, 17, 0.45)",
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{ color: palette.onOceanSoft, display: "block" }}>
          {label}
        </Typography>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: "1.0625rem" }}>
          {title}
        </Typography>
      </Box>
      {showingAnimal && (
        <IconButton
          aria-label="Remover animal do mapa"
          onClick={() => selectAnimal(null)}
          sx={{ color: palette.onOcean, width: 44, height: 44, "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <Button
        variant="contained"
        onClick={() => setMobileTab("explorar")}
        sx={{
          minHeight: 44,
          px: 2.5,
          bgcolor: palette.ochre,
          color: palette.ocean,
          transition: "background-color 150ms ease",
          "&:hover": { bgcolor: "#F4D58D" },
        }}
      >
        {showingAnimal ? "Detalhes" : "Explorar"}
      </Button>
    </Box>
  );
}

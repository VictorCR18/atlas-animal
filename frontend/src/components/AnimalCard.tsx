"use client";

import { Box, Card, CardActionArea, Chip, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { animalDetailOptions } from "@/hooks/useAnimalDetail";
import { displayName, formatCount, groupLabel } from "@/lib/format";
import { useAtlasStore } from "@/store/atlasStore";
import type { AnimalSummary } from "@/types/dto";
import { PhotoCredit, PhotoImage } from "./PhotoFigure";

export function AnimalCard({ animal }: { animal: AnimalSummary }) {
  const queryClient = useQueryClient();
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const selectAnimal = useAtlasStore((state) => state.selectAnimal);
  const name = displayName(animal);
  const group = groupLabel(animal.group);

  // Warm the detail cache while the pointer or keyboard focus is on the card.
  const prefetch = () => {
    void queryClient.prefetchQuery(animalDetailOptions(animal.id, regionSlug));
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: "divider",
        transition: "border-color 150ms ease, background-color 150ms ease",
        "&:hover": { borderColor: "primary.main", bgcolor: "#FFFFFF" },
      }}
    >
      <CardActionArea
        onClick={() => selectAnimal(animal.id)}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        aria-label={`Ver detalhes de ${name}`}
        sx={{ display: "flex", gap: 1.5, p: 1.25, alignItems: "center", justifyContent: "flex-start" }}
      >
        <PhotoImage photo={animal.photo} alt={`Foto de ${name}`} variant="thumb" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
            {name}
          </Typography>
          {animal.commonName && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }} noWrap>
              {animal.scientificName}
            </Typography>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            {group && <Chip size="small" label={group} variant="outlined" />}
            <Typography variant="caption" color="text.secondary">
              {formatCount(animal.observationsCount)} registros
            </Typography>
          </Box>
        </Box>
      </CardActionArea>
      {animal.photo && (
        <Box sx={{ px: 1.25, pb: 1 }}>
          <PhotoCredit photo={animal.photo} noWrap />
        </Box>
      )}
    </Card>
  );
}

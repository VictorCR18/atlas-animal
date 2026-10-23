"use client";

import { useEffect, useRef } from "react";
import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { animalDetailOptions } from "@/hooks/useAnimalDetail";
import { displayName, formatCount, groupLabel } from "@/lib/format";
import { useAtlasStore } from "@/store/atlasStore";
import { palette } from "@/theme/theme";
import type { AnimalSummary } from "@/types/dto";
import { PhotoCredit, PhotoImage } from "./PhotoFigure";

const clampTwoLines = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const;

export function AnimalCard({ animal }: { animal: AnimalSummary }) {
  const queryClient = useQueryClient();
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const selectAnimal = useAtlasStore((state) => state.selectAnimal);
  const name = displayName(animal);
  const group = groupLabel(animal.group);
  const hasCommonName = animal.commonName !== null;

  // Warm the detail cache when the pointer rests on the card or it gets keyboard focus.
  // The short delay keeps a quick sweep of the mouse over the list from firing a request per card.
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefetch = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void queryClient.prefetchQuery(animalDetailOptions(animal.id, regionSlug));
    }, 200);
  };
  const cancelPrefetch = () => clearTimeout(timer.current);
  useEffect(() => cancelPrefetch, []);

  return (
    <Card
      sx={{
        bgcolor: palette.tile,
        transition: "background-color 150ms ease",
        "&:hover": { bgcolor: palette.tileHover },
      }}
    >
      <CardActionArea
        onClick={() => selectAnimal(animal.id)}
        onMouseEnter={prefetch}
        onMouseLeave={cancelPrefetch}
        onFocus={prefetch}
        onBlur={cancelPrefetch}
        aria-label={`Ver detalhes de ${name}`}
        sx={{ display: "flex", gap: 1.5, p: 1.25, alignItems: "center", justifyContent: "flex-start" }}
      >
        <PhotoImage photo={animal.photo} alt={`Foto de ${name}`} variant="thumb" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            component="h3"
            translate={hasCommonName ? undefined : "no"}
            sx={{ ...clampTwoLines, fontStyle: hasCommonName ? "normal" : "italic" }}
          >
            {name}
          </Typography>
          {hasCommonName && (
            <Typography variant="body2" color="text.secondary" translate="no" sx={{ fontStyle: "italic" }} noWrap>
              {animal.scientificName}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {group && `${group} · `}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCount(animal.observationsCount)}</span>{" "}
            {animal.observationsCount === 1 ? "registro" : "registros"}
          </Typography>
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

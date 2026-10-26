"use client";

import { useState } from "react";
import { Alert, Box, Button, Chip, Link, Skeleton, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useAnimalDetail } from "@/hooks/useAnimalDetail";
import { CONSERVATION_COLORS, displayName, formatCount, groupLabel } from "@/lib/format";
import { GLOBAL_REGION_SLUG, useAtlasStore } from "@/store/atlasStore";
import { palette } from "@/theme/theme";
import { PhotoCredit, PhotoImage } from "./PhotoFigure";

const SCIENTIFIC_RANKS = new Set(["genus", "species"]);

export function AnimalDetail() {
  const animalId = useAtlasStore((state) => state.animalId);
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const selectionName = useAtlasStore((state) => state.selectionName);
  const selectAnimal = useAtlasStore((state) => state.selectAnimal);
  const setMobileTab = useAtlasStore((state) => state.setMobileTab);
  const { data, isLoading, isError, error, refetch } = useAnimalDetail(animalId, regionSlug);
  const [index, setIndex] = useState(0);

  const photos = data?.photos ?? [];
  const current = photos[index] ?? null;
  const name = data ? displayName(data) : "";
  const hasCommonName = data?.commonName != null;
  const group = data ? groupLabel(data.group) : null;
  const colors = data?.conservation ? CONSERVATION_COLORS[data.conservation.code] : undefined;
  // The store holds the region name in Portuguese; the API only knows the English place name.
  const regionLabel = selectionName ?? data?.regionName ?? null;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 1.5, pt: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => selectAnimal(null)} color="primary" sx={{ minHeight: 44 }}>
          Voltar à lista
        </Button>
        <Button
          startIcon={<MapOutlinedIcon />}
          onClick={() => setMobileTab("mapa")}
          color="primary"
          sx={{ display: { xs: "inline-flex", md: "none" }, minHeight: 44 }}
        >
          Ver no mapa
        </Button>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          p: { xs: 1.5, sm: 2.5 },
          pt: 1.5,
          pb: { xs: "calc(1.5rem + env(safe-area-inset-bottom))", sm: 2.5 },
        }}
      >
        {isLoading && (
          <Stack spacing={2} aria-label="Carregando detalhes…">
            <Skeleton variant="rounded" sx={{ aspectRatio: "4 / 3", width: "100%", height: "auto" }} />
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rounded" height={120} />
          </Stack>
        )}

        {isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            }
          >
            {error.message}
          </Alert>
        )}

        {data && (
          <Stack spacing={3}>
            <Box>
              <PhotoImage key={current?.id ?? "none"} photo={current} alt={`Foto de ${name}`} variant="large" />
              {current && (
                <Box sx={{ mt: 0.75 }}>
                  <PhotoCredit photo={current} />
                </Box>
              )}
              {photos.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1}
                  role="group"
                  aria-label="Galeria de fotos"
                  sx={{ mt: 1.5, overflowX: "auto", pb: 0.5 }}
                >
                  {photos.map((photo, position) => (
                    <Box
                      key={photo.id}
                      component="button"
                      type="button"
                      onClick={() => setIndex(position)}
                      aria-label={`Mostrar foto ${position + 1} de ${photos.length}`}
                      aria-current={position === index}
                      sx={{
                        p: 0,
                        flexShrink: 0,
                        width: 56,
                        height: 56,
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        bgcolor: "transparent",
                        border: "2px solid",
                        borderColor: position === index ? "secondary.main" : "transparent",
                        opacity: position === index ? 1 : 0.75,
                        transition: "opacity 150ms ease, border-color 150ms ease",
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <Box
                        component="img"
                        src={photo.thumbUrl}
                        alt=""
                        width={56}
                        height={56}
                        loading="lazy"
                        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Box>
              <Typography
                variant="h5"
                component="h2"
                translate={hasCommonName ? undefined : "no"}
                sx={{ fontStyle: hasCommonName ? "normal" : "italic" }}
              >
                {name}
              </Typography>
              {hasCommonName && (
                <Typography color="text.secondary" translate="no" sx={{ fontStyle: "italic" }}>
                  {data.scientificName}
                </Typography>
              )}
              <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: "wrap" }}>
                {group && <Chip label={group} sx={{ bgcolor: palette.tile }} />}
                {data.conservation && colors ? (
                  <Chip
                    label={`Conservação: ${data.conservation.label}`}
                    sx={{ bgcolor: colors.bg, color: colors.fg }}
                  />
                ) : (
                  <Chip label="Conservação: sem avaliação" sx={{ bgcolor: palette.tile }} />
                )}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" component="h3" sx={{ mb: 0.5 }}>
                Sobre a espécie
              </Typography>
              {data.summary ? (
                <>
                  <Typography sx={{ maxWidth: "62ch" }}>{data.summary}</Typography>
                  {data.summarySource && (
                    <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.75 }}>
                      Texto:{" "}
                      <Link
                        href={data.summarySource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        color="inherit"
                      >
                        {data.summarySource.name}
                      </Link>
                      , sob licença CC BY-SA.
                    </Typography>
                  )}
                </>
              ) : (
                <Typography color="text.secondary">Ainda não há descrição em português para esta espécie.</Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" component="h3" sx={{ mb: 0.5 }}>
                {regionSlug === GLOBAL_REGION_SLUG ? "Registros no mundo todo" : "Registros na região"}
              </Typography>
              <Typography>
                {data.regionObservationCount === null ? (
                  "Contagem indisponível no momento."
                ) : (
                  <>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCount(data.regionObservationCount)}</span>{" "}
                    {data.regionObservationCount === 1 ? "registro verificado" : "registros verificados"} pela comunidade.
                  </>
                )}
              </Typography>
              {regionLabel && regionSlug !== GLOBAL_REGION_SLUG && (
                <Typography variant="body2" color="text.secondary">
                  Região: {regionLabel}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" component="h3" sx={{ mb: 0.75 }}>
                Classificação científica
              </Typography>
              <Box
                component="dl"
                translate="no"
                sx={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 2, rowGap: 0.5, m: 0 }}
              >
                {data.taxonomy.map((entry) => (
                  <Box key={entry.rank} sx={{ display: "contents" }}>
                    <Typography component="dt" variant="body2" color="text.secondary">
                      {entry.rankLabel}
                    </Typography>
                    <Typography
                      component="dd"
                      variant="body2"
                      sx={{ m: 0, fontStyle: SCIENTIFIC_RANKS.has(entry.rank) ? "italic" : "normal" }}
                    >
                      {entry.name}
                      {entry.commonName ? ` (${entry.commonName})` : ""}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Button
              variant="contained"
              href={data.inaturalistUrl}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Ver espécie no iNaturalist
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
}

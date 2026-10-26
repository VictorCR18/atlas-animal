"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, useMapContext } from "react-simple-maps";
import { motion } from "motion/react";
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PublicIcon from "@mui/icons-material/Public";
import RemoveIcon from "@mui/icons-material/Remove";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import worldData from "world-atlas/countries-50m.json";
import { useRegions } from "@/hooks/useRegions";
import { useAnimalDistribution } from "@/hooks/useAnimalDistribution";
import { useAtlasStore } from "@/store/atlasStore";
import { palette } from "@/theme/theme";
import type { Region } from "@/types/dto";
import { countryDisplayName, countrySlug } from "@/lib/countryNames";
import { COUNTRY_OPTIONS } from "@/lib/countries";

type Coordinates = [number, number];

interface View {
  center: Coordinates;
  zoom: number;
  rev: number;
}

const EMPTY_REGIONS: Region[] = [];
// react-simple-maps parses TopoJSON at runtime; its typings only list GeoJSON.
const WORLD_GEOGRAPHY = worldData as unknown as ComponentProps<typeof Geographies>["geography"];
const WORLD_VIEW: View = { center: [-54, -14], zoom: 2.4, rev: 0 };
const clampZoom = (value: number): number => Math.min(14, Math.max(1, value));

function viewForRegion(region: Region, rev: number): View {
  const { swlat, swlng, nelat, nelng } = region.bounds;
  const lngSpan = Math.max(nelng - swlng, 1);
  const latSpan = Math.max(nelat - swlat, 1);
  const zoom = clampZoom(Math.min(360 / lngSpan, 170 / latSpan) * 0.7);
  return { center: [(swlng + nelng) / 2, (swlat + nelat) / 2], zoom, rev };
}

interface FramesProps {
  regions: Region[];
  selectedSlug: string | null;
  zoom: number;
  onSelect: (slug: string) => void;
}

/** Approximate biome areas are shown as soft regions in the accent color rather than rectangular boundaries. */
function RegionFrames({ regions, selectedSlug, zoom, onSelect }: FramesProps) {
  const { projection } = useMapContext();
  const [active, setActive] = useState<string | null>(null);

  const frames = useMemo(
    () =>
      regions
        .flatMap((region) => {
          const center = projection([
            (region.bounds.swlng + region.bounds.nelng) / 2,
            (region.bounds.swlat + region.bounds.nelat) / 2,
          ]);
          const east = projection([region.bounds.nelng, (region.bounds.swlat + region.bounds.nelat) / 2]);
          const north = projection([(region.bounds.swlng + region.bounds.nelng) / 2, region.bounds.nelat]);
          const south = projection([(region.bounds.swlng + region.bounds.nelng) / 2, region.bounds.swlat]);
          if (!center || !east || !north || !south) return [];
          return [
            {
              region,
              cx: center[0],
              cy: center[1],
              rx: Math.abs(east[0] - center[0]),
              ry: Math.abs(north[1] - south[1]) / 2,
            },
          ];
        })
        // Largest first so smaller frames sit on top and stay clickable.
        .sort((a, b) => b.rx * b.ry - a.rx * a.ry),
    [regions, projection],
  );

  return (
    <g>
      {frames.map(({ region, cx, cy, rx, ry }) => {
        const selected = region.slug === selectedSlug;
        const highlighted = active === region.slug;
        const fill = palette.ochre;
        return (
          <g
            key={region.id}
            role="button"
            tabIndex={0}
            aria-label={`Selecionar região ${region.name}`}
            aria-pressed={selected}
            style={{ cursor: "pointer", outline: "none" /* focus is shown by the highlighted outline below */ }}
            onClick={() => onSelect(region.slug)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(region.slug);
              }
            }}
            onMouseEnter={() => setActive(region.slug)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(region.slug)}
            onBlur={() => setActive(null)}
          >
            <motion.ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              initial={false}
              animate={{
                fillOpacity: selected ? 0.34 : highlighted ? 0.22 : 0.1,
                strokeWidth: selected || highlighted ? 2.5 : 1.5,
              }}
              transition={{ duration: 0.25 }}
              fill={fill}
              stroke={fill}
              strokeDasharray={selected ? undefined : "6 4"}
              vectorEffect="non-scaling-stroke"
            />
            {(selected || highlighted) && (
              <text
                x={cx - rx + 4 / zoom}
                y={cy}
                fontSize={12 / zoom}
                fontWeight={700}
                fill={palette.onOcean}
                stroke={palette.ocean}
                strokeWidth={3 / zoom}
                paintOrder="stroke"
                style={{ pointerEvents: "none" }}
              >
                {region.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function AnimalDistribution({ points, zoom }: { points: [number, number][]; zoom: number }) {
  const { projection } = useMapContext();

  return (
    <g aria-label="Locais onde o animal foi registrado" pointerEvents="none">
      {points.map((point, index) => {
        const position = projection(point);
        if (!position) return null;
        return (
          <circle
            key={`${point[0]}-${point[1]}-${index}`}
            cx={position[0]}
            cy={position[1]}
            r={5 / zoom}
            fill={palette.ochre}
            fillOpacity={0.7}
            stroke={palette.ocean}
            strokeWidth={0.75 / zoom}
          />
        );
      })}
    </g>
  );
}

export function AtlasMap({ overlay = null }: { overlay?: ReactNode }) {
  const { data, isLoading, isError, error } = useRegions();
  const regions = data ?? EMPTY_REGIONS;
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const animalId = useAtlasStore((state) => state.animalId);
  const selectRegion = useAtlasStore((state) => state.selectRegion);
  const selectCountry = useAtlasStore((state) => state.selectCountry);
  const selectionName = useAtlasStore((state) => state.selectionName);
  const mapMode = useAtlasStore((state) => state.mapMode);
  const setMapMode = useAtlasStore((state) => state.setMapMode);
  const mapExpanded = useAtlasStore((state) => state.mapExpanded);
  const toggleMapExpanded = useAtlasStore((state) => state.toggleMapExpanded);
  const { data: distribution = [] } = useAnimalDistribution(animalId);

  const [view, setView] = useState<View>(WORLD_VIEW);
  const [zoom, setZoom] = useState(WORLD_VIEW.zoom);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const centerRef = useRef<Coordinates>(WORLD_VIEW.center);
  const hoveredLabel = hoveredCountry ? COUNTRY_OPTIONS.find((country) => countrySlug(country.name) === hoveredCountry)?.displayName : null;
  const selectedCountry =
    mapMode === "countries"
      ? COUNTRY_OPTIONS.find((country) => countrySlug(country.name) === regionSlug) ?? null
      : null;

  const applyView = (next: View) => {
    centerRef.current = next.center;
    setZoom(next.zoom);
    setView(next);
  };

  useEffect(() => {
    const region = regions.find((item) => item.slug === regionSlug);
    if (region) applyView(viewForRegion(region, view.rev + 1));
  }, [regionSlug, regions]);

  const step = (factor: number) =>
    applyView({ center: centerRef.current, zoom: clampZoom(zoom * factor), rev: view.rev + 1 });

  return (
    <Box
      sx={{
        position: "relative",
        flex: 1,
        bgcolor: palette.ocean,
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        "& path": { vectorEffect: "non-scaling-stroke" },
        "& :focus-visible": { outlineColor: palette.ochre },
      }}
    >
    <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 150 }}
        width={800}
        height={500}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
        aria-label="Mapa-múndi interativo: escolha um país para ver os animais registrados nele"
      onClick={(event) => {
          const clickedElement = event.target instanceof Element ? event.target : null;
          const clickedCountry = clickedElement?.closest("[data-country-map-region]");
          if (mapMode === "countries" && !clickedCountry && regionSlug?.startsWith("country-")) {
            selectRegion(null);
          }
        }}
    >
        <ZoomableGroup
          key={view.rev}
          center={view.center}
          zoom={view.zoom}
          minZoom={1}
          maxZoom={14}
          onMoveEnd={({ coordinates, zoom: nextZoom }) => {
            if (coordinates) centerRef.current = coordinates;
            if (nextZoom !== undefined) setZoom(nextZoom);
          }}
        >
          <Geographies geography={WORLD_GEOGRAPHY}>
            {({ geographies }) =>
              geographies.map((geo) => (
                (() => {
                  const name = String(geo.properties?.name ?? "");
                  const displayName = countryDisplayName(name);
                  const slug = countrySlug(name);
                  const selected = regionSlug === slug;
                  const highlighted = mapMode === "countries" && hoveredCountry === slug;
                  return (
                    <g
                      key={geo.rsmKey}
                      data-country-map-region
                      role="button"
                      tabIndex={mapMode === "countries" ? 0 : -1}
                      aria-label={displayName ? `Selecionar ${displayName}` : undefined}
                      aria-pressed={selected}
                      style={{ cursor: mapMode === "countries" ? "pointer" : "default" }}
                      onMouseEnter={() => mapMode === "countries" && setHoveredCountry(slug)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => mapMode === "countries" && name && selectCountry(name)}
                      onKeyDown={(event) => {
                        if (mapMode === "countries" && name && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          selectCountry(name);
                        }
                      }}
                    >
                      <Geography
                        geography={geo}
                        fill={selected || highlighted ? palette.ochre : palette.land}
                        stroke={highlighted || selected ? "#F4D58D" : palette.ocean}
                        strokeWidth={highlighted || selected ? 1.3 : 0.6}
                        style={{ outline: "none" }}
                        aria-hidden
                      />
                    </g>
                  );
                })()
              ))
            }
          </Geographies>
          {animalId !== null && distribution.length > 0 && <AnimalDistribution points={distribution} zoom={zoom} />}
          {mapMode === "biomes" && (
            <RegionFrames regions={regions} selectedSlug={regionSlug} zoom={zoom} onSelect={selectRegion} />
          )}
        </ZoomableGroup>
      </ComposableMap>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute",
          top: 16,
          left: 16,
          width: 380,
          p: 2,
          bgcolor: palette.oceanRaised,
          color: palette.onOcean,
          borderRadius: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h1" translate="no" sx={{ fontSize: "1.7rem", lineHeight: 1.1 }}>
            Atlas Animal
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 0.5, color: palette.onOceanSoft }}>
          Explore a fauna do mundo, país por país.
        </Typography>

        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={mapMode}
          onChange={(_event, value: "biomes" | "countries" | null) => {
            if (value) setMapMode(value);
          }}
          aria-label="Modo de visualização do mapa"
          sx={{
            mt: 1.5,
            "& .MuiToggleButton-root": {
              minHeight: 44,
              color: palette.onOcean,
              borderColor: "rgba(255,255,255,0.22)",
              transition: "background-color 150ms ease",
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
            },
            "& .Mui-selected": {
              bgcolor: `${palette.ochre} !important`,
              color: `${palette.ocean} !important`,
              fontWeight: 700,
            },
          }}
        >
          <ToggleButton value="countries">Países</ToggleButton>
          <ToggleButton value="biomes">Biomas</ToggleButton>
        </ToggleButtonGroup>

        {mapMode === "biomes" && (
          <Stack
            direction="row"
            spacing={1}
            role="group"
            aria-label="Biomas disponíveis"
            sx={{
              mt: 1.25,
              overflowX: "auto",
              pb: 0.5,
            }}
          >
            {isLoading &&
              Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} variant="rounded" width={96} height={32} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
              ))}
            {regions.map((region) => {
              const selected = region.slug === regionSlug;
              return (
                <Chip
                  key={region.id}
                  label={region.name}
                  clickable
                  aria-pressed={selected}
                  onClick={() => selectRegion(region.slug)}
                  sx={{
                    flexShrink: 0,
                    minHeight: 44,
                    bgcolor: selected ? palette.ochre : "rgba(255,255,255,0.1)",
                    color: selected ? palette.ocean : palette.onOcean,
                    transition: "background-color 150ms ease",
                    "&:hover": { bgcolor: selected ? palette.ochre : "rgba(255,255,255,0.2)" },
                  }}
                />
              );
            })}
          </Stack>
        )}

        {mapMode === "countries" && (
          <Autocomplete
            options={COUNTRY_OPTIONS}
            value={selectedCountry}
            onChange={(_event, country) => {
              if (country) {
                selectCountry(country.name);
              } else {
                selectRegion(null);
              }
            }}
            getOptionLabel={(country) => country.displayName}
            isOptionEqualToValue={(option, value) => option.name === value.name}
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.08)", color: palette.onOcean },
              "& .MuiInputLabel-root": { color: palette.onOceanSoft },
              "& .MuiInputLabel-root.Mui-focused": { color: palette.ochre },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.22)" },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.45)" },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: palette.ochre },
              "& .MuiSvgIcon-root": { color: palette.onOcean },
            }}
            noOptionsText="País não encontrado"
            clearText="Limpar"
            openText="Abrir"
            closeText="Fechar"
            renderInput={(params) => (
              <TextField {...params} label="Pesquisar país" placeholder="Digite o nome do país…" size="small" />
            )}
          />
        )}

        {isError && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {error.message}
          </Alert>
        )}
      </Box>

      {hoveredLabel && (
        <Typography
          aria-hidden
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            left: 16,
            bottom: 16,
            px: 1.5,
            py: 0.75,
            bgcolor: palette.oceanRaised,
            color: palette.onOcean,
            borderRadius: 1,
            fontWeight: 600,
            pointerEvents: "none",
          }}
        >
          {hoveredLabel}
        </Typography>
      )}

      <Stack
        spacing={0.5}
        sx={{ position: "absolute", right: { xs: 8, md: 12 }, bottom: { xs: overlay ? 96 : 8, md: 12 }, bgcolor: palette.oceanRaised, borderRadius: 1.5, p: 0.5 }}
      >
        {[
          { label: "Aproximar o mapa", icon: <AddIcon />, onClick: () => step(1.6), phoneOnly: false },
          { label: "Afastar o mapa", icon: <RemoveIcon />, onClick: () => step(1 / 1.6), phoneOnly: false },
          {
            label: "Restaurar a visão inicial do mapa",
            icon: <PublicIcon />,
            onClick: () => {
              applyView({ ...WORLD_VIEW, rev: view.rev + 1 });
              selectRegion(null);
            },
            phoneOnly: false,
          },
          {
            label: mapExpanded ? "Mostrar o cabeçalho" : "Expandir o mapa",
            icon: mapExpanded ? <FullscreenExitIcon /> : <FullscreenIcon />,
            onClick: toggleMapExpanded,
            phoneOnly: true,
          },
        ].map((control) => (
          <Tooltip key={control.label} title={control.label} placement="left">
            <IconButton
              aria-label={control.label}
              onClick={control.onClick}
              sx={{
                display: control.phoneOnly ? { xs: "inline-flex", md: "none" } : undefined,
                color: palette.onOcean,
                "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
              }}
            >
              {control.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>

      {overlay && (
        <Box sx={{ position: "absolute", left: 8, right: 8, bottom: 8, zIndex: 1, pointerEvents: "none", "& > *": { pointerEvents: "auto" } }}>
          {overlay}
        </Box>
      )}

      <Box
        role="status"
        aria-live="polite"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {selectionName ? `Região selecionada: ${selectionName}` : ""}
      </Box>
    </Box>
  );
}

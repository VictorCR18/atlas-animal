"use client";

import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
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
import worldData from "world-atlas/countries-110m.json";
import { useRegions } from "@/hooks/useRegions";
import { useAnimalDistribution } from "@/hooks/useAnimalDistribution";
import { useAtlasStore } from "@/store/atlasStore";
import { palette } from "@/theme/theme";
import type { Region } from "@/types/dto";
import { countryDisplayName } from "@/lib/countryNames";

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

function countrySlug(name: string): string {
  return `country-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}`;
}

interface CountryOption {
  name: string;
  displayName: string;
}

const COUNTRY_OPTIONS: CountryOption[] = (
  worldData.objects.countries.geometries as Array<{ properties?: { name?: string } }>
)
  .map((geometry) => geometry.properties?.name ?? "")
  .filter(Boolean)
  .map((name) => ({ name, displayName: countryDisplayName(name) }))
  .sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));

interface FramesProps {
  regions: Region[];
  selectedSlug: string | null;
  zoom: number;
  onSelect: (slug: string) => void;
}

const BIOME_COLORS = ["#D19A35", "#5E9B68", "#B86F52", "#8C79B8", "#4F9AA8", "#C36A86", "#7C9A4B", "#A77B54"];

/** Approximate biome areas are shown as soft colored regions rather than rectangular boundaries. */
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
      {frames.map(({ region, cx, cy, rx, ry }, index) => {
        const selected = region.slug === selectedSlug;
        const highlighted = active === region.slug;
        const fill = BIOME_COLORS[index % BIOME_COLORS.length];
        return (
          <g
            key={region.id}
            role="button"
            tabIndex={0}
            aria-label={`Selecionar região ${region.name}`}
            aria-pressed={selected}
            style={{ cursor: "pointer", outline: "none" }}
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
                fillOpacity: selected ? 0.3 : highlighted ? 0.18 : 0.07,
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
                fill="#FDF3DC"
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

function AnimalDistribution({ points }: { points: [number, number][] }) {
  const { projection } = useMapContext();

  return (
    <g aria-label="Área aproximada de ocorrência do animal" pointerEvents="none">
      {points.map((point, index) => {
        const position = projection(point);
        if (!position) return null;
        return (
          <ellipse
            key={`${point[0]}-${point[1]}-${index}`}
            cx={position[0]}
            cy={position[1]}
            rx={22}
            ry={15}
            fill="url(#animal-distribution-gradient)"
            transform={`rotate(${index * 23 - 25} ${position[0]} ${position[1]})`}
          />
        );
      })}
    </g>
  );
}

export function AtlasMap() {
  const { data, isLoading, isError, error } = useRegions();
  const regions = data ?? EMPTY_REGIONS;
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const animalId = useAtlasStore((state) => state.animalId);
  const selectRegion = useAtlasStore((state) => state.selectRegion);
  const selectCountry = useAtlasStore((state) => state.selectCountry);
  const { data: distribution = [] } = useAnimalDistribution(animalId);

  const [view, setView] = useState<View>(WORLD_VIEW);
  const [zoom, setZoom] = useState(WORLD_VIEW.zoom);
  const [mapMode, setMapMode] = useState<"biomes" | "countries">("countries");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const centerRef = useRef<Coordinates>(WORLD_VIEW.center);
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
    // Only react to selection changes and the region list, not to our own view updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionSlug, regions]);

  const step = (factor: number) =>
    applyView({ center: centerRef.current, zoom: clampZoom(zoom * factor), rev: view.rev + 1 });

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: palette.ocean,
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
        "& path": { "vector-effect": "non-scaling-stroke" },
      }}
    >
    <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 150 }}
        width={800}
        height={500}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
        aria-label="Mapa-múndi interativo com as regiões disponíveis"
      onClick={(event) => {
          const clickedElement = event.target instanceof Element ? event.target : null;
          const clickedCountry = clickedElement?.closest("[data-country-map-region]");
          if (mapMode === "countries" && !clickedCountry && regionSlug?.startsWith("country-")) {
            selectRegion(null);
          }
        }}
    >
        <defs>
          <radialGradient id="animal-distribution-gradient">
            <stop offset="0%" stopColor="#F4C95D" stopOpacity="0.75" />
            <stop offset="65%" stopColor="#E47B4F" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#E47B4F" stopOpacity="0" />
          </radialGradient>
        </defs>
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
                      style={{ cursor: mapMode === "countries" ? "pointer" : "default" }}
                      onMouseEnter={() => mapMode === "countries" && setHoveredCountry(slug)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      onClick={() => mapMode === "countries" && name && selectCountry(name)}
                    >
                      <Geography
                        geography={geo}
                        fill={selected || highlighted ? palette.ochre : palette.land}
                        stroke={highlighted || selected ? "#F4D58D" : palette.ocean}
                        strokeWidth={highlighted || selected ? 1.3 : 0.6}
                        style={{ outline: "none" }}
                        aria-label={displayName ? `Selecionar ${displayName}` : undefined}
                      />
                    </g>
                  );
                })()
              ))
            }
          </Geographies>
          {animalId !== null && distribution.length > 0 && <AnimalDistribution points={distribution} />}
          {mapMode === "biomes" && (
            <RegionFrames regions={regions} selectedSlug={regionSlug} zoom={zoom} onSelect={selectRegion} />
          )}
        </ZoomableGroup>
      </ComposableMap>

      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, p: 2, pointerEvents: "none" }}>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.4rem", md: "1.75rem" }, color: "#EAF1EB" }}>
          Atlas Animal
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          role="group"
          aria-label="Regiões disponíveis"
          sx={{ mt: 1.25, overflowX: "auto", pb: 0.5, pointerEvents: "auto" }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={mapMode}
            onChange={(_event, value: "biomes" | "countries" | null) => {
              if (!value) return;
              if (value === "biomes" && mapMode === "countries" && regionSlug?.startsWith("country-")) {
                selectRegion(null);
              }
              setMapMode(value);
            }}
            aria-label="Modo de visualização do mapa"
            sx={{
              flexShrink: 0,
              "& .MuiToggleButton-root": { color: "#EAF1EB", borderColor: "rgba(255,255,255,0.28)" },
              "& .Mui-selected": { bgcolor: `${palette.ochre} !important`, color: `${palette.ocean} !important` },
            }}
          >
            <ToggleButton value="biomes">Biomas</ToggleButton>
            <ToggleButton value="countries">Países</ToggleButton>
          </ToggleButtonGroup>
          {isLoading &&
            Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} variant="rounded" width={96} height={32} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
            ))}
          {mapMode === "biomes" && regions.map((region) => {
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
                  bgcolor: selected ? palette.ochre : "rgba(255,255,255,0.1)",
                  color: selected ? palette.ocean : "#EAF1EB",
                  border: "1px solid",
                  borderColor: selected ? palette.ochre : "rgba(255,255,255,0.28)",
                  "&:hover": { bgcolor: selected ? palette.ochre : "rgba(255,255,255,0.2)" },
                }}
              />
            );
          })}
        </Stack>
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
              width: { xs: "min(100%, 360px)", sm: 360 },
              pointerEvents: "auto",
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(15,42,37,0.9)",
                color: "#EAF1EB",
              },
              "& .MuiInputLabel-root": { color: "rgba(234,241,235,0.8)" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.35)" },
              "& .MuiSvgIcon-root": { color: "#EAF1EB" },
            }}
            noOptionsText="País não encontrado"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Pesquisar país"
                placeholder="Digite o nome do país"
                size="small"
              />
            )}
          />
        )}
        {isError && (
          <Alert severity="error" sx={{ mt: 1.5, pointerEvents: "auto", maxWidth: 420 }}>
            {error.message}
          </Alert>
        )}
      </Box>

      <Stack
        spacing={0.5}
        sx={{ position: "absolute", right: 12, bottom: 12, bgcolor: "rgba(15,42,37,0.85)", borderRadius: 2 }}
      >
        {[
          { label: "Aproximar o mapa", icon: <AddIcon />, onClick: () => step(1.6) },
          { label: "Afastar o mapa", icon: <RemoveIcon />, onClick: () => step(1 / 1.6) },
          {
            label: "Restaurar a visão inicial do mapa",
            icon: <PublicIcon />,
            onClick: () => {
              applyView({ ...WORLD_VIEW, rev: view.rev + 1 });
              selectRegion(null);
            },
          },
        ].map((control) => (
          <Tooltip key={control.label} title={control.label} placement="left">
            <IconButton aria-label={control.label} onClick={control.onClick} sx={{ color: "#EAF1EB" }}>
              {control.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
}

"use client";

import { useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { COUNTRY_OPTIONS } from "@/lib/countries";
import { countrySlug } from "@/lib/countryNames";
import { useRegions } from "@/hooks/useRegions";
import { useAtlasStore } from "@/store/atlasStore";
import { palette } from "@/theme/theme";

export function MobileHeader() {
  const mapMode = useAtlasStore((state) => state.mapMode);
  const setMapMode = useAtlasStore((state) => state.setMapMode);
  const mapExpanded = useAtlasStore((state) => state.mapExpanded);
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const selectionName = useAtlasStore((state) => state.selectionName);
  const selectRegion = useAtlasStore((state) => state.selectRegion);
  const selectCountry = useAtlasStore((state) => state.selectCountry);
  const regions = useRegions().data ?? [];
  const region = regions.find((item) => item.slug === regionSlug);
  const [notice, setNotice] = useState("");

  const selectedCountry =
    mapMode === "countries" ? COUNTRY_OPTIONS.find((country) => countrySlug(country.name) === regionSlug) ?? null : null;

  return (
    <Box
      component="header"
      sx={{
        display: { xs: "block", md: "none" },
        flexShrink: 0,
        bgcolor: palette.ocean,
        color: palette.onOcean,
        px: 2,
        pt: "calc(24px + env(safe-area-inset-top))",
        pb: 1,
        borderBottom: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >

      {!mapExpanded && (
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={mapMode}
            onChange={(_event, value: "countries" | "biomes" | null) => {
              if (value) setMapMode(value);
            }}
            aria-label="Camada do mapa"
            sx={{
              "& .MuiToggleButton-root": {
                minHeight: 44,
                color: palette.onOcean,
                borderColor: "rgba(255,255,255,0.22)",
                transition: "background-color 150ms ease",
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
              },
              "& .Mui-selected": { bgcolor: `${palette.ochre} !important`, color: `${palette.ocean} !important`, fontWeight: 700 },
            }}
          >
            <ToggleButton value="countries">Países</ToggleButton>
            <ToggleButton value="biomes">Biomas</ToggleButton>
          </ToggleButtonGroup>

          {mapMode === "countries" ? (
            <Autocomplete
              options={COUNTRY_OPTIONS}
              value={selectedCountry}
              onChange={(_event, country) => (country ? selectCountry(country.name) : selectRegion(null))}
              getOptionLabel={(country) => country.displayName}
              isOptionEqualToValue={(option, value) => option.name === value.name}
              noOptionsText="País não encontrado"
              clearText="Limpar"
              openText="Abrir"
              closeText="Fechar"
              sx={{
                "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.08)", color: palette.onOcean, minHeight: 44 },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.22)" },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: palette.ochre },
                "& .MuiSvgIcon-root": { color: palette.onOcean },
                // 16px keeps iOS Safari from zooming the page when the field gets focus.
                "& input": { fontSize: 16 },
                "& input::placeholder": { color: palette.onOceanSoft, opacity: 1 },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Buscar país…"
                  slotProps={{
                    ...params.slotProps,
                    htmlInput: { ...params.slotProps.htmlInput, "aria-label": "Buscar país", name: "pais", spellCheck: false },
                  }}
                />
              )}
            />
          ) : (
            <Stack direction="row" spacing={1} role="group" aria-label="Biomas disponíveis" sx={{ overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
              {regions.map((item) => {
                const selected = item.slug === regionSlug;
                return (
                  <Chip
                    key={item.id}
                    label={item.name}
                    clickable
                    aria-pressed={selected}
                    onClick={() => selectRegion(item.slug)}
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
        </Stack>
      )}

      <Snackbar open={notice !== ""} autoHideDuration={3000} onClose={() => setNotice("")} message={notice} />
    </Box>
  );
}

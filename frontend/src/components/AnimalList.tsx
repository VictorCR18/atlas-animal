"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAnimals } from "@/hooks/useAnimals";
import { useDebounce } from "@/hooks/useDebounce";
import { useRegions } from "@/hooks/useRegions";
import { formatCount, GROUP_LABELS } from "@/lib/format";
import { ApiError } from "@/services/api";
import { GLOBAL_REGION_SLUG, useAtlasStore } from "@/store/atlasStore";
import { palette } from "@/theme/theme";
import { TAXON_GROUPS, type AnimalSummary } from "@/types/dto";
import { AnimalCard } from "./AnimalCard";

const chipSx = (active: boolean) => ({
  flexShrink: 0,
  minHeight: 44,
  bgcolor: active ? "primary.main" : palette.tile,
  color: active ? "primary.contrastText" : "text.primary",
  transition: "background-color 150ms ease",
  "&:hover": { bgcolor: active ? "primary.dark" : palette.tileHover },
});

export function AnimalList() {
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const selectionName = useAtlasStore((state) => state.selectionName);
  const taxonGroup = useAtlasStore((state) => state.taxonGroup);
  const search = useAtlasStore((state) => state.search);
  const setTaxonGroup = useAtlasStore((state) => state.setTaxonGroup);
  const setSearch = useAtlasStore((state) => state.setSearch);

  const region = useRegions().data?.find((item) => item.slug === regionSlug);

  const description =
    region?.description ??
    (regionSlug === GLOBAL_REGION_SLUG
      ? "Os animais mais registrados em todo o planeta."
      : "Espécies registradas pela comunidade do iNaturalist nesta região.");

  const [input, setInput] = useState(search);
  const debounced = useDebounce(input, 350);
  useEffect(() => {
    const trimmed = debounced.trim();
    setSearch(trimmed.length >= 2 ? trimmed : "");
  }, [debounced, setSearch]);

  const query = useAnimals(regionSlug, taxonGroup, search);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const errorMessage =
    query.error instanceof ApiError
      ? query.error.message
      : "Não foi possível carregar os animais. Tente novamente.";

  const items = useMemo(() => {
    const unique = new Map<number, AnimalSummary>();
    query.data?.pages.forEach((page) => page.items.forEach((item) => unique.set(item.id, item)));
    return [...unique.values()];
  }, [query.data]);
  const total = query.data?.pages[0]?.pagination.total ?? 0;

  const sentinel = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: "240px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: { xs: 1.25, sm: 2.5 }, pb: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: { xs: "1.25rem", sm: undefined } }}>
          {selectionName ?? region?.name ?? "Região"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 0.25, sm: 0.5 }, maxWidth: "52ch" }}>
          {description}
        </Typography>

        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          type="search"
          placeholder="Nome popular ou científico…"
          sx={{ mt: { xs: 1.25, sm: 2 } }}
          slotProps={{
            htmlInput: { "aria-label": "Buscar animais nesta região", name: "busca", autoComplete: "off", spellCheck: false },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Stack
          direction="row"
          spacing={1}
          role="group"
          aria-label="Filtrar por grupo de animais"
          sx={{ mt: { xs: 1, sm: 1.5 }, overflowX: "auto", pb: 0.5, scrollbarWidth: "thin" }}
        >
          <Chip
            label="Todos"
            clickable
            sx={chipSx(taxonGroup === null)}
            aria-pressed={taxonGroup === null}
            onClick={() => setTaxonGroup(null)}
          />
          {TAXON_GROUPS.map((group) => (
            <Chip
              key={group}
              label={GROUP_LABELS[group]}
              clickable
              sx={chipSx(taxonGroup === group)}
              aria-pressed={taxonGroup === group}
              onClick={() => setTaxonGroup(group)}
            />
          ))}
        </Stack>
      </Box>

      {query.isFetching && !query.isLoading && <LinearProgress aria-label="Atualizando a lista" />}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          px: { xs: 1.25, sm: 2.5 },
          pb: { xs: "calc(1.5rem + env(safe-area-inset-bottom))", sm: 2.5 },
        }}
        aria-live="polite"
      >
        {query.isLoading && (
          <Stack spacing={1.5} aria-label="Carregando animais…">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={104} />
            ))}
          </Stack>
        )}

        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void query.refetch()}>
                Tentar novamente
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        )}

        {query.isSuccess && items.length === 0 && (
          <Box sx={{ py: 3 }}>
            <Typography color="text.secondary">Nenhum animal encontrado com esses filtros.</Typography>
            <Button
              onClick={() => {
                setInput("");
                setTaxonGroup(null);
              }}
              sx={{ mt: 1 }}
            >
              Limpar busca e filtros
            </Button>
          </Box>
        )}

        {items.length > 0 && (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              role="status"
              aria-live="polite"
              sx={{ mb: 1.5 }}
            >
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCount(total)}</span>{" "}
              {total === 1 ? "espécie registrada" : "espécies registradas"}
            </Typography>
            <Stack spacing={{ xs: 1.25, sm: 1.5 }} component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {items.map((animal) => (
                <li key={animal.id} style={{ contentVisibility: "auto", containIntrinsicSize: "auto 132px" }}>
                  <AnimalCard animal={animal} />
                </li>
              ))}
            </Stack>
            <Box ref={sentinel} sx={{ height: 1 }} />
            {hasNextPage && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Carregando…" : "Carregar mais espécies"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

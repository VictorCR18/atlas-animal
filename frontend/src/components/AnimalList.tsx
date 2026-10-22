"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useAnimals } from "@/hooks/useAnimals";
import { useDebounce } from "@/hooks/useDebounce";
import { useRegions } from "@/hooks/useRegions";
import { formatCount, GROUP_LABELS } from "@/lib/format";
import { ApiError } from "@/services/api";
import { useAtlasStore } from "@/store/atlasStore";
import { TAXON_GROUPS, type AnimalSummary } from "@/types/dto";
import { AnimalCard } from "./AnimalCard";

export function AnimalList() {
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const selectionName = useAtlasStore((state) => state.selectionName);
  const taxonGroup = useAtlasStore((state) => state.taxonGroup);
  const search = useAtlasStore((state) => state.search);
  const setTaxonGroup = useAtlasStore((state) => state.setTaxonGroup);
  const setSearch = useAtlasStore((state) => state.setSearch);
  const selectRegion = useAtlasStore((state) => state.selectRegion);

  const region = useRegions().data?.find((item) => item.slug === regionSlug);

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
      <Box sx={{ p: 2.5, pb: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h5" component="h2">
              {selectionName ?? region?.name ?? "Região"}
            </Typography>
            {region && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 52 + "ch" }}>
                {region.description}
              </Typography>
            )}
          </Box>
        </Stack>

        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Buscar por nome popular ou científico"
          sx={{ mt: 2 }}
          slotProps={{
            htmlInput: { "aria-label": "Buscar animais nesta região" },
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
          sx={{ mt: 1.5, overflowX: "auto", pb: 0.5 }}
        >
          <Chip
            label="Todos"
            clickable
            color={taxonGroup === null ? "primary" : "default"}
            variant={taxonGroup === null ? "filled" : "outlined"}
            aria-pressed={taxonGroup === null}
            onClick={() => setTaxonGroup(null)}
          />
          {TAXON_GROUPS.map((group) => (
            <Chip
              key={group}
              label={GROUP_LABELS[group]}
              clickable
              color={taxonGroup === group ? "primary" : "default"}
              variant={taxonGroup === group ? "filled" : "outlined"}
              aria-pressed={taxonGroup === group}
              onClick={() => setTaxonGroup(group)}
            />
          ))}
        </Stack>
      </Box>

      {query.isFetching && !query.isLoading && <LinearProgress aria-label="Atualizando a lista" />}

      <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, pb: 2.5 }} aria-live="polite">
        {query.isLoading && (
          <Stack spacing={1.5} aria-label="Carregando animais">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={96} />
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
          <Typography color="text.secondary" sx={{ py: 3 }}>
            Nenhum animal encontrado com esses filtros. Remova o grupo ou altere a busca.
          </Typography>
        )}

        {items.length > 0 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {formatCount(total)} {total === 1 ? "espécie registrada" : "espécies registradas"}
            </Typography>
            <Stack spacing={1.5} component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {items.map((animal) => (
                <li key={animal.id}>
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
                  {isFetchingNextPage ? "Carregando..." : "Carregar mais espécies"}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

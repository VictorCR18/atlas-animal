import { create } from "zustand";
import type { TaxonGroup } from "@/types/dto";
import { countryDisplayName, countrySlug } from "@/lib/countryNames";

export const GLOBAL_REGION_SLUG = "global";
export const WORLD_LABEL = "Mundo todo";

export type MobileTab = "mapa" | "explorar" | "sobre";
export type MapMode = "countries" | "biomes";

interface AtlasState {
  mapMode: MapMode;
  mobileTab: MobileTab;
  /** Phone only: hides the header so the map gets the whole screen. */
  mapExpanded: boolean;
  regionSlug: string | null;
  selectionName: string | null;
  animalId: number | null;
  taxonGroup: TaxonGroup | null;
  search: string;
  setMapMode: (mode: MapMode) => void;
  setMobileTab: (tab: MobileTab) => void;
  toggleMapExpanded: () => void;
  selectRegion: (slug: string | null) => void;
  selectCountry: (name: string | null) => void;
  selectAnimal: (id: number | null) => void;
  setTaxonGroup: (group: TaxonGroup | null) => void;
  setSearch: (value: string) => void;
}

export const useAtlasStore = create<AtlasState>((set) => ({
  mapMode: "countries",
  mobileTab: "mapa",
  mapExpanded: false,
  regionSlug: GLOBAL_REGION_SLUG,
  selectionName: WORLD_LABEL,
  animalId: null,
  taxonGroup: null,
  search: "",
  setMapMode: (mapMode) =>
    set((state) =>
      // A country has no meaning on the biome layer, so leaving the country layer clears it.
      mapMode === "biomes" && state.regionSlug?.startsWith("country-")
        ? { mapMode, regionSlug: GLOBAL_REGION_SLUG, selectionName: WORLD_LABEL, animalId: null, taxonGroup: null, search: "" }
        : { mapMode },
    ),
  setMobileTab: (mobileTab) => set({ mobileTab }),
  toggleMapExpanded: () => set((state) => ({ mapExpanded: !state.mapExpanded })),
  selectRegion: (slug) =>
    set((state) =>
      state.regionSlug === (slug ?? GLOBAL_REGION_SLUG)
        ? state
        : {
            regionSlug: slug ?? GLOBAL_REGION_SLUG,
            selectionName: slug ? null : WORLD_LABEL,
            animalId: null,
            taxonGroup: null,
            search: "",
          },
    ),
  selectCountry: (name) =>
    set((state) => {
      const slug = name ? countrySlug(name) : null;
      return state.regionSlug === (slug ?? GLOBAL_REGION_SLUG)
        ? state
        : {
            regionSlug: slug ?? GLOBAL_REGION_SLUG,
            selectionName: name ? countryDisplayName(name) : WORLD_LABEL,
            animalId: null,
            taxonGroup: null,
            search: "",
          };
    }),
  selectAnimal: (id) => set({ animalId: id }),
  setTaxonGroup: (taxonGroup) => set({ taxonGroup }),
  setSearch: (search) => set({ search }),
}));

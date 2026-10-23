import { create } from "zustand";
import type { TaxonGroup } from "@/types/dto";
import { countryDisplayName, countrySlug } from "@/lib/countryNames";

export const GLOBAL_REGION_SLUG = "global";
export const WORLD_LABEL = "Mundo todo";

interface AtlasState {
  regionSlug: string | null;
  selectionName: string | null;
  animalId: number | null;
  taxonGroup: TaxonGroup | null;
  search: string;
  selectRegion: (slug: string | null) => void;
  selectCountry: (name: string | null) => void;
  selectAnimal: (id: number | null) => void;
  setTaxonGroup: (group: TaxonGroup | null) => void;
  setSearch: (value: string) => void;
}

export const useAtlasStore = create<AtlasState>((set) => ({
  regionSlug: GLOBAL_REGION_SLUG,
  selectionName: WORLD_LABEL,
  animalId: null,
  taxonGroup: null,
  search: "",
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

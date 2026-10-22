import { create } from "zustand";
import type { TaxonGroup } from "@/types/dto";
import { countryDisplayName } from "@/lib/countryNames";

export const GLOBAL_REGION_SLUG = "global";

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
  selectionName: "Global",
  animalId: null,
  taxonGroup: null,
  search: "",
  selectRegion: (slug) =>
    set((state) =>
      state.regionSlug === (slug ?? GLOBAL_REGION_SLUG)
        ? state
        : {
            regionSlug: slug ?? GLOBAL_REGION_SLUG,
            selectionName: slug ? null : "Global",
            animalId: null,
            taxonGroup: null,
            search: "",
          },
    ),
  selectCountry: (name) =>
    set((state) => {
      const slug = name ? `country-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}` : null;
      return state.regionSlug === (slug ?? GLOBAL_REGION_SLUG)
        ? state
        : {
            regionSlug: slug ?? GLOBAL_REGION_SLUG,
            selectionName: name ? countryDisplayName(name) : "Global",
            animalId: null,
            taxonGroup: null,
            search: "",
          };
    }),
  selectAnimal: (id) => set({ animalId: id }),
  setTaxonGroup: (taxonGroup) => set({ taxonGroup }),
  setSearch: (search) => set({ search }),
}));

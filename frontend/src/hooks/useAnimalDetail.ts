import { useQuery } from "@tanstack/react-query";
import { fetchAnimal } from "@/services/api";

const ONE_DAY = 24 * 60 * 60 * 1000;

export const animalDetailKey = (id: number, regionSlug: string | null) =>
  ["animal", id, regionSlug] as const;

export function animalDetailOptions(id: number, regionSlug: string | null) {
  return {
    queryKey: animalDetailKey(id, regionSlug),
    queryFn: () => fetchAnimal(id, regionSlug),
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  };
}

export function useAnimalDetail(id: number | null, regionSlug: string | null) {
  return useQuery({
    ...animalDetailOptions(id ?? 0, regionSlug),
    enabled: id !== null,
  });
}

import { useQuery } from "@tanstack/react-query";
import { fetchAnimalDistribution } from "@/services/api";

const ONE_DAY = 24 * 60 * 60 * 1000;

export function useAnimalDistribution(animalId: number | null) {
  return useQuery({
    queryKey: ["animal-distribution", animalId],
    queryFn: () => fetchAnimalDistribution(animalId ?? 0),
    enabled: animalId !== null,
    staleTime: ONE_DAY,
    gcTime: ONE_DAY,
  });
}

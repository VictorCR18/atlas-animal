import { useQuery } from "@tanstack/react-query";
import { fetchRegions } from "@/services/api";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegions,
    staleTime: FIFTEEN_MINUTES,
    gcTime: 2 * FIFTEEN_MINUTES,
  });
}

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchAnimals } from "@/services/api";
import type { TaxonGroup } from "@/types/dto";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/** Query keys are scoped by region, group and search; the page is the infinite-query cursor. */
export function useAnimals(slug: string | null, taxonGroup: TaxonGroup | null, search: string) {
  return useInfiniteQuery({
    queryKey: ["animals", slug, taxonGroup ?? "all", search],
    queryFn: ({ pageParam }) => fetchAnimals({ slug: slug ?? "", page: pageParam, taxonGroup, search }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    enabled: slug !== null,
    staleTime: FIFTEEN_MINUTES,
    gcTime: 2 * FIFTEEN_MINUTES,
  });
}

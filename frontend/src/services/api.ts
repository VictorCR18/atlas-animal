import type {
  AnimalDetail,
  AnimalListResponse,
  AnimalSummary,
  Conservation,
  DistributionPoint,
  Photo,
  Region,
  TaxonGroup,
  TaxonomyEntry,
} from "@/types/dto";

const BASE_URL = "https://api.inaturalist.org/v2";
const PER_PAGE = 20;
const ANIMALIA_TAXON_ID = 1;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RawPhoto {
  id: number;
  url?: string;
  square_url?: string;
  medium_url?: string;
  large_url?: string;
  attribution?: string;
  license_code?: string | null;
}

interface RawTaxon {
  id: number;
  name: string;
  rank?: string;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  default_photo?: RawPhoto | null;
  taxon_photos?: { photo: RawPhoto }[];
  ancestors?: RawTaxon[];
  conservation_status?: { status?: string } | null;
  conservation_statuses?: { status?: string }[];
  wikipedia_summary?: string | null;
}

interface RawSpeciesCount {
  count: number;
  taxon: RawTaxon;
}

const regions: Region[] = [
  {
    id: "amazonia",
    name: "Amazônia",
    slug: "amazonia",
    description: "Floresta tropical úmida que cobre quase metade do território brasileiro.",
    inaturalistPlaceId: 0,
    bounds: { swlat: -16.3, swlng: -74, nelat: 5.3, nelng: -44 },
  },
  {
    id: "mata-atlantica",
    name: "Mata Atlântica",
    slug: "mata-atlantica",
    description: "Faixa de floresta ao longo da costa leste, com muitas espécies que só existem ali.",
    inaturalistPlaceId: 0,
    bounds: { swlat: -30.5, swlng: -55.5, nelat: -3.5, nelng: -34.8 },
  },
  {
    id: "cerrado",
    name: "Cerrado",
    slug: "cerrado",
    description: "Savana do planalto central, berço de nascentes de grandes bacias hidrográficas.",
    inaturalistPlaceId: 0,
    bounds: { swlat: -24.7, swlng: -60.5, nelat: -2.3, nelng: -41.5 },
  },
  {
    id: "pantanal",
    name: "Pantanal",
    slug: "pantanal",
    description: "Maior planície alagável do mundo, famosa pela concentração de fauna visível.",
    inaturalistPlaceId: 0,
    bounds: { swlat: -22.5, swlng: -58.9, nelat: -15.5, nelng: -54.5 },
  },
  {
    id: "caatinga",
    name: "Caatinga",
    slug: "caatinga",
    description: "Bioma semiárido do Nordeste, exclusivamente brasileiro e adaptado à seca.",
    inaturalistPlaceId: 0,
    bounds: { swlat: -17.9, swlng: -45.5, nelat: -2.8, nelng: -35 },
  },
  ...[
    ["biome-congo-basin", "Bacia do Congo", "Floresta tropical da África central.", -13, 9, 5, 31],
    ["biome-southeast-asia", "Sudeste Asiático", "Florestas tropicais e ilhas de alta diversidade no Sudeste Asiático.", -11, 94, 22, 142],
    ["biome-boreal-forest", "Floresta Boreal", "Grande faixa de florestas coníferas do hemisfério norte.", 48, -170, 70, 170],
    ["biome-mediterranean", "Regiões Mediterrâneas", "Ecossistemas de clima mediterrâneo em diferentes continentes.", 30, -10, 46, 38],
    ["biome-australian-savanna", "Savana Australiana", "Savana tropical e campos do norte da Austrália.", -25, 120, -11, 146],
    ["biome-southern-andes", "Cordilheira dos Andes", "Gradiente de habitats montanos ao longo dos Andes.", -56, -81, 8, -66],
  ].map(([id, name, description, swlat, swlng, nelat, nelng]) => ({
    id: id as string,
    name: name as string,
    slug: id as string,
    description: description as string,
    inaturalistPlaceId: 0,
    bounds: { swlat: swlat as number, swlng: swlng as number, nelat: nelat as number, nelng: nelng as number },
  })),
];

const countryRegions = new Map<string, Promise<Region>>();

async function request<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError("Não foi possível conectar ao iNaturalist. Verifique sua conexão.", 0, "NETWORK_ERROR");
  }
  if (!response.ok) {
    if (response.status === 429) {
      throw new ApiError("O iNaturalist está limitando as requisições. Tente novamente em instantes.", 429, "RATE_LIMITED");
    }
    throw new ApiError("Não foi possível obter os dados do iNaturalist agora. Tente novamente.", response.status, "UPSTREAM_ERROR");
  }
  return (await response.json()) as T;
}

export async function fetchRegions(): Promise<Region[]> {
  return regions;
}

async function getRegion(slug: string): Promise<Region> {
  if (slug === "global") {
    return {
      id: "global",
      name: "Global",
      slug: "global",
      description: "Animais registrados no mundo todo.",
      inaturalistPlaceId: 0,
      bounds: { swlat: -90, swlng: -180, nelat: 90, nelng: 180 },
    };
  }
  const known = regions.find((region) => region.slug === slug);
  if (known) return known;
  if (!slug.startsWith("country-")) throw new ApiError("Região não encontrada.", 404, "NOT_FOUND");

  const existing = countryRegions.get(slug);
  if (existing) return existing;
  const name = slug.slice("country-".length).replace(/-/g, " ");
  const promise = request<{ results: { id: number; display_name?: string; name: string }[] }>("/places", {
    q: name,
    per_page: 5,
    fields: "id,name,display_name",
  }).then(({ results }) => {
    const place = results[0];
    if (!place) throw new ApiError("País não encontrado.", 404, "NOT_FOUND");
    return {
      id: slug,
      name: place.display_name ?? place.name,
      slug,
      description: `Animais registrados no país ${place.display_name ?? place.name}.`,
      inaturalistPlaceId: place.id,
      bounds: { swlat: -90, swlng: -180, nelat: 90, nelng: 180 },
    };
  });
  countryRegions.set(slug, promise);
  return promise;
}

function placeParams(region: Region): Record<string, number> {
  return region.inaturalistPlaceId > 0
    ? { place_id: region.inaturalistPlaceId }
    : { swlat: region.bounds.swlat, swlng: region.bounds.swlng, nelat: region.bounds.nelat, nelng: region.bounds.nelng };
}

const PHOTO_SIZE = /\/(square|small|medium|large|original)\.(\w+)(\?.*)?$/;
function mapPhoto(photo: RawPhoto | null | undefined): Photo | null {
  if (!photo) return null;
  const base = photo.medium_url ?? photo.url ?? photo.large_url ?? photo.square_url;
  if (!base) return null;
  const resized = (size: string) => base.replace(PHOTO_SIZE, `/${size}.$2$3`);
  return {
    id: photo.id,
    thumbUrl: photo.square_url ?? resized("square"),
    mediumUrl: photo.medium_url ?? resized("medium"),
    largeUrl: photo.large_url ?? resized("large"),
    attribution: photo.attribution ?? "Foto: iNaturalist",
    attributionUrl: `https://www.inaturalist.org/photos/${photo.id}`,
    license: photo.license_code ?? null,
  };
}

function mapSummary(row: RawSpeciesCount): AnimalSummary {
  return {
    id: row.taxon.id,
    commonName: row.taxon.preferred_common_name ?? null,
    scientificName: row.taxon.name,
    group: row.taxon.iconic_taxon_name ?? null,
    photo: mapPhoto(row.taxon.default_photo),
    observationsCount: row.count,
  };
}

const rankLabels: Record<string, string> = {
  kingdom: "Reino", phylum: "Filo", class: "Classe", order: "Ordem",
  family: "Família", genus: "Gênero", species: "Espécie",
};
const conservationLabels: Record<string, string> = {
  LC: "Pouco preocupante", NT: "Quase ameaçada", VU: "Vulnerável", EN: "Em perigo",
  CR: "Criticamente em perigo", EW: "Extinta na natureza", EX: "Extinta", DD: "Dados insuficientes",
};

function htmlToText(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || null;
}

function mapDetail(taxon: RawTaxon, region: Region | null, count: number | null): AnimalDetail {
  const photos = (taxon.taxon_photos ?? [])
    .map(({ photo }) => mapPhoto(photo))
    .filter((photo): photo is Photo => photo !== null)
    .slice(0, 12);
  const fallback = mapPhoto(taxon.default_photo);
  const taxonomy: TaxonomyEntry[] = [...(taxon.ancestors ?? []), taxon]
    .filter((item) => item.rank && rankLabels[item.rank])
    .map((item) => ({
      rank: item.rank as string,
      rankLabel: rankLabels[item.rank as string] as string,
      name: item.name,
      commonName: item.preferred_common_name ?? null,
    }));
  const code = (taxon.conservation_status?.status ?? taxon.conservation_statuses?.find((item) => item.status)?.status)?.toUpperCase();
  const conservation: Conservation | null = code && conservationLabels[code] ? { code, label: conservationLabels[code] } : null;
  return {
    id: taxon.id,
    commonName: taxon.preferred_common_name ?? null,
    scientificName: taxon.name,
    group: taxon.iconic_taxon_name ?? null,
    taxonomy,
    conservation,
    regionName: region?.name ?? null,
    regionObservationCount: count,
    summary: htmlToText(taxon.wikipedia_summary),
    photos: photos.length > 0 ? photos : fallback ? [fallback] : [],
    inaturalistUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
  };
}

export interface AnimalsParams {
  slug: string;
  page: number;
  taxonGroup: TaxonGroup | null;
  search: string;
}

export async function fetchAnimals({ slug, page, taxonGroup, search }: AnimalsParams): Promise<AnimalListResponse> {
  const region = await getRegion(slug);
  const query: Record<string, string | number | undefined> = {
    ...placeParams(region),
    iconic_taxa: taxonGroup ?? undefined,
    taxon_id: taxonGroup ? undefined : ANIMALIA_TAXON_ID,
    q: search.trim() || undefined,
    quality_grade: "research",
    photos: "true",
    locale: "pt-BR",
    fields: "all",
    page,
    per_page: PER_PAGE,
  };
  if (region.inaturalistPlaceId > 0) query.preferred_place_id = region.inaturalistPlaceId;
  const data = await request<{ total_results: number; results: RawSpeciesCount[] }>("/observations/species_counts", query);
  return {
    items: data.results.map(mapSummary),
    pagination: { page, perPage: PER_PAGE, total: data.total_results, totalPages: Math.max(1, Math.ceil(data.total_results / PER_PAGE)) },
  };
}

export async function fetchAnimal(id: number, regionSlug: string | null): Promise<AnimalDetail> {
  const region = regionSlug ? await getRegion(regionSlug) : null;
  const { results } = await request<{ results: RawTaxon[] }>(`/taxa/${id}`, { fields: "all" });
  const taxon = results[0];
  if (!taxon) throw new ApiError("Espécie não encontrada.", 404, "NOT_FOUND");
  let count: number | null = null;
  if (region) {
    try {
      const data = await request<{ total_results: number }>("/observations", {
        ...placeParams(region), taxon_id: id, quality_grade: "research", per_page: 1, fields: "id",
      });
      count = data.total_results;
    } catch {
      count = null;
    }
  }
  return mapDetail(taxon, region, count);
}

export async function fetchAnimalDistribution(id: number): Promise<DistributionPoint[]> {
  const data = await request<{ results: { geojson?: { type: string; coordinates?: [number, number] } }[] }>("/observations", {
    taxon_id: id, quality_grade: "research", per_page: 200, fields: "geojson",
  });
  return data.results
    .map((item) => item.geojson?.type === "Point" && item.geojson.coordinates ? item.geojson.coordinates : null)
    .filter((point): point is DistributionPoint => point !== null);
}

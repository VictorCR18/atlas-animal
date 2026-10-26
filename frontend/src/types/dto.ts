export const TAXON_GROUPS = [
  "Mammalia",
  "Aves",
  "Reptilia",
  "Amphibia",
  "Actinopterygii",
  "Insecta",
  "Arachnida",
  "Mollusca",
] as const;

export type TaxonGroup = (typeof TAXON_GROUPS)[number];

export interface Bounds {
  swlat: number;
  swlng: number;
  nelat: number;
  nelng: number;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  description: string;
  inaturalistPlaceId: number;
  bounds: Bounds;
}

export interface Photo {
  id: number;
  thumbUrl: string;
  mediumUrl: string;
  largeUrl: string;
  attribution: string;
  attributionUrl: string;
  license: string | null;
}

export interface AnimalSummary {
  id: number;
  commonName: string | null;
  scientificName: string;
  group: string | null;
  photo: Photo | null;
  observationsCount: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface AnimalListResponse {
  items: AnimalSummary[];
  pagination: Pagination;
}

export interface TaxonomyEntry {
  rank: string;
  rankLabel: string;
  name: string;
  commonName: string | null;
}

export interface Conservation {
  code: string;
  label: string;
}

export interface SummarySource {
  name: string;
  url: string;
}

export interface AnimalDetail {
  id: number;
  commonName: string | null;
  scientificName: string;
  group: string | null;
  taxonomy: TaxonomyEntry[];
  conservation: Conservation | null;
  regionName: string | null;
  regionObservationCount: number | null;
  summary: string | null;
  summarySource: SummarySource | null;
  photos: Photo[];
  inaturalistUrl: string;
}

export type DistributionPoint = [number, number];

export interface GroupCount {
  group: string;
  count: number;
}
export interface RawPhoto {
  id: number;
  url?: string;
  square_url?: string;
  medium_url?: string;
  large_url?: string;
  attribution?: string;
  license_code?: string | null;
}

export interface RawTaxon {
  id: number;
  name: string;
  rank?: string;
  preferred_common_name?: string;
  english_common_name?: string;
  iconic_taxon_name?: string;
  default_photo?: RawPhoto | null;
  taxon_photos?: { photo: RawPhoto }[];
  ancestors?: RawTaxon[];
  conservation_status?: { status?: string } | null;
  conservation_statuses?: { status?: string }[];
  wikipedia_summary?: string | null;
  wikipedia_url?: string | null;
}

export interface RawSpeciesCount {
  count: number;
  taxon: RawTaxon;
}
import worldData from "world-atlas/countries-50m.json";
import { countryDisplayName } from "@/lib/countryNames";

export interface CountryOption {
  name: string;
  displayName: string;
}

/** Every country of the world atlas, sorted by its Portuguese name. */
export const COUNTRY_OPTIONS: CountryOption[] = (
  worldData.objects.countries.geometries as Array<{ properties?: { name?: string } }>
)
  .map((geometry) => geometry.properties?.name ?? "")
  .filter(Boolean)
  .map((name) => ({ name, displayName: countryDisplayName(name) }))
  .sort((a, b) => a.displayName.localeCompare(b.displayName, "pt-BR"));

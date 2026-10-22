import type { AnimalSummary, TaxonGroup } from "@/types/dto";

export const GROUP_LABELS: Record<TaxonGroup, string> = {
  Mammalia: "Mamíferos",
  Aves: "Aves",
  Reptilia: "Répteis",
  Amphibia: "Anfíbios",
  Actinopterygii: "Peixes",
  Insecta: "Insetos",
  Arachnida: "Aracnídeos",
  Mollusca: "Moluscos",
};

export function groupLabel(group: string | null): string | null {
  if (!group) return null;
  return GROUP_LABELS[group as TaxonGroup] ?? null;
}

const MOJIBAKE_MARKERS = /(?:Ã|Â|â|ð|�)/;
const NON_LATIN_SCRIPT = /[\u0400-\u052f\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0600-\u06ff]/;

/**
 * Keeps valid Unicode scripts intact and repairs text that was decoded as
 * Latin-1 after being encoded as UTF-8.
 */
export function normalizeText(value: string): string {
  let normalized = value.normalize("NFC");

  for (let attempt = 0; attempt < 2 && MOJIBAKE_MARKERS.test(normalized); attempt += 1) {
    const codeUnits = Array.from(normalized, (character) => character.charCodeAt(0));
    if (codeUnits.some((codeUnit) => codeUnit > 0xff)) break;

    let repaired: string;
    try {
      repaired = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(codeUnits));
    } catch {
      break;
    }
    if (repaired === normalized) break;
    normalized = repaired.normalize("NFC");
  }

  return normalized;
}

export function portugueseCommonName(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = normalizeText(value);
  return NON_LATIN_SCRIPT.test(normalized) ? null : normalized;
}

/** Common name in pt-BR when available, scientific name otherwise. */
export function displayName(animal: Pick<AnimalSummary, "commonName" | "scientificName">): string {
  return portugueseCommonName(animal.commonName) ?? normalizeText(animal.scientificName);
}

const countFormatter = new Intl.NumberFormat("pt-BR");
export const formatCount = (value: number): string => countFormatter.format(value);

export const CONSERVATION_COLORS: Record<string, { bg: string; fg: string }> = {
  LC: { bg: "#D5E8D4", fg: "#1E4620" },
  NT: { bg: "#E4EBC2", fg: "#3F4A10" },
  VU: { bg: "#F6E3A6", fg: "#5A4200" },
  EN: { bg: "#F7CFA3", fg: "#6B2F00" },
  CR: { bg: "#F1B5AE", fg: "#6B1008" },
  EW: { bg: "#D9C3E6", fg: "#3E1A5A" },
  EX: { bg: "#D4D4D4", fg: "#222222" },
  DD: { bg: "#E2E2E2", fg: "#333333" },
};

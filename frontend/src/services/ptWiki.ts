/**
 * Portuguese (Brazil) content for animals that iNaturalist has no pt-BR text for.
 *
 * - Names: Wikidata "taxon common name" (P1843), pt-br first, then pt.
 * - Descriptions: introduction of the pt.wikipedia article.
 *
 * Both services are public and allow browser requests. Everything here is optional
 * enrichment: any failure resolves to "nothing found" and never throws.
 */
import { capitalizeFirst, normalizeText } from "@/lib/format";
import type { SummarySource } from "@/types/dto";

const SPARQL_URL = "https://query.wikidata.org/sparql";
const WIKI_API_URL = "https://pt.wikipedia.org/w/api.php";
const TIMEOUT_MS = 4000;
// After a failure both services are skipped for a while, so a slow or blocked service costs one wait, not one per page.
const PAUSE_MS = 60_000;
let pausedUntil = 0;
const available = (): boolean => Date.now() >= pausedUntil;
const pause = (): void => {
  pausedUntil = Date.now() + PAUSE_MS;
};

/** scientific name -> Brazilian name, or null when Wikidata has none. Failures are not cached. */
const nameCache = new Map<string, string | null>();

interface SparqlRow {
  n: { value: string };
  cn: { value: string };
  lang: { value: string };
}

export async function brazilianNames(scientificNames: string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  const missing: string[] = [];
  for (const name of new Set(scientificNames)) {
    const cached = nameCache.get(name);
    if (cached === undefined) missing.push(name);
    else if (cached) found.set(name, cached);
  }
  if (missing.length === 0 || !available()) return found;

  try {
    const values = missing.map((name) => `"${name.replace(/["\\\r\n]/g, "")}"`).join(" ");
    const query = `SELECT ?n ?cn (LANG(?cn) AS ?lang) WHERE {
      VALUES ?n { ${values} }
      ?t wdt:P225 ?n ; wdt:P1843 ?cn .
      FILTER(LANG(?cn) IN ("pt-br", "pt"))
    }`;
    const url = new URL(SPARQL_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("format", "json");
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) {
      pause();
      return found;
    }
    const { results } = (await response.json()) as { results: { bindings: SparqlRow[] } };

    // Per taxon: Brazilian Portuguese before generic Portuguese, then the shortest name.
    const best = new Map<string, { name: string; rank: number }>();
    for (const row of results.bindings) {
      const name = normalizeText(row.cn.value).trim();
      const rank = row.lang.value === "pt-br" ? 0 : 1;
      const current = best.get(row.n.value);
      if (!current || rank < current.rank || (rank === current.rank && name.length < current.name.length)) {
        best.set(row.n.value, { name, rank });
      }
    }
    for (const name of missing) {
      const value = best.has(name) ? capitalizeFirst((best.get(name) as { name: string }).name) : null;
      nameCache.set(name, value);
      if (value) found.set(name, value);
    }
  } catch {
    // Network error or timeout: the caller falls back to the scientific name.
    pause();
  }
  return found;
}

interface WikiPage {
  title: string;
  fullurl?: string;
  extract?: string;
  missing?: boolean;
  pageprops?: { disambiguation?: string };
}

export interface PortugueseSummary {
  text: string;
  source: SummarySource;
}

/** Introduction of the pt.wikipedia article for a species, or null when there is no safe match. */
export async function portugueseSummary(scientificName: string): Promise<PortugueseSummary | null> {
  if (!available()) return null;
  try {
    const url = new URL(WIKI_API_URL);
    const params: Record<string, string> = {
      action: "query",
      format: "json",
      formatversion: "2",
      origin: "*",
      redirects: "1",
      prop: "extracts|info|pageprops",
      ppprop: "disambiguation",
      inprop: "url",
      exintro: "1",
      explaintext: "1",
      exsentences: "4",
      titles: scientificName,
    };
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) {
      pause();
      return null;
    }
    const data = (await response.json()) as { query?: { pages?: WikiPage[] } };
    const page = data.query?.pages?.[0];
    if (!page || page.missing || page.pageprops?.disambiguation || !page.extract || !page.fullurl) return null;

    const text = normalizeText(page.extract).replace(/\s+/g, " ").trim();
    // Guard against a different subject sharing the name: the intro must cite the binomial.
    const binomial = scientificName.split(" ").slice(0, 2).join(" ").toLocaleLowerCase();
    if (!text || !text.toLocaleLowerCase().includes(binomial)) return null;
    return { text, source: { name: "Wikipédia", url: page.fullurl } };
  } catch {
    pause();
    return null;
  }
}

const PT_WORDS = /\b(de|da|do|dos|das|em|uma|que|os|as|são|é|com|para|por)\b/gi;
const EN_WORDS = /\b(the|of|and|is|in|with|are|which|that|to)\b/gi;

/** True when a text is written in Portuguese rather than English (iNaturalist falls back to English). */
export function looksPortuguese(text: string): boolean {
  const pt = text.match(PT_WORDS)?.length ?? 0;
  const en = text.match(EN_WORDS)?.length ?? 0;
  return pt >= 3 && pt > en * 1.5;
}

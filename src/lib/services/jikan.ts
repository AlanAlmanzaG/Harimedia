// src/lib/services/jikan.ts
// Jikan v4 — API no oficial de MyAnimeList (sin token requerido)
import type { SearchResult } from "@/types/media";

const BASE_URL = "https://api.jikan.moe/v4";

export async function searchAnime(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `${BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=10`
  );
  if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
  const { data } = await res.json();
  return data.map(normalizeAnime);
}

export async function getAnimeDetails(malId: string): Promise<SearchResult> {
  const res = await fetch(`${BASE_URL}/anime/${malId}`);
  if (!res.ok) throw new Error(`Jikan detail error: ${res.status}`);
  const { data } = await res.json();
  return normalizeAnime(data);
}

// ─── Normalización ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAnime(item: any): SearchResult {
  return {
    externalId: String(item.mal_id),
    source: "jikan",
    mediaType: "ANIME",
    title: item.title_english ?? item.title,
    originalTitle: item.title_japanese,
    synopsis: item.synopsis ?? "",
    coverUrl: item.images?.jpg?.large_image_url ?? "/placeholder-cover.png",
    year: item.year ?? item.aired?.prop?.from?.year,
    genres: item.genres?.map((g: { name: string }) => g.name) ?? [],
    suggestedFields: {
      episodesWatched: 0,
      totalEpisodes: item.episodes ?? 0,
      studio: item.studios?.[0]?.name ?? "",
      season: item.season ? `${item.season} ${item.year}` : undefined,
      source: item.source,
    },
  };
}
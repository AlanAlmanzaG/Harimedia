// src/lib/services/tmdb.ts
import type { SearchResult, MediaType } from "@/types/media";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const headers = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`,
  "Content-Type": "application/json",
};

// Búsqueda multi (detecta películas y series)
export async function searchTMDB(
  query: string,
  type: "movie" | "tv" = "movie"
): Promise<SearchResult[]> {
  const endpoint = type === "movie" ? "search/movie" : "search/tv";
  const res = await fetch(
    `${BASE_URL}/${endpoint}?query=${encodeURIComponent(query)}&language=es-MX`,
    { headers }
  );

  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = await res.json();

  return data.results.map((item: TMDBResult) =>
    normalizeTMDB(item, type === "movie" ? "MOVIE" : "SERIES")
  );
}

// Detalle completo de una obra
export async function getTMDBDetails(
  id: string,
  type: "movie" | "tv"
): Promise<SearchResult> {
  const res = await fetch(`${BASE_URL}/${type}/${id}?language=es-MX`, {
    headers,
  });
  if (!res.ok) throw new Error(`TMDB detail error: ${res.status}`);
  const item = await res.json();
  return normalizeTMDB(item, type === "movie" ? "MOVIE" : "SERIES");
}

// ─── Normalización ────────────────────────────────────────────────────────────

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

function normalizeTMDB(item: TMDBResult, mediaType: MediaType): SearchResult {
  const isMovie = mediaType === "MOVIE";
  return {
    externalId: String(item.id),
    source: "tmdb",
    mediaType,
    title: (isMovie ? item.title : item.name) ?? "Sin título",
    originalTitle: isMovie ? item.original_title : item.original_name,
    synopsis: item.overview,
    coverUrl: item.poster_path
      ? `${IMAGE_BASE}${item.poster_path}`
      : "/placeholder-cover.png",
    year: new Date(
      (isMovie ? item.release_date : item.first_air_date) ?? ""
    ).getFullYear(),
    suggestedFields: isMovie
      ? { duration: item.runtime ?? 0, director: "" }
      : {
          totalSeasons: item.number_of_seasons ?? 0,
          totalEpisodes: item.number_of_episodes ?? 0,
          episodesWatched: 0,
          currentSeason: 1,
        },
  };
}
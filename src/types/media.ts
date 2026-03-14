// src/types/media.ts

export type MediaType =
  | "MOVIE"
  | "SERIES"
  | "CARTOON"
  | "ANIME"
  | "MANGA"
  | "MANHWA";

export type MediaStatus =
  | "PENDING"       // Pendiente / Por leer
  | "IN_PROGRESS"   // Viendo / Leyendo
  | "PAUSED"        // Pausado
  | "COMPLETED"     // Terminado
  | "ABANDONED";    // Abandonado

// ─── Dynamic fields por tipo ────────────────────────────────────────────────

export interface MovieFields {
  duration: number; // minutos
  director: string;
  cast?: string[];
  studio?: string;
}

export interface SeriesFields {
  totalSeasons: number;
  episodesWatched: number;
  totalEpisodes: number;
  currentSeason: number;
  network?: string;
}

export interface AnimeFields {
  episodesWatched: number;
  totalEpisodes: number;
  studio: string;
  season?: string; // "Winter 2024"
  source?: string; // "Manga" | "Original" | etc.
}

export interface MangaFields {
  chaptersRead: number;
  totalChapters: number | null; // null = en emisión
  volumes: number;
  author: string;
  illustrator?: string;
  publisher?: string;
  demographic?: string; // "Shounen" | "Seinen" | etc.
}

export type DynamicFields =
  | MovieFields
  | SeriesFields
  | AnimeFields
  | MangaFields;

// ─── Documento base en Firestore ─────────────────────────────────────────────

export interface MediaEntry {
  id: string;
  userId: string;
  mediaType: MediaType;

  // Campos base compartidos
  title: string;
  originalTitle?: string;
  synopsis: string;
  coverUrl: string;
  genres?: string[];
  year?: number;

  // Seguimiento
  status: MediaStatus;
  rating?: number; // 1–10
  startDate?: Date;
  endDate?: Date;
  review?: string;

  // Campo dinámico tipado según mediaType
  dynamicFields: DynamicFields;

  // Referencia a API externa (para sincronización)
  externalId?: string;
  externalSource?: "tmdb" | "jikan" | "mangadex";

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ─── Resultado de búsqueda desde APIs externas ───────────────────────────────

export interface SearchResult {
  externalId: string;
  source: "tmdb" | "jikan" | "mangadex";
  mediaType: MediaType;
  title: string;
  originalTitle?: string;
  synopsis: string;
  coverUrl: string;
  year?: number;
  genres?: string[];
  // Pre-populated dynamic fields desde la API
  suggestedFields?: Partial<DynamicFields>;
}

// ─── Stats por usuario ────────────────────────────────────────────────────────

export interface MediaStats {
  mediaType: MediaType;
  count: number;
  completedCount: number;
  avgRating: number;
  totalMinutes?: number; // Para películas/series
  totalChapters?: number; // Para manga
}
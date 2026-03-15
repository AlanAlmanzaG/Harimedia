// src/hooks/useLibrarySearch.ts
"use client";

import { useMemo, useState } from "react";
import type { MediaEntry } from "@/types/media";
import type { MovieFields, SeriesFields, AnimeFields, MangaFields } from "@/types/media";

interface UseLibrarySearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: MediaEntry[];
  isSearching: boolean;
}

export function useLibrarySearch(entries: MediaEntry[]): UseLibrarySearchReturn {
  const [query, setQuery] = useState("");

  const isSearching = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;

    return entries.filter((entry) => {
      // Título principal
      if (entry.title.toLowerCase().includes(q)) return true;

      // Título original
      if (entry.originalTitle?.toLowerCase().includes(q)) return true;

      // Géneros
      if (entry.genres?.some((g) => g.toLowerCase().includes(q))) return true;

      // Reseña personal
      if (entry.review?.toLowerCase().includes(q)) return true;

      // Sinopsis
      if (entry.synopsis?.toLowerCase().includes(q)) return true;

      // Campos dinámicos según tipo
      const f = entry.dynamicFields as any;
      if (!f) return false;

      switch (entry.mediaType) {
        case "MOVIE":
          return (f as MovieFields).director?.toLowerCase().includes(q);
        case "SERIES":
        case "CARTOON":
          return (f as SeriesFields).network?.toLowerCase().includes(q);
        case "ANIME":
          return (
            (f as AnimeFields).studio?.toLowerCase().includes(q) ||
            (f as AnimeFields).season?.toLowerCase().includes(q)
          );
        case "MANGA":
        case "MANHWA":
          return (
            (f as MangaFields).author?.toLowerCase().includes(q) ||
            (f as MangaFields).illustrator?.toLowerCase().includes(q)
          );
        default:
          return false;
      }
    });
  }, [entries, query]);

  return { query, setQuery, results, isSearching };
}
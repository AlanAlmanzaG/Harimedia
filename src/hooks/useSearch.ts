// src/hooks/useSearch.ts
"use client";

import { useState, useCallback, useRef } from "react";
import { searchTMDB } from "@/lib/services/tmdb";
import { searchAnime } from "@/lib/services/jikan";
import { searchMangaDex } from "@/lib/services/mangadex";
import type { MediaType, SearchResult } from "@/types/media";

interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, mediaType: MediaType) => Promise<void>;
  clear: () => void;
}

// Debounce mínimo para no saturar APIs
const DEBOUNCE_MS = 400;

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref para cancelar búsquedas obsoletas (race condition)
  const activeQueryRef = useRef<string>("");

  const search = useCallback(
    async (query: string, mediaType: MediaType) => {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setResults([]);
        return;
      }

      // Debounce
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        const currentQuery = `${trimmed}-${mediaType}`;
        activeQueryRef.current = currentQuery;

        setLoading(true);
        setError(null);

        try {
          let data: SearchResult[] = [];

          switch (mediaType) {
            case "MOVIE":
              data = await searchTMDB(trimmed, "movie");
              break;
            case "SERIES":
            case "CARTOON":
              data = await searchTMDB(trimmed, "tv");
              // Marcamos el tipo correcto si es CARTOON
              if (mediaType === "CARTOON") {
                data = data.map((r) => ({ ...r, mediaType: "CARTOON" }));
              }
              break;
            case "ANIME":
              data = await searchAnime(trimmed);
              break;
            case "MANGA":
              data = await searchMangaDex(trimmed, "MANGA");
              break;
            case "MANHWA":
              data = await searchMangaDex(trimmed, "MANHWA");
              break;
          }

          // Ignorar si llegó una búsqueda más reciente
          if (activeQueryRef.current !== currentQuery) return;
          setResults(data);
        } catch {
          if (activeQueryRef.current !== currentQuery) return;
          setError("No se pudo conectar. Verifica tu conexión.");
          setResults([]);
        } finally {
          if (activeQueryRef.current === currentQuery) {
            setLoading(false);
          }
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    activeQueryRef.current = "";
  }, []);

  return { results, loading, error, search, clear };
}
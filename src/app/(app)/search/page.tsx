// src/app/(app)/search/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  PenLine,
} from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { MediaTypePicker } from "@/components/media/MediaTypePicker";
import { SearchResultCard } from "@/components/media/SearchResultCard";
import { cn } from "@/lib/utils";
import type { MediaType, SearchResult } from "@/types/media";

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("MOVIE");
  const { results, loading, error, search, clear } = useSearch();

  function handleQueryChange(val: string) {
    setQuery(val);
    if (val.length >= 2) {
      search(val, mediaType);
    } else {
      clear();
    }
  }

  function handleTypeChange(type: MediaType) {
    setMediaType(type);
    if (query.length >= 2) {
      search(query, type);
    }
  }

  function handleClear() {
    setQuery("");
    clear();
    inputRef.current?.focus();
  }

  function handleSelectResult(result: SearchResult) {
    // Serializar el resultado y pasarlo vía sessionStorage para no contaminar la URL
    sessionStorage.setItem("harimedia_prefill", JSON.stringify(result));
    router.push("/search/add");
  }

  function handleManualAdd() {
    // Limpiar prefill para entrada manual
    sessionStorage.removeItem("harimedia_prefill");
    sessionStorage.setItem(
      "harimedia_prefill_type",
      JSON.stringify({ mediaType })
    );
    router.push("/search/add");
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Barra de búsqueda ──────────────────────────────────────── */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-sm px-4 pt-4 pb-3 flex flex-col gap-3 border-b border-neutral-800/50">
        {/* Input */}
        <div className="relative flex items-center">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-4 text-neutral-500 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="search"
            placeholder={`Buscar ${getPlaceholder(mediaType)}...`}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(
              "w-full h-11 pl-11 pr-11 rounded-2xl text-sm",
              "bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600",
              "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
              "transition-colors duration-150"
            )}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Selector de tipo */}
        <MediaTypePicker value={mediaType} onChange={handleTypeChange} />
      </div>

      {/* ── Contenido ────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 pt-4">
        {/* Estado inicial — sin búsqueda */}
        {!query && results.length === 0 && (
          <InitialState mediaType={mediaType} onManualAdd={handleManualAdd} />
        )}

        {/* Cargando */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonResult key={i} />
            ))}
          </div>
        )}

        {/* Error de red */}
        {error && !loading && (
          <div className="text-center py-10">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && !error && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-10 flex flex-col items-center gap-3">
            <p className="text-sm text-neutral-500">
              Sin resultados para{" "}
              <span className="text-neutral-300 font-medium">"{query}"</span>
            </p>
            <button
              type="button"
              onClick={handleManualAdd}
              className="flex items-center gap-2 px-4 h-9 rounded-xl border border-neutral-700 text-sm text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-colors"
            >
              <PenLine size={14} strokeWidth={1.5} />
              Agregar manualmente
            </button>
          </div>
        )}

        {/* Resultados */}
        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-2 pb-4">
            <p className="text-xs text-neutral-600 mb-1">
              {results.length} resultado{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((result) => (
              <SearchResultCard
                key={result.externalId}
                result={result}
                onSelect={handleSelectResult}
              />
            ))}

            {/* Opción manual al final */}
            <button
              type="button"
              onClick={handleManualAdd}
              className={cn(
                "w-full flex items-center justify-center gap-2 h-11 rounded-2xl mt-1",
                "border border-dashed border-neutral-700 text-sm text-neutral-500",
                "hover:border-neutral-600 hover:text-neutral-300 transition-colors"
              )}
            >
              <PenLine size={14} strokeWidth={1.5} />
              No encuentro lo que busco — agregar manualmente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

function InitialState({
  mediaType,
  onManualAdd,
}: {
  mediaType: MediaType;
  onManualAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 pt-10 pb-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
        <Search size={24} strokeWidth={1} className="text-neutral-600" />
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-300 mb-1">
          Busca {getPlaceholder(mediaType)}
        </p>
        <p className="text-xs text-neutral-600 leading-relaxed max-w-56">
          Los datos se obtienen automáticamente desde bases de datos externas.
        </p>
      </div>

      <div className="w-full border-t border-neutral-800/60 pt-5 flex flex-col items-center gap-3">
        <p className="text-xs text-neutral-600">
          O registra sin buscar
        </p>
        <button
          type="button"
          onClick={onManualAdd}
          className={cn(
            "flex items-center gap-2 px-5 h-10 rounded-xl",
            "border border-neutral-700 text-sm text-neutral-400",
            "hover:text-neutral-200 hover:border-neutral-600 transition-colors"
          )}
        >
          <PenLine size={14} strokeWidth={1.5} />
          Entrada manual
        </button>
      </div>
    </div>
  );
}

// ─── Skeleton de resultado ────────────────────────────────────────────────────

function SkeletonResult() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800/60">
      <div className="w-12 h-[68px] flex-none rounded-lg bg-neutral-800 animate-pulse" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-3/4 rounded bg-neutral-800 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-neutral-800 animate-pulse" />
        <div className="h-3 w-full rounded bg-neutral-800 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-neutral-800 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getPlaceholder(type: MediaType): string {
  const map: Record<MediaType, string> = {
    MOVIE: "películas",
    SERIES: "series",
    CARTOON: "caricaturas",
    ANIME: "anime",
    MANGA: "manga",
    MANHWA: "manhwa",
  };
  return map[type];
}
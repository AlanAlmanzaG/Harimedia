// src/components/library/LibraryFiltersBar.tsx
"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { MEDIA_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/mediaConfig";
import type { MediaType, MediaStatus } from "@/types/media";
import type { LibraryFilters } from "@/hooks/useLibrary";
import { cn } from "@/lib/utils";

const MEDIA_TYPES: (MediaType | "ALL")[] = [
  "ALL", "MOVIE", "SERIES", "ANIME", "MANGA", "MANHWA", "CARTOON",
];
const STATUSES: (MediaStatus | "ALL")[] = [
  "ALL", "IN_PROGRESS", "PENDING", "COMPLETED", "PAUSED", "ABANDONED",
];
const SORT_OPTIONS = [
  { value: "updatedAt", label: "Reciente" },
  { value: "createdAt", label: "Agregado" },
  { value: "rating", label: "Calificación" },
  { value: "title", label: "Título" },
] as const;

interface LibraryFiltersBarProps {
  filters: LibraryFilters;
  onChange: (f: LibraryFilters) => void;
  total: number;
}

export function LibraryFiltersBar({
  filters,
  onChange,
  total,
}: LibraryFiltersBarProps) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    (filters.mediaType && filters.mediaType !== "ALL") ||
    (filters.status && filters.status !== "ALL") ||
    filters.sortBy !== "updatedAt";

  function reset() {
    onChange({ mediaType: "ALL", status: "ALL", sortBy: "updatedAt", sortDir: "desc" });
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          {total} {total === 1 ? "obra" : "obras"}
        </p>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <X size={12} strokeWidth={2} />
              Limpiar
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium",
              "border transition-colors duration-150",
              open || hasActiveFilters
                ? "bg-violet-600/15 border-violet-500/40 text-violet-400"
                : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300"
            )}
          >
            <SlidersHorizontal size={13} strokeWidth={1.5} />
            Filtros
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            )}
          </button>
        </div>
      </div>

      {/* Panel expandible */}
      {open && (
        <div className="flex flex-col gap-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          {/* Tipo de medio */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
              Tipo
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {MEDIA_TYPES.map((type) => {
                const isActive = (filters.mediaType ?? "ALL") === type;
                const config = type !== "ALL" ? MEDIA_TYPE_CONFIG[type] : null;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange({ ...filters, mediaType: type })}
                    className={cn(
                      "flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-medium border transition-all duration-150",
                      isActive
                        ? config
                          ? [config.bgColor, config.color, config.borderColor]
                          : "bg-violet-600/15 text-violet-400 border-violet-500/40"
                        : "bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300"
                    )}
                  >
                    {config && <config.icon size={11} strokeWidth={1.5} />}
                    {type === "ALL" ? "Todos" : config?.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
              Estado
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => {
                const isActive = (filters.status ?? "ALL") === s;
                const config = s !== "ALL" ? STATUS_CONFIG[s] : null;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ ...filters, status: s })}
                    className={cn(
                      "flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-medium border transition-all duration-150",
                      isActive
                        ? "bg-violet-600/15 text-violet-400 border-violet-500/40"
                        : "bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300"
                    )}
                  >
                    {config && (
                      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
                    )}
                    {s === "ALL" ? "Todos" : config?.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordenar */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
              Ordenar por
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {SORT_OPTIONS.map((opt) => {
                const isActive = (filters.sortBy ?? "updatedAt") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        sortBy: opt.value as LibraryFilters["sortBy"],
                        sortDir: isActive
                          ? filters.sortDir === "asc" ? "desc" : "asc"
                          : "desc",
                      })
                    }
                    className={cn(
                      "flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-medium border transition-all duration-150",
                      isActive
                        ? "bg-violet-600/15 text-violet-400 border-violet-500/40"
                        : "bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300"
                    )}
                  >
                    {opt.label}
                    {isActive && (
                      <ChevronDown
                        size={11}
                        strokeWidth={2}
                        className={cn(
                          "transition-transform duration-150",
                          filters.sortDir === "asc" ? "rotate-180" : ""
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
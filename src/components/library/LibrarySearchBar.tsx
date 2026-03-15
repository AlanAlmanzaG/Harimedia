// src/components/library/LibrarySearchBar.tsx
"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LibrarySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  isSearching?: boolean;
}

export function LibrarySearchBar({
  value,
  onChange,
  resultCount,
  isSearching,
}: LibrarySearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClear() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative flex items-center">
        <Search
          size={15}
          strokeWidth={1.5}
          className="absolute left-3.5 text-neutral-500 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          placeholder="Buscar en tu biblioteca..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            "w-full h-10 pl-10 pr-10 rounded-xl text-sm",
            "bg-neutral-900 border text-neutral-100 placeholder:text-neutral-600",
            "focus:outline-none focus:ring-1 focus:ring-violet-500",
            "transition-colors duration-150",
            value
              ? "border-violet-500/40"
              : "border-neutral-800"
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Contador de resultados */}
      {isSearching && (
        <p className="text-xs text-neutral-600 px-1">
          {resultCount === 0
            ? "Sin resultados"
            : `${resultCount} resultado${resultCount !== 1 ? "s" : ""} para "${value}"`}
        </p>
      )}
    </div>
  );
}
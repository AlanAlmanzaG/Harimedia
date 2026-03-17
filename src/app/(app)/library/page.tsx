// src/app/(app)/library/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, List } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary, type LibraryFilters } from "@/hooks/useLibrary";
import { useLibrarySearch } from "@/hooks/useLibrarySearch";
import { LibrarySearchBar } from "@/components/library/LibrarySearchBar";
import { LibraryFiltersBar } from "@/components/library/LibraryFiltersBar";
import { LibraryGrid } from "@/components/library/LibraryGrid";

const DEFAULT_FILTERS: LibraryFilters = {
  mediaType: "ALL",
  status: "ALL",
  sortBy: "updatedAt",
  sortDir: "desc",
};

export default function LibraryPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<LibraryFilters>(DEFAULT_FILTERS);

  // 1. Carga todas las entradas desde Firestore (con filtros de tipo/estado/orden)
  const { entries, loading, error } = useLibrary(user?.uid, filters);

  // 2. Filtra en cliente por texto de búsqueda
  const { query, setQuery, results, isSearching } = useLibrarySearch(entries);

  // Lo que se muestra en el grid: resultados de búsqueda o todas las entradas
  const displayEntries = isSearching ? results : entries;

  return (
    <div className="flex flex-col gap-3 px-4 pt-5 pb-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
          Mi biblioteca
        </h1>
        <Link
          href="/search"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 active:scale-[0.97] transition-all duration-150"
          aria-label="Agregar obra"
        >
          <Plus size={18} strokeWidth={2} />
        </Link>
      </div>

      <Link href="/library/collections" className="w-9 h-9 ...">
  <List size={18} strokeWidth={1.5} />
</Link>

      {/* Búsqueda interna */}
      <LibrarySearchBar
        value={query}
        onChange={setQuery}
        resultCount={results.length}
        isSearching={isSearching}
      />

      {/* Filtros — se ocultan durante búsqueda activa para no confundir */}
      {!isSearching && (
        <LibraryFiltersBar
          filters={filters}
          onChange={setFilters}
          total={entries.length}
        />
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 text-center py-4">{error}</p>
      )}

      {/* Grid */}
      <LibraryGrid entries={displayEntries} loading={loading} />
    </div>
  );
}
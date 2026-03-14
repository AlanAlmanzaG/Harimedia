// src/app/(app)/library/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLibrary, type LibraryFilters } from "@/hooks/useLibrary";
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
  const { entries, loading, error, total } = useLibrary(user?.uid, filters);

  return (
    <div className="flex flex-col gap-4 px-4 pt-5 pb-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
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

      {/* Filtros */}
      <LibraryFiltersBar
        filters={filters}
        onChange={setFilters}
        total={total}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 text-center py-4">{error}</p>
      )}

      {/* Grid */}
      <LibraryGrid entries={entries} loading={loading} />
    </div>
  );
}
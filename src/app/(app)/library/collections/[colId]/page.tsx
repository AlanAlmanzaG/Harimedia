// src/app/(app)/library/collections/[colId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { getEntry } from "@/lib/firebase/firestore";
import { removeEntryFromCollection } from "@/lib/firebase/collections";
import { COLLECTION_ICONS, COLLECTION_COLORS } from "@/lib/collectionConfig";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import { cn } from "@/lib/utils";
import type { MediaEntry } from "@/types/media";

export default function CollectionDetailPage() {
  const { colId } = useParams<{ colId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { collections, loading: loadingCols } = useCollections(user?.uid);

  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const col = collections.find((c) => c.id === colId);

  // Cargar entries de la colección
  useEffect(() => {
    if (!user || !col) return;
    if (col.entryIds.length === 0) {
      setEntries([]);
      setLoadingEntries(false);
      return;
    }

    setLoadingEntries(true);
    Promise.all(col.entryIds.map((id) => getEntry(user.uid, id)))
      .then((results) => {
        // Filtrar nulls (entries eliminadas que aún están en la colección)
        setEntries(results.filter(Boolean) as MediaEntry[]);
      })
      .finally(() => setLoadingEntries(false));
  }, [user, col?.entryIds.join(",")]);

  if (loadingCols) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-64">
        <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-neutral-600" />
      </div>
    );
  }

  if (!col) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 min-h-64">
        <p className="text-sm text-neutral-500">Lista no encontrada.</p>
        <button
          type="button"
          onClick={() => router.replace("/library/collections")}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Volver a listas
        </button>
      </div>
    );
  }

  const Icon = COLLECTION_ICONS[col.icon];
  const colors = COLLECTION_COLORS[col.color] ?? COLLECTION_COLORS.neutral;

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-sm px-4 py-3 border-b border-neutral-800/50 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-none", colors.bg)}>
            <Icon size={14} strokeWidth={1.5} className={colors.text} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-100 truncate">
              {col.name}
            </p>
            <p className="text-[11px] text-neutral-600">
              {entries.length} {entries.length === 1 ? "obra" : "obras"}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {col.description && (
        <p className="text-xs text-neutral-500 px-4 pt-4 pb-1">
          {col.description}
        </p>
      )}

      {/* Grid de entradas */}
      <div className="px-4 pt-4 pb-6">
        {loadingEntries ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-neutral-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", colors.bg)}>
              <Icon size={22} strokeWidth={1} className={colors.text} />
            </div>
            <p className="text-sm text-neutral-500 leading-snug">
              Esta lista está vacía.
              <br />
              Agrega obras desde su página de detalle.
            </p>
          </div>
        ) : (
          <LibraryGrid entries={entries} />
        )}
      </div>
    </div>
  );
}
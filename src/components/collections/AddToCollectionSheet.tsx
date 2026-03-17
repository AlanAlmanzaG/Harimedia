// src/components/collections/AddToCollectionSheet.tsx
"use client";

import { useState } from "react";
import { X, Check, Plus, Loader2 } from "lucide-react";
import {
  addEntryToCollection,
  removeEntryFromCollection,
  getCollectionsForEntry,
} from "@/lib/firebase/collections";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { COLLECTION_ICONS, COLLECTION_COLORS } from "@/lib/collectionConfig";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types/collection";

interface AddToCollectionSheetProps {
  entryId: string;
  entryTitle: string;
  onClose: () => void;
  onCreateNew: () => void;
}

export function AddToCollectionSheet({
  entryId,
  entryTitle,
  onClose,
  onCreateNew,
}: AddToCollectionSheetProps) {
  const { user } = useAuth();
  const { collections, loading } = useCollections(user?.uid);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Colecciones que ya contienen esta entry
  const activeCollections = getCollectionsForEntry(collections, entryId);
  const activeIds = new Set(activeCollections.map((c) => c.id));

  async function handleToggle(col: Collection) {
    if (!user || togglingId) return;
    setTogglingId(col.id);
    try {
      if (activeIds.has(col.id)) {
        await removeEntryFromCollection(user.uid, col.id, entryId);
      } else {
        await addEntryToCollection(user.uid, col.id, entryId);
      }
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-neutral-900 rounded-t-3xl border-t border-neutral-800 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-none">
          <div>
            <div className="w-10 h-1 rounded-full bg-neutral-700 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-neutral-100">
              Agregar a lista
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-64">
              {entryTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Lista de colecciones */}
        <div className="overflow-y-auto flex-1 px-5 pb-4 flex flex-col gap-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-neutral-600" />
            </div>
          ) : (
            collections.map((col) => {
              const Icon = COLLECTION_ICONS[col.icon];
              const colors = COLLECTION_COLORS[col.color] ?? COLLECTION_COLORS.neutral;
              const isActive = activeIds.has(col.id);
              const isToggling = togglingId === col.id;

              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleToggle(col)}
                  disabled={!!togglingId}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border",
                    "text-left transition-all duration-150",
                    isActive
                      ? [colors.bg, colors.border]
                      : "bg-neutral-800/50 border-neutral-700/50 hover:border-neutral-600",
                    "disabled:opacity-60"
                  )}
                >
                  {/* Ícono */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center flex-none",
                      isActive ? colors.bg : "bg-neutral-700/50"
                    )}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      className={isActive ? colors.text : "text-neutral-500"}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isActive ? colors.text : "text-neutral-300"
                      )}
                    >
                      {col.name}
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {col.entryIds.length}{" "}
                      {col.entryIds.length === 1 ? "obra" : "obras"}
                    </p>
                  </div>

                  {/* Estado */}
                  <div className="flex-none">
                    {isToggling ? (
                      <Loader2
                        size={15}
                        strokeWidth={1.5}
                        className="animate-spin text-neutral-500"
                      />
                    ) : isActive ? (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center",
                          colors.bg
                        )}
                      >
                        <Check
                          size={13}
                          strokeWidth={2.5}
                          className={colors.text}
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-neutral-700" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Crear nueva lista */}
        <div className="px-5 pb-8 pt-2 border-t border-neutral-800 flex-none">
          <button
            type="button"
            onClick={onCreateNew}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-11 rounded-2xl",
              "border border-dashed border-neutral-700",
              "text-sm text-neutral-500 hover:text-neutral-300 hover:border-neutral-500",
              "transition-colors duration-150"
            )}
          >
            <Plus size={15} strokeWidth={1.5} />
            Nueva lista
          </button>
        </div>
      </div>
    </div>
  );
}
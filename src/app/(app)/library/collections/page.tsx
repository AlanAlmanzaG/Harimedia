// src/app/(app)/library/collections/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pin, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCollections } from "@/hooks/useCollections";
import { deleteCollection, updateCollection } from "@/lib/firebase/collections";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { COLLECTION_ICONS, COLLECTION_COLORS } from "@/lib/collectionConfig";
import { cn } from "@/lib/utils";
import type { Collection } from "@/types/collection";

export default function CollectionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { collections, loading } = useCollections(user?.uid);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-header */}
      <div className="sticky top-14 z-30 bg-neutral-950/95 backdrop-blur-sm px-4 py-3 border-b border-neutral-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <h1 className="text-sm font-semibold text-neutral-100">Mis listas</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
        >
          <Plus size={15} strokeWidth={2} />
          Nueva
        </button>
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-3 px-4 pt-5 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-neutral-600" />
          </div>
        ) : (
          collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              uid={user?.uid ?? ""}
              onOpen={() => router.push(`/library/collections/${col.id}`)}
            />
          ))
        )}
      </div>

      {showCreate && (
        <CreateCollectionModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

// ─── Tarjeta de colección ─────────────────────────────────────────────────────

function CollectionCard({
  collection: col,
  uid,
  onOpen,
}: {
  collection: Collection;
  uid: string;
  onOpen: () => void;
}) {
  const Icon = COLLECTION_ICONS[col.icon];
  const colors = COLLECTION_COLORS[col.color] ?? COLLECTION_COLORS.neutral;
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCollection(uid, col.id);
    } finally {
      setDeleting(false);
    }
  }

  async function handleTogglePin() {
    await updateCollection(uid, col.id, { isPinned: !col.isPinned });
  }

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden",
        "bg-neutral-900 border-neutral-800/60"
      )}
    >
      {/* Fila principal — clickeable */}
      <button
        type="button"
        onClick={onOpen}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-neutral-800/30 transition-colors"
      >
        {/* Ícono */}
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-none",
            colors.bg
          )}
        >
          <Icon size={20} strokeWidth={1.5} className={colors.text} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-neutral-100 truncate">
              {col.name}
            </p>
            {col.isPinned && (
              <Pin size={11} strokeWidth={1.5} className="text-neutral-600 flex-none" />
            )}
          </div>
          {col.description && (
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              {col.description}
            </p>
          )}
          <p className="text-[11px] text-neutral-600 mt-1">
            {col.entryIds.length}{" "}
            {col.entryIds.length === 1 ? "obra" : "obras"}
          </p>
        </div>

        {/* Flecha */}
        <div className={cn("w-2 h-2 rounded-full flex-none", colors.dot)} />
      </button>

      {/* Acciones — solo para listas no predefinidas */}
      {!col.isDefault && (
        <div className="flex border-t border-neutral-800/60">
          <button
            type="button"
            onClick={handleTogglePin}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <Pin size={12} strokeWidth={1.5} />
            {col.isPinned ? "Desfijar" : "Fijar"}
          </button>

          <div className="w-px bg-neutral-800" />

          {!showConfirm ? (
            <button
              type="button"
              onClick={() => {
                setShowConfirm(true);
                setTimeout(() => setShowConfirm(false), 3000);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-neutral-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} strokeWidth={1.5} />
              Eliminar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-red-400 font-medium transition-colors"
            >
              {deleting ? (
                <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />
              ) : (
                "Confirmar"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
// src/components/collections/CreateCollectionModal.tsx
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createCollection } from "@/lib/firebase/collections";
import { useAuth } from "@/hooks/useAuth";
import {
  COLLECTION_ICONS,
  COLLECTION_COLORS,
  COLOR_KEYS,
  ICON_KEYS,
} from "@/lib/collectionConfig";
import { cn } from "@/lib/utils";
import type { CollectionIcon } from "@/types/collection";

interface CreateCollectionModalProps {
  onClose: () => void;
  onCreated?: (colId: string) => void;
}

export function CreateCollectionModal({
  onClose,
  onCreated,
}: CreateCollectionModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<CollectionIcon>("list");
  const [color, setColor] = useState("violet");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!user || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const colId = await createCollection(user.uid, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        entryIds: [],
        isPinned: false,
        isDefault: false,
      });
      onCreated?.(colId);
      onClose();
    } catch {
      setError("No se pudo crear la lista. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  const selectedColors = COLLECTION_COLORS[color];
  const SelectedIcon = COLLECTION_ICONS[icon];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-neutral-900 rounded-t-3xl border-t border-neutral-800 px-5 pt-5 pb-10 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="w-10 h-1 rounded-full bg-neutral-700 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-neutral-100">
              Nueva lista
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Preview */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl border",
            selectedColors.bg,
            selectedColors.border
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              selectedColors.bg
            )}
          >
            <SelectedIcon
              size={18}
              strokeWidth={1.5}
              className={selectedColors.text}
            />
          </div>
          <div>
            <p className={cn("text-sm font-semibold", selectedColors.text)}>
              {name || "Nombre de la lista"}
            </p>
            <p className="text-xs text-neutral-600">
              {description || "Sin descripción"}
            </p>
          </div>
        </div>

        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-500">Nombre</label>
          <input
            type="text"
            placeholder="Mis favoritos de 2024..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className={cn(
              "w-full h-11 px-4 rounded-xl text-sm",
              "bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder:text-neutral-600",
              "focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
            )}
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-500">
            Descripción{" "}
            <span className="text-neutral-700">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="Una breve descripción..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={80}
            className={cn(
              "w-full h-11 px-4 rounded-xl text-sm",
              "bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder:text-neutral-600",
              "focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
            )}
          />
        </div>

        {/* Selector de color */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-500">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_KEYS.map((key) => {
              const c = COLLECTION_COLORS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all duration-150",
                    c.dot,
                    color === key
                      ? "border-white scale-110"
                      : "border-transparent opacity-60 hover:opacity-90"
                  )}
                  aria-label={key}
                />
              );
            })}
          </div>
        </div>

        {/* Selector de ícono */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-neutral-500">Ícono</label>
          <div className="flex gap-2 flex-wrap">
            {ICON_KEYS.map((key) => {
              const Icon = COLLECTION_ICONS[key];
              const isSelected = icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    "border transition-all duration-150",
                    isSelected
                      ? [selectedColors.bg, selectedColors.border, selectedColors.text]
                      : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-neutral-300"
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Botón crear */}
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving || !name.trim()}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-semibold",
            "bg-violet-600 text-white hover:bg-violet-500",
            "flex items-center justify-center gap-2",
            "transition-all duration-150 active:scale-[0.98]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {saving ? (
            <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
          ) : (
            "Crear lista"
          )}
        </button>
      </div>
    </div>
  );
}
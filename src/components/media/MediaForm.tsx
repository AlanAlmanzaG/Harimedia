// src/components/media/MediaForm.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Calendar, FileText, Save, Loader2 } from "lucide-react";
import { addEntry, updateEntry } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { DynamicFields } from "./fields/DynamicFields";
import { RatingPicker } from "@/components/ui/RatingPicker";
import { STATUS_CONFIG, MEDIA_TYPE_CONFIG } from "@/lib/mediaConfig";
import { cn } from "@/lib/utils";
import type {
  MediaEntry,
  MediaType,
  MediaStatus,
  DynamicFields as DynamicFieldsType,
  SearchResult,
} from "@/types/media";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaFormProps {
  /** Si viene de búsqueda externa, pre-rellena el formulario */
  prefill?: SearchResult;
  /** Si se pasa una entry existente, entra en modo edición */
  existingEntry?: MediaEntry;
  onSuccess?: (entryId: string) => void;
}

const ALL_STATUSES: MediaStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "PAUSED",
  "COMPLETED",
  "ABANDONED",
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function MediaForm({ prefill, existingEntry, onSuccess }: MediaFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Inicializar desde prefill (búsqueda) o entry existente
  const initial = existingEntry ?? prefillToDefaults(prefill);

  const [title, setTitle] = useState(initial.title ?? "");
  const [synopsis, setSynopsis] = useState(initial.synopsis ?? "");
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl ?? "");
  const [mediaType] = useState<MediaType>(
    initial.mediaType ?? prefill?.mediaType ?? "MOVIE"
  );
  const [status, setStatus] = useState<MediaStatus>(initial.status ?? "PENDING");
  const [rating, setRating] = useState<number | undefined>(initial.rating);
  const [review, setReview] = useState(initial.review ?? "");
  const [startDate, setStartDate] = useState(
    initial.startDate ? toInputDate(initial.startDate) : ""
  );
  const [endDate, setEndDate] = useState(
    initial.endDate ? toInputDate(initial.endDate) : ""
  );
  const [dynamicFields, setDynamicFields] = useState<Partial<DynamicFieldsType>>(
    (initial.dynamicFields as Partial<DynamicFieldsType>) ??
      prefill?.suggestedFields ??
      {}
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeConfig = MEDIA_TYPE_CONFIG[mediaType];
  const isEditing = !!existingEntry;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      mediaType,
      title: title.trim(),
      synopsis,
      coverUrl,
      status,
      rating,
      review,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      dynamicFields: dynamicFields as DynamicFieldsType,
      externalId: prefill?.externalId ?? existingEntry?.externalId,
      externalSource: prefill?.source ?? existingEntry?.externalSource,
    };

    try {
      let entryId: string;
      if (isEditing && existingEntry) {
        await updateEntry(user.uid, existingEntry.id, payload);
        entryId = existingEntry.id;
      } else {
        entryId = await addEntry(user.uid, payload as any);
      }
      onSuccess?.(entryId);
      router.push(`/library/${entryId}`);
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-4 pb-10">
      {/* ── Portada + título ──────────────────────────────────────────── */}
      <div className="flex gap-3 pt-4">
        <div className="relative w-20 h-28 flex-none rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/60">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <typeConfig.icon
                size={24}
                strokeWidth={1}
                className="text-neutral-600"
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2 justify-center">
          {/* Badge de tipo (no editable desde aquí) */}
          <div
            className={cn(
              "flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg text-xs font-medium",
              typeConfig.bgColor,
              typeConfig.color
            )}
          >
            <typeConfig.icon size={12} strokeWidth={2} />
            {typeConfig.label}
          </div>

          <input
            type="text"
            placeholder="Título de la obra"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={cn(
              "w-full h-11 px-3.5 rounded-xl text-sm font-medium",
              "bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600",
              "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
              "transition-colors duration-150"
            )}
          />
        </div>
      </div>

      {/* ── Estado ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-400">Estado</label>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MediaStatus)}
            className={cn(
              "w-full h-11 pl-3.5 pr-10 rounded-xl text-sm appearance-none",
              "bg-neutral-900 border border-neutral-800 text-neutral-100",
              "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
              "transition-colors duration-150"
            )}
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
        </div>
      </div>

      {/* ── Campos dinámicos por tipo ─────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-400 mb-1">
          Detalles de seguimiento
        </label>
        <DynamicFields
          mediaType={mediaType}
          value={dynamicFields}
          onChange={setDynamicFields}
        />
      </div>

      {/* ── Fechas ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <Calendar size={12} strokeWidth={1.5} />
            Inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={cn(
              "w-full h-11 px-3.5 rounded-xl text-sm",
              "bg-neutral-900 border border-neutral-800 text-neutral-100",
              "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
              "[color-scheme:dark]"
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <Calendar size={12} strokeWidth={1.5} />
            Fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={cn(
              "w-full h-11 px-3.5 rounded-xl text-sm",
              "bg-neutral-900 border border-neutral-800 text-neutral-100",
              "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
              "[color-scheme:dark]"
            )}
          />
        </div>
      </div>

      {/* ── Calificación ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-neutral-400">
          Calificación
        </label>
        <RatingPicker value={rating} onChange={setRating} />
      </div>

      {/* ── Sinopsis ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-400">Sinopsis</label>
        <textarea
          placeholder="Sinopsis de la obra..."
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          rows={3}
          className={cn(
            "w-full px-3.5 py-3 rounded-xl text-sm resize-none",
            "bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600",
            "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
            "transition-colors duration-150"
          )}
        />
      </div>

      {/* ── Reseña personal ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
          <FileText size={12} strokeWidth={1.5} />
          Reseña personal
        </label>
        <textarea
          placeholder="¿Qué te pareció? Escribe tus notas..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          className={cn(
            "w-full px-3.5 py-3 rounded-xl text-sm resize-none",
            "bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600",
            "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
            "transition-colors duration-150"
          )}
        />
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {/* ── Botón guardar ────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={saving}
        className={cn(
          "w-full h-13 rounded-2xl text-sm font-semibold",
          "bg-violet-600 text-white",
          "flex items-center justify-center gap-2",
          "hover:bg-violet-500 active:scale-[0.98]",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {saving ? (
          <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />
        ) : (
          <>
            <Save size={16} strokeWidth={1.5} />
            {isEditing ? "Guardar cambios" : "Agregar a mi biblioteca"}
          </>
        )}
      </button>
    </form>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prefillToDefaults(prefill?: SearchResult): Partial<MediaEntry> {
  if (!prefill) return {};
  return {
    title: prefill.title,
    synopsis: prefill.synopsis,
    coverUrl: prefill.coverUrl,
    mediaType: prefill.mediaType,
    status: "PENDING",
    dynamicFields: prefill.suggestedFields as any,
  };
}

function toInputDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
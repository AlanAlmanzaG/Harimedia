// src/components/media/MediaDetail.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2,
  Trash2,
  ChevronDown,
  Calendar,
  Star,
  FileText,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { updateEntry, deleteEntry } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { MEDIA_TYPE_CONFIG, STATUS_CONFIG, getProgressInfo } from "@/lib/mediaConfig";
import { cn } from "@/lib/utils";
import type { MediaEntry, MediaStatus, DynamicFields } from "@/types/media";
import type { SeriesFields, AnimeFields, MangaFields, MovieFields } from "@/types/media";

interface MediaDetailProps {
  entry: MediaEntry;
}

const ALL_STATUSES: MediaStatus[] = [
  "PENDING", "IN_PROGRESS", "PAUSED", "COMPLETED", "ABANDONED",
];

export function MediaDetail({ entry }: MediaDetailProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [status, setStatus] = useState<MediaStatus>(entry.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Para actualización rápida de progreso (series/anime/manga)
  const progress = getProgressInfo(entry.mediaType, entry.dynamicFields);
  const [currentProgress, setCurrentProgress] = useState(
    progress?.current ?? 0
  );
  const [savingProgress, setSavingProgress] = useState(false);

  const typeConfig = MEDIA_TYPE_CONFIG[entry.mediaType];
  const statusConfig = STATUS_CONFIG[status];

  // ── Cambio de estado ───────────────────────────────────────────────────────
  async function handleStatusChange(newStatus: MediaStatus) {
    if (!user || newStatus === status) return;
    setSavingStatus(true);
    try {
      await updateEntry(user.uid, entry.id, { status: newStatus });
      setStatus(newStatus);
    } finally {
      setSavingStatus(false);
    }
  }

  // ── Actualización rápida de progreso ───────────────────────────────────────
  async function handleProgressSave() {
    if (!user || !progress) return;
    setSavingProgress(true);

    const progressKey =
      entry.mediaType === "MANGA" || entry.mediaType === "MANHWA"
        ? "chaptersRead"
        : "episodesWatched";

    try {
      await updateEntry(user.uid, entry.id, {
        dynamicFields: {
          ...entry.dynamicFields,
          [progressKey]: currentProgress,
        } as DynamicFields,
      });
    } finally {
      setSavingProgress(false);
    }
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteEntry(user.uid, entry.id);
      router.replace("/library");
    } finally {
      setDeleting(false);
    }
  }

  const progressPct =
    progress?.total
      ? Math.min(100, Math.round((currentProgress / progress.total) * 100))
      : null;

  return (
    <div className="flex flex-col pb-10">
      {/* ── Hero con portada ──────────────────────────────────────────── */}
      <div className="relative w-full">
        {/* Fondo difuminado */}
        {entry.coverUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={entry.coverUrl}
              alt=""
              fill
              className="object-cover blur-2xl scale-110 opacity-20"
              sizes="100vw"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/60 to-neutral-950" />
          </div>
        )}

        <div className="relative flex gap-4 px-4 pt-5 pb-6">
          {/* Portada */}
          <div className="relative w-28 h-40 flex-none rounded-2xl overflow-hidden bg-neutral-800 shadow-xl border border-white/10">
            {entry.coverUrl ? (
              <Image
                src={entry.coverUrl}
                alt={entry.title}
                fill
                className="object-cover"
                sizes="112px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <typeConfig.icon size={32} strokeWidth={1} className="text-neutral-600" />
              </div>
            )}
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0 flex flex-col justify-end gap-2">
            {/* Badge tipo */}
            <div
              className={cn(
                "flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg text-xs font-medium",
                typeConfig.bgColor, typeConfig.color
              )}
            >
              <typeConfig.icon size={11} strokeWidth={2} />
              {typeConfig.label}
            </div>

            <h1 className="text-lg font-bold text-neutral-100 leading-tight">
              {entry.title}
            </h1>

            {entry.year && (
              <p className="text-xs text-neutral-500">{entry.year}</p>
            )}

            {/* Calificación */}
            {entry.rating != null && (
              <div className="flex items-center gap-1.5">
                <Star size={13} strokeWidth={1.5} className="text-yellow-400 fill-yellow-400/30" />
                <span className="text-sm font-semibold text-yellow-400">
                  {entry.rating}
                </span>
                <span className="text-xs text-neutral-600">/10</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Estado ───────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as MediaStatus)}
              disabled={savingStatus}
              className={cn(
                "w-full h-10 pl-3 pr-8 rounded-xl text-sm appearance-none",
                "border transition-colors duration-150",
                "bg-neutral-900 text-neutral-100",
                "focus:outline-none focus:ring-1 focus:ring-violet-500",
                "disabled:opacity-50",
                statusConfig.color,
                "border-neutral-800"
              )}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s} className="text-neutral-100 bg-neutral-900">
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
            {savingStatus ? (
              <Loader2
                size={14}
                strokeWidth={1.5}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 animate-spin pointer-events-none"
              />
            ) : (
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
            )}
          </div>

          {/* Botón editar */}
          <button
            type="button"
            onClick={() => router.push(`/library/${entry.id}/edit`)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="Editar"
          >
            <Edit2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Progreso rápido (series/anime/manga) ──────────────────────── */}
      {progress && (
        <div className="mx-4 mb-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} strokeWidth={1.5} className="text-violet-400" />
              <p className="text-xs font-medium text-neutral-300">Progreso</p>
            </div>
            <p className="text-xs text-neutral-500 tabular-nums">
              {currentProgress}
              {progress.total ? `/${progress.total}` : ""}{" "}
              {progress.unit}
              {progressPct !== null && (
                <span className="ml-1 text-violet-400">{progressPct}%</span>
              )}
            </p>
          </div>

          {/* Barra de progreso visual */}
          {progressPct !== null && (
            <div className="h-1.5 w-full rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}

          {/* Control +/- */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentProgress((v) => Math.max(0, v - 1))}
              className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-lg font-medium hover:bg-neutral-700 transition-colors flex items-center justify-center"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={progress.total ?? undefined}
              value={currentProgress}
              onChange={(e) =>
                setCurrentProgress(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="flex-1 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={() =>
                setCurrentProgress((v) =>
                  progress.total ? Math.min(progress.total, v + 1) : v + 1
                )
              }
              className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-300 text-lg font-medium hover:bg-neutral-700 transition-colors flex items-center justify-center"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleProgressSave}
              disabled={savingProgress || currentProgress === progress.current}
              className={cn(
                "h-9 px-3 rounded-xl text-xs font-medium transition-all duration-150",
                currentProgress !== progress.current
                  ? "bg-violet-600 text-white hover:bg-violet-500"
                  : "bg-neutral-800 text-neutral-600 border border-neutral-700 cursor-default",
                "disabled:opacity-50"
              )}
            >
              {savingProgress ? (
                <Loader2 size={13} strokeWidth={1.5} className="animate-spin" />
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Detalles específicos del tipo ─────────────────────────────── */}
      <DynamicDetails entry={entry} />

      {/* ── Fechas ───────────────────────────────────────────────────── */}
      {(entry.startDate || entry.endDate) && (
        <div className="mx-4 mb-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar size={14} strokeWidth={1.5} className="text-neutral-500" />
            <p className="text-xs font-medium text-neutral-300">Fechas</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {entry.startDate && (
              <div>
                <p className="text-[10px] text-neutral-600 mb-0.5">Inicio</p>
                <p className="text-sm text-neutral-300">
                  {formatDate(entry.startDate)}
                </p>
              </div>
            )}
            {entry.endDate && (
              <div>
                <p className="text-[10px] text-neutral-600 mb-0.5">Fin</p>
                <p className="text-sm text-neutral-300">
                  {formatDate(entry.endDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sinopsis ─────────────────────────────────────────────────── */}
      {entry.synopsis && (
        <div className="mx-4 mb-4">
          <p className="text-xs font-medium text-neutral-500 mb-2">Sinopsis</p>
          <p className="text-sm text-neutral-400 leading-relaxed">
            {entry.synopsis}
          </p>
        </div>
      )}

      {/* ── Reseña personal ──────────────────────────────────────────── */}
      {entry.review && (
        <div className="mx-4 mb-4 rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <FileText size={14} strokeWidth={1.5} className="text-neutral-500" />
            <p className="text-xs font-medium text-neutral-300">Reseña personal</p>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed italic">
            "{entry.review}"
          </p>
        </div>
      )}

      {/* ── Géneros ──────────────────────────────────────────────────── */}
      {entry.genres && entry.genres.length > 0 && (
        <div className="mx-4 mb-4 flex flex-wrap gap-1.5">
          {entry.genres.map((g) => (
            <span
              key={g}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-400"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {/* ── Eliminar ─────────────────────────────────────────────────── */}
      <div className="mx-4 mt-4">
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            Eliminar de la biblioteca
          </button>
        ) : (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} strokeWidth={1.5} className="text-red-400 flex-none" />
              <p className="text-sm text-red-300 font-medium">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl bg-red-600 text-sm text-white font-medium hover:bg-red-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detalles dinámicos por tipo ──────────────────────────────────────────────

function DynamicDetails({ entry }: { entry: MediaEntry }) {
  const fields = entry.dynamicFields;
  if (!fields) return null;

  const rows: { label: string; value: string | number }[] = [];

  switch (entry.mediaType) {
    case "MOVIE": {
      const f = fields as MovieFields;
      if (f.director) rows.push({ label: "Director", value: f.director });
      if (f.duration) rows.push({ label: "Duración", value: `${f.duration} min` });
      break;
    }
    case "SERIES":
    case "CARTOON": {
      const f = fields as SeriesFields;
      if (f.totalSeasons) rows.push({ label: "Temporadas", value: f.totalSeasons });
      if (f.network) rows.push({ label: "Plataforma", value: f.network });
      break;
    }
    case "ANIME": {
      const f = fields as AnimeFields;
      if (f.studio) rows.push({ label: "Estudio", value: f.studio });
      if (f.season) rows.push({ label: "Temporada", value: f.season });
      if (f.source) rows.push({ label: "Fuente", value: f.source });
      break;
    }
    case "MANGA":
    case "MANHWA": {
      const f = fields as MangaFields;
      if (f.author) rows.push({ label: "Autor", value: f.author });
      if (f.illustrator) rows.push({ label: "Ilustrador", value: f.illustrator });
      if (f.volumes) rows.push({ label: "Volúmenes", value: f.volumes });
      if (f.demographic) rows.push({ label: "Demografía", value: f.demographic });
      break;
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-neutral-900 border border-neutral-800 divide-y divide-neutral-800/60">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between px-4 py-3">
          <p className="text-xs text-neutral-500">{label}</p>
          <p className="text-xs font-medium text-neutral-300">{value}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
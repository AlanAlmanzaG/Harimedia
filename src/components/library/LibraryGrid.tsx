// src/components/library/LibraryGrid.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MEDIA_TYPE_CONFIG, STATUS_CONFIG, getProgressInfo } from "@/lib/mediaConfig";
import type { MediaEntry } from "@/types/media";

interface LibraryGridProps {
  entries: MediaEntry[];
  loading?: boolean;
}

export function LibraryGrid({ entries, loading }: LibraryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <EmptyGrid />;
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {entries.map((entry) => (
        <LibraryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

// ─── Tarjeta ──────────────────────────────────────────────────────────────────

function LibraryCard({ entry }: { entry: MediaEntry }) {
  const typeConfig = MEDIA_TYPE_CONFIG[entry.mediaType];
  const statusConfig = STATUS_CONFIG[entry.status];
  const progress = getProgressInfo(entry.mediaType, entry.dynamicFields);
  const progressPct =
    progress?.total
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : null;

  return (
    <Link
      href={`/library/${entry.id}`}
      className="flex flex-col rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/60 group active:scale-[0.96] transition-transform duration-150"
    >
      {/* Portada */}
      <div className="relative w-full aspect-[2/3] bg-neutral-800">
        {entry.coverUrl ? (
          <Image
            src={entry.coverUrl}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 160px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <typeConfig.icon
              size={24}
              strokeWidth={1}
              className="text-neutral-700"
            />
          </div>
        )}

        {/* Barra de progreso */}
        {progressPct !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/40">
            <div
              className="h-full bg-violet-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Punto de estado (esquina superior derecha) */}
        <div className="absolute top-1.5 right-1.5">
          <span
            className={cn(
              "block w-2 h-2 rounded-full ring-1 ring-black/30",
              statusConfig.dotColor
            )}
          />
        </div>

        {/* Calificación (si existe) */}
        {entry.rating != null && (
          <div className="absolute bottom-2 left-2 flex items-baseline gap-0.5 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="text-[11px] font-bold text-white leading-none">
              {entry.rating}
            </span>
            <span className="text-[9px] text-neutral-400 leading-none">/10</span>
          </div>
        )}
      </div>

      {/* Título */}
      <div className="px-2 py-2">
        <p className="text-[11px] font-medium text-neutral-200 line-clamp-2 leading-tight">
          {entry.title}
        </p>
        <p className={cn("text-[10px] mt-0.5", typeConfig.color)}>
          {typeConfig.label}
        </p>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800/60">
      <div className="w-full aspect-[2/3] bg-neutral-800 animate-pulse" />
      <div className="px-2 py-2 flex flex-col gap-1.5">
        <div className="h-3 w-full rounded bg-neutral-800 animate-pulse" />
        <div className="h-2.5 w-2/3 rounded bg-neutral-800 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyGrid() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
        <span className="text-2xl text-neutral-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </span>
      </div>
      <p className="text-sm text-neutral-500 leading-snug">
        Sin resultados para
        <br />
        estos filtros.
      </p>
    </div>
  );
}
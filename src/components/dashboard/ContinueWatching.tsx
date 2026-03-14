// src/components/dashboard/ContinueWatching.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MEDIA_TYPE_CONFIG,
  STATUS_CONFIG,
  getProgressInfo,
} from "@/lib/mediaConfig";
import type { MediaEntry } from "@/types/media";

interface ContinueWatchingProps {
  entries: MediaEntry[];
  loading?: boolean;
}

export function ContinueWatching({ entries, loading }: ContinueWatchingProps) {
  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-sm font-semibold text-neutral-200 tracking-tight">
          Continuar
        </h2>
        <Link
          href="/library?status=IN_PROGRESS"
          className="text-xs text-neutral-500 hover:text-violet-400 transition-colors"
        >
          Ver todo
        </Link>
      </div>

      {/* Scroll horizontal */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none snap-x snap-mandatory">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : entries.length === 0
          ? <EmptyState />
          : entries.map((entry) => (
              <ContinueCard key={entry.id} entry={entry} />
            ))}
      </div>
    </section>
  );
}

// ─── Tarjeta individual ───────────────────────────────────────────────────────

function ContinueCard({ entry }: { entry: MediaEntry }) {
  const typeConfig = MEDIA_TYPE_CONFIG[entry.mediaType];
  const progress = getProgressInfo(entry.mediaType, entry.dynamicFields);
  const progressPct =
    progress && progress.total
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : null;

  const isReader = entry.mediaType === "MANGA" || entry.mediaType === "MANHWA";
  const ActionIcon = isReader ? BookOpen : Play;

  return (
    <Link
      href={`/library/${entry.id}`}
      className={cn(
        "relative flex-none w-36 rounded-2xl overflow-hidden",
        "bg-neutral-900 border border-neutral-800/60",
        "snap-start group",
        "transition-transform duration-150 active:scale-[0.97]"
      )}
    >
      {/* Portada */}
      <div className="relative w-full aspect-[2/3] bg-neutral-800">
        {entry.coverUrl ? (
          <Image
            src={entry.coverUrl}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="144px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <typeConfig.icon
              size={28}
              strokeWidth={1}
              className="text-neutral-700"
            />
          </div>
        )}

        {/* Barra de progreso inferior */}
        {progressPct !== null && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-700/60">
            <div
              className="h-full bg-violet-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Badge de tipo */}
        <div
          className={cn(
            "absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md",
            "text-[10px] font-medium backdrop-blur-sm",
            typeConfig.bgColor,
            typeConfig.color,
            "border",
            typeConfig.borderColor
          )}
        >
          <typeConfig.icon size={10} strokeWidth={2} />
          {typeConfig.label}
        </div>

        {/* Overlay con botón de acción */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-violet-600/90 flex items-center justify-center">
            <ActionIcon size={18} strokeWidth={1.5} className="text-white" />
          </div>
        </div>
      </div>

      {/* Info inferior */}
      <div className="px-2.5 py-2.5">
        <p className="text-xs font-medium text-neutral-200 leading-snug line-clamp-2 mb-1.5">
          {entry.title}
        </p>

        {/* Progreso en texto */}
        {progress && (
          <p className="text-[10px] text-neutral-500 tabular-nums">
            {progress.current}
            {progress.total ? `/${progress.total}` : ""}{" "}
            {progress.unit}
            {progressPct !== null && (
              <span className="ml-1 text-violet-400">{progressPct}%</span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex-none w-36 rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800/60 snap-start">
      <div className="w-full aspect-[2/3] bg-neutral-800 animate-pulse" />
      <div className="px-2.5 py-2.5 flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-neutral-800 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-neutral-800 animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-neutral-800 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center min-h-[180px]">
      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mb-3">
        <Play size={18} strokeWidth={1.5} className="text-neutral-600" />
      </div>
      <p className="text-sm text-neutral-600 leading-snug">
        Nada en progreso.
        <br />
        Agrega una obra para empezar.
      </p>
    </div>
  );
}
// src/components/dashboard/RecentActivity.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MEDIA_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/mediaConfig";
import type { MediaEntry } from "@/types/media";

interface RecentActivityProps {
  entries: MediaEntry[];
  loading?: boolean;
}

export function RecentActivity({ entries, loading }: RecentActivityProps) {
  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-200 tracking-tight">
          Actividad reciente
        </h2>
        <Link
          href="/library"
          className="text-xs text-neutral-500 hover:text-violet-400 transition-colors"
        >
          Ver todo
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-neutral-800/60">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          : entries.length === 0
          ? <EmptyState />
          : entries.map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
      </div>
    </section>
  );
}

// ─── Fila individual ──────────────────────────────────────────────────────────

function ActivityRow({ entry }: { entry: MediaEntry }) {
  const typeConfig = MEDIA_TYPE_CONFIG[entry.mediaType];
  const statusConfig = STATUS_CONFIG[entry.status];

  const timeAgo = entry.updatedAt ? formatTimeAgo(entry.updatedAt) : null;

  return (
    <Link
      href={`/library/${entry.id}`}
      className={cn(
        "flex items-center gap-3 py-3",
        "transition-opacity duration-150 active:opacity-60"
      )}
    >
      {/* Miniatura o placeholder */}
      <div className="relative w-10 h-14 flex-none rounded-lg overflow-hidden bg-neutral-800">
        {entry.coverUrl ? (
          <Image
            src={entry.coverUrl}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <typeConfig.icon
              size={16}
              strokeWidth={1.5}
              className="text-neutral-600"
            />
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-200 truncate leading-tight mb-1">
          {entry.title}
        </p>

        <div className="flex items-center gap-2">
          {/* Tipo */}
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
              typeConfig.bgColor,
              typeConfig.color
            )}
          >
            {typeConfig.label}
          </span>

          {/* Estado */}
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full flex-none",
                statusConfig.dotColor
              )}
            />
            <span className={cn("text-[10px]", statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tiempo */}
      {timeAgo && (
        <span className="text-[10px] text-neutral-600 flex-none">{timeAgo}</span>
      )}

      {/* Calificación */}
      {entry.rating != null && (
        <div className="flex items-center gap-0.5 flex-none">
          <span className="text-xs font-semibold text-neutral-300">
            {entry.rating}
          </span>
          <span className="text-[10px] text-neutral-600">/10</span>
        </div>
      )}
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-10 h-14 flex-none rounded-lg bg-neutral-800 animate-pulse" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-3/4 rounded bg-neutral-800 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-neutral-800 animate-pulse" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-neutral-600">
        Tu bitácora está vacía.
      </p>
    </div>
  );
}

// ─── Helper de tiempo ─────────────────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHrs < 24) return `${diffHrs}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}
// src/components/stats/TopRatedList.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { MEDIA_TYPE_CONFIG } from "@/lib/mediaConfig";
import { cn } from "@/lib/utils";
import type { TopEntry } from "@/hooks/useStats";

interface TopRatedListProps {
  entries: TopEntry[];
  loading?: boolean;
}

export function TopRatedList({ entries, loading }: TopRatedListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 text-center">
              <div className="h-3 w-4 mx-auto rounded bg-neutral-800 animate-pulse" />
            </div>
            <div className="w-9 h-12 rounded-lg bg-neutral-800 animate-pulse flex-none" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-3/4 rounded bg-neutral-800 animate-pulse" />
              <div className="h-2.5 w-1/3 rounded bg-neutral-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-600 text-center py-4">
        Califica obras para ver tu ranking.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0 divide-y divide-neutral-800/50">
      {entries.map((entry, i) => {
        const typeConfig = MEDIA_TYPE_CONFIG[entry.mediaType];
        return (
          <Link
            key={entry.id}
            href={`/library/${entry.id}`}
            className="flex items-center gap-3 py-3 active:opacity-60 transition-opacity"
          >
            {/* Posición */}
            <span
              className={cn(
                "w-6 text-center text-sm font-bold tabular-nums flex-none",
                i === 0
                  ? "text-yellow-400"
                  : i === 1
                  ? "text-neutral-400"
                  : i === 2
                  ? "text-orange-600"
                  : "text-neutral-700"
              )}
            >
              {i + 1}
            </span>

            {/* Portada */}
            <div className="relative w-9 h-12 flex-none rounded-lg overflow-hidden bg-neutral-800">
              {entry.coverUrl ? (
                <Image
                  src={entry.coverUrl}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <typeConfig.icon
                    size={14}
                    strokeWidth={1.5}
                    className="text-neutral-600"
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-200 truncate leading-tight">
                {entry.title}
              </p>
              <p className={cn("text-[11px] mt-0.5", typeConfig.color)}>
                {typeConfig.label}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 flex-none">
              <Star
                size={12}
                strokeWidth={1.5}
                className="text-yellow-400 fill-yellow-400/40"
              />
              <span className="text-sm font-semibold text-neutral-200 tabular-nums">
                {entry.rating}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
// src/components/media/SearchResultCard.tsx
"use client";

import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEDIA_TYPE_CONFIG } from "@/lib/mediaConfig";
import type { SearchResult } from "@/types/media";

interface SearchResultCardProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
  alreadyAdded?: boolean;
}

export function SearchResultCard({
  result,
  onSelect,
  alreadyAdded = false,
}: SearchResultCardProps) {
  const typeConfig = MEDIA_TYPE_CONFIG[result.mediaType];

  return (
    <button
      type="button"
      onClick={() => !alreadyAdded && onSelect(result)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl text-left",
        "border transition-all duration-150",
        alreadyAdded
          ? "bg-neutral-900/50 border-neutral-800/40 opacity-60 cursor-default"
          : "bg-neutral-900 border-neutral-800/60 hover:border-neutral-700 active:scale-[0.98] cursor-pointer"
      )}
    >
      {/* Portada */}
      <div className="relative w-12 h-[68px] flex-none rounded-lg overflow-hidden bg-neutral-800">
        {result.coverUrl && result.coverUrl !== "/placeholder-cover.png" ? (
          <Image
            src={result.coverUrl}
            alt={result.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <typeConfig.icon
              size={18}
              strokeWidth={1}
              className="text-neutral-600"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-100 leading-tight line-clamp-2 mb-1">
          {result.title}
        </p>

        <div className="flex items-center gap-2 mb-1.5">
          {result.year && (
            <span className="text-[11px] text-neutral-500">{result.year}</span>
          )}
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
              typeConfig.bgColor,
              typeConfig.color
            )}
          >
            {typeConfig.label}
          </span>
        </div>

        {result.synopsis && (
          <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
            {result.synopsis}
          </p>
        )}
      </div>

      {/* Acción */}
      <div className="flex-none ml-1">
        {alreadyAdded ? (
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Check size={14} strokeWidth={2} className="text-emerald-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
            <Plus size={16} strokeWidth={2} className="text-white" />
          </div>
        )}
      </div>
    </button>
  );
}
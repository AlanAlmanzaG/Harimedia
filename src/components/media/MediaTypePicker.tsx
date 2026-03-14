// src/components/media/MediaTypePicker.tsx
"use client";

import { MEDIA_TYPE_CONFIG } from "@/lib/mediaConfig";
import type { MediaType } from "@/types/media";
import { cn } from "@/lib/utils";

const TYPES: MediaType[] = [
  "MOVIE",
  "SERIES",
  "ANIME",
  "MANGA",
  "MANHWA",
  "CARTOON",
];

interface MediaTypePickerProps {
  value: MediaType;
  onChange: (type: MediaType) => void;
}

export function MediaTypePicker({ value, onChange }: MediaTypePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {TYPES.map((type) => {
        const config = MEDIA_TYPE_CONFIG[type];
        const isActive = value === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-full flex-none",
              "text-xs font-medium transition-all duration-150",
              "border",
              isActive
                ? [config.bgColor, config.color, config.borderColor]
                : "bg-transparent border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600"
            )}
          >
            <config.icon
              size={12}
              strokeWidth={isActive ? 2 : 1.5}
              aria-hidden="true"
            />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
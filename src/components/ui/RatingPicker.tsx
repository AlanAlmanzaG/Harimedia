// src/components/ui/RatingPicker.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RatingPickerProps {
  value: number | undefined;
  onChange: (rating: number | undefined) => void;
}

export function RatingPicker({ value, onChange }: RatingPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const filled = display !== undefined && n <= display;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(value === n ? undefined : n)}
              className={cn(
                "flex-1 h-8 rounded-lg text-xs font-semibold transition-all duration-100",
                "border",
                filled
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-neutral-900 border-neutral-800 text-neutral-600 hover:border-neutral-600 hover:text-neutral-400"
              )}
              aria-label={`Calificación ${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-neutral-600 text-center">
        {value === undefined
          ? "Sin calificación"
          : value <= 3
          ? `${value}/10 — Malo`
          : value <= 5
          ? `${value}/10 — Regular`
          : value <= 7
          ? `${value}/10 — Bueno`
          : value <= 9
          ? `${value}/10 — Excelente`
          : `${value}/10 — Obra maestra`}
      </p>
    </div>
  );
}
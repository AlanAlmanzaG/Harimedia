// src/components/stats/StatusBreakdown.tsx
"use client";

import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/mediaConfig";
import type { StatusDistribution } from "@/hooks/useStats";

interface StatusBreakdownProps {
  data: StatusDistribution[];
  total: number;
  loading?: boolean;
}

// Orden de visualización
const STATUS_ORDER = [
  "IN_PROGRESS",
  "COMPLETED",
  "PENDING",
  "PAUSED",
  "ABANDONED",
] as const;

export function StatusBreakdown({ data, total, loading }: StatusBreakdownProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-3 w-24 rounded bg-neutral-800 animate-pulse" />
            <div className="h-2 w-full rounded-full bg-neutral-800 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Mapa para acceso rápido
  const countMap = new Map(data.map((d) => [d.status, d.count]));
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {STATUS_ORDER.map((status) => {
        const count = countMap.get(status) ?? 0;
        if (count === 0) return null;

        const config = STATUS_CONFIG[status];
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const barWidth = Math.round((count / maxCount) * 100);

        return (
          <div key={status} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
                <span className="text-xs text-neutral-400">{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-300 tabular-nums">
                  {count}
                </span>
                <span className="text-[10px] text-neutral-600 tabular-nums w-8 text-right">
                  {pct}%
                </span>
              </div>
            </div>
            {/* Barra */}
            <div className="h-1.5 w-full rounded-full bg-neutral-800">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  status === "IN_PROGRESS" && "bg-emerald-400",
                  status === "COMPLETED"  && "bg-blue-400",
                  status === "PENDING"    && "bg-neutral-500",
                  status === "PAUSED"     && "bg-yellow-400",
                  status === "ABANDONED"  && "bg-red-400"
                )}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
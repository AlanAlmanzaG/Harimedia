// src/components/stats/StatsMetricCard.tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsMetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  accent?: boolean;
  loading?: boolean;
}

export function StatsMetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor = "text-neutral-400",
  accent = false,
  loading = false,
}: StatsMetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl p-4 border",
        accent
          ? "bg-violet-600/10 border-violet-500/25"
          : "bg-neutral-900 border-neutral-800/60"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg",
          accent ? "bg-violet-500/20" : "bg-neutral-800",
          iconColor
        )}
      >
        <Icon size={16} strokeWidth={1.5} />
      </div>

      {loading ? (
        <>
          <div className="h-7 w-16 rounded-md bg-neutral-800 animate-pulse" />
          <div className="h-3 w-20 rounded-md bg-neutral-800 animate-pulse" />
        </>
      ) : (
        <>
          <div>
            <p
              className={cn(
                "text-2xl font-semibold tracking-tight",
                accent ? "text-violet-300" : "text-neutral-100"
              )}
            >
              {value}
            </p>
            {sublabel && (
              <p className="text-[11px] text-neutral-600 mt-0.5">{sublabel}</p>
            )}
          </div>
          <p className="text-xs text-neutral-500 font-medium">{label}</p>
        </>
      )}
    </div>
  );
}
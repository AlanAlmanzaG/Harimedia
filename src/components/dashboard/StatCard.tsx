// src/components/dashboard/StatCard.tsx
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-neutral-400",
  loading = false,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-neutral-900 border border-neutral-800/60 p-4">
      <div className={cn("w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800", iconColor)}>
        <Icon size={16} strokeWidth={1.5} />
      </div>

      {loading ? (
        <>
          <div className="h-7 w-12 rounded-md bg-neutral-800 animate-pulse" />
          <div className="h-3 w-16 rounded-md bg-neutral-800 animate-pulse" />
        </>
      ) : (
        <>
          <span className="text-2xl font-semibold tracking-tight text-neutral-100">
            {value}
          </span>
          <span className="text-xs text-neutral-500 font-medium">{label}</span>
        </>
      )}
    </div>
  );
}
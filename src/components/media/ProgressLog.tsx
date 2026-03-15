// src/components/media/ProgressLog.tsx
"use client";

import { useState } from "react";
import {
  TrendingUp,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
} from "lucide-react";
import { deleteProgressLog } from "@/lib/firebase/progressLog";
import { useAuth } from "@/hooks/useAuth";
import { useProgressLog } from "@/hooks/useProgressLog";
import { cn } from "@/lib/utils";
import type { ProgressLogEntry } from "@/types/progressLog";

interface ProgressLogProps {
  entryId: string;
}

export function ProgressLog({ entryId }: ProgressLogProps) {
  const { user } = useAuth();
  const { logs, loading } = useProgressLog(user?.uid, entryId);
  const [expanded, setExpanded] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(logId: string) {
    if (!user) return;
    setDeletingId(logId);
    try {
      await deleteProgressLog(user.uid, entryId, logId);
    } finally {
      setDeletingId(null);
    }
  }

  // Agrupar logs por fecha (día)
  const grouped = groupByDay(logs);

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={14} strokeWidth={1.5} className="text-violet-400" />
          <span className="text-sm font-medium text-neutral-200">
            Historial de progreso
          </span>
          {logs.length > 0 && (
            <span className="text-xs text-neutral-600 bg-neutral-800 px-1.5 py-0.5 rounded-md tabular-nums">
              {logs.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={15} strokeWidth={1.5} className="text-neutral-600" />
        ) : (
          <ChevronDown size={15} strokeWidth={1.5} className="text-neutral-600" />
        )}
      </button>

      {/* Contenido */}
      {expanded && (
        <div className="border-t border-neutral-800">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-neutral-600" />
            </div>
          ) : logs.length === 0 ? (
            <EmptyLog />
          ) : (
            <div className="px-4 py-3 flex flex-col gap-5">
              {Object.entries(grouped).map(([dayKey, dayLogs]) => (
                <DayGroup
                  key={dayKey}
                  dayLabel={dayKey}
                  logs={dayLogs}
                  deletingId={deletingId}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Grupo por día ────────────────────────────────────────────────────────────

function DayGroup({
  dayLabel,
  logs,
  deletingId,
  onDelete,
}: {
  dayLabel: string;
  logs: ProgressLogEntry[];
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  // Cuánto avanzó en total ese día
  const dayDelta = logs.reduce((acc, l) => acc + l.delta, 0);
  const unit = logs[0]?.unit ?? "";

  return (
    <div className="flex flex-col gap-2">
      {/* Encabezado del día */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-500">{dayLabel}</p>
        {dayDelta > 0 && (
          <span className="text-[10px] text-violet-400 tabular-nums">
            +{dayDelta} {unit} ese día
          </span>
        )}
      </div>

      {/* Entradas del día */}
      <div className="flex flex-col gap-1.5">
        {logs.map((log) => (
          <LogRow
            key={log.id}
            log={log}
            isDeleting={deletingId === log.id}
            onDelete={() => onDelete(log.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Fila individual de log ───────────────────────────────────────────────────

function LogRow({
  log,
  isDeleting,
  onDelete,
}: {
  log: ProgressLogEntry;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const time = log.date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl",
        "bg-neutral-800/50 border border-neutral-800",
        "transition-opacity duration-150",
        isDeleting && "opacity-40"
      )}
    >
      {/* Indicador de avance */}
      <div className="flex-none flex flex-col items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-neutral-200 tabular-nums">
            {log.previousValue} → {log.newValue} {log.unit}
          </span>
          {log.delta > 0 && (
            <span className="text-[10px] text-violet-400 tabular-nums">
              +{log.delta}
            </span>
          )}
        </div>

        {log.note && (
          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
            {log.note}
          </p>
        )}
      </div>

      {/* Hora */}
      <span className="text-[10px] text-neutral-600 tabular-nums flex-none">
        {time}
      </span>

      {/* Botón eliminar */}
      {!isDeleting && (
        <button
          type="button"
          onClick={() => {
            if (showDelete) {
              onDelete();
            } else {
              setShowDelete(true);
              setTimeout(() => setShowDelete(false), 2000);
            }
          }}
          className={cn(
            "flex-none w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-150",
            showDelete
              ? "bg-red-500/20 text-red-400"
              : "text-neutral-700 hover:text-neutral-400"
          )}
          aria-label="Eliminar registro"
        >
          <Trash2 size={11} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

function EmptyLog() {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
      <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center">
        <Plus size={16} strokeWidth={1.5} className="text-neutral-600" />
      </div>
      <p className="text-xs text-neutral-600 leading-relaxed">
        Aquí aparecerá tu historial de progreso cada vez que actualices tu avance.
      </p>
    </div>
  );
}

// ─── Agrupar por día ──────────────────────────────────────────────────────────

function groupByDay(
  logs: ProgressLogEntry[]
): Record<string, ProgressLogEntry[]> {
  const groups: Record<string, ProgressLogEntry[]> = {};

  for (const log of logs) {
    const key = formatDayLabel(log.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  }

  return groups;
}

function formatDayLabel(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Hoy";
  if (isYesterday) return "Ayer";

  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
// src/components/profile/ExportModal.tsx
"use client";

import { useState } from "react";
import {
  X,
  FileJson,
  FileSpreadsheet,
  Download,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { exportToJSON, exportToCSV } from "@/lib/services/export";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { MediaEntry } from "@/types/media";

interface ExportModalProps {
  onClose: () => void;
}

type Format = "json" | "csv";
type ExportState = "idle" | "loading" | "done" | "error";

export function ExportModal({ onClose }: ExportModalProps) {
  const { user } = useAuth();
  const [format, setFormat] = useState<Format>("json");
  const [state, setState] = useState<ExportState>("idle");
  const [count, setCount] = useState<number | null>(null);

  async function handleExport() {
    if (!user) return;
    setState("loading");

    try {
      const snap = await getDocs(
        collection(db, "users", user.uid, "entries")
      );

      const entries: MediaEntry[] = snap.docs.map((d) => {
        const raw = d.data();
        return {
          ...raw,
          id: d.id,
          startDate: raw.startDate?.toDate(),
          endDate: raw.endDate?.toDate(),
          createdAt: raw.createdAt?.toDate(),
          updatedAt: raw.updatedAt?.toDate(),
        } as MediaEntry;
      });

      setCount(entries.length);

      if (format === "json") {
        exportToJSON(entries);
      } else {
        exportToCSV(entries);
      }

      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    // Fondo oscuro
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet desde abajo */}
      <div className="w-full max-w-lg bg-neutral-900 rounded-t-3xl border-t border-neutral-800 px-5 pt-5 pb-10 flex flex-col gap-5">
        {/* Handle + header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="w-10 h-1 rounded-full bg-neutral-700 mx-auto mb-4" />
            <h2 className="text-base font-semibold text-neutral-100">
              Exportar biblioteca
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Descarga una copia de todos tus registros
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Selector de formato */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-neutral-500">Formato</p>
          <div className="grid grid-cols-2 gap-2">
            <FormatOption
              id="json"
              selected={format === "json"}
              onSelect={() => setFormat("json")}
              icon={FileJson}
              title="JSON"
              description="Backup completo. Incluye todos los campos y fechas."
              color="text-blue-400"
              bg="bg-blue-500/10"
              border="border-blue-500/30"
            />
            <FormatOption
              id="csv"
              selected={format === "csv"}
              onSelect={() => setFormat("csv")}
              icon={FileSpreadsheet}
              title="CSV"
              description="Compatible con Excel y Google Sheets."
              color="text-emerald-400"
              bg="bg-emerald-500/10"
              border="border-emerald-500/30"
            />
          </div>
        </div>

        {/* Info del formato */}
        <div className="rounded-xl bg-neutral-800/60 border border-neutral-700/50 px-4 py-3">
          {format === "json" ? (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-neutral-300">
                Incluye en el backup:
              </p>
              <ul className="text-xs text-neutral-500 space-y-0.5 mt-1">
                <li>— Todos los campos de cada obra</li>
                <li>— Campos dinámicos por tipo (episodios, capítulos, etc.)</li>
                <li>— Fechas exactas de inicio, fin y creación</li>
                <li>— Reseñas personales y calificaciones</li>
                <li>— IDs externos (TMDB, Jikan, MangaDex)</li>
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-neutral-300">
                Columnas incluidas:
              </p>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Título, tipo, estado, calificación, fechas, géneros,
                director/autor, progreso, reseña
              </p>
              <p className="text-[11px] text-amber-400/80 mt-2 flex items-center gap-1.5">
                <AlertTriangle size={11} strokeWidth={1.5} />
                El CSV no contiene todos los campos — usa JSON para backup completo
              </p>
            </div>
          )}
        </div>

        {/* Estado de resultado */}
        {state === "done" && count !== null && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Check size={15} strokeWidth={2} className="text-emerald-400 flex-none" />
            <p className="text-sm text-emerald-300">
              {count} obra{count !== 1 ? "s" : ""} exportada{count !== 1 ? "s" : ""} correctamente
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={15} strokeWidth={1.5} className="text-red-400 flex-none" />
            <p className="text-sm text-red-300">
              No se pudo exportar. Intenta de nuevo.
            </p>
          </div>
        )}

        {/* Botón exportar */}
        <button
          type="button"
          onClick={state === "done" ? onClose : handleExport}
          disabled={state === "loading"}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-semibold",
            "flex items-center justify-center gap-2",
            "transition-all duration-150",
            state === "done"
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "bg-violet-600 text-white hover:bg-violet-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "active:scale-[0.98]"
          )}
        >
          {state === "loading" ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Preparando exportación...
            </>
          ) : state === "done" ? (
            <>
              <Check size={16} strokeWidth={2} />
              Listo — cerrar
            </>
          ) : (
            <>
              <Download size={16} strokeWidth={1.5} />
              Exportar como {format.toUpperCase()}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Opción de formato ────────────────────────────────────────────────────────

interface FormatOptionProps {
  id: Format;
  selected: boolean;
  onSelect: () => void;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
  border: string;
}

function FormatOption({
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  color,
  bg,
  border,
}: FormatOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-2 p-3.5 rounded-2xl border text-left",
        "transition-all duration-150",
        selected
          ? [bg, border, "ring-1 ring-inset", border]
          : "bg-neutral-800/50 border-neutral-700/50 hover:border-neutral-600"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          selected ? bg : "bg-neutral-700/50",
          color
        )}
      >
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div>
        <p className={cn("text-sm font-semibold", selected ? color : "text-neutral-300")}>
          {title}
        </p>
        <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </button>
  );
}
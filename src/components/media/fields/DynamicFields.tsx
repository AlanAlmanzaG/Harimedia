// src/components/media/fields/DynamicFields.tsx
"use client";

import type { MediaType, DynamicFields as DynamicFieldsType } from "@/types/media";
import { cn } from "@/lib/utils";

// ─── Componente raíz ──────────────────────────────────────────────────────────

interface DynamicFieldsProps {
  mediaType: MediaType;
  value: Partial<DynamicFieldsType>;
  onChange: (fields: Partial<DynamicFieldsType>) => void;
}

export function DynamicFields({ mediaType, value, onChange }: DynamicFieldsProps) {
  function set(key: string, val: string | number | null) {
    onChange({ ...value, [key]: val });
  }

  switch (mediaType) {
    case "MOVIE":
      return <MovieFields value={value as any} set={set} />;
    case "SERIES":
    case "CARTOON":
      return <SeriesFields value={value as any} set={set} />;
    case "ANIME":
      return <AnimeFields value={value as any} set={set} />;
    case "MANGA":
    case "MANHWA":
      return <MangaFields value={value as any} set={set} />;
    default:
      return null;
  }
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-neutral-400">{label}</label>
        {hint && <span className="text-[10px] text-neutral-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = cn(
  "w-full h-11 px-3.5 rounded-xl text-sm",
  "bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600",
  "focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500/50",
  "transition-colors duration-150"
);

const rowCls = "grid grid-cols-2 gap-3";

// ─── Película ──────────────────────────────────────────────────────────────────

function MovieFields({ value, set }: { value: any; set: Function }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Director">
        <input
          type="text"
          placeholder="Nombre del director"
          value={value.director ?? ""}
          onChange={(e) => set("director", e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="Duración" hint="minutos">
        <input
          type="number"
          placeholder="120"
          min={0}
          max={600}
          value={value.duration ?? ""}
          onChange={(e) => set("duration", parseInt(e.target.value) || 0)}
          className={inputCls}
        />
      </Field>
    </div>
  );
}

// ─── Series / Caricatura ──────────────────────────────────────────────────────

function SeriesFields({ value, set }: { value: any; set: Function }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={rowCls}>
        <Field label="Temporadas">
          <input
            type="number"
            placeholder="0"
            min={0}
            value={value.totalSeasons ?? ""}
            onChange={(e) => set("totalSeasons", parseInt(e.target.value) || 0)}
            className={inputCls}
          />
        </Field>
        <Field label="Temporada actual">
          <input
            type="number"
            placeholder="1"
            min={1}
            value={value.currentSeason ?? ""}
            onChange={(e) => set("currentSeason", parseInt(e.target.value) || 1)}
            className={inputCls}
          />
        </Field>
      </div>
      <div className={rowCls}>
        <Field label="Ep. vistos">
          <input
            type="number"
            placeholder="0"
            min={0}
            value={value.episodesWatched ?? ""}
            onChange={(e) =>
              set("episodesWatched", parseInt(e.target.value) || 0)
            }
            className={inputCls}
          />
        </Field>
        <Field label="Ep. totales" hint="0 = desconocido">
          <input
            type="number"
            placeholder="0"
            min={0}
            value={value.totalEpisodes ?? ""}
            onChange={(e) =>
              set("totalEpisodes", parseInt(e.target.value) || 0)
            }
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Canal / Plataforma">
        <input
          type="text"
          placeholder="Netflix, HBO, etc."
          value={value.network ?? ""}
          onChange={(e) => set("network", e.target.value)}
          className={inputCls}
        />
      </Field>
    </div>
  );
}

// ─── Anime ────────────────────────────────────────────────────────────────────

function AnimeFields({ value, set }: { value: any; set: Function }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={rowCls}>
        <Field label="Ep. vistos">
          <input
            type="number"
            placeholder="0"
            min={0}
            value={value.episodesWatched ?? ""}
            onChange={(e) =>
              set("episodesWatched", parseInt(e.target.value) || 0)
            }
            className={inputCls}
          />
        </Field>
        <Field label="Ep. totales" hint="0 = en emisión">
          <input
            type="number"
            placeholder="0"
            min={0}
            value={value.totalEpisodes ?? ""}
            onChange={(e) =>
              set("totalEpisodes", parseInt(e.target.value) || 0)
            }
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Estudio">
        <input
          type="text"
          placeholder="MAPPA, Ufotable, etc."
          value={value.studio ?? ""}
          onChange={(e) => set("studio", e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="Temporada">
        <input
          type="text"
          placeholder="Winter 2024"
          value={value.season ?? ""}
          onChange={(e) => set("season", e.target.value)}
          className={inputCls}
        />
      </Field>
    </div>
  );
}

// ─── Manga / Manhwa ───────────────────────────────────────────────────────────

function MangaFields({ value, set }: { value: any; set: Function }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Autor">
        <input
          type="text"
          placeholder="Nombre del autor"
          value={value.author ?? ""}
          onChange={(e) => set("author", e.target.value)}
          className={inputCls}
        />
      </Field>
      <Field label="Ilustrador" hint="Si es diferente al autor">
        <input
          type="text"
          placeholder="Nombre del ilustrador"
          value={value.illustrator ?? ""}
          onChange={(e) => set("illustrator", e.target.value)}
          className={inputCls}
        />
      </Field>
      <div className={rowCls}>
        <Field label="Caps. leídos">
          <input
            type="number"
            placeholder="0"
            min={0}
            value={value.chaptersRead ?? ""}
            onChange={(e) =>
              set("chaptersRead", parseInt(e.target.value) || 0)
            }
            className={inputCls}
          />
        </Field>
        <Field label="Caps. totales" hint="0 = en emisión">
          <input
            type="number"
            placeholder="0"
            min={0}
            value={value.totalChapters ?? ""}
            onChange={(e) =>
              set(
                "totalChapters",
                e.target.value === "" ? null : parseInt(e.target.value) || 0
              )
            }
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Volúmenes">
        <input
          type="number"
          placeholder="0"
          min={0}
          value={value.volumes ?? ""}
          onChange={(e) => set("volumes", parseInt(e.target.value) || 0)}
          className={inputCls}
        />
      </Field>
    </div>
  );
}
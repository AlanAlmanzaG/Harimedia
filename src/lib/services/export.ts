// src/lib/services/export.ts
import type { MediaEntry } from "@/types/media";
import type { MovieFields, SeriesFields, AnimeFields, MangaFields } from "@/types/media";
import { MEDIA_TYPE_CONFIG, STATUS_CONFIG } from "@/lib/mediaConfig";

// ─── JSON ─────────────────────────────────────────────────────────────────────

export function exportToJSON(entries: MediaEntry[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    total: entries.length,
    entries: entries.map(serializeEntry),
  };

  downloadFile(
    JSON.stringify(data, null, 2),
    `harimedia-backup-${dateStamp()}.json`,
    "application/json"
  );
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  "Título",
  "Título original",
  "Tipo",
  "Estado",
  "Calificación",
  "Fecha inicio",
  "Fecha fin",
  "Géneros",
  "Director / Autor",
  "Progreso",
  "Total",
  "Unidad",
  "Reseña",
];

export function exportToCSV(entries: MediaEntry[]): void {
  const rows = entries.map((e) => {
    const dynamic = e.dynamicFields as any;
    const type = MEDIA_TYPE_CONFIG[e.mediaType].label;
    const status = STATUS_CONFIG[e.status].label;

    // Campos dinámicos normalizados
    let creatorField = "";
    let progress = "";
    let total = "";
    let unit = "";

    switch (e.mediaType) {
      case "MOVIE": {
        const f = dynamic as MovieFields;
        creatorField = f.director ?? "";
        progress = f.duration ? String(f.duration) : "";
        unit = "min";
        break;
      }
      case "SERIES":
      case "CARTOON": {
        const f = dynamic as SeriesFields;
        progress = String(f.episodesWatched ?? 0);
        total = String(f.totalEpisodes ?? "");
        unit = "ep";
        break;
      }
      case "ANIME": {
        const f = dynamic as AnimeFields;
        creatorField = f.studio ?? "";
        progress = String(f.episodesWatched ?? 0);
        total = String(f.totalEpisodes ?? "");
        unit = "ep";
        break;
      }
      case "MANGA":
      case "MANHWA": {
        const f = dynamic as MangaFields;
        creatorField = f.author ?? "";
        progress = String(f.chaptersRead ?? 0);
        total = String(f.totalChapters ?? "");
        unit = "cap";
        break;
      }
    }

    return [
      e.title,
      e.originalTitle ?? "",
      type,
      status,
      e.rating != null ? String(e.rating) : "",
      e.startDate ? formatDate(e.startDate) : "",
      e.endDate ? formatDate(e.endDate) : "",
      (e.genres ?? []).join(", "),
      creatorField,
      progress,
      total,
      unit,
      e.review ?? "",
    ];
  });

  const csvContent = [CSV_HEADERS, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");

  // BOM para que Excel abra correctamente con UTF-8
  const bom = "\uFEFF";
  downloadFile(
    bom + csvContent,
    `harimedia-${dateStamp()}.csv`,
    "text/csv;charset=utf-8;"
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serializeEntry(e: MediaEntry) {
  return {
    ...e,
    startDate: e.startDate?.toISOString() ?? null,
    endDate: e.endDate?.toISOString() ?? null,
    createdAt: e.createdAt?.toISOString() ?? null,
    updatedAt: e.updatedAt?.toISOString() ?? null,
  };
}

function csvCell(value: string): string {
  // Escapar comillas dobles y envolver si contiene comas, saltos o comillas
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function dateStamp(): string {
  return new Date().toISOString().split("T")[0];
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
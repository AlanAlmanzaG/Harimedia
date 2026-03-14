// src/lib/mediaConfig.ts
import {
  Film,
  Tv2,
  BookOpen,
  Sword,
  Sparkles,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import type { MediaType, MediaStatus } from "@/types/media";

// ─── Configuración por tipo de medio ─────────────────────────────────────────

interface MediaTypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;       // Tailwind text color
  bgColor: string;     // Tailwind bg color (suave)
  borderColor: string; // Tailwind border color
}

export const MEDIA_TYPE_CONFIG: Record<MediaType, MediaTypeConfig> = {
  MOVIE: {
    label: "Película",
    icon: Film,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  SERIES: {
    label: "Serie",
    icon: Tv2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  CARTOON: {
    label: "Caricatura",
    icon: Clapperboard,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
  },
  ANIME: {
    label: "Anime",
    icon: Sparkles,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
  },
  MANGA: {
    label: "Manga",
    icon: BookOpen,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  MANHWA: {
    label: "Manhwa",
    icon: Sword,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
};

// ─── Configuración por estado ─────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}

export const STATUS_CONFIG: Record<MediaStatus, StatusConfig> = {
  PENDING: {
    label: "Pendiente",
    color: "text-neutral-400",
    dotColor: "bg-neutral-500",
  },
  IN_PROGRESS: {
    label: "En progreso",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  PAUSED: {
    label: "Pausado",
    color: "text-yellow-400",
    dotColor: "bg-yellow-400",
  },
  COMPLETED: {
    label: "Completado",
    color: "text-blue-400",
    dotColor: "bg-blue-400",
  },
  ABANDONED: {
    label: "Abandonado",
    color: "text-red-400",
    dotColor: "bg-red-400",
  },
};

// ─── Helpers de progreso por tipo ─────────────────────────────────────────────

import type { DynamicFields, SeriesFields, AnimeFields, MangaFields } from "@/types/media";

interface ProgressInfo {
  current: number;
  total: number | null;
  unit: string;
}

export function getProgressInfo(
  mediaType: MediaType,
  fields: DynamicFields
): ProgressInfo | null {
  switch (mediaType) {
    case "SERIES":
    case "CARTOON": {
      const f = fields as SeriesFields;
      return {
        current: f.episodesWatched,
        total: f.totalEpisodes ?? null,
        unit: "ep",
      };
    }
    case "ANIME": {
      const f = fields as AnimeFields;
      return {
        current: f.episodesWatched,
        total: f.totalEpisodes ?? null,
        unit: "ep",
      };
    }
    case "MANGA":
    case "MANHWA": {
      const f = fields as MangaFields;
      return {
        current: f.chaptersRead,
        total: f.totalChapters ?? null,
        unit: "cap",
      };
    }
    default:
      return null;
  }
}
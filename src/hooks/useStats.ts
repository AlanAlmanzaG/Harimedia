// src/hooks/useStats.ts
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { MediaEntry, MediaType, MediaStatus } from "@/types/media";
import type { MovieFields, SeriesFields, AnimeFields, MangaFields } from "@/types/media";

// ─── Tipos de salida ──────────────────────────────────────────────────────────

export interface TypeDistribution {
  type: MediaType;
  count: number;
  pct: number;
}

export interface StatusDistribution {
  status: MediaStatus;
  count: number;
}

export interface MonthlyActivity {
  month: string;      // "Ene", "Feb", ...
  monthKey: string;   // "2024-01"
  added: number;
  completed: number;
}

export interface TopEntry {
  id: string;
  title: string;
  coverUrl: string;
  mediaType: MediaType;
  rating: number;
}

export interface StatsData {
  total: number;
  completed: number;
  inProgress: number;
  avgRating: number;
  totalMinutesWatched: number;   // películas + series + anime
  totalChaptersRead: number;     // manga + manhwa
  typeDistribution: TypeDistribution[];
  statusDistribution: StatusDistribution[];
  monthlyActivity: MonthlyActivity[];
  topRated: TopEntry[];
  completionRate: number;        // % completados del total con rating
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStats(uid: string | undefined) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    getDocs(collection(db, "users", uid, "entries"))
      .then((snap) => {
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
        setData(aggregate(entries));
      })
      .catch(() => setError("No se pudieron cargar las estadísticas."))
      .finally(() => setLoading(false));
  }, [uid]);

  return { data, loading, error };
}

// ─── Agregación ───────────────────────────────────────────────────────────────

function aggregate(entries: MediaEntry[]): StatsData {
  const total = entries.length;
  const completed = entries.filter((e) => e.status === "COMPLETED").length;
  const inProgress = entries.filter((e) => e.status === "IN_PROGRESS").length;

  // Promedio de calificación
  const rated = entries.filter((e) => e.rating != null);
  const avgRating =
    rated.length > 0
      ? Math.round(
          (rated.reduce((acc, e) => acc + (e.rating ?? 0), 0) / rated.length) * 10
        ) / 10
      : 0;

  // Minutos vistos (películas + series + anime)
  let totalMinutesWatched = 0;
  let totalChaptersRead = 0;

  for (const e of entries) {
    const f = e.dynamicFields as any;
    if (e.mediaType === "MOVIE" && f?.duration) {
      totalMinutesWatched += f.duration;
    } else if (
      (e.mediaType === "SERIES" || e.mediaType === "CARTOON") &&
      f?.episodesWatched
    ) {
      // Estimado: 45 min por episodio de serie
      totalMinutesWatched += f.episodesWatched * 45;
    } else if (e.mediaType === "ANIME" && f?.episodesWatched) {
      // Estimado: 24 min por episodio de anime
      totalMinutesWatched += f.episodesWatched * 24;
    } else if (
      (e.mediaType === "MANGA" || e.mediaType === "MANHWA") &&
      f?.chaptersRead
    ) {
      totalChaptersRead += f.chaptersRead;
    }
  }

  // Distribución por tipo
  const typeCounts = new Map<MediaType, number>();
  for (const e of entries) {
    typeCounts.set(e.mediaType, (typeCounts.get(e.mediaType) ?? 0) + 1);
  }
  const typeDistribution: TypeDistribution[] = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Distribución por estado
  const statusCounts = new Map<MediaStatus, number>();
  for (const e of entries) {
    statusCounts.set(e.status, (statusCounts.get(e.status) ?? 0) + 1);
  }
  const statusDistribution: StatusDistribution[] = Array.from(
    statusCounts.entries()
  ).map(([status, count]) => ({ status, count }));

  // Actividad mensual (últimos 12 meses)
  const monthlyActivity = buildMonthlyActivity(entries);

  // Top 5 mejor calificadas
  const topRated: TopEntry[] = entries
    .filter((e) => e.rating != null && e.rating >= 8)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      title: e.title,
      coverUrl: e.coverUrl,
      mediaType: e.mediaType,
      rating: e.rating!,
    }));

  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    avgRating,
    totalMinutesWatched,
    totalChaptersRead,
    typeDistribution,
    statusDistribution,
    monthlyActivity,
    topRated,
    completionRate,
  };
}

// ─── Actividad mensual ────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function buildMonthlyActivity(entries: MediaEntry[]): MonthlyActivity[] {
  const now = new Date();
  const months: MonthlyActivity[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      month: MONTH_LABELS[d.getMonth()],
      monthKey: key,
      added: 0,
      completed: 0,
    });
  }

  for (const e of entries) {
    if (e.createdAt) {
      const key = `${e.createdAt.getFullYear()}-${String(
        e.createdAt.getMonth() + 1
      ).padStart(2, "0")}`;
      const slot = months.find((m) => m.monthKey === key);
      if (slot) slot.added++;
    }
    if (e.endDate && e.status === "COMPLETED") {
      const key = `${e.endDate.getFullYear()}-${String(
        e.endDate.getMonth() + 1
      ).padStart(2, "0")}`;
      const slot = months.find((m) => m.monthKey === key);
      if (slot) slot.completed++;
    }
  }

  return months;
}
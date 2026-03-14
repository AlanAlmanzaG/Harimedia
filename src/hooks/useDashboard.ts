// src/hooks/useDashboard.ts
"use client";

import { useEffect, useState } from "react";
import {
  getInProgressEntries,
  getRecentEntries,
  getDashboardStats,
} from "@/lib/firebase/firestore";
import type { MediaEntry } from "@/types/media";

interface DashboardStats {
  total: number;
  inProgress: number;
  completed: number;
  avgRating: number;
}

interface DashboardData {
  stats: DashboardStats | null;
  inProgress: MediaEntry[];
  recent: MediaEntry[];
  loading: boolean;
  error: string | null;
}

export function useDashboard(uid: string | undefined): DashboardData {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inProgress, setInProgress] = useState<MediaEntry[]>([]);
  const [recent, setRecent] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    setError(null);

    Promise.all([
      getDashboardStats(uid),
      getInProgressEntries(uid, 8),
      getRecentEntries(uid, 6),
    ])
      .then(([statsData, inProgressData, recentData]) => {
        setStats(statsData);
        setInProgress(inProgressData);
        setRecent(recentData);
      })
      .catch(() => setError("No se pudieron cargar los datos."))
      .finally(() => setLoading(false));
  }, [uid]);

  return { stats, inProgress, recent, loading, error };
}
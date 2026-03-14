// src/app/(app)/page.tsx
"use client";

import Link from "next/link";
import {
  Play,
  CheckCircle2,
  Star,
  Library,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ContinueWatching } from "@/components/dashboard/ContinueWatching";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, inProgress, recent, loading } = useDashboard(
    user?.uid
  );

  const firstName = user?.displayName?.split(" ")[0] ?? "Hola";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 flex items-start justify-between">
        <div>
          <p className="text-xs text-neutral-500 font-medium tracking-wide mb-0.5">
            {greeting}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100">
            {firstName}
          </h1>
        </div>

        {/* Botón rápido añadir */}
        <Link
          href="/search"
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 active:scale-[0.97] transition-all duration-150"
        >
          <Plus size={15} strokeWidth={2} />
          Añadir
        </Link>
      </div>

      {/* ── Tarjetas de estadísticas ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 px-4">
        <StatCard
          label="En progreso"
          value={stats?.inProgress ?? 0}
          icon={Play}
          iconColor="text-emerald-400"
          loading={loading}
        />
        <StatCard
          label="Completados"
          value={stats?.completed ?? 0}
          icon={CheckCircle2}
          iconColor="text-blue-400"
          loading={loading}
        />
        <StatCard
          label="Promedio"
          value={stats?.avgRating ? `${stats.avgRating}` : "—"}
          icon={Star}
          iconColor="text-yellow-400"
          loading={loading}
        />
      </div>

      {/* ── Continuar ─────────────────────────────────────────────────── */}
      <ContinueWatching entries={inProgress} loading={loading} />

      {/* ── Banner total de obras (solo si hay datos) ─────────────────── */}
      {!loading && stats && stats.total > 0 && (
        <div className="mx-4 rounded-2xl bg-neutral-900 border border-neutral-800/60 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center">
              <Library size={16} strokeWidth={1.5} className="text-neutral-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-100">
                {stats.total}{" "}
                {stats.total === 1 ? "obra registrada" : "obras registradas"}
              </p>
              <p className="text-xs text-neutral-500">en tu biblioteca</p>
            </div>
          </div>
          <Link
            href="/library"
            className="text-xs text-violet-400 font-medium hover:text-violet-300 transition-colors"
          >
            Ver
          </Link>
        </div>
      )}

      {/* ── Actividad reciente ─────────────────────────────────────────── */}
      <RecentActivity entries={recent} loading={loading} />
    </div>
  );
}
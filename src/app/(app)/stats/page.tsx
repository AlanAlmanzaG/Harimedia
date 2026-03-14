// src/app/(app)/stats/page.tsx
"use client";

import {
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStats } from "@/hooks/useStats";
import { StatsMetricCard } from "@/components/stats/StatsMetricCard";
import { TypeDonutChart } from "@/components/stats/TypeDonutChart";
import { ActivityBarChart } from "@/components/stats/ActivityBarChart";
import { StatusBreakdown } from "@/components/stats/StatusBreakdown";
import { TopRatedList } from "@/components/stats/TopRatedList";

export default function StatsPage() {
  const { user } = useAuth();
  const { data, loading, error } = useStats(user?.uid);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64 px-4">
        <p className="text-sm text-red-400 text-center">{error}</p>
      </div>
    );
  }

  // Formatear tiempo total
  const totalHours = data
    ? Math.floor(data.totalMinutesWatched / 60)
    : 0;
  const timeLabel =
    totalHours >= 24
      ? `${Math.floor(totalHours / 24)}d ${totalHours % 24}h`
      : `${totalHours}h`;

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
          Estadísticas
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Un resumen de tu consumo multimedia
        </p>
      </div>

      {/* ── Métricas principales ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatsMetricCard
          label="Obras totales"
          value={data?.total ?? 0}
          icon={BookOpen}
          iconColor="text-violet-400"
          accent
          loading={loading}
        />
        <StatsMetricCard
          label="Completadas"
          value={data?.completed ?? 0}
          sublabel={
            data ? `${data.completionRate}% del total` : undefined
          }
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          loading={loading}
        />
        <StatsMetricCard
          label="Calificación media"
          value={data?.avgRating ? `${data.avgRating}/10` : "—"}
          icon={Star}
          iconColor="text-yellow-400"
          loading={loading}
        />
        <StatsMetricCard
          label="Tiempo estimado"
          value={data?.totalMinutesWatched ? timeLabel : "—"}
          sublabel="Películas + series + anime"
          icon={Clock}
          iconColor="text-blue-400"
          loading={loading}
        />
      </div>

      {/* Capítulos leídos (solo si hay datos) */}
      {(loading || (data?.totalChaptersRead ?? 0) > 0) && (
        <StatsMetricCard
          label="Capítulos leídos"
          value={data?.totalChaptersRead ?? 0}
          sublabel="Manga + Manhwa"
          icon={BookOpen}
          iconColor="text-orange-400"
          loading={loading}
        />
      )}

      {/* ── Distribución por tipo ─────────────────────────────────────── */}
      <section className="rounded-2xl bg-neutral-900 border border-neutral-800/60 p-4">
        <SectionHeader icon={BarChart2} title="Por tipo de medio" />
        <TypeDonutChart
          data={data?.typeDistribution ?? []}
          loading={loading}
        />
      </section>

      {/* ── Estado de la biblioteca ───────────────────────────────────── */}
      <section className="rounded-2xl bg-neutral-900 border border-neutral-800/60 p-4">
        <SectionHeader icon={TrendingUp} title="Estado de la biblioteca" />
        <StatusBreakdown
          data={data?.statusDistribution ?? []}
          total={data?.total ?? 0}
          loading={loading}
        />
      </section>

      {/* ── Actividad mensual ─────────────────────────────────────────── */}
      <section className="rounded-2xl bg-neutral-900 border border-neutral-800/60 p-4">
        <SectionHeader icon={BarChart2} title="Actividad mensual" />
        <p className="text-[11px] text-neutral-600 mb-3">
          Últimos 6 meses
        </p>
        <ActivityBarChart
          data={data?.monthlyActivity ?? []}
          loading={loading}
        />
      </section>

      {/* ── Top calificadas ───────────────────────────────────────────── */}
      <section className="rounded-2xl bg-neutral-900 border border-neutral-800/60 p-4">
        <SectionHeader icon={Star} title="Mejor calificadas" />
        <TopRatedList
          entries={data?.topRated ?? []}
          loading={loading}
        />
      </section>
    </div>
  );
}

// ─── Helper de encabezado de sección ─────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} strokeWidth={1.5} className="text-neutral-500" />
      <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
    </div>
  );
}
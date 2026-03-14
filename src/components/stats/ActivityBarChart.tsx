// src/components/stats/ActivityBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MonthlyActivity } from "@/hooks/useStats";

interface ActivityBarChartProps {
  data: MonthlyActivity[];
  loading?: boolean;
}

export function ActivityBarChart({ data, loading }: ActivityBarChartProps) {
  if (loading) {
    return (
      <div className="h-44 flex items-end gap-1.5 px-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-neutral-800 animate-pulse"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    );
  }

  // Mostrar solo los últimos 6 meses en pantallas pequeñas
  const displayData = data.slice(-6);
  const hasData = data.some((d) => d.added > 0 || d.completed > 0);

  if (!hasData) {
    return (
      <div className="h-44 flex items-center justify-center">
        <p className="text-sm text-neutral-600">Sin actividad registrada</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={176}>
      <BarChart
        data={displayData}
        margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
        barCategoryGap="30%"
        barGap={2}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#262626"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "#525252", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "#525252", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs">
                <p className="font-medium text-neutral-300 mb-1.5">{label}</p>
                {payload.map((p) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.color as string }}
                    />
                    <span className="text-neutral-400">{p.name}</span>
                    <span className="text-neutral-200 ml-auto pl-3 tabular-nums font-medium">
                      {p.value}
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Bar
          dataKey="added"
          name="Agregadas"
          fill="#7c3aed"
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
        <Bar
          dataKey="completed"
          name="Completadas"
          fill="#34d399"
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", color: "#737373", paddingTop: "8px" }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
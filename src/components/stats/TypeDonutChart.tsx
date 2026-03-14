// src/components/stats/TypeDonutChart.tsx
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MEDIA_TYPE_CONFIG } from "@/lib/mediaConfig";
import type { TypeDistribution } from "@/hooks/useStats";

// Colores fijos por tipo — consistentes con mediaConfig
const TYPE_COLORS: Record<string, string> = {
  MOVIE:   "#60a5fa", // blue-400
  SERIES:  "#34d399", // emerald-400
  CARTOON: "#facc15", // yellow-400
  ANIME:   "#f472b6", // pink-400
  MANGA:   "#fb923c", // orange-400
  MANHWA:  "#a78bfa", // violet-400
};

interface TypeDonutChartProps {
  data: TypeDistribution[];
  loading?: boolean;
}

export function TypeDonutChart({ data, loading }: TypeDonutChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-32 h-32 rounded-full border-4 border-neutral-800 animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-neutral-600">Sin datos</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: MEDIA_TYPE_CONFIG[d.type].label,
    value: d.count,
    type: d.type,
    pct: d.pct,
  }));

  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Donut */}
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.type}
                  fill={TYPE_COLORS[entry.type] ?? "#6b7280"}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs">
                    <p className="font-medium text-neutral-100">{d.name}</p>
                    <p className="text-neutral-400">
                      {d.value} obra{d.value !== 1 ? "s" : ""} · {d.pct}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centro del donut — total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-neutral-100 leading-none">{total}</p>
          <p className="text-[11px] text-neutral-500 mt-1">total</p>
        </div>
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {chartData.map((d) => (
          <div key={d.type} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-none"
              style={{ backgroundColor: TYPE_COLORS[d.type] ?? "#6b7280" }}
            />
            <span className="text-xs text-neutral-400 truncate">{d.name}</span>
            <span className="text-xs text-neutral-600 ml-auto tabular-nums">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
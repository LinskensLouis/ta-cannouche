"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import type { ConsumptionPoint } from "@/lib/stats/user";

// Graphique de consommation dans le temps (S4-04). Volume en centilitres par jour.
export function ConsumptionChart({ points }: { points: ConsumptionPoint[] }) {
  const data = points.map((p) => ({
    day: p.label.slice(8, 10) + "/" + p.label.slice(5, 7),
    cl: Math.round(p.ml / 10),
  }));

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--color-alu-mat)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <Tooltip
            cursor={{ fill: "var(--color-alu-mat)", opacity: 0.1 }}
            contentStyle={{
              background: "var(--color-alu-surface)",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--color-alu-mat)" }}
            formatter={(value) => [`${value} cl`, "Volume"]}
          />
          <Bar dataKey="cl" fill="var(--color-serigraphie)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

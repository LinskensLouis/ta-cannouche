"use client";

import dynamic from "next/dynamic";
import type { ConsumptionPoint } from "@/lib/stats/user";

// Charge Recharts (~338 Ko) à la demande : le graphique n'entre pas dans le JS
// initial de /stats, il se charge après le rendu des chiffres et de la tier list.
const ConsumptionChart = dynamic(
  () => import("./consumption-chart").then((m) => m.ConsumptionChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-44 items-center justify-center text-sm text-alu-mat">
        Chargement du graphique…
      </div>
    ),
  },
);

export function ConsumptionChartLazy({ points }: { points: ConsumptionPoint[] }) {
  return <ConsumptionChart points={points} />;
}

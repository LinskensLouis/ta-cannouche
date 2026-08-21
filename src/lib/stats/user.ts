import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Period = "30d" | "3m" | "1y" | "all";

export const PERIODS: { key: Period; label: string; days: number | null }[] = [
  { key: "30d", label: "30 j", days: 30 },
  { key: "3m", label: "3 mois", days: 90 },
  { key: "1y", label: "1 an", days: 365 },
  { key: "all", label: "Tout", days: null },
];

export type UserStats = {
  totalSpentCents: number;
  totalVolumeMl: number;
  checkinCount: number;
  activeWeeks: number;
  avgPerActiveWeekCents: number | null;
};

// Clé de semaine ISO (année-semaine) pour compter les semaines « actives ».
function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-${week}`;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClient();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("total_price_cents, purchased_at")
    .eq("user_id", userId);
  const { data: checkins } = await supabase
    .from("checkins")
    .select("quantity_ml")
    .eq("user_id", userId);

  const totalSpentCents = (purchases ?? []).reduce((s, p) => s + p.total_price_cents, 0);
  const totalVolumeMl = (checkins ?? []).reduce((s, c) => s + (c.quantity_ml ?? 0), 0);
  const checkinCount = (checkins ?? []).length;

  // Moyenne sur les semaines réellement actives (E4-3), pas depuis l'inscription.
  const weeks = new Set((purchases ?? []).map((p) => isoWeekKey(new Date(p.purchased_at))));
  const activeWeeks = weeks.size;
  const avgPerActiveWeekCents = activeWeeks > 0 ? Math.round(totalSpentCents / activeWeeks) : null;

  return { totalSpentCents, totalVolumeMl, checkinCount, activeWeeks, avgPerActiveWeekCents };
}

export type ConsumptionPoint = { label: string; ml: number };

// Série de consommation par jour sur la période (S4-04).
export async function getConsumptionSeries(
  userId: string,
  period: Period,
  now: Date,
): Promise<ConsumptionPoint[]> {
  const supabase = await createClient();
  const days = PERIODS.find((p) => p.key === period)?.days ?? null;

  let query = supabase
    .from("checkins")
    .select("consumed_at, quantity_ml")
    .eq("user_id", userId)
    .order("consumed_at");
  if (days != null) {
    const from = new Date(now.getTime() - days * 86400000).toISOString();
    query = query.gte("consumed_at", from);
  }
  const { data } = await query;

  const byDay = new Map<string, number>();
  for (const c of data ?? []) {
    const key = c.consumed_at.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + (c.quantity_ml ?? 0));
  }
  return [...byDay.entries()].map(([label, ml]) => ({ label, ml }));
}

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

// Agrégations faites en SQL par la vue `user_stats` (migration 005).
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_stats")
    .select("total_spent_cents, active_weeks, total_volume_ml, checkin_count")
    .eq("user_id", userId)
    .maybeSingle();

  const totalSpentCents = Number(data?.total_spent_cents ?? 0);
  const activeWeeks = Number(data?.active_weeks ?? 0);

  return {
    totalSpentCents,
    totalVolumeMl: Number(data?.total_volume_ml ?? 0),
    checkinCount: Number(data?.checkin_count ?? 0),
    activeWeeks,
    // Moyenne sur les semaines réellement actives (E4-3), pas depuis l'inscription.
    avgPerActiveWeekCents: activeWeeks > 0 ? Math.round(totalSpentCents / activeWeeks) : null,
  };
}

export type ConsumptionPoint = { label: string; ml: number };

// Série de consommation par jour sur la période (S4-04), via la vue
// `user_daily_consumption` (agrégation par jour en SQL).
export async function getConsumptionSeries(
  userId: string,
  period: Period,
  now: Date,
): Promise<ConsumptionPoint[]> {
  const supabase = await createClient();
  const days = PERIODS.find((p) => p.key === period)?.days ?? null;

  let query = supabase
    .from("user_daily_consumption")
    .select("day, ml")
    .eq("user_id", userId)
    .order("day");
  if (days != null) {
    const from = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
    query = query.gte("day", from);
  }
  const { data } = await query;

  return (data ?? []).map((r) => ({ label: r.day ?? "", ml: Number(r.ml ?? 0) }));
}

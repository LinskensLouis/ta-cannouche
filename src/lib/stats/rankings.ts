import "server-only";
import { createClient } from "@/lib/supabase/server";

export type RankedBeer = {
  id: string;
  name: string;
  score: number; // note (brute) de la meilleure dégustation
  count: number;
};

// Palmarès personnel (S4-06) : mes canettes notées, par ma meilleure note.
export async function getUserTopBeers(userId: string, limit = 10): Promise<RankedBeer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins")
    .select("rating, beer_id, beers(name)")
    .eq("user_id", userId)
    .not("rating", "is", null);

  const byBeer = new Map<string, { name: string; best: number; count: number }>();
  for (const r of data ?? []) {
    if (r.rating == null) continue;
    const cur = byBeer.get(r.beer_id) ?? { name: r.beers?.name ?? "?", best: 0, count: 0 };
    cur.best = Math.max(cur.best, r.rating);
    cur.count += 1;
    byBeer.set(r.beer_id, cur);
  }

  return [...byBeer.entries()]
    .map(([id, b]) => ({ id, name: b.name, score: b.best, count: b.count }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

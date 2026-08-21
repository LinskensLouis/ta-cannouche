import "server-only";
import { createClient } from "@/lib/supabase/server";

const BAYES_M = 3;

export type RankedBeer = {
  id: string;
  name: string;
  score: number; // note (bayésienne pour le groupe, brute pour le perso)
  count: number;
};

// Top des canettes du groupe (S4-05), moyenne bayésienne pour ne pas laisser une
// canette notée une fois dominer.
export async function getGroupTopBeers(limit = 10): Promise<RankedBeer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins")
    .select("rating, beer_id, beers(name)")
    .not("rating", "is", null);

  const rows = data ?? [];
  const globalMean =
    rows.length > 0 ? rows.reduce((s, r) => s + (r.rating ?? 0), 0) / rows.length : 0;

  const byBeer = new Map<string, { name: string; sum: number; count: number }>();
  for (const r of rows) {
    if (r.rating == null) continue;
    const cur = byBeer.get(r.beer_id) ?? { name: r.beers?.name ?? "?", sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    byBeer.set(r.beer_id, cur);
  }

  const ranked: RankedBeer[] = [...byBeer.entries()].map(([id, b]) => {
    const avg = b.sum / b.count;
    const score = (b.count / (b.count + BAYES_M)) * avg + (BAYES_M / (b.count + BAYES_M)) * globalMean;
    return { id, name: b.name, score, count: b.count };
  });

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

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

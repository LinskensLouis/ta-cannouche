import "server-only";
import { createClient } from "@/lib/supabase/server";

// Tier list du groupe : les canettes notées, rangées par niveau de note (S→D).
export type TierBeer = { id: string; name: string; avg: number; count: number };
export type Tier = { key: string; label: string; beers: TierBeer[] };

// Bornes de note, du meilleur au pire. Une canette rejoint le premier tier dont
// elle atteint le seuil.
const BANDS = [
  { key: "S", label: "Culte", min: 4.5 },
  { key: "A", label: "Excellente", min: 3.5 },
  { key: "B", label: "Bonne", min: 2.5 },
  { key: "C", label: "Passable", min: 1.5 },
  { key: "D", label: "À fuir", min: 0 },
] as const;

function tierKeyFor(avg: number): string {
  for (const b of BANDS) if (avg >= b.min) return b.key;
  return "D";
}

export async function getGroupTierList(): Promise<Tier[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins")
    .select("rating, beer_id, beers(name)")
    .not("rating", "is", null);

  // Moyenne (brute) par canette.
  const byBeer = new Map<string, { name: string; sum: number; count: number }>();
  for (const r of data ?? []) {
    if (r.rating == null) continue;
    const cur = byBeer.get(r.beer_id) ?? { name: r.beers?.name ?? "?", sum: 0, count: 0 };
    cur.sum += r.rating;
    cur.count += 1;
    byBeer.set(r.beer_id, cur);
  }

  const beers: TierBeer[] = [...byBeer.entries()]
    .map(([id, b]) => ({ id, name: b.name, avg: b.sum / b.count, count: b.count }))
    .sort((a, b) => b.avg - a.avg);

  return BANDS.map((band) => ({
    key: band.key,
    label: band.label,
    beers: beers.filter((x) => tierKeyFor(x.avg) === band.key),
  }));
}

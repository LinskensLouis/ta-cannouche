import "server-only";
import { createClient } from "@/lib/supabase/server";

// Tier list du groupe : les canettes notées, rangées par niveau de note (S→D).
// La moyenne par canette vient de la vue `beer_stats` (agrégation SQL).
export type TierBeer = { id: string; name: string; avg: number; count: number };
export type Tier = { key: string; label: string; beers: TierBeer[] };

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
    .from("beer_stats")
    .select("beer_id, beer_name, avg_rating, rating_count")
    .gt("rating_count", 0);

  const beers: TierBeer[] = (data ?? [])
    .map((r) => ({
      id: r.beer_id ?? "",
      name: r.beer_name ?? "?",
      avg: Number(r.avg_rating ?? 0),
      count: Number(r.rating_count ?? 0),
    }))
    .sort((a, b) => b.avg - a.avg);

  return BANDS.map((band) => ({
    key: band.key,
    label: band.label,
    beers: beers.filter((x) => tierKeyFor(x.avg) === band.key),
  }));
}

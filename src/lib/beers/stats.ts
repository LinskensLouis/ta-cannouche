import "server-only";
import { createClient } from "@/lib/supabase/server";

// Note de groupe d'une bière. Moyenne bayésienne (m = 3) pour éviter qu'une
// bière notée 5/5 une seule fois ne devance une bière très notée.
// Le calcul est fait en SQL par la vue `beer_stats` (migration 005) — plus de
// scan complet des checkins recalculé en JS.
export type BeerRating = {
  count: number; // nombre de dégustations notées
  average: number | null; // moyenne brute
  bayesian: number | null; // moyenne lissée
};

export async function getBeerRating(beerId: string): Promise<BeerRating> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("beer_stats")
    .select("rating_count, avg_rating, bayesian_rating")
    .eq("beer_id", beerId)
    .maybeSingle();

  return {
    count: Number(data?.rating_count ?? 0),
    average: data?.avg_rating != null ? Number(data.avg_rating) : null,
    bayesian: data?.bayesian_rating != null ? Number(data.bayesian_rating) : null,
  };
}

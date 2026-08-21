import "server-only";
import { createClient } from "@/lib/supabase/server";

// Note de groupe d'une bière. Moyenne bayésienne (S3-05) pour éviter qu'une
// bière notée 5/5 une seule fois ne devance une bière très notée.
//   score = (v/(v+m))·R + (m/(v+m))·C
// v = nb de notes de la bière, R = sa moyenne, m = seuil (3), C = moyenne globale.
const BAYES_M = 3;

export type BeerRating = {
  count: number; // nombre de dégustations notées
  average: number | null; // moyenne brute
  bayesian: number | null; // moyenne lissée
};

export async function getBeerRating(beerId: string): Promise<BeerRating> {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("checkins")
    .select("rating")
    .eq("beer_id", beerId)
    .not("rating", "is", null);

  const ratings = (rows ?? []).map((r) => r.rating).filter((r): r is number => r !== null);
  const count = ratings.length;
  if (count === 0) return { count: 0, average: null, bayesian: null };

  const average = ratings.reduce((a, b) => a + b, 0) / count;

  // Moyenne globale du groupe (toutes bières), pour le lissage bayésien.
  const { data: allRows } = await supabase.from("checkins").select("rating").not("rating", "is", null);
  const all = (allRows ?? []).map((r) => r.rating).filter((r): r is number => r !== null);
  const globalMean = all.length ? all.reduce((a, b) => a + b, 0) / all.length : average;

  const bayesian = (count / (count + BAYES_M)) * average + (BAYES_M / (count + BAYES_M)) * globalMean;
  return { count, average, bayesian };
}

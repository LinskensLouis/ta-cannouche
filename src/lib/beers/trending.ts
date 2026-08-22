import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FormatMl } from "@/types/db";

// « Bières du moment » : les canettes avec de l'activité récente (dégustations
// non rétroactives), les plus récemment bues d'abord, avec leur note de groupe.
export type TrendingBeer = {
  id: string;
  name: string;
  image_url: string | null;
  format_ml: FormatMl;
  rating: number | null; // moyenne brute (ce que le groupe attend d'une note)
};

export async function getTrendingBeers(limit = 12): Promise<TrendingBeer[]> {
  const supabase = await createClient();

  const { data: recent } = await supabase
    .from("checkins")
    .select("beer_id, consumed_at")
    .eq("retroactive", false)
    .order("consumed_at", { ascending: false })
    .limit(80);

  // Dédoublonne en gardant l'ordre (la plus récemment bue d'abord).
  const orderedIds: string[] = [];
  for (const c of recent ?? []) {
    if (!orderedIds.includes(c.beer_id)) orderedIds.push(c.beer_id);
    if (orderedIds.length >= limit) break;
  }
  if (orderedIds.length === 0) return [];

  const [beersRes, statsRes] = await Promise.all([
    supabase.from("beers").select("id, name, image_url, format_ml").in("id", orderedIds),
    supabase.from("beer_stats").select("beer_id, avg_rating").in("beer_id", orderedIds),
  ]);

  const beers = new Map((beersRes.data ?? []).map((b) => [b.id, b]));
  const ratings = new Map((statsRes.data ?? []).map((s) => [s.beer_id, s.avg_rating]));

  return orderedIds
    .map((id) => {
      const b = beers.get(id);
      if (!b) return null;
      const r = ratings.get(id);
      return {
        id,
        name: b.name,
        image_url: b.image_url,
        format_ml: b.format_ml,
        rating: r != null ? Number(r) : null,
      } satisfies TrendingBeer;
    })
    .filter((x): x is TrendingBeer => x !== null);
}

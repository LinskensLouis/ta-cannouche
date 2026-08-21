import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CheckinRowData } from "@/components/checkin/checkin-row";

// Feed des dégustations du groupe (S5-04), les plus récentes d'abord.
export async function getGroupFeed(limit = 30): Promise<CheckinRowData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins")
    .select("id, rating, comment, consumed_at, beer_id, profiles(pseudo), beers(name)")
    .order("consumed_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((c) => ({
    id: c.id,
    rating: c.rating,
    comment: c.comment,
    consumed_at: c.consumed_at,
    beerId: c.beer_id,
    pseudo: c.profiles?.pseudo ?? undefined,
    beerName: c.beers?.name ?? undefined,
  }));
}

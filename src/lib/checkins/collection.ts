import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CollectedBeer = { id: string; name: string };

// Le mur des languettes (S5-05) : une languette par canette distincte goûtée.
export async function getCollectedBeers(userId: string): Promise<CollectedBeer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins")
    .select("beer_id, beers(name)")
    .eq("user_id", userId);

  const byId = new Map<string, CollectedBeer>();
  for (const c of data ?? []) {
    if (!byId.has(c.beer_id)) byId.set(c.beer_id, { id: c.beer_id, name: c.beers?.name ?? "?" });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

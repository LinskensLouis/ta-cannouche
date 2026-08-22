import "server-only";
import { createClient } from "@/lib/supabase/server";

// Disponibilité d'une canette en enseigne (E6-2 / E6-3), plus récente d'abord.
export type Availability = {
  id: string;
  storeName: string;
  storeCity: string | null;
  priceCents: number | null;
  lastSeenAt: string; // YYYY-MM-DD
  inStock: boolean;
};

export async function getBeerAvailability(beerId: string): Promise<Availability[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("beer_availability")
    .select("id, price_cents, last_seen_at, in_stock, stores(name, city)")
    .eq("beer_id", beerId)
    .order("last_seen_at", { ascending: false });

  return (data ?? []).map((a) => ({
    id: a.id,
    storeName: a.stores?.name ?? "Enseigne inconnue",
    storeCity: a.stores?.city ?? null,
    priceCents: a.price_cents,
    lastSeenAt: a.last_seen_at,
    inStock: a.in_stock,
  }));
}

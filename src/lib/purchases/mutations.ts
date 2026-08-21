import "server-only";
import { createClient } from "@/lib/supabase/server";

// Trouve une enseigne par nom (insensible à la casse) ou la crée.
export async function findOrCreateStore(name: string | null): Promise<string | null> {
  const clean = name?.trim();
  if (!clean) return null;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .ilike("name", clean)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase.from("stores").insert({ name: clean }).select("id").single();
  return created?.id ?? null;
}

export type NewPurchase = {
  beerId: string;
  storeName: string | null;
  totalPriceCents: number;
  packSize: number;
  packCount: number;
  purchasedAt: string; // YYYY-MM-DD
};

export async function createPurchase(input: NewPurchase): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const storeId = await findOrCreateStore(input.storeName);

  const { error } = await supabase.from("purchases").insert({
    user_id: user.id,
    beer_id: input.beerId,
    store_id: storeId,
    total_price_cents: input.totalPriceCents,
    pack_size: input.packSize,
    pack_count: input.packCount,
    purchased_at: input.purchasedAt,
  });
  return !error;
}

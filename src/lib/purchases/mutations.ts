import "server-only";
import { createClient } from "@/lib/supabase/server";

type SupaClient = Awaited<ReturnType<typeof createClient>>;

// Alimente la disponibilité en enseigne (E6) sans saisie supplémentaire : un
// achat avec enseigne vaut « vue à [enseigne] à [prix unitaire] ». Upsert sur
// (beer_id, store_id) pour rafraîchir prix et date au dernier achat constaté.
export async function upsertAvailability(
  supabase: SupaClient,
  input: { beerId: string; storeId: string; priceCents: number; seenAt: string; reportedBy: string },
): Promise<void> {
  await supabase.from("beer_availability").upsert(
    {
      beer_id: input.beerId,
      store_id: input.storeId,
      reported_by: input.reportedBy,
      price_cents: input.priceCents,
      last_seen_at: input.seenAt,
      in_stock: true,
    },
    { onConflict: "beer_id,store_id" },
  );
}

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
  if (error) return false;

  // Alimente la dispo en enseigne à partir de l'achat (prix unitaire).
  if (storeId) {
    const units = input.packSize * input.packCount;
    await upsertAvailability(supabase, {
      beerId: input.beerId,
      storeId,
      priceCents: Math.round(input.totalPriceCents / units),
      seenAt: input.purchasedAt,
      reportedBy: user.id,
    });
  }
  return true;
}

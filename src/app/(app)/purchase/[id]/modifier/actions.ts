"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateStore, upsertAvailability } from "@/lib/purchases/mutations";

export type PurchaseEdit = {
  beerId: string;
  storeName: string | null;
  totalPriceCents: number;
  packSize: number;
  packCount: number;
  purchasedAt: string;
};

// Modifie un de ses achats. RLS + filtre user_id explicite.
export async function updatePurchaseAction(id: string, data: PurchaseEdit): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const storeId = await findOrCreateStore(data.storeName);

  await supabase
    .from("purchases")
    .update({
      store_id: storeId,
      total_price_cents: data.totalPriceCents,
      pack_size: data.packSize,
      pack_count: data.packCount,
      purchased_at: data.purchasedAt,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (storeId) {
    const units = data.packSize * data.packCount;
    await upsertAvailability(supabase, {
      beerId: data.beerId,
      storeId,
      priceCents: Math.round(data.totalPriceCents / units),
      seenAt: data.purchasedAt,
      reportedBy: user.id,
    });
  }

  revalidatePath("/stats");
  revalidatePath(`/beer/${data.beerId}`);
  redirect(`/beer/${data.beerId}`);
}

export async function deletePurchaseAction(id: string, beerId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("purchases").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/stats");
  revalidatePath(`/beer/${beerId}`);
  redirect(`/beer/${beerId}`);
}

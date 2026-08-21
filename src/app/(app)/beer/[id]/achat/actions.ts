"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPurchase } from "@/lib/purchases/mutations";
import { eurosToCents } from "@/lib/format";

export type PurchaseState = { error?: string };

// Enregistre un achat (S4-01). Prix en centimes entiers.
export async function createPurchaseAction(
  _prev: PurchaseState,
  formData: FormData,
): Promise<PurchaseState> {
  const beerId = String(formData.get("beer_id") ?? "");
  if (!beerId) return { error: "Canette introuvable." };

  const cents = eurosToCents(String(formData.get("price") ?? ""));
  if (cents == null) return { error: "Prix invalide." };

  const packSize = Number(formData.get("pack_size") ?? 0);
  const packCount = Number(formData.get("pack_count") ?? 0);
  if (!Number.isInteger(packSize) || packSize <= 0) return { error: "Choisis la taille du lot." };
  if (!Number.isInteger(packCount) || packCount <= 0) return { error: "Nombre de lots invalide." };

  const dateRaw = String(formData.get("purchased_at") ?? "").trim();
  const purchasedAt = dateRaw || new Date().toISOString().slice(0, 10);

  const ok = await createPurchase({
    beerId,
    storeName: String(formData.get("store") ?? "").trim() || null,
    totalPriceCents: cents,
    packSize,
    packCount,
    purchasedAt,
  });
  if (!ok) return { error: "Enregistrement impossible. Réessaie." };

  revalidatePath("/stats");
  redirect(`/beer/${beerId}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MergeResult = { error?: string; ok?: boolean };

// Fusionne deux canettes : déplace dégustations et achats de `sourceId` vers
// `targetId`, puis supprime la fiche source (ses signalements/listes suivent en
// cascade). Réservé aux admins ; la RLS admin autorise ces écritures cross-membres.
export async function mergeBeersAction(sourceId: string, targetId: string): Promise<MergeResult> {
  if (!sourceId || !targetId || sourceId === targetId) {
    return { error: "Sélectionne deux canettes différentes." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { error: "Fusion réservée aux admins." };

  const checkins = await supabase.from("checkins").update({ beer_id: targetId }).eq("beer_id", sourceId);
  if (checkins.error) return { error: "Échec du déplacement des dégustations." };

  const purchases = await supabase.from("purchases").update({ beer_id: targetId }).eq("beer_id", sourceId);
  if (purchases.error) return { error: "Échec du déplacement des achats." };

  const del = await supabase.from("beers").delete().eq("id", sourceId);
  if (del.error) return { error: "Échec de la suppression du doublon." };

  revalidatePath("/admin/doublons");
  revalidatePath("/");
  revalidatePath("/recherche");
  return { ok: true };
}

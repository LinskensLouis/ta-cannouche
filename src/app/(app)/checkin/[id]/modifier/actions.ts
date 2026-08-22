"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONTEXTS } from "@/lib/offline/types";
import type { CheckinContext } from "@/types/db";

export type CheckinEdit = {
  beerId: string;
  rating: number | null;
  comment: string | null;
  quantity_ml: number;
  context: CheckinContext | null;
  consumed_at: string;
  photo_url: string | null;
  retroactive: boolean;
};

// Modifie une dégustation existante. La RLS garantit qu'on ne touche que les
// siennes ; on double le filtre par user_id par sécurité.
export async function updateCheckinAction(id: string, data: CheckinEdit): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const context = data.context && CONTEXTS.includes(data.context) ? data.context : null;

  await supabase
    .from("checkins")
    .update({
      rating: data.rating,
      comment: data.comment,
      quantity_ml: data.quantity_ml,
      context,
      consumed_at: data.consumed_at,
      photo_url: data.photo_url,
      retroactive: data.retroactive,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath(`/beer/${data.beerId}`);
  redirect(`/beer/${data.beerId}`);
}

// Supprime une dégustation. Utilisée en `action` de formulaire (bind des args).
export async function deleteCheckinAction(id: string, beerId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("checkins").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath(`/beer/${beerId}`);
  redirect(`/beer/${beerId}`);
}

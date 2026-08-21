"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CheckinContext, FormatMl } from "@/types/db";

const FORMATS: FormatMl[] = ["250", "330", "440", "500"];
const CONTEXTS: CheckinContext[] = ["home", "out", "party", "festival", "other"];

export type CheckinState = { error?: string };

// Enregistre une dégustation (S3-02 / S3-03). Note facultative.
export async function createCheckinAction(
  _prev: CheckinState,
  formData: FormData,
): Promise<CheckinState> {
  const beerId = String(formData.get("beer_id") ?? "");
  if (!beerId) return { error: "Canette introuvable." };

  const format = String(formData.get("format") ?? "");
  if (!FORMATS.includes(format as FormatMl)) return { error: "Choisis un format." };

  const ratingRaw = String(formData.get("rating") ?? "").trim();
  const rating = ratingRaw ? Number(ratingRaw) : null;

  const comment = String(formData.get("comment") ?? "").trim() || null;

  const contextRaw = String(formData.get("context") ?? "");
  const context = CONTEXTS.includes(contextRaw as CheckinContext)
    ? (contextRaw as CheckinContext)
    : null;

  const dateRaw = String(formData.get("consumed_at") ?? "").trim();
  const consumedAt = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée, reconnecte-toi." };

  const { error } = await supabase.from("checkins").insert({
    user_id: user.id,
    beer_id: beerId,
    rating,
    comment,
    quantity_ml: Number(format),
    context,
    consumed_at: consumedAt,
  });
  if (error) return { error: "Enregistrement impossible. Réessaie." };

  revalidatePath(`/beer/${beerId}`);
  revalidatePath("/");
  redirect(`/beer/${beerId}`);
}

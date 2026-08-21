import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONTEXTS } from "@/lib/offline/types";
import type { CheckinContext } from "@/types/db";

// Endpoint de rejeu des dégustations mises en file hors-ligne (S1-10 / S3-03).
// Authentifié via la session (cookies) : la RLS s'applique.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const beerId = typeof b.beer_id === "string" ? b.beer_id : null;
  const quantityMl = typeof b.quantity_ml === "number" ? b.quantity_ml : null;
  if (!beerId || !quantityMl || quantityMl <= 0) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const rating = typeof b.rating === "number" ? b.rating : null;
  const comment = typeof b.comment === "string" && b.comment.trim() ? b.comment.trim() : null;
  const context =
    typeof b.context === "string" && CONTEXTS.includes(b.context as CheckinContext)
      ? (b.context as CheckinContext)
      : null;
  const consumedAt = typeof b.consumed_at === "string" ? b.consumed_at : new Date().toISOString();
  const photoUrl = typeof b.photo_url === "string" && b.photo_url ? b.photo_url : null;

  const { error } = await supabase.from("checkins").insert({
    user_id: user.id,
    beer_id: beerId,
    rating,
    comment,
    quantity_ml: quantityMl,
    context,
    consumed_at: consumedAt,
    photo_url: photoUrl,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePath("/");
  revalidatePath(`/beer/${beerId}`);
  return NextResponse.json({ ok: true });
}

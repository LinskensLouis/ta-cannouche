import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CheckinRowData } from "@/components/checkin/checkin-row";

// Avis du groupe sur une canette : les dégustations commentées des AUTRES membres
// (les miennes sont déjà dans « Mes dégustations »). Les rétroactives comptent —
// un avis reste un avis même s'il date. Plus récents d'abord.
export async function getGroupReviews(
  beerId: string,
  excludeUserId: string | null,
  limit = 20,
): Promise<CheckinRowData[]> {
  const supabase = await createClient();

  let query = supabase
    .from("checkins")
    .select("id, rating, comment, consumed_at, photo_url, profiles(pseudo)")
    .eq("beer_id", beerId)
    .not("comment", "is", null)
    .order("consumed_at", { ascending: false })
    .limit(limit);
  if (excludeUserId) query = query.neq("user_id", excludeUserId);

  const { data } = await query;
  return (data ?? []).map((c) => ({
    id: c.id,
    rating: c.rating,
    comment: c.comment,
    consumed_at: c.consumed_at,
    photo_url: c.photo_url,
    pseudo: c.profiles?.pseudo ?? undefined,
  }));
}

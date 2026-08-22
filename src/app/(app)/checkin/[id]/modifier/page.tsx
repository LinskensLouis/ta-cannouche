import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen";
import { CheckinForm } from "@/components/checkin/checkin-form";
import { createClient } from "@/lib/supabase/server";
import { deleteCheckinAction } from "./actions";

// Modifier une de ses dégustations (note, format, contexte, date, commentaire,
// photo). Accès depuis « Mes dégustations » sur la fiche bière.
export default async function ModifierCheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: checkin } = await supabase
    .from("checkins")
    .select("id, user_id, beer_id, rating, comment, quantity_ml, context, consumed_at, photo_url, retroactive, beers(name, format_ml)")
    .eq("id", id)
    .maybeSingle();

  // On ne modifie que les siennes.
  if (!checkin || checkin.user_id !== user.id) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const beerName = checkin.beers?.name ?? "Canette";
  const defaultFormat = checkin.beers?.format_ml ?? "330";

  return (
    <>
      <ScreenHeader title={beerName} subtitle="Modifier la dégustation." />
      <CheckinForm
        beerId={checkin.beer_id}
        defaultFormat={defaultFormat}
        today={today}
        edit={{
          id: checkin.id,
          rating: checkin.rating,
          comment: checkin.comment,
          quantity_ml: checkin.quantity_ml,
          context: checkin.context,
          consumed_at: checkin.consumed_at,
          photo_url: checkin.photo_url,
          retroactive: checkin.retroactive,
        }}
      />

      <form action={deleteCheckinAction.bind(null, checkin.id, checkin.beer_id)} className="px-5 pb-6">
        <button
          type="submit"
          className="min-h-12 w-full rounded-lg border border-serigraphie/40 px-4 text-serigraphie active:bg-serigraphie/10"
        >
          Supprimer cette dégustation
        </button>
      </form>
    </>
  );
}

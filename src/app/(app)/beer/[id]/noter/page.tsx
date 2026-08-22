import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen";
import { CheckinForm } from "@/components/checkin/checkin-form";
import { createClient } from "@/lib/supabase/server";

// Formulaire de dégustation d'une canette (S3-02).
export default async function NoterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: beer } = await supabase
    .from("beers")
    .select("id, name, format_ml")
    .eq("id", id)
    .maybeSingle();
  if (!beer) notFound();

  // Note actuelle de l'utilisateur pour cette bière (sa dégustation notée la plus
  // récente) : pré-remplie pour qu'il la mette à jour plutôt que d'en cumuler.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let defaultRating = 0;
  if (user) {
    const { data: last } = await supabase
      .from("checkins")
      .select("rating")
      .eq("beer_id", id)
      .eq("user_id", user.id)
      .not("rating", "is", null)
      .order("consumed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    defaultRating = last?.rating ?? 0;
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <ScreenHeader title={beer.name} subtitle="Enregistre ta dégustation." />
      <CheckinForm
        beerId={beer.id}
        defaultFormat={beer.format_ml}
        today={today}
        defaultRating={defaultRating}
      />
    </>
  );
}

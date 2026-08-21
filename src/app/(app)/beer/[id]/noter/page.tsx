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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <ScreenHeader title={beer.name} subtitle="Enregistre ta dégustation." />
      <CheckinForm beerId={beer.id} defaultFormat={beer.format_ml} today={today} />
    </>
  );
}

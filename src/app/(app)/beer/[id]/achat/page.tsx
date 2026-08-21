import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen";
import { PurchaseForm } from "@/components/purchase/purchase-form";
import { createClient } from "@/lib/supabase/server";

// Saisie d'un achat (S4-01).
export default async function AchatPage({ params }: { params: Promise<{ id: string }> }) {
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
      <ScreenHeader title={beer.name} subtitle="Enregistre un achat." />
      <PurchaseForm beerId={beer.id} formatMl={beer.format_ml} today={today} />
    </>
  );
}

import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen";
import { PurchaseForm } from "@/components/purchase/purchase-form";
import { createClient } from "@/lib/supabase/server";
import { deletePurchaseAction } from "./actions";

// Modifier un de ses achats. Accès depuis « Mes achats » sur la fiche bière.
export default async function ModifierPurchasePage({
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

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id, user_id, beer_id, total_price_cents, pack_size, pack_count, purchased_at, stores(name), beers(name, format_ml)")
    .eq("id", id)
    .maybeSingle();

  if (!purchase || purchase.user_id !== user.id) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const beerName = purchase.beers?.name ?? "Canette";
  const formatMl = purchase.beers?.format_ml ?? "330";

  return (
    <>
      <ScreenHeader title={beerName} subtitle="Modifier l'achat." />
      <PurchaseForm
        beerId={purchase.beer_id}
        formatMl={formatMl}
        today={today}
        edit={{
          id: purchase.id,
          total_price_cents: purchase.total_price_cents,
          pack_size: purchase.pack_size,
          pack_count: purchase.pack_count,
          purchased_at: purchase.purchased_at,
          storeName: purchase.stores?.name ?? null,
        }}
      />

      <form action={deletePurchaseAction.bind(null, purchase.id, purchase.beer_id)} className="px-5 pb-6">
        <button
          type="submit"
          className="min-h-12 w-full rounded-lg border border-serigraphie/40 px-4 text-serigraphie active:bg-serigraphie/10"
        >
          Supprimer cet achat
        </button>
      </form>
    </>
  );
}

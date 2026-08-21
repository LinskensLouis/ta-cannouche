import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBeerRating } from "@/lib/beers/stats";
import { formatMlLabel, displayBrewery } from "@/lib/format";
import { CheckinRow } from "@/components/checkin/checkin-row";
import { PurchaseRow } from "@/components/purchase/purchase-row";

// Fiche bière (S2-04) : visuel, nom, brasserie, format, degré, note du groupe.
export default async function BeerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: beer } = await supabase
    .from("beers")
    .select("*, breweries(name)")
    .eq("id", id)
    .maybeSingle();

  if (!beer) notFound();

  const rating = await getBeerRating(id);
  const brewery = displayBrewery(beer.name, beer.breweries?.name);

  // Mon historique sur cette canette (S3-04).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: history } = user
    ? await supabase
        .from("checkins")
        .select("id, rating, comment, consumed_at, photo_url")
        .eq("beer_id", id)
        .eq("user_id", user.id)
        .order("consumed_at", { ascending: false })
    : { data: [] };

  // Mes achats de cette canette (S4-01), modifiables.
  const { data: purchases } = user
    ? await supabase
        .from("purchases")
        .select("id, total_price_cents, pack_size, pack_count, purchased_at, stores(name)")
        .eq("beer_id", id)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-5 px-5 pt-6">
      <div className="flex gap-4">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-alu-surface">
          {beer.image_url ? (
            <Image src={beer.image_url} alt={beer.name} fill className="object-contain" sizes="112px" />
          ) : (
            <div className="flex h-full items-center justify-center text-alu-mat">🍺</div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-1">
          <h1 className="display text-2xl leading-tight">{beer.name}</h1>
          {brewery && <p className="text-sm text-alu-mat">{brewery}</p>}
          <p className="font-mono text-xs text-alu-mat">
            {formatMlLabel(beer.format_ml)}
            {beer.abv != null && ` · ${beer.abv.toString().replace(".", ",")}°`}
            {beer.style && ` · ${beer.style}`}
          </p>
        </div>
      </div>

      {/* Note du groupe */}
      <div className="flex items-center gap-4 rounded-xl bg-alu-surface p-4">
        {rating.bayesian != null ? (
          <>
            <span className="font-mono text-3xl text-serigraphie">
              {rating.bayesian.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-sm text-alu-mat">
              note du groupe
              <br />
              <span className="font-mono text-xs">
                {rating.count} dégustation{rating.count > 1 ? "s" : ""} notée{rating.count > 1 ? "s" : ""}
              </span>
            </span>
          </>
        ) : (
          <span className="text-sm text-alu-mat">Personne ne l&apos;a encore notée. À toi de jouer.</span>
        )}
      </div>

      {/* Actions primaires */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/beer/${id}/noter`}
          className="flex min-h-12 items-center justify-center rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond"
        >
          Enregistrer une dégustation
        </Link>
        <Link
          href={`/beer/${id}/achat`}
          className="flex min-h-12 items-center justify-center rounded-lg border border-white/10 px-4 text-alu-brosse active:bg-white/5"
        >
          Enregistrer un achat
        </Link>
      </div>

      {/* Mon historique sur cette canette (chaque ligne est modifiable) */}
      {history && history.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base text-alu-mat">Mes dégustations</h2>
          {history.map((c) => (
            <CheckinRow key={c.id} checkin={{ ...c, editHref: `/checkin/${c.id}/modifier` }} />
          ))}
        </section>
      )}

      {/* Mes achats de cette canette (chaque ligne est modifiable) */}
      {purchases && purchases.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base text-alu-mat">Mes achats</h2>
          {purchases.map((p) => (
            <PurchaseRow
              key={p.id}
              purchase={{
                id: p.id,
                total_price_cents: p.total_price_cents,
                pack_size: p.pack_size,
                pack_count: p.pack_count,
                purchased_at: p.purchased_at,
                storeName: p.stores?.name ?? null,
                formatMl: beer.format_ml,
                editHref: `/purchase/${p.id}/modifier`,
              }}
            />
          ))}
        </section>
      )}
    </div>
  );
}

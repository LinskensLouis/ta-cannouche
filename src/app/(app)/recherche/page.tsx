import { ScreenHeader, EmptyState } from "@/components/layout/screen";
import { BeerCard, type BeerCardData } from "@/components/beer/beer-card";
import { createClient } from "@/lib/supabase/server";

// Recherche par nom dans le référentiel (S2-06).
export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let beers: BeerCardData[] = [];
  if (query.length >= 2) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("beers")
      .select("id, name, format_ml, image_url, breweries(name)")
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(30);
    beers = (data ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      format_ml: b.format_ml,
      image_url: b.image_url,
      brewery: b.breweries?.name ?? null,
    }));
  }

  return (
    <>
      <ScreenHeader title="Recherche" subtitle="Retrouve une canette par son nom." />

      <div className="px-5">
        <form method="get">
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Chouffe, IPA, Corona…"
            className="min-h-12 w-full rounded-lg bg-alu-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
          />
        </form>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-5">
        {query.length < 2 ? (
          <EmptyState title="Cherche une canette" hint="Tape au moins deux lettres." />
        ) : beers.length === 0 ? (
          <EmptyState
            title="Rien trouvé"
            hint="Cette canette n'est pas encore dans le référentiel — scanne-la pour l'ajouter."
          />
        ) : (
          beers.map((beer) => <BeerCard key={beer.id} beer={beer} />)
        )}
      </div>
    </>
  );
}

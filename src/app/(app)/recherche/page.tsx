import { ScreenHeader, EmptyState } from "@/components/layout/screen";
import { BeerCard } from "@/components/beer/beer-card";
import { SearchInput } from "@/components/beer/search-input";
import { searchBeers } from "@/lib/beers/search";

// Recherche par nom, brasserie/marque ou style (S2-06).
export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const beers = query.length >= 2 ? await searchBeers(query) : [];

  return (
    <>
      <ScreenHeader title="Recherche" subtitle="Par nom, marque (8.6…) ou style." />

      <div className="px-5">
        <SearchInput defaultValue={query} />
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

import Link from "next/link";
import { ScreenHeader, EmptyState } from "@/components/layout/screen";
import { BeerCard } from "@/components/beer/beer-card";
import { SearchInput } from "@/components/beer/search-input";
import { searchBeers, listCatalog } from "@/lib/beers/search";

// Recherche + catalogue parcourable (S2-06 / Tranche A) : quand rien n'est tapé,
// on liste les canettes du référentiel pour les noter sans scanner.
export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const isSearching = query.length >= 2;
  const beers = isSearching ? await searchBeers(query) : await listCatalog();

  return (
    <>
      <ScreenHeader title="Le catalogue" subtitle="Choisis une canette à noter, ou cherche par nom / marque." />

      <div className="px-5">
        <SearchInput defaultValue={query} />
      </div>

      <div className="mt-4 flex flex-col gap-2 px-5">
        {isSearching ? (
          beers.length === 0 ? (
            <EmptyState
              title="Rien trouvé"
              hint="Cette canette n'est pas encore dans le référentiel — scanne-la pour l'ajouter."
            />
          ) : (
            beers.map((beer) => <BeerCard key={beer.id} beer={beer} />)
          )
        ) : beers.length === 0 ? (
          <EmptyState
            title="Catalogue vide"
            hint="Scanne une première canette pour lancer le référentiel du groupe."
            action={
              <Link
                href="/scan"
                className="mt-2 flex min-h-12 items-center rounded-lg bg-serigraphie px-5 font-semibold text-alu-fond"
              >
                Scanner une canette
              </Link>
            }
          />
        ) : (
          <>
            <p className="text-xs text-alu-mat">Récemment ajoutées — tape dessus pour noter.</p>
            {beers.map((beer) => (
              <BeerCard key={beer.id} beer={beer} />
            ))}
          </>
        )}
      </div>
    </>
  );
}

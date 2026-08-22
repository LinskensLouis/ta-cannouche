import Link from "next/link";
import { ScreenHeader, EmptyState } from "@/components/layout/screen";
import { BeerCard } from "@/components/beer/beer-card";
import { SearchInput } from "@/components/beer/search-input";
import { searchBeers, listCatalog } from "@/lib/beers/search";

// Recherche + catalogue parcourable + ajout manuel (S2-06 / Tranche A) :
// on peut noter une canette déjà là, ou en ajouter une absente du catalogue
// (celles goûtées avant l'appli), sans passer par le scan.
export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const isSearching = query.length >= 2;
  const beers = isSearching ? await searchBeers(query) : await listCatalog();

  // Ajout manuel, avec le nom pré-rempli par la recherche en cours si présent.
  const addHref = query
    ? `/beer/nouveau?source=manual&name=${encodeURIComponent(query)}`
    : "/beer/nouveau?source=manual";

  return (
    <>
      <ScreenHeader title="Le catalogue" subtitle="Note une canette, ou ajoute-en une à la main." />

      <div className="flex flex-col gap-2 px-5">
        <SearchInput defaultValue={query} />
        <Link
          href={addHref}
          className="flex min-h-12 items-center justify-center rounded-lg border border-white/10 px-4 text-sm text-alu-brosse active:bg-white/5"
        >
          + Ajouter une canette à la main
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-5">
        {isSearching ? (
          beers.length === 0 ? (
            <EmptyState
              title="Pas dans le catalogue"
              hint="Ajoute-la à la main pour la noter — elle rejoindra le référentiel du groupe."
              action={
                <Link
                  href={addHref}
                  className="mt-2 flex min-h-12 items-center rounded-lg bg-serigraphie px-5 font-semibold text-alu-fond"
                >
                  Ajouter « {query} »
                </Link>
              }
            />
          ) : (
            beers.map((beer) => <BeerCard key={beer.id} beer={beer} />)
          )
        ) : beers.length === 0 ? (
          <EmptyState
            title="Catalogue vide"
            hint="Ajoute une première canette à la main, ou scanne-en une."
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

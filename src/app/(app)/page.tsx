import Link from "next/link";
import { ScreenHeader, EmptyState } from "@/components/layout/screen";
import { CheckinRow } from "@/components/checkin/checkin-row";
import { TrendingRail } from "@/components/beer/trending-rail";
import { getGroupFeed } from "@/lib/checkins/feed";
import { getTrendingBeers } from "@/lib/beers/trending";

// Accueil : découverte (bières du moment) + activité récente du groupe.
export default async function HomePage() {
  const [feed, trending] = await Promise.all([getGroupFeed(), getTrendingBeers()]);

  // Rien du tout : premier lancement du groupe.
  if (feed.length === 0 && trending.length === 0) {
    return (
      <>
        <ScreenHeader title="Accueil" subtitle="Les canettes du moment et l'activité du groupe." />
        <EmptyState
          title="Rien à boire ici… pour l'instant"
          hint="Scanne ou ajoute une canette pour lancer le carnet du groupe."
          action={
            <Link
              href="/scan"
              className="mt-2 flex min-h-12 items-center rounded-lg bg-serigraphie px-5 font-semibold text-alu-fond"
            >
              Scanne ta première cannouche
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Accueil" subtitle="Les canettes du moment et l'activité du groupe." />

      {trending.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="display text-base px-5 text-alu-mat">Bières du moment</h2>
          <TrendingRail beers={trending} />
        </section>
      )}

      <section className="mt-5 flex flex-col gap-2">
        <h2 className="display text-base px-5 text-alu-mat">Activité récente</h2>
        {feed.length === 0 ? (
          <p className="px-5 text-sm text-alu-mat">Pas encore de dégustation loggée récemment.</p>
        ) : (
          <div className="flex flex-col gap-2 px-5">
            {feed.map((c) => (
              <CheckinRow key={c.id} checkin={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

import Link from "next/link";
import { ScreenHeader, EmptyState } from "@/components/layout/screen";
import { ConsumptionChart } from "@/components/stats/consumption-chart";
import { RankingList } from "@/components/stats/ranking-list";
import { TierList } from "@/components/stats/tier-list";
import { createClient } from "@/lib/supabase/server";
import { getUserStats, getConsumptionSeries, PERIODS, type Period } from "@/lib/stats/user";
import { getUserTopBeers } from "@/lib/stats/rankings";
import { getGroupTierList } from "@/lib/stats/tierlist";
import { euros } from "@/lib/format";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col rounded-xl bg-alu-surface p-4">
      <span className="font-mono text-2xl text-alu-brosse">{value}</span>
      <span className="text-xs text-alu-mat">{label}</span>
    </div>
  );
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const period: Period = PERIODS.some((x) => x.key === p) ? (p as Period) : "3m";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [stats, series, tiers, myTop] = await Promise.all([
    getUserStats(user.id),
    getConsumptionSeries(user.id, period, new Date()),
    getGroupTierList(),
    getUserTopBeers(user.id),
  ]);

  const hasRatings = tiers.some((t) => t.beers.length > 0);

  const nothing = stats.checkinCount === 0 && stats.totalSpentCents === 0;

  return (
    <>
      <ScreenHeader title="Mes stats" subtitle="Conso, dépenses, classements." />

      {nothing ? (
        <EmptyState
          title="Pas encore de chiffres"
          hint="Enregistre des dégustations et des achats pour voir tes stats."
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
        <div className="flex flex-col gap-6 px-5">
          {/* Chiffres clés */}
          <div className="grid grid-cols-2 gap-2">
            <Stat value={euros(stats.totalSpentCents)} label="Dépensé au total" />
            <Stat
              value={stats.avgPerActiveWeekCents != null ? euros(stats.avgPerActiveWeekCents) : "—"}
              label="Par semaine active"
            />
            <Stat value={`${(stats.totalVolumeMl / 1000).toFixed(1).replace(".", ",")} L`} label="Volume bu" />
            <Stat value={String(stats.checkinCount)} label="Dégustations" />
          </div>

          {/* Graphique conso */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {PERIODS.map((x) => (
                <Link
                  key={x.key}
                  href={`/stats?p=${x.key}`}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    x.key === period ? "bg-serigraphie text-alu-fond" : "bg-alu-surface text-alu-mat"
                  }`}
                >
                  {x.label}
                </Link>
              ))}
            </div>
            {series.length > 0 ? (
              <ConsumptionChart points={series} />
            ) : (
              <p className="py-8 text-center text-sm text-alu-mat">Aucune dégustation sur cette période.</p>
            )}
          </div>

          {/* Tier list du groupe : meilleures → pires */}
          {hasRatings && (
            <section className="flex flex-col gap-2">
              <h2 className="display text-base">Tier list du groupe</h2>
              <TierList tiers={tiers} />
            </section>
          )}
          {myTop.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="display text-base">Mon palmarès</h2>
              <RankingList beers={myTop} />
            </section>
          )}
        </div>
      )}
    </>
  );
}

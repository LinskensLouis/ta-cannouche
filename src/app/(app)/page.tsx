import Link from "next/link";
import { ScreenHeader, EmptyState } from "@/components/layout/screen";
import { CheckinRow } from "@/components/checkin/checkin-row";
import { getGroupFeed } from "@/lib/checkins/feed";

// Feed des dégustations du groupe (S5-04).
export default async function FeedPage() {
  const feed = await getGroupFeed();

  return (
    <>
      <ScreenHeader title="Le feed" subtitle="Ce que le groupe a bu récemment." />

      {feed.length === 0 ? (
        <EmptyState
          title="Rien à boire ici… pour l'instant"
          hint="Les dégustations du groupe s'afficheront ici."
          action={
            <Link
              href="/scan"
              className="mt-2 flex min-h-12 items-center rounded-lg bg-serigraphie px-5 font-semibold text-alu-fond"
            >
              Scanne ta première cannouche
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2 px-5">
          {feed.map((c) => (
            <CheckinRow key={c.id} checkin={c} />
          ))}
        </div>
      )}
    </>
  );
}

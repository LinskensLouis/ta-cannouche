import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export type CheckinRowData = {
  id: string;
  rating: number | null;
  comment: string | null;
  consumed_at: string;
  photo_url?: string | null;
  pseudo?: string; // affiché dans le feed de groupe
  beerName?: string; // affiché dans le feed
  beerId?: string;
};

// Une ligne de dégustation, réutilisée par l'historique et le feed.
export function CheckinRow({ checkin }: { checkin: CheckinRowData }) {
  const inner = (
    <div className="flex items-start gap-3 rounded-xl bg-alu-surface p-4">
      <div className="flex min-w-14 flex-col items-center">
        {checkin.rating != null ? (
          <>
            <span className="font-mono text-xl text-serigraphie">
              {checkin.rating.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-[10px] text-alu-mat">/ 5</span>
          </>
        ) : (
          <span className="text-xs text-alu-mat">non notée</span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {(checkin.pseudo || checkin.beerName) && (
          <span className="text-sm">
            {checkin.pseudo && <span className="text-alu-brosse">{checkin.pseudo}</span>}
            {checkin.pseudo && checkin.beerName && <span className="text-alu-mat"> · </span>}
            {checkin.beerName && <span className="text-alu-brosse">{checkin.beerName}</span>}
          </span>
        )}
        {checkin.comment && <p className="text-sm text-alu-brosse">{checkin.comment}</p>}
        {checkin.photo_url && (
          <div className="relative mt-1 h-40 w-full overflow-hidden rounded-lg bg-alu-fond">
            <Image
              src={checkin.photo_url}
              alt="Photo de la dégustation"
              fill
              className="object-cover"
              sizes="(max-width: 520px) 100vw, 520px"
            />
          </div>
        )}
        <span className="font-mono text-xs text-alu-mat">{formatDate(checkin.consumed_at)}</span>
      </div>
    </div>
  );

  return checkin.beerId ? <Link href={`/beer/${checkin.beerId}`}>{inner}</Link> : inner;
}

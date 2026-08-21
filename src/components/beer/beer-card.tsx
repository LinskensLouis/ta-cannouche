import Image from "next/image";
import Link from "next/link";
import { formatMlLabel } from "@/lib/format";
import type { FormatMl } from "@/types/db";

export type BeerCardData = {
  id: string;
  name: string;
  format_ml: FormatMl;
  image_url: string | null;
  brewery: string | null;
};

// Carte compacte d'une canette dans une liste (recherche, feed…).
export function BeerCard({ beer }: { beer: BeerCardData }) {
  return (
    <Link
      href={`/beer/${beer.id}`}
      className="flex items-center gap-3 rounded-xl bg-alu-surface p-3 active:bg-white/5"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-alu-fond">
        {beer.image_url ? (
          <Image src={beer.image_url} alt={beer.name} fill className="object-contain" sizes="56px" />
        ) : (
          <div className="flex h-full items-center justify-center text-alu-mat">🍺</div>
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-base text-alu-brosse">{beer.name}</span>
        <span className="font-mono text-xs text-alu-mat">
          {formatMlLabel(beer.format_ml)}
          {beer.brewery && ` · ${beer.brewery}`}
        </span>
      </div>
    </Link>
  );
}

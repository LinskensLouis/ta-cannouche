import Link from "next/link";
import type { RankedBeer } from "@/lib/stats/rankings";

// Liste de classement (top groupe / palmarès perso). La position est marquée
// par une languette numérotée, la puce signature.
export function RankingList({ beers }: { beers: RankedBeer[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {beers.map((beer, i) => (
        <li key={beer.id}>
          <Link
            href={`/beer/${beer.id}`}
            className="flex items-center gap-3 rounded-xl bg-alu-surface p-3 active:bg-white/5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-alu-fond font-mono text-sm text-serigraphie">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-base text-alu-brosse">{beer.name}</span>
            <span className="font-mono text-sm text-serigraphie">
              {beer.score.toFixed(1).replace(".", ",")}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

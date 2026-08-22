import Image from "next/image";
import Link from "next/link";
import type { TrendingBeer } from "@/lib/beers/trending";

// Rangée horizontale de découverte : les canettes du moment, image + note.
export function TrendingRail({ beers }: { beers: TrendingBeer[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {beers.map((beer) => (
        <Link key={beer.id} href={`/beer/${beer.id}`} className="flex w-32 shrink-0 flex-col gap-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-alu-surface">
            {beer.image_url ? (
              <Image src={beer.image_url} alt={beer.name} fill className="object-contain" sizes="128px" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl">🍺</div>
            )}
            {beer.rating != null && (
              <span className="absolute bottom-1 right-1 rounded-md bg-alu-fond/85 px-1.5 py-0.5 font-mono text-xs text-serigraphie">
                {beer.rating.toFixed(1).replace(".", ",")}
              </span>
            )}
          </div>
          <span className="truncate text-sm text-alu-brosse">{beer.name}</span>
        </Link>
      ))}
    </div>
  );
}

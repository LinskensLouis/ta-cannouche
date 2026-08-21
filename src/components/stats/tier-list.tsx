import Link from "next/link";
import { Languette } from "@/components/beer/languette";
import type { Tier } from "@/lib/stats/tierlist";

// Dégradé des tiers via l'OPACITÉ de l'orange sérigraphie (S plein → D pâle) :
// une seule couleur du token, aucune couleur en dur, l'orange encode la note.
const BADGE: Record<string, string> = {
  S: "bg-serigraphie text-alu-fond",
  A: "bg-serigraphie/70 text-alu-fond",
  B: "bg-serigraphie/45 text-alu-brosse",
  C: "bg-serigraphie/25 text-alu-brosse",
  D: "bg-serigraphie/12 text-alu-brosse",
};

export function TierList({ tiers }: { tiers: Tier[] }) {
  return (
    <div className="flex flex-col gap-2">
      {tiers.map((tier) => (
        <div key={tier.key} className="flex items-stretch gap-2">
          {/* Badge du tier */}
          <div
            className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-lg py-2 ${BADGE[tier.key]}`}
          >
            <span className="display text-2xl leading-none">{tier.key}</span>
            <span className="mt-0.5 text-[10px] leading-none opacity-80">{tier.label}</span>
          </div>

          {/* Canettes du tier, en puces languette */}
          <div className="flex flex-1 flex-wrap content-center gap-1.5 rounded-lg bg-alu-surface p-2">
            {tier.beers.length === 0 ? (
              <span className="px-1 text-xs text-alu-mat">—</span>
            ) : (
              tier.beers.map((beer) => (
                <Link
                  key={beer.id}
                  href={`/beer/${beer.id}`}
                  className="flex items-center gap-1.5 rounded-full bg-alu-fond px-2.5 py-1.5 text-serigraphie active:bg-white/5"
                >
                  <Languette width={12} className="shrink-0" />
                  <span className="max-w-[130px] truncate text-sm text-alu-brosse">{beer.name}</span>
                  <span className="font-mono text-xs text-serigraphie">
                    {beer.avg.toFixed(1).replace(".", ",")}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

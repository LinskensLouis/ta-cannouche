import { euros, timeAgo } from "@/lib/format";
import type { Availability } from "@/lib/beers/availability";

// « Où la trouver » : enseignes où la canette a été vue, prix et fraîcheur.
export function AvailabilityList({ items, now }: { items: Availability[]; now: Date }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex items-center justify-between gap-3 rounded-xl bg-alu-surface p-4"
        >
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-base text-alu-brosse">
              {a.storeName}
              {a.storeCity ? ` · ${a.storeCity}` : ""}
            </span>
            <span className="font-mono text-xs text-alu-mat">
              {a.inStock ? `vue ${timeAgo(a.lastSeenAt, now)}` : `rupture signalée ${timeAgo(a.lastSeenAt, now)}`}
            </span>
          </div>
          {a.priceCents != null && (
            <span className="shrink-0 font-mono text-sm text-condensation">{euros(a.priceCents)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

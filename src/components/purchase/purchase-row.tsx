import Link from "next/link";
import { euros, pricePerLiter, formatDate } from "@/lib/format";
import type { FormatMl } from "@/types/db";

export type PurchaseRowData = {
  id: string;
  total_price_cents: number;
  pack_size: number;
  pack_count: number;
  purchased_at: string;
  storeName: string | null;
  formatMl: FormatMl;
  editHref: string;
};

// Une ligne d'achat (fiche bière → « Mes achats »), cliquable vers la modification.
export function PurchaseRow({ purchase }: { purchase: PurchaseRowData }) {
  const units = purchase.pack_size * purchase.pack_count;
  const perL = pricePerLiter(purchase.total_price_cents, Number(purchase.formatMl), units);

  return (
    <Link
      href={purchase.editHref}
      className="flex items-center justify-between gap-3 rounded-xl bg-alu-surface p-4 active:bg-white/5"
    >
      <div className="flex min-w-0 flex-col">
        <span className="font-mono text-base text-alu-brosse">{euros(purchase.total_price_cents)}</span>
        <span className="truncate text-xs text-alu-mat">
          {units} canette{units > 1 ? "s" : ""}
          {purchase.storeName ? ` · ${purchase.storeName}` : ""} · {formatDate(purchase.purchased_at)}
        </span>
      </div>
      {perL && <span className="shrink-0 font-mono text-sm text-condensation">{perL}</span>}
    </Link>
  );
}

"use client";

import { useActionState, useState } from "react";
import { createPurchaseAction, type PurchaseState } from "@/app/(app)/beer/[id]/achat/actions";
import { eurosToCents, euros, pricePerLiter } from "@/lib/format";
import type { FormatMl } from "@/types/db";

const PACK_SIZES = [1, 4, 6, 12, 24];

export function PurchaseForm({
  beerId,
  formatMl,
  today,
}: {
  beerId: string;
  formatMl: FormatMl;
  today: string;
}) {
  const [state, formAction, pending] = useActionState<PurchaseState, FormData>(
    createPurchaseAction,
    {},
  );
  const [price, setPrice] = useState("");
  const [packSize, setPackSize] = useState(6);
  const [packCount, setPackCount] = useState(1);

  // Aperçu prix unitaire et prix au litre (S4-02), recalculé en direct.
  const cents = eurosToCents(price);
  const units = packSize * packCount;
  const unit = cents != null && units > 0 ? euros(Math.round(cents / units)) : null;
  const perL = cents != null ? pricePerLiter(cents, Number(formatMl), units) : null;

  const inputClass =
    "min-h-12 w-full rounded-lg bg-alu-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie";

  return (
    <form action={formAction} className="flex flex-col gap-5 px-5 pb-6">
      <input type="hidden" name="beer_id" value={beerId} />
      <input type="hidden" name="pack_size" value={packSize} />

      <label className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Prix total payé</span>
        <input
          name="price"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="11,40"
          className={`${inputClass} font-mono`}
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Taille du lot (canettes)</span>
        <div className="grid grid-cols-5 gap-2">
          {PACK_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPackSize(n)}
              aria-pressed={packSize === n}
              className={`min-h-12 rounded-lg font-mono text-sm ${
                packSize === n ? "bg-serigraphie text-alu-fond" : "bg-alu-surface text-alu-brosse"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Nombre de lots</span>
        <input
          name="pack_count"
          type="number"
          min={1}
          value={packCount}
          onChange={(e) => setPackCount(Math.max(1, Number(e.target.value) || 1))}
          className={`${inputClass} font-mono`}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Enseigne</span>
        <input name="store" placeholder="Leclerc Mérignac" className={inputClass} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Date d&apos;achat</span>
        <input type="date" name="purchased_at" defaultValue={today} max={today} className={`${inputClass} font-mono`} />
      </label>

      {/* Aperçu en direct */}
      {unit && (
        <div className="flex justify-between rounded-lg bg-alu-surface p-3 font-mono text-sm">
          <span className="text-alu-mat">
            {units} canette{units > 1 ? "s" : ""} · {unit}/u
          </span>
          {perL && <span className="text-condensation">{perL}</span>}
        </div>
      )}

      {state.error && <p className="text-sm text-serigraphie">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond disabled:opacity-50"
      >
        {pending ? "…" : "Enregistrer l'achat"}
      </button>
    </form>
  );
}

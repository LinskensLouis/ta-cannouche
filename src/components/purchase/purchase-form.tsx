"use client";

import { useState } from "react";
import { createPurchaseAction } from "@/app/(app)/beer/[id]/achat/actions";
import { updatePurchaseAction } from "@/app/(app)/purchase/[id]/modifier/actions";
import { eurosToCents, euros, pricePerLiter } from "@/lib/format";
import type { FormatMl } from "@/types/db";

const PACK_SIZES = [1, 4, 6, 12, 24];

// Achat existant à modifier. Absent = mode création.
export type PurchaseEditData = {
  id: string;
  total_price_cents: number;
  pack_size: number;
  pack_count: number;
  purchased_at: string; // YYYY-MM-DD
  storeName: string | null;
};

function isRedirect(err: unknown): boolean {
  return !!err && typeof err === "object" && "digest" in err;
}

export function PurchaseForm({
  beerId,
  formatMl,
  today,
  edit,
}: {
  beerId: string;
  formatMl: FormatMl;
  today: string;
  edit?: PurchaseEditData;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState(
    edit ? (edit.total_price_cents / 100).toFixed(2).replace(".", ",") : "",
  );
  const [packSize, setPackSize] = useState(edit?.pack_size ?? 6);
  const [packCount, setPackCount] = useState(edit?.pack_count ?? 1);

  // Aperçu prix unitaire et prix au litre (S4-02), recalculé en direct.
  const cents = eurosToCents(price);
  const units = packSize * packCount;
  const unit = cents != null && units > 0 ? euros(Math.round(cents / units)) : null;
  const perL = cents != null ? pricePerLiter(cents, Number(formatMl), units) : null;

  const inputClass =
    "min-h-12 w-full rounded-lg bg-alu-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const priceCents = eurosToCents(price);
    if (priceCents == null) {
      setError("Prix invalide.");
      return;
    }
    setBusy(true);

    try {
      if (edit) {
        await updatePurchaseAction(edit.id, {
          beerId,
          storeName: String(new FormData(e.currentTarget).get("store") ?? "").trim() || null,
          totalPriceCents: priceCents,
          packSize,
          packCount,
          purchasedAt:
            String(new FormData(e.currentTarget).get("purchased_at") ?? "").trim() || today,
        });
      } else {
        const res = await createPurchaseAction({}, new FormData(e.currentTarget));
        if (res?.error) {
          setError(res.error);
          setBusy(false);
        }
      }
    } catch (err) {
      if (isRedirect(err)) throw err; // navigation attendue
      setError("Enregistrement impossible (réseau ?). Réessaie.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-5 pb-6">
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
        <input
          name="store"
          defaultValue={edit?.storeName ?? ""}
          placeholder="Leclerc Mérignac"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Date d&apos;achat</span>
        <input
          type="date"
          name="purchased_at"
          defaultValue={edit ? edit.purchased_at.slice(0, 10) : today}
          max={today}
          className={`${inputClass} font-mono`}
        />
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

      {error && <p className="text-sm text-serigraphie">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="min-h-12 rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond disabled:opacity-50"
      >
        {busy ? "…" : edit ? "Enregistrer les modifications" : "Enregistrer l'achat"}
      </button>
    </form>
  );
}

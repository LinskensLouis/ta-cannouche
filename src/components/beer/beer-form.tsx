"use client";

import { useActionState } from "react";
import { createManualBeerAction, type BeerFormState } from "@/app/(app)/beer/nouveau/actions";
import { FormatPicker } from "./format-picker";
import type { FormatMl } from "@/types/db";

export type BeerPrefill = {
  barcode?: string;
  name?: string;
  brand?: string;
  abv?: string;
  format?: FormatMl;
  image?: string;
  source?: string;
};

const inputClass =
  "min-h-12 w-full rounded-lg bg-alu-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie";

export function BeerForm({ prefill }: { prefill: BeerPrefill }) {
  const [state, formAction, pending] = useActionState<BeerFormState, FormData>(
    createManualBeerAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 px-5 pb-6">
      <input type="hidden" name="barcode" defaultValue={prefill.barcode ?? ""} />
      <input type="hidden" name="image" defaultValue={prefill.image ?? ""} />
      <input type="hidden" name="source" defaultValue={prefill.source ?? "manual"} />

      {prefill.source === "openfoodfacts" && (
        <p className="text-sm text-condensation">
          Trouvée sur Open Food Facts. Vérifie et complète ce qui manque.
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Nom</span>
        <input name="name" required defaultValue={prefill.name ?? ""} placeholder="La Chouffe" className={inputClass} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Brasserie</span>
        <input name="brand" defaultValue={prefill.brand ?? ""} placeholder="Achouffe" className={inputClass} />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm text-alu-mat">Format</span>
        <FormatPicker defaultValue={prefill.format} />
      </div>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-alu-mat">Degré (°)</span>
          <input
            name="abv"
            inputMode="decimal"
            defaultValue={prefill.abv ?? ""}
            placeholder="8"
            className={`${inputClass} font-mono`}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm text-alu-mat">Style</span>
          <input name="style" placeholder="Triple" className={inputClass} />
        </label>
      </div>

      {state.error && <p className="text-sm text-serigraphie">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 min-h-12 rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond disabled:opacity-50"
      >
        {pending ? "…" : "Ajouter la canette"}
      </button>
    </form>
  );
}

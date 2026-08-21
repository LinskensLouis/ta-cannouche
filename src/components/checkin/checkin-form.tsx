"use client";

import { useActionState } from "react";
import { createCheckinAction, type CheckinState } from "@/app/(app)/beer/[id]/noter/actions";
import { RatingTab } from "@/components/rating/rating-tab";
import { FormatPicker } from "@/components/beer/format-picker";
import { CONTEXTS, CONTEXT_LABELS } from "@/lib/i18n/labels";
import type { FormatMl } from "@/types/db";

export function CheckinForm({
  beerId,
  defaultFormat,
  today,
}: {
  beerId: string;
  defaultFormat: FormatMl;
  today: string;
}) {
  const [state, formAction, pending] = useActionState<CheckinState, FormData>(
    createCheckinAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-6 px-5 pb-6">
      <input type="hidden" name="beer_id" value={beerId} />

      {/* Note (facultative) */}
      <div className="rounded-2xl bg-alu-surface p-5">
        <RatingTab />
      </div>

      {/* Format */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Format bu</span>
        <FormatPicker defaultValue={defaultFormat} />
      </div>

      {/* Contexte */}
      <div className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Contexte</span>
        <div className="flex flex-wrap gap-2">
          {CONTEXTS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="context" value={c} className="peer sr-only" />
              <span className="flex min-h-12 items-center rounded-lg bg-alu-surface px-4 text-sm peer-checked:bg-serigraphie peer-checked:text-alu-fond">
                {CONTEXT_LABELS[c]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Date */}
      <label className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Date de dégustation</span>
        <input
          type="date"
          name="consumed_at"
          defaultValue={today}
          max={today}
          className="min-h-12 rounded-lg bg-alu-surface px-4 font-mono text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
        />
      </label>

      {/* Commentaire */}
      <label className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Commentaire</span>
        <textarea
          name="comment"
          rows={3}
          placeholder="Amertume, arômes, le moment…"
          className="rounded-lg bg-alu-surface px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
        />
      </label>

      {state.error && <p className="text-sm text-serigraphie">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond disabled:opacity-50"
      >
        {pending ? "…" : "Enregistrer la dégustation"}
      </button>
    </form>
  );
}

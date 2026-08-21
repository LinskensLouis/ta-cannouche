"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RatingTab } from "@/components/rating/rating-tab";
import { FormatPicker } from "@/components/beer/format-picker";
import { CONTEXTS, CONTEXT_LABELS } from "@/lib/i18n/labels";
import { submitCheckin } from "@/lib/offline/sync";
import { FORMATS, type CheckinPayload } from "@/lib/offline/types";
import type { CheckinContext, FormatMl } from "@/types/db";

export function CheckinForm({
  beerId,
  defaultFormat,
  today,
}: {
  beerId: string;
  defaultFormat: FormatMl;
  today: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);

    const format = String(form.get("format") ?? "");
    if (!FORMATS.includes(format as FormatMl)) {
      setError("Choisis un format.");
      return;
    }
    const ratingRaw = String(form.get("rating") ?? "").trim();
    const contextRaw = String(form.get("context") ?? "");
    const dateRaw = String(form.get("consumed_at") ?? "").trim();

    const payload: CheckinPayload = {
      beer_id: beerId,
      rating: ratingRaw ? Number(ratingRaw) : null,
      comment: String(form.get("comment") ?? "").trim() || null,
      quantity_ml: Number(format),
      context: CONTEXTS.includes(contextRaw as CheckinContext) ? (contextRaw as CheckinContext) : null,
      consumed_at: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(),
    };

    setBusy(true);
    // Interface optimiste : la dégustation est acceptée localement, puis
    // synchronisée (immédiatement si réseau, plus tard sinon).
    await submitCheckin(payload);
    router.push(`/beer/${beerId}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 px-5 pb-6">
      <div className="rounded-2xl bg-alu-surface p-5">
        <RatingTab />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Format bu</span>
        <FormatPicker defaultValue={defaultFormat} />
      </div>

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

      <label className="flex flex-col gap-2">
        <span className="text-sm text-alu-mat">Commentaire</span>
        <textarea
          name="comment"
          rows={3}
          placeholder="Amertume, arômes, le moment…"
          className="rounded-lg bg-alu-surface px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
        />
      </label>

      {error && <p className="text-sm text-serigraphie">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="min-h-12 rounded-lg bg-serigraphie px-4 font-semibold text-alu-fond disabled:opacity-50"
      >
        {busy ? "…" : "Enregistrer la dégustation"}
      </button>
    </form>
  );
}

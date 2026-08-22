"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mergeBeersAction } from "@/app/(app)/admin/doublons/actions";
import { formatMlLabel } from "@/lib/format";
import type { FormatMl } from "@/types/db";

export type AdminBeer = {
  id: string;
  name: string;
  format_ml: FormatMl;
  brewery: string | null;
  checkins: number;
};

// Fusion en deux temps : on choisit la canette à GARDER, puis le doublon à
// fusionner dedans, puis on confirme.
export function MergeTool({ beers }: { beers: AdminBeer[] }) {
  const router = useRouter();
  const [targetId, setTargetId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const byId = (id: string | null) => beers.find((b) => b.id === id) ?? null;
  const target = byId(targetId);
  const source = byId(sourceId);

  function onTap(id: string) {
    setError("");
    if (!targetId) return setTargetId(id);
    if (id === targetId) return setTargetId(null); // dé-sélection
    if (!sourceId) return setSourceId(id);
    if (id === sourceId) return setSourceId(null);
  }

  function reset() {
    setTargetId(null);
    setSourceId(null);
    setError("");
  }

  async function confirmMerge() {
    if (!targetId || !sourceId) return;
    setBusy(true);
    setError("");
    const res = await mergeBeersAction(sourceId, targetId);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-alu-mat">
        {!targetId
          ? "1. Touche la canette à GARDER."
          : !sourceId
            ? "2. Touche le doublon à fusionner dedans."
            : "Vérifie, puis confirme la fusion."}
      </p>

      <ul className="flex flex-col gap-2">
        {beers.map((b) => {
          const isTarget = b.id === targetId;
          const isSource = b.id === sourceId;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => onTap(b.id)}
                className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg p-3 text-left ${
                  isTarget
                    ? "bg-condensation/20 ring-1 ring-condensation"
                    : isSource
                      ? "bg-serigraphie/20 ring-1 ring-serigraphie"
                      : "bg-alu-surface active:bg-white/5"
                }`}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm text-alu-brosse">{b.name}</span>
                  <span className="font-mono text-xs text-alu-mat">
                    {formatMlLabel(b.format_ml)}
                    {b.brewery ? ` · ${b.brewery}` : ""} · {b.checkins} dég
                  </span>
                </span>
                {isTarget && <span className="shrink-0 text-xs text-condensation">à garder</span>}
                {isSource && <span className="shrink-0 text-xs text-serigraphie">à fusionner</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {error && <p className="text-sm text-serigraphie">{error}</p>}

      {target && source && (
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] flex flex-col gap-2 rounded-xl bg-alu-surface p-4">
          <p className="text-sm text-alu-brosse">
            Fusionner « {source.name} » dans « {target.name} » ? Les dégustations et achats de
            « {source.name} » seront déplacés, puis la fiche supprimée.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="min-h-12 flex-1 rounded-lg border border-white/10 text-alu-brosse active:bg-white/5"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmMerge}
              disabled={busy}
              className="min-h-12 flex-1 rounded-lg bg-serigraphie font-semibold text-alu-fond disabled:opacity-50"
            >
              {busy ? "…" : "Fusionner"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { startSync, onQueueCount, syncQueue } from "@/lib/offline/sync";

// Indicateur discret des dégustations en attente de synchronisation (S1-10).
// Monté dans la coquille ; démarre la synchro et affiche une pastille tant que
// des éléments restent en file.
export function SyncIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    startSync();
    const off = onQueueCount(setCount);
    return off;
  }, []);

  if (count <= 0) return null;

  return (
    <button
      type="button"
      onClick={() => void syncQueue()}
      aria-label={`${count} dégustation${count > 1 ? "s" : ""} en attente de synchronisation`}
      className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 mx-auto flex w-fit items-center gap-2 rounded-full bg-condensation/15 px-3 py-1.5 text-xs text-condensation"
    >
      <span className="size-2 animate-pulse rounded-full bg-condensation" />
      {count} en attente de synchro
    </button>
  );
}

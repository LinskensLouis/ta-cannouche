"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

// Recherche instantanée : met à jour le paramètre `q` de l'URL après une courte
// pause de frappe, la page serveur se recharge avec les résultats.
export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <input
      name="q"
      defaultValue={defaultValue}
      autoFocus
      inputMode="search"
      placeholder="Chouffe, 8.6, IPA…"
      aria-label="Rechercher une canette"
      onChange={(e) => {
        const value = e.target.value.trim();
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          router.replace(value ? `/recherche?q=${encodeURIComponent(value)}` : "/recherche");
        }, 250);
      }}
      className="min-h-12 w-full rounded-lg bg-alu-surface px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-serigraphie"
    />
  );
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { fetchOffBeer } from "@/lib/off/client";
import { createBeer } from "@/lib/beers/mutations";
import type { FormatMl } from "@/types/db";

// Résolution d'un code-barres vers une bière (S2-03 / S2-05).
export type Resolution =
  | { kind: "beer"; id: string }
  | {
      kind: "manual";
      prefill: {
        barcode: string;
        name?: string;
        brand?: string;
        abv?: number;
        formatMl?: FormatMl;
        imageUrl?: string;
        source: "openfoodfacts" | "manual";
      };
    };

// 1) bière déjà connue → sa fiche ; 2) trouvée sur OFF avec un format → créée
// automatiquement ; 3) trouvée sur OFF sans format sûr → formulaire pré-rempli ;
// 4) inconnue d'OFF → formulaire de création avec juste le code-barres.
export async function resolveBeerByBarcode(barcode: string): Promise<Resolution> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("beers")
    .select("id")
    .eq("barcode", barcode)
    .maybeSingle();
  if (existing) return { kind: "beer", id: existing.id };

  const off = await fetchOffBeer(barcode);

  if (off && off.formatMl) {
    const beer = await createBeer({
      barcode: off.barcode,
      name: off.name,
      brand: off.brand,
      abv: off.abv,
      formatMl: off.formatMl,
      style: null,
      imageUrl: off.imageUrl,
      source: "openfoodfacts",
      offId: off.offId,
    });
    if (beer) return { kind: "beer", id: beer.id };
  }

  if (off) {
    return {
      kind: "manual",
      prefill: {
        barcode,
        name: off.name,
        brand: off.brand ?? undefined,
        abv: off.abv ?? undefined,
        formatMl: off.formatMl ?? undefined,
        imageUrl: off.imageUrl ?? undefined,
        source: "openfoodfacts",
      },
    };
  }

  return { kind: "manual", prefill: { barcode, source: "manual" } };
}

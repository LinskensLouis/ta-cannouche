"use server";

import { redirect } from "next/navigation";
import { createBeer } from "@/lib/beers/mutations";
import type { FormatMl } from "@/types/db";

const FORMATS: FormatMl[] = ["250", "330", "440", "500"];

export type BeerFormState = { error?: string };

// Crée une canette à la main (S2-05), éventuellement pré-remplie depuis OFF.
export async function createManualBeerAction(
  _prev: BeerFormState,
  formData: FormData,
): Promise<BeerFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const format = String(formData.get("format") ?? "");
  if (!name) return { error: "Le nom de la canette est requis." };
  if (!FORMATS.includes(format as FormatMl)) return { error: "Choisis un format." };

  const barcode = String(formData.get("barcode") ?? "").trim() || null;
  const abvRaw = String(formData.get("abv") ?? "").replace(",", ".").trim();
  const abvNum = abvRaw ? Number(abvRaw) : null;
  const source = String(formData.get("source") ?? "manual") === "openfoodfacts" ? "openfoodfacts" : "manual";

  const beer = await createBeer({
    barcode,
    name,
    brand: String(formData.get("brand") ?? "").trim() || null,
    abv: abvNum != null && Number.isFinite(abvNum) ? abvNum : null,
    formatMl: format as FormatMl,
    style: String(formData.get("style") ?? "").trim() || null,
    imageUrl: String(formData.get("image") ?? "").trim() || null,
    source,
    offId: source === "openfoodfacts" ? barcode : null,
  });

  if (!beer) return { error: "Impossible de créer la canette (doublon ?)." };
  redirect(`/beer/${beer.id}`);
}

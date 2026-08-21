"use server";

import { redirect } from "next/navigation";
import { resolveBeerByBarcode } from "@/lib/beers/lookup";

// Résout un code-barres puis redirige : soit vers la fiche bière, soit vers le
// formulaire de création pré-rempli (S2-05).
export async function lookupBarcodeAction(barcode: string): Promise<void> {
  const clean = barcode.trim();
  if (!clean) return;

  const res = await resolveBeerByBarcode(clean);
  if (res.kind === "beer") redirect(`/beer/${res.id}`);

  const p = res.prefill;
  const params = new URLSearchParams();
  params.set("barcode", p.barcode);
  params.set("source", p.source);
  if (p.name) params.set("name", p.name);
  if (p.brand) params.set("brand", p.brand);
  if (p.abv) params.set("abv", String(p.abv));
  if (p.formatMl) params.set("format", p.formatMl);
  if (p.imageUrl) params.set("image", p.imageUrl);
  redirect(`/beer/nouveau?${params.toString()}`);
}

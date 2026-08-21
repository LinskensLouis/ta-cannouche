"use server";

import { redirect } from "next/navigation";
import { resolveBeerByBarcode } from "@/lib/beers/lookup";

export type LookupState = { error?: string };

// Résout un code-barres puis redirige vers la fiche ou le formulaire de création.
// Renvoie une erreur (sans rediriger) si le produit est hors périmètre.
export async function lookupBarcodeAction(barcode: string): Promise<LookupState> {
  const clean = barcode.trim();
  if (!clean) return { error: "Saisis un code-barres." };

  const res = await resolveBeerByBarcode(clean);
  if (res.kind === "bottle") {
    return { error: "Cette bière est vendue en bouteille — Ta Cannouche ne référence que les canettes." };
  }
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

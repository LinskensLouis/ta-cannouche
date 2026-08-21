import type { FormatMl } from "@/types/db";

// Intégration Open Food Facts (S2-03). API publique, sans clé.
// Doc : https://world.openfoodfacts.org/api/v2/product/{barcode}.json

export type OffBeer = {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  abv: number | null;
  formatMl: FormatMl | null; // null si non déductible → l'utilisateur choisit
  offId: string;
};

const FORMATS: FormatMl[] = ["250", "330", "440", "500"];

// Convertit une quantité OFF (« 33 cl », « 0,5 L », « 500 ml ») vers l'un de nos
// quatre formats. Retourne null si la valeur est trop loin des formats connus.
export function parseFormatMl(quantity: string | undefined | null): FormatMl | null {
  if (!quantity) return null;
  const normalized = quantity.toLowerCase().replace(",", ".");
  const match = normalized.match(/([\d.]+)\s*(ml|cl|l|litre|litres)?/);
  if (!match) return null;

  const value = Number.parseFloat(match[1] ?? "");
  if (!Number.isFinite(value)) return null;
  const unit = match[2] ?? "";

  let ml: number;
  if (unit === "ml") ml = value;
  else if (unit === "cl") ml = value * 10;
  else if (unit.startsWith("l")) ml = value * 1000;
  else ml = value; // sans unité, on suppose des ml

  // Cherche le format le plus proche, à ±20 ml de tolérance.
  let best: FormatMl | null = null;
  let bestDiff = Infinity;
  for (const f of FORMATS) {
    const diff = Math.abs(Number(f) - ml);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = f;
    }
  }
  return bestDiff <= 20 ? best : null;
}

type OffApiProduct = {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  image_url?: string;
  quantity?: string;
  categories_tags?: string[];
  packaging_tags?: string[];
  packagings?: { shape?: { id?: string } | string }[];
  nutriments?: { alcohol_100g?: number; alcohol_value?: number };
};

function isBeer(tags: string[] | undefined): boolean {
  if (!tags) return false;
  return tags.some((t) => t.includes("beer") || t === "en:beers");
}

// Périmètre : canettes uniquement (CLAUDE.md §3). On rejette une bière SEULEMENT
// si son conditionnement est explicitement une bouteille et jamais une canette.
// L'inconnu passe (bénéfice du doute) : beaucoup de canettes ont un
// conditionnement mal renseigné dans OFF, et le format reste borné aux 4 canettes.
export function isExplicitBottle(product: OffApiProduct): boolean {
  const signals = [
    ...(product.packaging_tags ?? []),
    ...(product.packagings ?? []).map((p) =>
      typeof p.shape === "string" ? p.shape : (p.shape?.id ?? ""),
    ),
  ].map((s) => s.toLowerCase());

  const hasCan = signals.some((s) => s.includes("can") || s.includes("canette"));
  const hasBottle = signals.some((s) => s.includes("bottle") || s.includes("bouteille"));
  return hasBottle && !hasCan;
}

export type OffLookup =
  | { status: "can"; beer: OffBeer }
  | { status: "bottle" } // bière trouvée mais en bouteille → hors périmètre
  | { status: "absent" }; // inconnue d'OFF ou pas une bière

// Récupère une bière canette depuis OFF par code-barres.
export async function fetchOffBeer(barcode: string): Promise<OffLookup> {
  const fields =
    "product_name,brands,image_front_url,image_url,quantity,categories_tags,packaging_tags,packagings,nutriments";
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}`;

  let json: { status?: number; product?: OffApiProduct };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TaCannouche/0.1 (app de groupe)" },
      // Cache court : une fiche produit OFF bouge peu.
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return { status: "absent" };
    json = await res.json();
  } catch {
    return { status: "absent" };
  }

  if (json.status !== 1 || !json.product) return { status: "absent" };
  const p = json.product;
  if (!isBeer(p.categories_tags)) return { status: "absent" };

  const name = p.product_name?.trim();
  if (!name) return { status: "absent" };

  // Canettes uniquement : on écarte les bouteilles.
  if (isExplicitBottle(p)) return { status: "bottle" };

  const abvRaw = p.nutriments?.alcohol_100g ?? p.nutriments?.alcohol_value;
  const abv = typeof abvRaw === "number" && abvRaw > 0 && abvRaw <= 100 ? abvRaw : null;

  return {
    status: "can",
    beer: {
      barcode,
      name,
      brand: p.brands?.split(",")[0]?.trim() || null,
      imageUrl: p.image_front_url || p.image_url || null,
      abv,
      formatMl: parseFormatMl(p.quantity),
      offId: barcode,
    },
  };
}

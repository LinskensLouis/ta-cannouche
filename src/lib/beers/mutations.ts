import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { FormatMl, Row } from "@/types/db";

// Écritures sur le référentiel bières (S2-03 / S2-05). Passent par le client
// serveur : la RLS s'applique avec la session de l'utilisateur.

// Trouve une brasserie par nom (insensible à la casse) ou la crée.
export async function findOrCreateBrewery(name: string | null): Promise<string | null> {
  const clean = name?.trim();
  if (!clean) return null;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("breweries")
    .select("id")
    .ilike("name", clean)
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("breweries")
    .insert({ name: clean })
    .select("id")
    .single();
  return created?.id ?? null;
}

export type NewBeer = {
  barcode: string | null;
  name: string;
  brand: string | null;
  abv: number | null;
  formatMl: FormatMl;
  style: string | null;
  imageUrl: string | null;
  source: "openfoodfacts" | "manual";
  offId: string | null;
};

// Crée une bière dans le référentiel et renvoie sa ligne complète.
export async function createBeer(input: NewBeer): Promise<Row<"beers"> | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const breweryId = await findOrCreateBrewery(input.brand);

  const { data, error } = await supabase
    .from("beers")
    .insert({
      barcode: input.barcode,
      name: input.name,
      brewery_id: breweryId,
      abv: input.abv,
      format_ml: input.formatMl,
      style: input.style,
      image_url: input.imageUrl,
      source: input.source,
      off_id: input.offId,
      created_by: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error) return null;
  return data;
}

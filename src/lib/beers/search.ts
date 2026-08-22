import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BeerCardData } from "@/components/beer/beer-card";

// Recherche de canettes (S2-06) : par nom, par brasserie/marque (ex. « 8.6 »,
// souvent absente du nom auto-rempli par OFF) et par style. Insensible à la casse.
const SELECT = "id, name, format_ml, image_url, breweries(name)";

// Catalogue parcourable : les canettes du référentiel, plus récentes d'abord,
// pour noter sans avoir à scanner (Tranche A du P1).
export async function listCatalog(limit = 50): Promise<BeerCardData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("beers")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    format_ml: b.format_ml,
    image_url: b.image_url,
    brewery: b.breweries?.name ?? null,
  }));
}

export async function searchBeers(query: string, limit = 30): Promise<BeerCardData[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = await createClient();
  const like = `%${q}%`;

  // Brasseries qui matchent → leurs canettes.
  const { data: breweries } = await supabase.from("breweries").select("id").ilike("name", like);
  const breweryIds = (breweries ?? []).map((b) => b.id);

  // On combine plusieurs requêtes .ilike/.in (valeurs échappées proprement)
  // plutôt qu'un .or() brut où l'entrée utilisateur casserait le filtre.
  const queries = [
    supabase.from("beers").select(SELECT).ilike("name", like).limit(limit),
    supabase.from("beers").select(SELECT).ilike("style", like).limit(limit),
  ];
  if (breweryIds.length > 0) {
    queries.push(supabase.from("beers").select(SELECT).in("brewery_id", breweryIds).limit(limit));
  }

  const results = await Promise.all(queries);

  const byId = new Map<string, BeerCardData>();
  for (const res of results) {
    for (const b of res.data ?? []) {
      if (byId.has(b.id)) continue;
      byId.set(b.id, {
        id: b.id,
        name: b.name,
        format_ml: b.format_ml,
        image_url: b.image_url,
        brewery: b.breweries?.name ?? null,
      });
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)).slice(0, limit);
}

import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/layout/screen";
import { MergeTool, type AdminBeer } from "@/components/admin/merge-tool";
import { createClient } from "@/lib/supabase/server";

// Écran admin de fusion des doublons (E2-7). Réservé aux admins.
export default async function DoublonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) notFound();

  const [beersRes, checkinsRes] = await Promise.all([
    supabase.from("beers").select("id, name, format_ml, breweries(name)").order("name"),
    supabase.from("checkins").select("beer_id"),
  ]);

  const checkinCounts = new Map<string, number>();
  for (const c of checkinsRes.data ?? []) checkinCounts.set(c.beer_id, (checkinCounts.get(c.beer_id) ?? 0) + 1);

  const beers: AdminBeer[] = (beersRes.data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    format_ml: b.format_ml,
    brewery: b.breweries?.name ?? null,
    checkins: checkinCounts.get(b.id) ?? 0,
  }));

  return (
    <>
      <ScreenHeader title="Doublons" subtitle="Fusionner deux fiches de la même canette." />
      <div className="px-5 pb-6">
        <MergeTool beers={beers} />
      </div>
    </>
  );
}

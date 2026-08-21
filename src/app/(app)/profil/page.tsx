import Link from "next/link";
import { ScreenHeader } from "@/components/layout/screen";
import { Languette } from "@/components/beer/languette";
import { createClient } from "@/lib/supabase/server";
import { getCollectedBeers } from "@/lib/checkins/collection";
import { signOutAction } from "@/app/(auth)/actions";

// Profil du membre : pseudo, mur de languettes collectées (S5-05), déconnexion.
export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let pseudo = "";
  if (user) {
    const { data } = await supabase.from("profiles").select("pseudo").eq("id", user.id).maybeSingle();
    pseudo = data?.pseudo ?? "";
  }

  const collected = user ? await getCollectedBeers(user.id) : [];

  return (
    <>
      <ScreenHeader title="Profil" />

      <section className="flex flex-col gap-4 px-5">
        <div className="flex items-center gap-4 rounded-lg bg-alu-surface p-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-serigraphie text-xl font-bold text-alu-fond">
            {(pseudo || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="display text-lg">{pseudo || "Mon profil"}</span>
            <span className="font-mono text-xs text-alu-mat">{user?.email}</span>
          </div>
        </div>

        {/* Mur des languettes : une par canette distincte goûtée */}
        <div className="flex flex-col gap-3 rounded-lg bg-alu-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="display text-base">Mes languettes</span>
            <span className="font-mono text-xs text-alu-mat">{collected.length}</span>
          </div>

          {collected.length === 0 ? (
            <p className="text-sm text-alu-mat">
              Ta collection est vide. Chaque canette goûtée y ajoute une languette.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {collected.map((beer) => (
                <Link
                  key={beer.id}
                  href={`/beer/${beer.id}`}
                  title={beer.name}
                  className="flex items-center gap-1.5 rounded-full bg-alu-fond px-2.5 py-1.5 text-serigraphie active:bg-white/5"
                >
                  <Languette width={12} className="shrink-0" />
                  <span className="max-w-[140px] truncate text-sm text-alu-brosse">{beer.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <form action={signOutAction} className="pt-2">
          <button
            type="submit"
            className="min-h-12 w-full rounded-lg border border-white/10 px-4 text-base text-alu-brosse active:bg-white/5"
          >
            Se déconnecter
          </button>
        </form>
      </section>
    </>
  );
}

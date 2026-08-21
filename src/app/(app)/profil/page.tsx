import { ScreenHeader } from "@/components/layout/screen";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/(auth)/actions";

// Profil du membre : pseudo, mur de languettes (S5-05) plus tard, déconnexion.
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

        <div className="rounded-lg bg-alu-surface p-4">
          <p className="text-sm text-alu-mat">
            Ton mur de languettes collectées s&apos;affichera ici — une par canette
            distincte goûtée.
          </p>
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

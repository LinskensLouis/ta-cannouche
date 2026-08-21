import { createBrowserClient } from "@supabase/ssr";

// Client Supabase côté navigateur. N'utilise QUE les variables NEXT_PUBLIC_* :
// la clé service_role ne doit jamais atteindre ce fichier.
// TODO S1-06 : paramétrer avec le type `Database` généré.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies dans .env.local.",
    );
  }

  return createBrowserClient(url, key);
}

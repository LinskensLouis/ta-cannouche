import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// Rafraîchit la session Supabase à chaque requête et protège les routes.
// Perf : on valide le jeton avec `getClaims()` (vérification locale de la
// signature JWT via les clés asymétriques du projet), au lieu de `getUser()`
// qui fait un aller-retour réseau vers l'Auth Supabase à chaque navigation.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // `getClaims()` renvoie les claims du JWT (dont `sub`) si la session est
  // valide, sinon `data` est null. La vérification est locale (pas de round-trip),
  // et le rafraîchissement du jeton reste assuré via la récupération de session.
  const { data } = await supabase.auth.getClaims();
  const isAuthed = !!data?.claims;

  const path = request.nextUrl.pathname;
  const isAuthRoute = path === "/login" || path === "/signup";

  // Non connecté hors des écrans d'auth → redirige vers la connexion.
  if (!isAuthed && !isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Déjà connecté sur un écran d'auth → renvoie vers l'app.
  if (isAuthed && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

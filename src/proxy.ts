import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 : la convention « middleware » a été renommée « proxy ».
// Rafraîchit la session Supabase et protège les routes (voir updateSession).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Tout sauf les assets statiques et les fichiers PWA (manifest, sw, icônes).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

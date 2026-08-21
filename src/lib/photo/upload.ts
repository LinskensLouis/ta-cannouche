import { createClient } from "@/lib/supabase/client";

// Upload d'une photo de dégustation compressée vers le bucket `checkin-photos`
// (S3-06). Chemin `<user_id>/<uuid>.jpg` pour coller aux politiques Storage.
// Renvoie l'URL publique, ou null en cas d'échec (hors-ligne inclus).
export async function uploadCheckinPhoto(blob: Blob): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const path = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from("checkin-photos")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) return null;

  return supabase.storage.from("checkin-photos").getPublicUrl(path).data.publicUrl;
}

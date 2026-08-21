-- 004_checkin_photos.sql
-- Stockage des photos de dégustation (S3-06). Bucket public en lecture (app de
-- groupe), écriture réservée à chacun dans son propre dossier `<user_id>/…`.

insert into storage.buckets (id, name, public)
values ('checkin-photos', 'checkin-photos', true)
on conflict (id) do nothing;

-- Lecture publique des objets du bucket (le bucket est public de toute façon).
create policy "checkin_photos_read"
  on storage.objects for select to public
  using (bucket_id = 'checkin-photos');

-- Chacun n'écrit que dans son dossier (premier segment du chemin = son user id).
create policy "checkin_photos_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'checkin-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "checkin_photos_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'checkin-photos' and owner = (select auth.uid()));

create policy "checkin_photos_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'checkin-photos' and owner = (select auth.uid()));

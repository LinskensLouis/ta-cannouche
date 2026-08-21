-- 003_profile_trigger.sql
-- Création automatique du profil à l'inscription (S1-07).
-- Le pseudo vient des métadonnées d'inscription (raw_user_meta_data->>'pseudo'),
-- avec repli sur la partie locale de l'email. En cas de collision de pseudo,
-- on suffixe par un numéro pour ne jamais faire échouer l'inscription.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_pseudo text;
  final_pseudo text;
  suffix int := 0;
begin
  base_pseudo := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'pseudo'), ''),
    split_part(new.email, '@', 1)
  );
  final_pseudo := base_pseudo;

  while exists (select 1 from public.profiles where pseudo = final_pseudo) loop
    suffix := suffix + 1;
    final_pseudo := base_pseudo || suffix::text;
  end loop;

  insert into public.profiles (id, pseudo, avatar_url)
  values (new.id, final_pseudo, new.raw_user_meta_data ->> 'avatar_url');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

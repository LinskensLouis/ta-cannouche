-- 007_admin_merge.sql
-- Gestion des doublons de canettes (SPECS §4.5, E2-7). Fusionner deux fiches
-- suppose de déplacer les dégustations/achats d'AUTRES membres vers la fiche
-- gardée, ce que la RLS interdit normalement. On introduit un rôle admin léger.

alter table public.profiles
  add column is_admin boolean not null default false;

-- Fonction utilitaire : l'utilisateur courant est-il admin ? SECURITY DEFINER
-- pour éviter toute récursion de RLS lors de la lecture de profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = (select auth.uid())), false);
$$;

-- Politiques admin (permissives, s'ajoutent aux politiques existantes) :
-- un admin peut déplacer n'importe quelle dégustation/achat et supprimer une bière.
create policy checkins_admin_update on public.checkins
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy purchases_admin_update on public.purchases
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy beers_admin_delete on public.beers
  for delete to authenticated
  using (public.is_admin());

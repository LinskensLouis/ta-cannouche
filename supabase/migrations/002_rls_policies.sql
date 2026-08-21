-- 002_rls_policies.sql
-- Politiques RLS (S1-05). La RLS est déjà activée (001).
-- Modèle : app de groupe fermé, pas de notion de « groupe » en base au sprint 1.
-- Règle générale : tout utilisateur AUTHENTIFIÉ lit le référentiel et l'activité
-- du groupe ; chacun n'écrit/modifie que ses propres lignes.
-- Exception : les dépenses (purchases) ne sont visibles du groupe que si le
-- propriétaire a réglé expenses_visibility = 'group' (défaut : private).

-- =========================================================================
-- profiles : lecture par tous (pseudos/avatars du groupe), écriture de soi
-- =========================================================================
create policy profiles_select on profiles
  for select to authenticated using (true);

create policy profiles_insert on profiles
  for insert to authenticated with check (id = (select auth.uid()));

create policy profiles_update on profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- =========================================================================
-- Référentiels partagés (breweries, beers, stores) :
-- lecture par tous, création/correction par tout authentifié, pas de suppression
-- =========================================================================
create policy breweries_select on breweries
  for select to authenticated using (true);
create policy breweries_insert on breweries
  for insert to authenticated with check (true);
create policy breweries_update on breweries
  for update to authenticated using (true) with check (true);

create policy beers_select on beers
  for select to authenticated using (true);
create policy beers_insert on beers
  for insert to authenticated with check (true);
create policy beers_update on beers
  for update to authenticated using (true) with check (true);

create policy stores_select on stores
  for select to authenticated using (true);
create policy stores_insert on stores
  for insert to authenticated with check (true);
create policy stores_update on stores
  for update to authenticated using (true) with check (true);

-- =========================================================================
-- checkins : lecture par tous (feed/stats de groupe), écriture réservée au propriétaire
-- =========================================================================
create policy checkins_select on checkins
  for select to authenticated using (true);
create policy checkins_insert on checkins
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy checkins_update on checkins
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy checkins_delete on checkins
  for delete to authenticated using (user_id = (select auth.uid()));

-- =========================================================================
-- purchases : lecture par le propriétaire, ou par le groupe si visibilité 'group'
-- =========================================================================
create policy purchases_select on purchases
  for select to authenticated using (
    user_id = (select auth.uid())
    or exists (
      select 1 from profiles p
      where p.id = purchases.user_id and p.expenses_visibility = 'group'
    )
  );
create policy purchases_insert on purchases
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy purchases_update on purchases
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy purchases_delete on purchases
  for delete to authenticated using (user_id = (select auth.uid()));

-- =========================================================================
-- beer_availability : lecture par tous ; chacun crée ses signalements, mais
-- tout le monde peut rafraîchir un signalement existant (last_seen_at, prix, stock)
-- =========================================================================
create policy availability_select on beer_availability
  for select to authenticated using (true);
create policy availability_insert on beer_availability
  for insert to authenticated with check (reported_by = (select auth.uid()));
create policy availability_update on beer_availability
  for update to authenticated using (true) with check (true);
create policy availability_delete on beer_availability
  for delete to authenticated using (reported_by = (select auth.uid()));

-- =========================================================================
-- lists : lecture propriétaire ou publiques ; écriture propriétaire
-- =========================================================================
create policy lists_select on lists
  for select to authenticated
  using (user_id = (select auth.uid()) or is_public = true);
create policy lists_insert on lists
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy lists_update on lists
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy lists_delete on lists
  for delete to authenticated using (user_id = (select auth.uid()));

-- =========================================================================
-- list_items : suit la visibilité/propriété de la liste parente
-- =========================================================================
create policy list_items_select on list_items
  for select to authenticated using (
    exists (
      select 1 from lists l
      where l.id = list_items.list_id
        and (l.user_id = (select auth.uid()) or l.is_public = true)
    )
  );
create policy list_items_write on list_items
  for all to authenticated using (
    exists (
      select 1 from lists l
      where l.id = list_items.list_id and l.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from lists l
      where l.id = list_items.list_id and l.user_id = (select auth.uid())
    )
  );

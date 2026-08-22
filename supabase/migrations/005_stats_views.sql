-- 005_stats_views.sql
-- Vues d'agrégation (SPECS §4.4). Objectif perf : faire les moyennes/sommes en
-- SQL plutôt que de rapatrier tous les checkins et recalculer en JS à chaque
-- affichage. `security_invoker = on` → les vues respectent la RLS de l'appelant.

-- Note de groupe par canette : moyenne brute + moyenne bayésienne (m = 3).
create view public.beer_stats
with (security_invoker = on) as
with global as (
  select avg(rating) as global_mean from public.checkins where rating is not null
)
select
  b.id as beer_id,
  b.name as beer_name,
  count(c.rating) as rating_count,
  avg(c.rating) as avg_rating,
  case
    when count(c.rating) = 0 then null
    else (count(c.rating)::numeric / (count(c.rating) + 3)) * avg(c.rating)
       + (3::numeric / (count(c.rating) + 3)) * (select global_mean from global)
  end as bayesian_rating
from public.beers b
left join public.checkins c on c.beer_id = b.id and c.rating is not null
group by b.id, b.name;

grant select on public.beer_stats to authenticated;

-- Stats agrégées par membre (dépense, semaines actives, volume, nb dégustations).
create view public.user_stats
with (security_invoker = on) as
select
  p.id as user_id,
  coalesce((select sum(total_price_cents) from public.purchases where user_id = p.id), 0) as total_spent_cents,
  coalesce((select count(distinct date_trunc('week', purchased_at)) from public.purchases where user_id = p.id), 0) as active_weeks,
  coalesce((select sum(quantity_ml) from public.checkins where user_id = p.id), 0) as total_volume_ml,
  coalesce((select count(*) from public.checkins where user_id = p.id), 0) as checkin_count
from public.profiles p;

grant select on public.user_stats to authenticated;

-- Consommation quotidienne par membre (pour le graphique de conso).
create view public.user_daily_consumption
with (security_invoker = on) as
select user_id, consumed_at::date as day, sum(quantity_ml) as ml
from public.checkins
group by user_id, consumed_at::date;

grant select on public.user_daily_consumption to authenticated;

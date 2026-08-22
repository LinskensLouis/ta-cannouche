-- 008_rating_per_user.sql
-- Une note par personne et par bière : la moyenne du groupe ne doit pas compter
-- plusieurs fois la même personne qui a dégusté la bière plusieurs fois.
-- On retient, par (bière, personne), sa dégustation notée la PLUS RÉCENTE, puis
-- on fait la moyenne de ces notes (une par personne). Les dégustations restent
-- toutes des événements (feed, conso, collection) — seule la note est dédoublonnée.

create or replace view public.beer_stats
with (security_invoker = on) as
with latest_per_user as (
  select distinct on (beer_id, user_id) beer_id, user_id, rating
  from public.checkins
  where rating is not null
  order by beer_id, user_id, consumed_at desc, created_at desc
),
global as (
  select avg(rating) as global_mean from latest_per_user
)
select
  b.id as beer_id,
  b.name as beer_name,
  count(l.rating) as rating_count, -- = nombre de personnes ayant noté
  avg(l.rating) as avg_rating,
  case
    when count(l.rating) = 0 then null
    else (count(l.rating)::numeric / (count(l.rating) + 3)) * avg(l.rating)
       + (3::numeric / (count(l.rating) + 3)) * (select global_mean from global)
  end as bayesian_rating
from public.beers b
left join latest_per_user l on l.beer_id = b.id
group by b.id, b.name;

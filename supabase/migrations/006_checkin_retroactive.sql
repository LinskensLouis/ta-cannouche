-- 006_checkin_retroactive.sql
-- Distinction log récent / déjà goûté avant (Tranche B du P1).
-- Une dégustation « rétroactive » (goûtée avant l'appli) compte dans les notes,
-- la collection et les totaux, mais n'est pas de l'activité récente : on l'exclut
-- du feed et du graphique de consommation dans le temps.

alter table public.checkins
  add column retroactive boolean not null default false;

-- Le graphique de conso ne compte que les dégustations récentes (non rétroactives).
create or replace view public.user_daily_consumption
with (security_invoker = on) as
select user_id, consumed_at::date as day, sum(quantity_ml) as ml
from public.checkins
where retroactive = false
group by user_id, consumed_at::date;

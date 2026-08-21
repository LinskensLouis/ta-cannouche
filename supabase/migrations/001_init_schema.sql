-- 001_init_schema.sql
-- Schéma initial de Ta Cannouche (SPECS §4.3).
-- Règles structurantes appliquées ici :
--   * montants en centimes entiers, jamais de float sur de la monnaie ;
--   * achat (purchases) et dégustation (checkins) séparés, lien facultatif ;
--   * rating nullable (logger une conso sans la noter) ;
--   * format_ml contraint par enum ;
--   * RLS activée sur toutes les tables dès cette migration (politiques en S1-05).

-- =========================================================================
-- Enums (valeurs en anglais ; libellés français gérés côté affichage)
-- =========================================================================

-- Formats de canette autorisés, en millilitres. Périmètre : canettes uniquement.
create type format_ml as enum ('250', '330', '440', '500');

-- Contexte de dégustation.
create type checkin_context as enum ('home', 'out', 'party', 'festival', 'other');

-- Provenance d'une fiche bière.
create type beer_source as enum ('openfoodfacts', 'manual');

-- Visibilité du suivi de dépenses d'un membre vis-à-vis du groupe.
create type expenses_visibility as enum ('private', 'group');

-- =========================================================================
-- profiles — complète auth.users (géré par Supabase Auth)
-- =========================================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null unique,
  avatar_url text,
  expenses_visibility expenses_visibility not null default 'private',
  created_at timestamptz not null default now()
);

-- =========================================================================
-- breweries — référentiel des brasseries
-- =========================================================================
create table breweries (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  country text, -- code ISO
  logo_url text
);

-- =========================================================================
-- beers — le référentiel partagé
-- =========================================================================
create table beers (
  id uuid primary key default gen_random_uuid (),
  barcode text unique, -- nullable : une artisanale peut ne pas être scannable
  name text not null,
  brewery_id uuid references breweries (id) on delete set null,
  style text, -- IPA, Pils, Triple, Stout…
  abv numeric(4, 2) check (abv is null or (abv >= 0 and abv <= 100)),
  format_ml format_ml not null,
  image_url text,
  off_id text, -- traçabilité Open Food Facts
  source beer_source not null default 'manual',
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Anti-doublon de saisie manuelle : quand il n'y a pas de code-barres, on
-- interdit deux bières de même nom (insensible à la casse), brasserie et format.
create unique index beers_manual_unique
  on beers (lower(name), brewery_id, format_ml)
  where barcode is null;

-- =========================================================================
-- stores — enseignes
-- =========================================================================
create table stores (
  id uuid primary key default gen_random_uuid (),
  chain text, -- Carrefour, Leclerc, Lidl, cave…
  name text not null, -- « Leclerc Mérignac »
  city text,
  postal_code text,
  lat numeric,
  lng numeric
);

-- =========================================================================
-- purchases — transactions datées avec prix (le différenciateur budget)
-- =========================================================================
create table purchases (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references profiles (id) on delete cascade,
  beer_id uuid not null references beers (id) on delete restrict,
  store_id uuid references stores (id) on delete set null,
  total_price_cents integer not null check (total_price_cents >= 0),
  pack_size integer not null check (pack_size > 0), -- canettes par lot : 1, 4, 6, 12, 24
  pack_count integer not null check (pack_count > 0), -- nombre de lots achetés
  purchased_at date not null default current_date
);

-- =========================================================================
-- checkins — le cœur de l'app : une dégustation datée, personnelle
-- =========================================================================
create table checkins (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references profiles (id) on delete cascade,
  beer_id uuid not null references beers (id) on delete restrict,
  -- 0,5 → 5,0 par pas de 0,5, nullable pour logger une conso sans noter.
  rating numeric(2, 1)
    check (rating is null or (rating >= 0.5 and rating <= 5.0 and (rating * 10)::int % 5 = 0)),
  comment text,
  photo_url text,
  consumed_at timestamptz not null default now(), -- saisissable, ≠ created_at
  quantity_ml integer check (quantity_ml is null or quantity_ml > 0),
  context checkin_context,
  purchase_id uuid references purchases (id) on delete set null, -- lien facultatif
  created_at timestamptz not null default now()
);

-- =========================================================================
-- beer_availability — la feature d'Owen : dispo en enseigne
-- =========================================================================
create table beer_availability (
  id uuid primary key default gen_random_uuid (),
  beer_id uuid not null references beers (id) on delete cascade,
  store_id uuid not null references stores (id) on delete cascade,
  reported_by uuid references profiles (id) on delete set null,
  last_seen_at date not null default current_date,
  price_cents integer check (price_cents is null or price_cents >= 0),
  in_stock boolean not null default true,
  unique (beer_id, store_id) -- un signalement par couple, mis à jour dans le temps
);

-- =========================================================================
-- lists / list_items — la wishlist est une liste système, pas une table dédiée
-- =========================================================================
create table lists (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references profiles (id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table list_items (
  list_id uuid not null references lists (id) on delete cascade,
  beer_id uuid not null references beers (id) on delete cascade,
  position integer not null default 0,
  note text,
  primary key (list_id, beer_id)
);

-- =========================================================================
-- Index utiles aux lectures fréquentes
-- =========================================================================
create index checkins_user_idx on checkins (user_id);
create index checkins_beer_idx on checkins (beer_id);
create index purchases_user_idx on purchases (user_id);
create index purchases_beer_idx on purchases (beer_id);
create index beer_availability_beer_idx on beer_availability (beer_id);

-- =========================================================================
-- RLS — activée partout dès maintenant. Sans politique, tout est refusé :
-- c'est volontaire, les politiques arrivent en S1-05. (CLAUDE.md §4.2)
-- =========================================================================
alter table profiles enable row level security;
alter table breweries enable row level security;
alter table beers enable row level security;
alter table stores enable row level security;
alter table purchases enable row level security;
alter table checkins enable row level security;
alter table beer_availability enable row level security;
alter table lists enable row level security;
alter table list_items enable row level security;

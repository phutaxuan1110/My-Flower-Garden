-- My Flower Garden — Supabase schema
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / OR REPLACE.

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Friend',
  garden_name text not null default 'My Flower Garden',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bouquets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  image_storage_path text,
  received_date date not null,
  occasion text,
  custom_occasion text,
  gifted_by text,
  personal_note text,
  overall_meaning text,
  is_favorite boolean not null default false,
  detection_status text not null default 'manual',
  frame_style text not null default 'classic-circle',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bouquets_user_id_idx on bouquets (user_id);

create table if not exists bouquet_flowers (
  id uuid primary key default gen_random_uuid(),
  bouquet_id uuid not null references bouquets (id) on delete cascade,
  common_name text not null,
  scientific_name text,
  color text,
  estimated_quantity integer,
  confidence numeric,
  meaning text not null,
  symbolism text[],
  source text not null default 'user'
);
create index if not exists bouquet_flowers_bouquet_id_idx on bouquet_flowers (bouquet_id);

create table if not exists garden_areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  "order" integer not null default 0,
  theme text not null default 'spring'
);
create index if not exists garden_areas_user_id_idx on garden_areas (user_id);

create table if not exists garden_placements (
  id uuid primary key default gen_random_uuid(),
  garden_area_id uuid not null references garden_areas (id) on delete cascade,
  bouquet_id uuid not null unique references bouquets (id) on delete cascade,
  slot_id text not null,
  vase_style text default 'clay-pot',
  decoration_style text default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists garden_placements_area_idx on garden_placements (garden_area_id);

-- One unguessable public link per owner. Deleting this row immediately
-- revokes the link; enabling sharing again creates a brand-new token.
create table if not exists garden_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists garden_shares_token_idx on garden_shares (token);

-- ---------------------------------------------------------------------
-- 2. Row Level Security — every user can only ever see their own rows
-- ---------------------------------------------------------------------

alter table profiles enable row level security;
alter table bouquets enable row level security;
alter table bouquet_flowers enable row level security;
alter table garden_areas enable row level security;
alter table garden_placements enable row level security;
alter table garden_shares enable row level security;

drop policy if exists "profiles: owner full access" on profiles;
create policy "profiles: owner full access" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "bouquets: owner full access" on bouquets;
create policy "bouquets: owner full access" on bouquets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "garden_areas: owner full access" on garden_areas;
create policy "garden_areas: owner full access" on garden_areas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "bouquet_flowers: owner full access" on bouquet_flowers;
create policy "bouquet_flowers: owner full access" on bouquet_flowers
  for all using (
    exists (select 1 from bouquets b where b.id = bouquet_flowers.bouquet_id and b.user_id = auth.uid())
  )
  with check (
    exists (select 1 from bouquets b where b.id = bouquet_flowers.bouquet_id and b.user_id = auth.uid())
  );

drop policy if exists "garden_placements: owner full access" on garden_placements;
create policy "garden_placements: owner full access" on garden_placements
  for all using (
    exists (select 1 from garden_areas a where a.id = garden_placements.garden_area_id and a.user_id = auth.uid())
  )
  with check (
    exists (select 1 from garden_areas a where a.id = garden_placements.garden_area_id and a.user_id = auth.uid())
  );

drop policy if exists "garden_shares: owner full access" on garden_shares;
create policy "garden_shares: owner full access" on garden_shares
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 3. Auto-create a profile row whenever someone signs up
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, garden_name)
  values (new.id, 'Friend', 'My Flower Garden')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- 4. Storage bucket for bouquet photos
-- ---------------------------------------------------------------------
-- Private bucket; every object lives under `<user_id>/...` and the policies
-- below only let a user read/write inside their own folder. The app reads
-- images back via short-lived signed URLs (see repository.supabase.ts),
-- never a public URL.

insert into storage.buckets (id, name, public)
values ('bouquet-images', 'bouquet-images', false)
on conflict (id) do nothing;

drop policy if exists "bouquet-images: owner full access" on storage.objects;
create policy "bouquet-images: owner full access" on storage.objects
  for all using (
    bucket_id = 'bouquet-images' and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'bouquet-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

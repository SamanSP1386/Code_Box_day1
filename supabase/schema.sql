-- Run this once in the Supabase dashboard: Project > SQL Editor > New query > Run.

create table if not exists public.spots (
  id bigint generated always as identity primary key,
  name text not null,
  building text not null,
  crowd_level text not null default 'empty' check (crowd_level in ('empty', 'moderate', 'crowded')),
  noise_level text not null default 'quiet' check (noise_level in ('silent', 'quiet', 'moderate', 'loud')),
  location_type text not null default 'on_campus' check (location_type in ('on_campus', 'off_campus')),
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Safe to re-run: adds the column only if this table already existed without it.
alter table public.spots add column if not exists location_type text not null default 'on_campus';

alter table public.spots drop constraint if exists spots_location_type_check;
alter table public.spots add constraint spots_location_type_check
  check (location_type in ('on_campus', 'off_campus'));

alter table public.spots enable row level security;

drop policy if exists "Anyone can read spots" on public.spots;
create policy "Anyone can read spots"
  on public.spots for select
  using (true);

drop policy if exists "Logged-in users can add spots" on public.spots;
create policy "Logged-in users can add spots"
  on public.spots for insert
  to authenticated
  with check (true);

drop policy if exists "Logged-in users can update spots" on public.spots;
create policy "Logged-in users can update spots"
  on public.spots for update
  to authenticated
  using (true);

drop policy if exists "Logged-in users can delete spots" on public.spots;
create policy "Logged-in users can delete spots"
  on public.spots for delete
  to authenticated
  using (true);

insert into public.spots (name, building, crowd_level, noise_level, created_by)
select * from (values
  ('4th Floor Reading Room', 'Kennedy Library', 'empty', 'silent', 'seed'),
  ('Baker 180 Lounge', 'Baker Center', 'moderate', 'quiet', 'seed'),
  ('Business Courtyard', 'Building 03', 'crowded', 'moderate', 'seed')
) as seed(name, building, crowd_level, noise_level, created_by)
where not exists (select 1 from public.spots);

-- A second, bigger seed pass of real-feeling, insider-knowledge spots — split
-- across on-campus and off-campus. Idempotent by (name, building), so it's
-- safe to re-run this whole file without creating duplicates.
insert into public.spots (name, building, crowd_level, noise_level, location_type, created_by)
select v.name, v.building, v.crowd_level, v.noise_level, v.location_type, v.created_by
from (values
  -- on campus
  ('The Silo Nook', 'Kennedy Library', 'empty', 'silent', 'on_campus', 'seed'),
  ('Breezeway Benches', 'Baker Center', 'moderate', 'moderate', 'on_campus', 'seed'),
  ('Under the Dexter Oaks', 'Dexter Lawn', 'moderate', 'moderate', 'on_campus', 'seed'),
  ('UU Plaza Tables', 'University Union', 'crowded', 'loud', 'on_campus', 'seed'),
  ('UU 220 Lounge', 'University Union', 'moderate', 'quiet', 'on_campus', 'seed'),
  ('Design Village Clearing', 'Poly Canyon', 'empty', 'silent', 'on_campus', 'seed'),
  ('Fab Lab Lounge', 'Bonderson Engineering Project Center', 'moderate', 'moderate', 'on_campus', 'seed'),
  ('Baker Science Atrium', 'Warren J. Baker Science Building', 'empty', 'quiet', 'on_campus', 'seed'),
  ('Spanos Lobby Steps', 'Spanos Theatre', 'empty', 'quiet', 'on_campus', 'seed'),
  ('Track-Side Benches', 'Recreation Center', 'moderate', 'loud', 'on_campus', 'seed'),
  ('Rose Float Workshop Lounge', 'Rose Float Facility', 'empty', 'moderate', 'on_campus', 'seed'),
  ('Greenhouse Benches', 'Poly Plant Shop', 'empty', 'silent', 'on_campus', 'seed'),
  ('Vista Grande Patio', 'Vista Grande', 'crowded', 'loud', 'on_campus', 'seed'),
  ('19 Metro Corner Booth', '19 Metro Station', 'moderate', 'moderate', 'on_campus', 'seed'),
  ('Print Lab Lounge', 'Graphic Communication Building', 'empty', 'quiet', 'on_campus', 'seed'),
  -- off campus
  ('Creekside Steps', 'Mission Plaza', 'moderate', 'moderate', 'off_campus', 'seed'),
  ('Reading Room', 'San Luis Obispo Public Library', 'empty', 'silent', 'off_campus', 'seed'),
  ('The Back Patio', 'Linnaea''s Café', 'moderate', 'quiet', 'off_campus', 'seed'),
  ('Higuera Street Benches', 'Downtown SLO', 'crowded', 'loud', 'off_campus', 'seed'),
  ('Corner Table by the Window', 'Foothill Blvd', 'empty', 'quiet', 'off_campus', 'seed'),
  ('Garden Street Nook', 'Downtown SLO', 'moderate', 'quiet', 'off_campus', 'seed')
) as v(name, building, crowd_level, noise_level, location_type, created_by)
where not exists (
  select 1 from public.spots s where s.name = v.name and s.building = v.building
);

-- Every logged-in user gets a "card" (first/last name, major, class year) the
-- first time they sign in. The app won't unlock the catalog until this exists.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  major text not null,
  class_year text not null check (class_year in ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad Student')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

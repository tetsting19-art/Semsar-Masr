-- سمسار مصر: Supabase SQL
-- شغّل الكود كله مرة واحدة في Supabase > SQL Editor

create table if not exists public.game_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  cash bigint not null default 85000,
  rep integer not null default 18,
  level integer not null default 1,
  office integer not null default 1,
  day integer not null default 1,
  owned jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{"deals":0,"profit":0,"flips":0}'::jsonb,
  net_worth bigint not null default 85000,
  updated_at timestamptz not null default now()
);

alter table public.game_profiles enable row level security;

drop policy if exists "read leaderboard" on public.game_profiles;
create policy "read leaderboard"
on public.game_profiles for select
to anon, authenticated
using (true);

drop policy if exists "insert own profile" on public.game_profiles;
create policy "insert own profile"
on public.game_profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "update own profile" on public.game_profiles;
create policy "update own profile"
on public.game_profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create index if not exists game_profiles_net_worth_idx
on public.game_profiles (net_worth desc);

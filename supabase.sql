-- سمسار مصر — FINAL schema
create table if not exists public.game_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique,
 cash bigint not null default 500000,
 rep integer not null default 18,
 level integer not null default 1,
 office integer not null default 1,
 day integer not null default 1,
 owned jsonb not null default '[]'::jsonb,
 stats jsonb not null default '{"deals":0,"profit":0,"flips":0,"rentIncome":0}'::jsonb,
 loans jsonb not null default '[]'::jsonb,
 rent_offers jsonb not null default '[]'::jsonb,
 staff jsonb not null default '[]'::jsonb,
 staff_offers jsonb not null default '[]'::jsonb,
 net_worth bigint not null default 500000,
 updated_at timestamptz not null default now()
);
alter table public.game_profiles enable row level security;
create index if not exists game_profiles_net_worth_idx on public.game_profiles(net_worth desc);
drop policy if exists "read own profile" on public.game_profiles;
drop policy if exists "insert own profile" on public.game_profiles;
drop policy if exists "update own profile" on public.game_profiles;
create policy "read own profile" on public.game_profiles for select to authenticated using (auth.uid()=id);
create policy "insert own profile" on public.game_profiles for insert to authenticated with check (auth.uid()=id);
create policy "update own profile" on public.game_profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);
create or replace function public.username_available(requested_username text) returns boolean language sql security definer set search_path=public as $$ select not exists(select 1 from public.game_profiles where lower(username)=lower(trim(requested_username))); $$;
create or replace function public.get_leaderboard() returns table(username text,net_worth bigint) language sql security definer set search_path=public as $$ select gp.username,gp.net_worth from public.game_profiles gp order by gp.net_worth desc limit 50; $$;
create or replace function public.get_public_player(requested_username text) returns table(username text,net_worth bigint,property_count integer,total_profit bigint,rank_name text,rank bigint) language sql security definer set search_path=public as $$
 select gp.username,gp.net_worth,jsonb_array_length(gp.owned)::integer,coalesce((gp.stats->>'profit')::bigint,0),case when gp.level>=12 then 'بارون العقارات' when gp.level>=8 then 'مليونير السوق' when gp.level>=4 then 'سمسار تقيل' else 'سمسار مبتدئ' end,(select count(*)+1 from public.game_profiles x where x.net_worth>gp.net_worth) from public.game_profiles gp where lower(gp.username)=lower(trim(requested_username)) limit 1; $$;
grant execute on function public.username_available(text) to anon,authenticated;
grant execute on function public.get_leaderboard() to authenticated;
grant execute on function public.get_public_player(text) to authenticated;

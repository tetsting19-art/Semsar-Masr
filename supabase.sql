-- سمسار مصر V4 — شغّل الملف كله مرة واحدة في Supabase > SQL Editor.
-- قبل التشغيل: Authentication > Providers > Email > اقفل Confirm email.
-- V4 يحفظ القروض والإيجارات والتطوير والصيانة داخل game_profiles.

create table if not exists public.game_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  cash bigint not null default 500000,
  rep integer not null default 18,
  level integer not null default 1,
  office integer not null default 1,
  day integer not null default 1,
  owned jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{"deals":0,"profit":0,"flips":0}'::jsonb,
  loans jsonb not null default '[]'::jsonb,
  rent_offers jsonb not null default '[]'::jsonb,
  staff jsonb not null default '[]'::jsonb,
  staff_offers jsonb not null default '[]'::jsonb,
  net_worth bigint not null default 500000,
  updated_at timestamptz not null default now()
);

alter table public.game_profiles add column if not exists loans jsonb not null default '[]'::jsonb;
alter table public.game_profiles add column if not exists rent_offers jsonb not null default '[]'::jsonb;
alter table public.game_profiles add column if not exists staff jsonb not null default '[]'::jsonb;
alter table public.game_profiles add column if not exists staff_offers jsonb not null default '[]'::jsonb;
alter table public.game_profiles enable row level security;

drop policy if exists "read leaderboard" on public.game_profiles;
drop policy if exists "read own profile" on public.game_profiles;
create policy "read own profile" on public.game_profiles
for select to authenticated using (auth.uid()=id);

drop policy if exists "insert own profile" on public.game_profiles;
create policy "insert own profile" on public.game_profiles
for insert to authenticated with check (auth.uid()=id);

drop policy if exists "update own profile" on public.game_profiles;
create policy "update own profile" on public.game_profiles
for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);

create index if not exists game_profiles_net_worth_idx on public.game_profiles(net_worth desc);

create or replace function public.username_available(requested_username text)
returns boolean
language sql
security definer
set search_path=public
as $$
  select not exists(
    select 1 from public.game_profiles
    where lower(username)=lower(trim(requested_username))
  );
$$;

create or replace function public.get_leaderboard()
returns table(username text, net_worth bigint)
language sql
security definer
set search_path=public
as $$
  select gp.username,gp.net_worth
  from public.game_profiles gp
  order by gp.net_worth desc
  limit 10;
$$;

-- المعلومات الظاهرة عند الضغط على اسم لاعب في المتصدرين.
-- لا نرجع القروض أو كلمات السر أو بيانات الحساب الداخلية.
create or replace function public.get_public_player(requested_username text)
returns table(
  username text,
  cash bigint,
  net_worth bigint,
  property_count integer,
  total_profit bigint,
  rank_name text
)
language sql
security definer
set search_path=public
as $$
  select
    gp.username,
    gp.cash,
    gp.net_worth,
    jsonb_array_length(gp.owned)::integer,
    coalesce((gp.stats->>'profit')::bigint,0),
    case
      when gp.level >= 12 then 'بارون العقارات'
      when gp.level >= 8 then 'مليونير السوق'
      when gp.level >= 4 then 'سمسار تقيل'
      else 'سمسار مبتدئ'
    end
  from public.game_profiles gp
  where lower(gp.username)=lower(trim(requested_username))
  limit 1;
$$;

grant execute on function public.username_available(text) to anon,authenticated;
grant execute on function public.get_leaderboard() to authenticated;
grant execute on function public.get_public_player(text) to authenticated;

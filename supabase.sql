-- سمسار مصر V3 — Supabase SQL
-- شغّل الكود كله مرة واحدة في Supabase > SQL Editor.
-- مهم: Authentication > Providers > Email > اقفل Confirm email.
-- اللعبة تظهر للاعب Username + Password فقط، وبتستخدم بريدًا تقنيًا داخليًا مع Supabase Auth.

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
  net_worth bigint not null default 500000,
  updated_at timestamptz not null default now()
);

alter table public.game_profiles alter column cash set default 500000;
alter table public.game_profiles alter column net_worth set default 500000;
alter table public.game_profiles enable row level security;

-- اللاعب يقرأ بيانات حسابه فقط.
drop policy if exists "read leaderboard" on public.game_profiles;
drop policy if exists "read own profile" on public.game_profiles;
create policy "read own profile" on public.game_profiles for select to authenticated
using (auth.uid() = id);

drop policy if exists "insert own profile" on public.game_profiles;
create policy "insert own profile" on public.game_profiles for insert to authenticated
with check (auth.uid() = id);

drop policy if exists "update own profile" on public.game_profiles;
create policy "update own profile" on public.game_profiles for update to authenticated
using (auth.uid() = id) with check (auth.uid() = id);

create index if not exists game_profiles_net_worth_idx on public.game_profiles (net_worth desc);

-- فحص اسم المستخدم قبل تسجيل الدخول/الإنشاء بدون كشف بيانات اللاعبين.
create or replace function public.username_available(requested_username text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.game_profiles
    where lower(username)=lower(trim(requested_username))
  );
$$;

-- الـLeaderboard يرجّع فقط الاسم والثروة، وليس بيانات الحساب الكاملة.
create or replace function public.get_leaderboard()
returns table(username text, net_worth bigint)
language sql
security definer
set search_path = public
as $$
  select gp.username, gp.net_worth
  from public.game_profiles gp
  order by gp.net_worth desc
  limit 10;
$$;

grant execute on function public.username_available(text) to anon, authenticated;
grant execute on function public.get_leaderboard() to authenticated;

-- لو عايز حسابك الحالي يبدأ من 500,000 بدل الرصيد القديم، نفّذ السطر التالي مرة واحدة فقط
-- بعد معرفة username الخاص بك، مثال:
-- update public.game_profiles set cash=500000, net_worth=500000 where username='اسمك';

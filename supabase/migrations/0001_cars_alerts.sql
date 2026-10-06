-- EVIX 段階②：マイカーと売りどきアラート
-- Supabase ダッシュボードの SQL Editor に貼って Run する。
-- 「新しいテーブルを自動的に公開する」をオフにしている前提で、権限(grant)も明示している。

create table public.cars (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  model_id    text not null,
  grade_index int  not null default 0 check (grade_index between 0 and 9),
  year        int  not null check (year between 2010 and 2100),
  km          int  not null check (km between 0 and 500000),
  soh         int  check (soh between 30 and 100),
  created_at  timestamptz not null default now()
);
create index cars_user_id_idx on public.cars (user_id);

create table public.alerts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  car_id            uuid not null references public.cars (id) on delete cascade,
  direction         text not null check (direction in ('above', 'below')),
  threshold_man_yen int  not null check (threshold_man_yen between 1 and 5000),
  created_at        timestamptz not null default now()
);
create index alerts_user_id_idx on public.alerts (user_id);
create index alerts_car_id_idx on public.alerts (car_id);

alter table public.cars   enable row level security;
alter table public.alerts enable row level security;

-- 未ログイン(anon)には何も渡さない。ログイン済みだけに必要な操作を許可する。
revoke all on public.cars, public.alerts from anon, authenticated;
grant select, insert, update, delete on public.cars, public.alerts to authenticated;

-- 自分の行だけ見える・触れる
create policy "cars: select own" on public.cars for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "cars: insert own" on public.cars for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "cars: update own" on public.cars for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "cars: delete own" on public.cars for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "alerts: select own" on public.alerts for select to authenticated
  using ((select auth.uid()) = user_id);
-- アラートは「自分の車」にだけ付けられる
create policy "alerts: insert own" on public.alerts for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.cars c where c.id = car_id and c.user_id = (select auth.uid()))
  );
create policy "alerts: delete own" on public.alerts for delete to authenticated
  using ((select auth.uid()) = user_id);

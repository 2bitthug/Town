create table if not exists public.community_time_spent (
  user_id uuid not null references auth.users(id) on delete cascade,
  community_id uuid not null references public.communities(id) on delete cascade,
  seconds_spent bigint not null default 0 check (seconds_spent >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, community_id)
);
alter table public.community_time_spent enable row level security;
drop policy if exists "Members can read own community time" on public.community_time_spent;
create policy "Members can read own community time" on public.community_time_spent
for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Members can insert own community time" on public.community_time_spent;
create policy "Members can insert own community time" on public.community_time_spent
for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Members can update own community time" on public.community_time_spent;
create policy "Members can update own community time" on public.community_time_spent
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.community_time_spent to authenticated;
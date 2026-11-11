-- Town pet progression: server-derived membership/reputation rewards and joined-community souvenirs.
-- This migration extends the companion tables created by the initial pet rollout.
create or replace function public.sync_pet_community_souvenirs()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare uid uuid := auth.uid(); added integer := 0;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  insert into public.pet_souvenirs(user_id,community_id,souvenir_key)
  select uid, cm.community_id, 'community-member'
  from public.community_memberships cm
  join public.communities c on c.id=cm.community_id
  where cm.user_id=uid and c.status='active' and c.visibility='public'
  on conflict (user_id,community_id,souvenir_key) do nothing;
  get diagnostics added = row_count;
  return added;
end;
$$;
revoke all on function public.sync_pet_community_souvenirs() from public, anon;
grant execute on function public.sync_pet_community_souvenirs() to authenticated;

-- Prevent clients from granting themselves inventory or souvenirs.
drop policy if exists "Users manage their own pet companion" on public.pet_companions;
create policy "Users manage their own pet companion" on public.pet_companions
 for all to authenticated using ((select auth.uid())=user_id)
 with check ((select auth.uid())=user_id);
drop policy if exists "Users read their pet unlocks" on public.pet_unlocks;
create policy "Users read their pet unlocks" on public.pet_unlocks
 for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Users read their pet souvenirs" on public.pet_souvenirs;
create policy "Users read their pet souvenirs" on public.pet_souvenirs
 for select to authenticated using ((select auth.uid())=user_id);

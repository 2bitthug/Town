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

-- Community souvenirs require an actual membership row; a browser-supplied
-- community ID alone is not sufficient to claim a visit reward.
create or replace function public.record_pet_community_visit(p_community_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare uid uuid := auth.uid(); inserted integer := 0;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if not exists (
    select 1 from public.community_memberships cm
    join public.communities c on c.id=cm.community_id
    where cm.user_id=uid and cm.community_id=p_community_id
      and c.status='active' and c.visibility='public'
  ) then raise exception 'Join this public downtown to earn its souvenir'; end if;
  insert into public.pet_souvenirs(user_id,community_id,souvenir_key)
  values(uid,p_community_id,'community-member')
  on conflict (user_id,community_id,souvenir_key) do nothing;
  get diagnostics inserted = row_count;
  return jsonb_build_object('collected',inserted > 0);
end;
$$;
revoke all on function public.record_pet_community_visit(uuid) from public, anon;
grant execute on function public.record_pet_community_visit(uuid) to authenticated;

-- Add the welcome toy and keep reward thresholds derived from persisted records.
create or replace function public.refresh_pet_rewards()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  member_since timestamptz;
  positive_recognition integer := 0;
  new_count integer := 0;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  select p.created_at into member_since from public.profiles p where p.id=uid;
  if member_since is null then raise exception 'Profile not found'; end if;
  select count(*) into positive_recognition
    from public.reputation_events re
   where re.user_id=uid and re.points>0
     and re.event_type in ('post_upvoted','comment_upvoted','moderator_recognition');
  insert into public.pet_unlocks(user_id,reward_key,reward_type,source)
  select uid,reward_key,reward_type,source from (values
    ('welcome-wave','trick','welcome','Welcome gift'),
    ('toy-ball','toy','welcome','Welcome gift'),
    ('mint-coat','color','membership-7d','7 days as a Town member'),
    ('reading-nook','decoration','membership-30d','30 days as a Town member'),
    ('stargazer-outfit','outfit','membership-90d','90 days as a Town member')
  ) as rewards(reward_key,reward_type,source)
  where reward_key in ('welcome-wave','toy-ball')
     or (reward_key='mint-coat' and now()>=member_since+interval '7 days')
     or (reward_key='reading-nook' and now()>=member_since+interval '30 days')
     or (reward_key='stargazer-outfit' and now()>=member_since+interval '90 days')
  on conflict(user_id,reward_key) do nothing;
  get diagnostics new_count=row_count;
  if positive_recognition>=3 then
    insert into public.pet_unlocks(user_id,reward_key,reward_type,source)
    values(uid,'helpful-sparkle','emote','3 positive community recognitions')
    on conflict(user_id,reward_key) do nothing;
    if found then new_count:=new_count+1; end if;
  end if;
  if positive_recognition>=10 then
    insert into public.pet_unlocks(user_id,reward_key,reward_type,source)
    values(uid,'friendly-trick','trick','10 positive community recognitions')
    on conflict(user_id,reward_key) do nothing;
    if found then new_count:=new_count+1; end if;
  end if;
  return jsonb_build_object('new_unlocks',new_count,'positive_recognitions',positive_recognition);
end;
$$;
revoke all on function public.refresh_pet_rewards() from public,anon;
grant execute on function public.refresh_pet_rewards() to authenticated;

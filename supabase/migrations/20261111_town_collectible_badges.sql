create schema if not exists private;

alter table public.badges
  add column if not exists criteria text,
  add column if not exists tier text not null default 'common',
  add column if not exists category text not null default 'contribution';

insert into public.badges (slug,name,description,icon,criteria,tier,category) values
('first-post','First Voice','Published your first post in Town.','post','Publish 1 post','common','publishing'),
('first-comment','Conversation Opener','Added your first comment to a discussion.','comment','Publish 1 comment','common','conversation'),
('conversation-starter','Conversation Starter','Started 10 discussions for the community.','post','Publish 10 posts','uncommon','publishing'),
('prolific-publisher','Town Chronicler','Published 100 posts on Town.','post','Publish 100 posts','epic','publishing'),
('regular-voice','Familiar Voice','Added 25 comments to community discussions.','comment','Publish 25 comments','uncommon','conversation'),
('helpful-contributor','Helpful Contributor','Received 10 positive votes across your posts and comments.','helpful','Receive 10 positive votes','rare','recognition'),
('community-builder','Community Builder','Created a downtown for others to gather in.','community','Create a downtown','rare','community'),
('town-pillar','Town Pillar','Reached 500 reputation points through contributions.','helpful','Reach 500 reputation points','epic','recognition'),
('trusted-moderator','Trusted Moderator','Served the community as a downtown moderator.','moderator','Become a downtown moderator','epic','community'),
('community-regular','Local Regular','Joined 5 downtowns and became part of their communities.','community','Join 5 downtowns','uncommon','community')
on conflict (slug) do update set name=excluded.name,description=excluded.description,icon=excluded.icon,criteria=excluded.criteria,tier=excluded.tier,category=excluded.category;

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
drop policy if exists "Badges are visible to everyone" on public.badges;
create policy "Badges are visible to everyone" on public.badges for select to anon,authenticated using (true);
drop policy if exists "Members can view their own earned badges" on public.user_badges;
create policy "Members can view their own earned badges" on public.user_badges for select to authenticated using ((select auth.uid())=user_id);
grant select on public.badges to anon,authenticated;
grant select on public.user_badges to authenticated;

create or replace function private.award_eligible_badges(p_user_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_awarded integer:=0; v_posts bigint; v_comments bigint; v_helpful bigint; v_created bigint; v_joined bigint; v_moderator boolean; v_reputation integer;
begin
 if p_user_id is null then return 0; end if;
 select count(*) into v_posts from public.posts where author_id=p_user_id and status='published';
 select count(*) into v_comments from public.comments where author_id=p_user_id and status='published';
 select count(*) into v_helpful from (
  select pv.post_id id from public.post_votes pv join public.posts p on p.id=pv.post_id where p.author_id=p_user_id and pv.value=1 and p.status='published'
  union all
  select cv.comment_id id from public.comment_votes cv join public.comments c on c.id=cv.comment_id where c.author_id=p_user_id and cv.value=1 and c.status='published'
 ) votes;
 select count(*) into v_created from public.communities where creator_id=p_user_id and status='active';
 select count(*) into v_joined from public.community_memberships where user_id=p_user_id;
 select exists(select 1 from public.community_memberships where user_id=p_user_id and role in ('moderator','admin')) into v_moderator;
 select reputation_score into v_reputation from public.profiles where id=p_user_id;
 with eligible(slug) as (
  select 'first-post' where v_posts>=1 union all select 'first-comment' where v_comments>=1
  union all select 'conversation-starter' where v_posts>=10 union all select 'prolific-publisher' where v_posts>=100
  union all select 'regular-voice' where v_comments>=25 union all select 'helpful-contributor' where v_helpful>=10
  union all select 'community-builder' where v_created>=1 union all select 'town-pillar' where coalesce(v_reputation,0)>=500
  union all select 'trusted-moderator' where v_moderator union all select 'community-regular' where v_joined>=5
 ), inserted as (
  insert into public.user_badges(user_id,badge_id,awarded_at)
  select p_user_id,b.id,now() from eligible e join public.badges b on b.slug=e.slug
  on conflict(user_id,badge_id) do nothing returning 1
 ) select count(*) into v_awarded from inserted;
 return v_awarded;
end; $$;
revoke all on function private.award_eligible_badges(uuid) from public,anon,authenticated;

create or replace function public.sync_my_badges()
returns integer language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 return private.award_eligible_badges(auth.uid());
end; $$;
revoke all on function public.sync_my_badges() from public,anon;
grant execute on function public.sync_my_badges() to authenticated;

create or replace function private.award_badges_for_new_content()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid;
begin
 if tg_table_name in ('posts','comments') then v_user_id:=new.author_id;
 elsif tg_table_name='communities' then v_user_id:=new.creator_id;
 elsif tg_table_name in ('community_memberships','profiles') then
  if tg_table_name='profiles' then v_user_id:=new.id; else v_user_id:=new.user_id; end if;
 elsif tg_table_name='post_votes' then select author_id into v_user_id from public.posts where id=new.post_id;
 elsif tg_table_name='comment_votes' then select author_id into v_user_id from public.comments where id=new.comment_id;
 end if;
 if v_user_id is not null then perform private.award_eligible_badges(v_user_id); end if;
 return new;
end; $$;
revoke all on function private.award_badges_for_new_content() from public,anon,authenticated;

drop trigger if exists award_badges_after_post on public.posts;
create trigger award_badges_after_post after insert or update of status on public.posts for each row execute function private.award_badges_for_new_content();
drop trigger if exists award_badges_after_comment on public.comments;
create trigger award_badges_after_comment after insert or update of status on public.comments for each row execute function private.award_badges_for_new_content();
drop trigger if exists award_badges_after_community on public.communities;
create trigger award_badges_after_community after insert or update of status on public.communities for each row execute function private.award_badges_for_new_content();
drop trigger if exists award_badges_after_membership on public.community_memberships;
create trigger award_badges_after_membership after insert or update of role on public.community_memberships for each row execute function private.award_badges_for_new_content();
drop trigger if exists award_badges_after_profile on public.profiles;
create trigger award_badges_after_profile after insert or update of reputation_score on public.profiles for each row execute function private.award_badges_for_new_content();
drop trigger if exists award_badges_after_post_vote on public.post_votes;
create trigger award_badges_after_post_vote after insert or update of value on public.post_votes for each row execute function private.award_badges_for_new_content();
drop trigger if exists award_badges_after_comment_vote on public.comment_votes;
create trigger award_badges_after_comment_vote after insert or update of value on public.comment_votes for each row execute function private.award_badges_for_new_content();

do $$ declare r record; begin for r in select id from public.profiles loop perform private.award_eligible_badges(r.id); end loop; end; $$;

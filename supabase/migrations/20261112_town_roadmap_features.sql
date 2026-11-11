-- Town roadmap: Q&A, notifications, safety, saved collections and community events.
-- Idempotent migration. Apply with Supabase CLI or SQL Editor before deploying the UI.

alter table public.posts add column if not exists accepted_answer_id uuid;
create index if not exists posts_accepted_answer_idx on public.posts(accepted_answer_id) where accepted_answer_id is not null;

create table if not exists public.town_notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null,
 kind text not null check (kind in ('comment','reply','answer_accepted','post_vote','community_event')),
 post_id uuid references public.posts(id) on delete cascade, comment_id uuid references public.comments(id) on delete cascade,
 community_id uuid references public.communities(id) on delete cascade, title text not null, body text not null default '',
 href text not null default '#/feed', read_at timestamptz, created_at timestamptz not null default now(),
 check (actor_id is null or actor_id <> user_id)
);
create index if not exists town_notifications_user_created_idx on public.town_notifications(user_id,created_at desc);
alter table public.town_notifications enable row level security;
drop policy if exists "Members read own notifications" on public.town_notifications;
create policy "Members read own notifications" on public.town_notifications for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Members update own notifications" on public.town_notifications;
create policy "Members update own notifications" on public.town_notifications for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,update on public.town_notifications to authenticated;

create or replace function public.notify_post_comment()
returns trigger language plpgsql security definer set search_path = '' as $$
declare post_author uuid; parent_author uuid;
begin
 select p.author_id into post_author from public.posts p where p.id=new.post_id;
 if post_author is not null and post_author<>new.author_id then
  insert into public.town_notifications(user_id,actor_id,kind,post_id,comment_id,title,body,href)
  values(post_author,new.author_id,'comment',new.post_id,new.id,'New comment on your post',left(coalesce(new.body,''),180),'#/post/'||new.post_id::text);
 end if;
 if new.parent_id is not null then
  select c.author_id into parent_author from public.comments c where c.id=new.parent_id;
  if parent_author is not null and parent_author not in (new.author_id,post_author) then
   insert into public.town_notifications(user_id,actor_id,kind,post_id,comment_id,title,body,href)
   values(parent_author,new.author_id,'reply',new.post_id,new.id,'Someone replied to your comment',left(coalesce(new.body,''),180),'#/post/'||new.post_id::text);
  end if;
 end if;
 return new;
end; $$;
drop trigger if exists town_notify_post_comment on public.comments;
create trigger town_notify_post_comment after insert on public.comments for each row execute function public.notify_post_comment();

create or replace function public.accept_town_answer(p_post_id uuid,p_comment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); post_owner uuid; comment_post uuid; post_kind text;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 select author_id,post_type into post_owner,post_kind from public.posts where id=p_post_id and status='published' for update;
 if post_owner is distinct from uid then raise exception 'Only the post author can accept an answer'; end if;
 if post_kind<>'question' then raise exception 'Accepted answers are available on questions'; end if;
 select post_id into comment_post from public.comments where id=p_comment_id and status='published';
 if comment_post is distinct from p_post_id then raise exception 'The answer must belong to this question'; end if;
 update public.posts set accepted_answer_id=p_comment_id,updated_at=now() where id=p_post_id;
 insert into public.town_notifications(user_id,actor_id,kind,post_id,comment_id,title,body,href)
 select author_id,uid,'answer_accepted',p_post_id,p_comment_id,'Your answer was accepted',left(body,180),'#/post/'||p_post_id::text
 from public.comments where id=p_comment_id and author_id<>uid;
end; $$;
revoke all on function public.accept_town_answer(uuid,uuid) from public,anon;
grant execute on function public.accept_town_answer(uuid,uuid) to authenticated;

create table if not exists public.user_blocks (
 blocker_id uuid not null references auth.users(id) on delete cascade, blocked_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);
alter table public.user_blocks enable row level security;
drop policy if exists "Members manage their own blocks" on public.user_blocks;
create policy "Members manage their own blocks" on public.user_blocks for all to authenticated using ((select auth.uid())=blocker_id) with check ((select auth.uid())=blocker_id);
grant select,insert,delete on public.user_blocks to authenticated;

create table if not exists public.saved_collections (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(char_length(name) between 1 and 60), created_at timestamptz not null default now(), unique(user_id,name)
);
alter table public.saved_posts add column if not exists collection_id uuid references public.saved_collections(id) on delete set null;
alter table public.saved_collections enable row level security;
drop policy if exists "Members manage their saved collections" on public.saved_collections;
create policy "Members manage their saved collections" on public.saved_collections for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
grant select,insert,update,delete on public.saved_collections to authenticated;
grant update on public.saved_posts to authenticated;

create table if not exists public.community_events (
 id uuid primary key default gen_random_uuid(), community_id uuid not null references public.communities(id) on delete cascade,
 created_by uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 3 and 100), description text not null default '' check(char_length(description)<=1000),
 starts_at timestamptz not null, location text not null default '' check(char_length(location)<=160), created_at timestamptz not null default now()
);
create index if not exists community_events_start_idx on public.community_events(community_id,starts_at);
alter table public.community_events enable row level security;
drop policy if exists "Public can read events in public downtowns" on public.community_events;
create policy "Public can read events in public downtowns" on public.community_events for select to anon,authenticated using (exists(select 1 from public.communities c where c.id=community_id and c.visibility='public' and c.status='active'));
drop policy if exists "Members can create downtown events" on public.community_events;
create policy "Members can create downtown events" on public.community_events for insert to authenticated with check ((select auth.uid())=created_by and exists(select 1 from public.community_memberships m where m.community_id=community_events.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','moderator','admin')));
drop policy if exists "Event creators and downtown owners can manage events" on public.community_events;
create policy "Event creators and downtown owners can manage events" on public.community_events for delete to authenticated using (created_by=(select auth.uid()) or exists(select 1 from public.community_memberships m where m.community_id=community_events.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','admin')));
grant select,insert,delete on public.community_events to authenticated;
grant select on public.community_events to anon;

create table if not exists public.moderation_audit (
 id uuid primary key default gen_random_uuid(), community_id uuid references public.communities(id) on delete set null,
 moderator_id uuid references auth.users(id) on delete set null, report_id uuid references public.reports(id) on delete set null,
 target_user_id uuid references auth.users(id) on delete set null, post_id uuid references public.posts(id) on delete set null,
 comment_id uuid references public.comments(id) on delete set null, action_type text not null, reason text not null default '',
 created_at timestamptz not null default now()
);
alter table public.moderation_audit enable row level security;
drop policy if exists "Moderators can read audit in their downtowns" on public.moderation_audit;
create policy "Moderators can read audit in their downtowns" on public.moderation_audit for select to authenticated
using (exists(select 1 from public.community_memberships m where m.community_id=moderation_audit.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','moderator','admin')));
drop policy if exists "Moderators can add audit records" on public.moderation_audit;
create policy "Moderators can add audit records" on public.moderation_audit for insert to authenticated
with check (moderator_id=(select auth.uid()) and exists(select 1 from public.community_memberships m where m.community_id=moderation_audit.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','moderator','admin')));
grant select,insert on public.moderation_audit to authenticated;

create or replace function public.block_town_member(p_blocked_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if p_blocked_id is null or p_blocked_id=uid then raise exception 'Invalid member'; end if;
 insert into public.user_blocks(blocker_id,blocked_id) values(uid,p_blocked_id) on conflict do nothing;
 delete from public.connections where (sender_id=uid and receiver_id=p_blocked_id) or (sender_id=p_blocked_id and receiver_id=uid);
end; $$;
revoke all on function public.block_town_member(uuid) from public,anon;
grant execute on function public.block_town_member(uuid) to authenticated;

-- Saved-post assignment must remain scoped to the owning member.
drop policy if exists "Members update their saved posts" on public.saved_posts;
create policy "Members update their saved posts" on public.saved_posts
for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- Keep the answer reference constrained to a comment row.
do $$ begin
 if not exists(select 1 from pg_constraint where conname='posts_accepted_answer_id_fkey') then
  alter table public.posts add constraint posts_accepted_answer_id_fkey foreign key(accepted_answer_id) references public.comments(id) on delete set null;
 end if;
end $$;

revoke all on function public.notify_post_comment() from public,anon,authenticated;


create or replace function public.notify_community_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.town_notifications(user_id,actor_id,kind,community_id,title,body,href)
 select m.user_id,new.created_by,'community_event',new.community_id,'New downtown event: '||new.title,left(coalesce(new.description,''),180),
        '#/community/'||c.slug
 from public.community_memberships m
 join public.communities c on c.id=new.community_id
 where m.community_id=new.community_id and m.user_id<>new.created_by;
 return new;
end; $$;
drop trigger if exists town_notify_community_event on public.community_events;
create trigger town_notify_community_event after insert on public.community_events for each row execute function public.notify_community_event();
revoke all on function public.notify_community_event() from public,anon,authenticated;


create table if not exists public.member_suspensions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 community_id uuid references public.communities(id) on delete cascade,
 moderator_id uuid references auth.users(id) on delete set null,
 reason text not null default '',
 starts_at timestamptz not null default now(),
 expires_at timestamptz,
 created_at timestamptz not null default now(),
 check(expires_at is null or expires_at>starts_at)
);
create index if not exists member_suspensions_active_idx on public.member_suspensions(user_id,expires_at);
alter table public.member_suspensions enable row level security;
drop policy if exists "Moderators can create member suspensions" on public.member_suspensions;
create policy "Moderators can create member suspensions" on public.member_suspensions for insert to authenticated
with check (moderator_id=(select auth.uid()) and exists(
 select 1 from public.community_memberships m where m.community_id=member_suspensions.community_id
 and m.user_id=(select auth.uid()) and m.role in ('owner','moderator','admin')
));
drop policy if exists "Moderators can read suspensions in their downtowns" on public.member_suspensions;
create policy "Moderators can read suspensions in their downtowns" on public.member_suspensions for select to authenticated
using (exists(select 1 from public.community_memberships m where m.community_id=member_suspensions.community_id
 and m.user_id=(select auth.uid()) and m.role in ('owner','moderator','admin')));
grant select,insert on public.member_suspensions to authenticated;

create or replace function public.enforce_town_member_suspension()
returns trigger language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); target_community uuid;
begin
 if uid is null then return new; end if;
 if tg_table_name='posts' then target_community:=new.community_id;
 elsif tg_table_name='comments' then select community_id into target_community from public.posts where id=new.post_id;
 elsif tg_table_name='messages' then
  if exists(select 1 from public.member_suspensions s where s.user_id=uid and s.starts_at<=now() and (s.expires_at is null or s.expires_at>now())) then
   raise exception 'Your Town account is temporarily suspended from posting and messaging.';
  end if;
  return new;
 end if;
 if exists(select 1 from public.member_suspensions s where s.user_id=uid and s.starts_at<=now()
   and (s.expires_at is null or s.expires_at>now()) and (s.community_id is null or s.community_id=target_community)) then
  raise exception 'Your account is currently suspended from contributing in this downtown.';
 end if;
 return new;
end; $$;
drop trigger if exists town_check_post_suspension on public.posts;
create trigger town_check_post_suspension before insert on public.posts for each row execute function public.enforce_town_member_suspension();
drop trigger if exists town_check_comment_suspension on public.comments;
create trigger town_check_comment_suspension before insert on public.comments for each row execute function public.enforce_town_member_suspension();
drop trigger if exists town_check_message_suspension on public.messages;
create trigger town_check_message_suspension before insert on public.messages for each row execute function public.enforce_town_member_suspension();
revoke all on function public.enforce_town_member_suspension() from public,anon,authenticated;


alter table public.town_notifications drop constraint if exists town_notifications_kind_check;
alter table public.town_notifications add constraint town_notifications_kind_check
 check (kind in ('comment','reply','answer_accepted','post_vote','community_event','moderator_warning','moderator_suspension'));


create or replace function public.notify_member_moderation(p_user_id uuid,p_kind text,p_community_id uuid,p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); community_name text;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if p_kind not in ('moderator_warning','moderator_suspension') then raise exception 'Invalid moderation notice'; end if;
 if not exists(select 1 from public.community_memberships m where m.community_id=p_community_id and m.user_id=uid and m.role in ('owner','moderator','admin')) then
  raise exception 'Moderator access required';
 end if;
 select name into community_name from public.communities where id=p_community_id;
 insert into public.town_notifications(user_id,actor_id,kind,community_id,title,body,href)
 values(p_user_id,uid,p_kind,p_community_id,
   case when p_kind='moderator_warning' then 'A moderator issued a warning' else 'A moderator suspended your contributions for 7 days' end,
   coalesce(nullif(p_reason,''),'Review the downtown rules and contact a moderator if you have questions.')||' · '||coalesce(community_name,'Downtown'),
   '#/help');
end; $$;
revoke all on function public.notify_member_moderation(uuid,text,uuid,text) from public,anon;
grant execute on function public.notify_member_moderation(uuid,text,uuid,text) to authenticated;


alter table public.town_notifications drop constraint if exists town_notifications_kind_check;
alter table public.town_notifications add constraint town_notifications_kind_check
 check (kind in ('comment','reply','mention','answer_accepted','post_vote','community_event','moderator_warning','moderator_suspension'));

create or replace function public.notify_town_mentions()
returns trigger language plpgsql security definer set search_path = '' as $$
declare match_row record; mentioned_user uuid; target_post uuid; target_title text;
begin
 if tg_table_name='posts' then target_post:=new.id; target_title:=new.title;
 else target_post:=new.post_id; select title into target_title from public.posts where id=target_post;
 end if;
 for match_row in
  select distinct lower(found[1]) as username
  from regexp_matches(coalesce(new.body,''),'@([a-z0-9_]{3,24})','g') as found
 loop
  select id into mentioned_user from public.profiles where lower(username)=match_row.username;
  if mentioned_user is not null and mentioned_user<>new.author_id then
   insert into public.town_notifications(user_id,actor_id,kind,post_id,comment_id,title,body,href)
   values(mentioned_user,new.author_id,'mention',target_post,
     case when tg_table_name='comments' then new.id else null end,
     'You were mentioned in a discussion',left(coalesce(new.body,''),180),'#/post/'||target_post::text);
  end if;
 end loop;
 return new;
end; $$;
drop trigger if exists town_notify_post_mentions on public.posts;
create trigger town_notify_post_mentions after insert on public.posts for each row execute function public.notify_town_mentions();
drop trigger if exists town_notify_comment_mentions on public.comments;
create trigger town_notify_comment_mentions after insert on public.comments for each row execute function public.notify_town_mentions();
revoke all on function public.notify_town_mentions() from public,anon,authenticated;

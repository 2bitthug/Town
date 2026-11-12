-- Cycle 1: question lifecycle and downtown-scoped topic tags.
alter table public.posts add column if not exists question_status text not null default 'open';
alter table public.posts drop constraint if exists posts_question_status_check;
alter table public.posts add constraint posts_question_status_check check (question_status in ('open','answered','closed'));
update public.posts set question_status='answered' where post_type='question' and accepted_answer_id is not null;
create table if not exists public.community_tags (
 id uuid primary key default gen_random_uuid(),
 community_id uuid not null references public.communities(id) on delete cascade,
 name text not null check(char_length(btrim(name)) between 2 and 32),
 slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 created_by uuid not null references auth.users(id) on delete restrict,
 status text not null default 'active' check(status in ('active','inactive')),
 created_at timestamptz not null default now(),
 unique(community_id,slug), unique(id,community_id)
);
create index if not exists community_tags_community_idx on public.community_tags(community_id,status,name);
create table if not exists public.post_tags (
 post_id uuid not null references public.posts(id) on delete cascade,
 tag_id uuid not null,
 community_id uuid not null,
 created_at timestamptz not null default now(),
 primary key(post_id,tag_id),
 foreign key(tag_id,community_id) references public.community_tags(id,community_id) on delete cascade
);
create index if not exists post_tags_tag_idx on public.post_tags(tag_id,post_id);
create or replace function public.validate_town_post_tag()
returns trigger language plpgsql set search_path = '' as $$
declare pc uuid; ts text;
begin
 select community_id into pc from public.posts where id=new.post_id;
 select status into ts from public.community_tags where id=new.tag_id and community_id=new.community_id;
 if pc is distinct from new.community_id then raise exception 'Tag and post must belong to the same downtown'; end if;
 if ts is distinct from 'active' then raise exception 'Tag is not active'; end if;
 return new;
end; $$;
drop trigger if exists town_validate_post_tag on public.post_tags;
create trigger town_validate_post_tag before insert or update on public.post_tags for each row execute function public.validate_town_post_tag();
alter table public.community_tags enable row level security;
alter table public.post_tags enable row level security;
drop policy if exists "Visible members read downtown tags" on public.community_tags;
create policy "Visible members read downtown tags" on public.community_tags for select to anon,authenticated
using (exists(select 1 from public.communities c where c.id=community_id and c.status='active' and c.visibility='public')
 or exists(select 1 from public.community_memberships m where m.community_id=community_tags.community_id and m.user_id=(select auth.uid())));
drop policy if exists "Downtown members create tags" on public.community_tags;
create policy "Downtown members create tags" on public.community_tags for insert to authenticated
with check (created_by=(select auth.uid()) and exists(select 1 from public.community_memberships m where m.community_id=community_tags.community_id and m.user_id=(select auth.uid())));
drop policy if exists "Tag creators and moderators manage tags" on public.community_tags;
create policy "Tag creators and moderators manage tags" on public.community_tags for update to authenticated
using (created_by=(select auth.uid()) or exists(select 1 from public.community_memberships m where m.community_id=community_tags.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','moderator','admin')))
with check (created_by=(select auth.uid()) or exists(select 1 from public.community_memberships m where m.community_id=community_tags.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','moderator','admin')));
drop policy if exists "Visible members read post tags" on public.post_tags;
create policy "Visible members read post tags" on public.post_tags for select to anon,authenticated
using (exists(select 1 from public.posts p join public.communities c on c.id=p.community_id where p.id=post_id and p.status='published' and c.status='active' and (c.visibility='public' or exists(select 1 from public.community_memberships m where m.community_id=c.id and m.user_id=(select auth.uid())))));
drop policy if exists "Authors tag their posts" on public.post_tags;
create policy "Authors tag their posts" on public.post_tags for insert to authenticated
with check (exists(select 1 from public.posts p where p.id=post_id and p.author_id=(select auth.uid()) and p.community_id=community_id));
drop policy if exists "Authors remove post tags" on public.post_tags;
create policy "Authors remove post tags" on public.post_tags for delete to authenticated
using (exists(select 1 from public.posts p where p.id=post_id and p.author_id=(select auth.uid())));
grant select,insert,update on public.community_tags to authenticated;
grant select on public.community_tags to anon;
grant select,insert,delete on public.post_tags to authenticated;
grant select on public.post_tags to anon;

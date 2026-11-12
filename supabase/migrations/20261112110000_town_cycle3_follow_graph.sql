create table if not exists public.user_follows (
 follower_id uuid not null references auth.users(id) on delete cascade,
 followed_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(follower_id,followed_id),
 constraint user_follows_no_self check(follower_id<>followed_id)
);
create table if not exists public.community_follows (
 user_id uuid not null references auth.users(id) on delete cascade,
 community_id uuid not null references public.communities(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,community_id)
);
create table if not exists public.tag_follows (
 user_id uuid not null references auth.users(id) on delete cascade,
 tag_id uuid not null references public.community_tags(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(user_id,tag_id)
);
create index if not exists user_follows_followed_idx on public.user_follows(followed_id,follower_id);
create index if not exists community_follows_community_idx on public.community_follows(community_id,user_id);
create index if not exists tag_follows_tag_idx on public.tag_follows(tag_id,user_id);
alter table public.user_follows enable row level security;
alter table public.community_follows enable row level security;
alter table public.tag_follows enable row level security;
create policy "Authenticated users can view user follows" on public.user_follows for select to authenticated using(true);
create policy "Users manage their own follows" on public.user_follows for insert to authenticated with check(follower_id=(select auth.uid()) and followed_id<>(select auth.uid()));
create policy "Users remove their own follows" on public.user_follows for delete to authenticated using(follower_id=(select auth.uid()));
create policy "Authenticated users can view community follows" on public.community_follows for select to authenticated using(true);
create policy "Users follow communities" on public.community_follows for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.communities c where c.id=community_id and c.status='active' and c.visibility='public'));
create policy "Users unfollow communities" on public.community_follows for delete to authenticated using(user_id=(select auth.uid()));
create policy "Authenticated users can view tag follows" on public.tag_follows for select to authenticated using(true);
create policy "Users follow active tags" on public.tag_follows for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.community_tags t join public.communities c on c.id=t.community_id where t.id=tag_id and t.status='active' and c.status='active' and c.visibility='public'));
create policy "Users unfollow tags" on public.tag_follows for delete to authenticated using(user_id=(select auth.uid()));
grant select,insert,delete on public.user_follows,public.community_follows,public.tag_follows to authenticated;

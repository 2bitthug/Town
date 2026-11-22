-- Town: explicit content preferences and community-led weekly questions.
create table if not exists public.user_content_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  feed_sort text not null default 'latest' check (feed_sort in ('latest','discussed','upvoted','viewed')),
  included_community_ids uuid[] not null default '{}',
  excluded_community_ids uuid[] not null default '{}',
  muted_tag_ids uuid[] not null default '{}',
  hidden_post_types text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.user_content_preferences enable row level security;
drop policy if exists "Users read their content preferences" on public.user_content_preferences;
create policy "Users read their content preferences" on public.user_content_preferences for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Users insert their content preferences" on public.user_content_preferences;
create policy "Users insert their content preferences" on public.user_content_preferences for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "Users update their content preferences" on public.user_content_preferences;
create policy "Users update their content preferences" on public.user_content_preferences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.user_content_preferences to authenticated;
create index if not exists user_content_preferences_excluded_idx on public.user_content_preferences using gin(excluded_community_ids);
create index if not exists user_content_preferences_muted_tags_idx on public.user_content_preferences using gin(muted_tag_ids);

create table if not exists public.community_weekly_features (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  nominated_by uuid not null references auth.users(id) on delete cascade,
  approved_by uuid references auth.users(id) on delete set null,
  status text not null default 'nominated' check (status in ('nominated','featured','rejected')),
  created_at timestamptz not null default now(),
  check (week_end = week_start + 6),
  unique (community_id, post_id, week_start)
);
create unique index if not exists community_weekly_one_feature_idx on public.community_weekly_features(community_id,week_start) where status='featured';
create index if not exists community_weekly_archive_idx on public.community_weekly_features(week_start desc,status,community_id);
alter table public.community_weekly_features enable row level security;
drop policy if exists "Public can read weekly community features" on public.community_weekly_features;
create policy "Public can read weekly community features" on public.community_weekly_features for select to anon,authenticated
using (exists(select 1 from public.communities c where c.id=community_id and c.status='active' and c.visibility='public')
 or exists(select 1 from public.community_memberships m where m.community_id=community_weekly_features.community_id and m.user_id=(select auth.uid())));
drop policy if exists "Members can nominate weekly questions" on public.community_weekly_features;
create policy "Members can nominate weekly questions" on public.community_weekly_features for insert to authenticated
with check (
  nominated_by=(select auth.uid()) and status='nominated' and approved_by is null
  and exists(select 1 from public.community_memberships m where m.community_id=community_weekly_features.community_id and m.user_id=(select auth.uid()))
  and exists(select 1 from public.posts p where p.id=post_id and p.community_id=community_weekly_features.community_id and p.post_type='question' and p.question_status='open' and p.accepted_answer_id is null and p.status='published')
);
drop policy if exists "Community moderators review weekly questions" on public.community_weekly_features;
create policy "Community moderators review weekly questions" on public.community_weekly_features for update to authenticated
using (exists(select 1 from public.community_memberships m where m.community_id=community_weekly_features.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','moderator')))
with check (
  approved_by=(select auth.uid()) and status in ('featured','rejected')
  and exists(select 1 from public.community_memberships m where m.community_id=community_weekly_features.community_id and m.user_id=(select auth.uid()) and m.role in ('owner','moderator'))
);
grant select,insert,update on public.community_weekly_features to authenticated;
grant select on public.community_weekly_features to anon;

-- Keep nomination identity and scope immutable after insertion.
create or replace function public.guard_town_weekly_feature_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.community_id is distinct from old.community_id
    or new.post_id is distinct from old.post_id
    or new.week_start is distinct from old.week_start
    or new.week_end is distinct from old.week_end
    or new.nominated_by is distinct from old.nominated_by then
    raise exception 'A weekly question nomination cannot be reassigned';
  end if;
  if old.status <> 'nominated' or new.status not in ('featured','rejected') then
    raise exception 'Only pending nominations can be reviewed';
  end if;
  return new;
end;
$$;
drop trigger if exists town_guard_weekly_feature_update on public.community_weekly_features;
create trigger town_guard_weekly_feature_update before update on public.community_weekly_features
for each row execute function public.guard_town_weekly_feature_update();

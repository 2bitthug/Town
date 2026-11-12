-- Public guest browsing is limited to active public downtown content.
-- Authenticated policies remain unchanged; guests receive SELECT only.
grant select on public.posts to anon, authenticated;
grant select on public.comments to anon, authenticated;

drop policy if exists "Guest visitors can view public downtowns" on public.communities;
create policy "Guest visitors can view public downtowns"
on public.communities for select to anon
using (status = 'active' and visibility = 'public');

drop policy if exists "Guest visitors can view published public posts" on public.posts;
create policy "Guest visitors can view published public posts"
on public.posts for select to anon
using (
  status = 'published'
  and exists (
    select 1 from public.communities c
    where c.id = posts.community_id
      and c.status = 'active'
      and c.visibility = 'public'
  )
);

drop policy if exists "Guest visitors can view comments on public posts" on public.comments;
create policy "Guest visitors can view comments on public posts"
on public.comments for select to anon
using (
  status <> 'removed'
  and exists (
    select 1
    from public.posts p
    join public.communities c on c.id = p.community_id
    where p.id = comments.post_id
      and p.status = 'published'
      and c.status = 'active'
      and c.visibility = 'public'
  )
);

drop policy if exists "Guest visitors can view public downtown categories" on public.community_categories;
create policy "Guest visitors can view public downtown categories"
on public.community_categories for select to anon
using (
  exists (
    select 1 from public.communities c
    where c.id = community_categories.community_id
      and c.status = 'active'
      and c.visibility = 'public'
  )
);

drop policy if exists "Guest visitors can view public downtown topics" on public.topics;
create policy "Guest visitors can view public downtown topics"
on public.topics for select to anon
using (
  exists (
    select 1 from public.communities c
    where c.id = topics.community_id
      and c.status = 'active'
      and c.visibility = 'public'
  )
);

-- Keep weekly nominations within the current UTC week and index their foreign keys.
drop policy if exists "Members can nominate weekly questions" on public.community_weekly_features;
create policy "Members can nominate weekly questions" on public.community_weekly_features for insert to authenticated
with check (
  nominated_by=(select auth.uid()) and status='nominated' and approved_by is null
  and week_start=date_trunc('week', now())::date
  and week_end=week_start+6
  and exists(select 1 from public.community_memberships m where m.community_id=community_weekly_features.community_id and m.user_id=(select auth.uid()))
  and exists(select 1 from public.posts p where p.id=post_id and p.community_id=community_weekly_features.community_id and p.post_type='question' and p.question_status='open' and p.accepted_answer_id is null and p.status='published')
);
create index if not exists community_weekly_post_idx on public.community_weekly_features(post_id);
create index if not exists community_weekly_nominator_idx on public.community_weekly_features(nominated_by);
create index if not exists community_weekly_approver_idx on public.community_weekly_features(approved_by);

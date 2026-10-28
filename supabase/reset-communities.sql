-- Town community reset: removes existing community content, preserves accounts/profiles/private messages.
-- Run in Supabase SQL Editor. Transaction rolls back if any statement fails.
begin;

do $$
declare
  seed_user uuid;
  c record;
  cat_id uuid;
  topic_id uuid;
  tbl text;
begin
  select id into seed_user from public.profiles order by created_at limit 1;
  if seed_user is null then
    raise exception 'Create at least one Town profile before resetting communities.';
  end if;

  create temporary table _old_community_ids on commit drop as select id from public.communities;
  create temporary table _old_post_ids on commit drop as select id from public.posts;
  create temporary table _old_topic_ids on commit drop as select id from public.topics;
  create temporary table _old_category_ids on commit drop as select id from public.community_categories;

  -- Remove known post/community-linked activity before deleting posts and their structure.
  if to_regclass('public.post_views') is not null then delete from public.post_views where post_id in (select id from _old_post_ids); end if;
  if to_regclass('public.post_votes') is not null then delete from public.post_votes where post_id in (select id from _old_post_ids); end if;
  if to_regclass('public.saved_posts') is not null then delete from public.saved_posts where post_id in (select id from _old_post_ids); end if;
  if to_regclass('public.reputation_events') is not null then delete from public.reputation_events where post_id in (select id from _old_post_ids) or comment_id in (select id from (select null::uuid as id) x where false); end if;
  if to_regclass('public.moderation_actions') is not null then delete from public.moderation_actions where community_id in (select id from _old_community_ids) or post_id in (select id from _old_post_ids); end if;
  if to_regclass('public.reports') is not null then delete from public.reports where community_id in (select id from _old_community_ids) or post_id in (select id from _old_post_ids); end if;
  if to_regclass('public.message_reactions') is not null then
    -- Private-message reactions are intentionally preserved.
    null;
  end if;

  -- Remove comments/replies stored in common table names when present.
  if to_regclass('public.comments') is not null then delete from public.comments where post_id in (select id from _old_post_ids); end if;
  if to_regclass('public.post_comments') is not null then delete from public.post_comments where post_id in (select id from _old_post_ids); end if;
  if to_regclass('public.comment_votes') is not null then
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='comment_votes' and column_name='comment_id') then
      execute 'delete from public.comment_votes where comment_id in (select id from public.comments)';
    end if;
  end if;

  delete from public.posts where id in (select id from _old_post_ids);
  delete from public.community_memberships where community_id in (select id from _old_community_ids);
  delete from public.topics where id in (select id from _old_topic_ids);
  delete from public.community_categories where id in (select id from _old_category_ids);
  delete from public.communities where id in (select id from _old_community_ids);

  -- Exactly 18 new, empty communities.
  for c in select * from (values
    ('Delhi','city-delhi','A community for people living in or connected to Delhi.','Cities'),
    ('Mumbai','city-mumbai','A community for people living in or connected to Mumbai.','Cities'),
    ('Bengaluru','city-bengaluru','A community for people living in or connected to Bengaluru.','Cities'),
    ('Kolkata','city-kolkata','A community for people living in or connected to Kolkata.','Cities'),
    ('Chennai','city-chennai','A community for people living in or connected to Chennai.','Cities'),
    ('Hyderabad','city-hyderabad','A community for people living in or connected to Hyderabad.','Cities'),
    ('Ahmedabad','city-ahmedabad','A community for people living in or connected to Ahmedabad.','Cities'),
    ('Surat','city-surat','A community for people living in or connected to Surat.','Cities'),
    ('Pune','city-pune','A community for people living in or connected to Pune.','Cities'),
    ('Ghaziabad','city-ghaziabad','A community for people living in or connected to Ghaziabad.','Cities'),
    ('Jaipur','city-jaipur','A community for people living in or connected to Jaipur.','Cities'),
    ('Kozhikode','city-kozhikode','A community for people living in or connected to Kozhikode.','Cities'),
    ('Lucknow','city-lucknow','A community for people living in or connected to Lucknow.','Cities'),
    ('Kochi','city-kochi','A community for people living in or connected to Kochi.','Cities'),
    ('Thrissur','city-thrissur','A community for people living in or connected to Thrissur.','Cities'),
    ('Running','activity-running','Training, routes, races, and running questions.','Activities'),
    ('Swimming','activity-swimming','Swimming practice, technique, pools, and open-water discussion.','Activities'),
    ('Cycling','activity-cycling','Cycling routes, equipment, training, and group rides.','Activities')
  ) as v(name,slug,description,category) loop
    insert into public.communities (name, slug, description, rules, category, creator_id, visibility, status)
    values (c.name,c.slug,c.description,'Be constructive and respectful. Stay on topic. No harassment, spam, or personal attacks.',c.category,seed_user,'public','active');
    insert into public.community_memberships (community_id,user_id,role)
    select id,seed_user,'owner' from public.communities where slug=c.slug
    on conflict (community_id,user_id) do update set role='owner';

  end loop;
end $$;

-- Add one default category and topic to each new community so the post composer works.
do $$
declare c record; cat_id uuid;
begin
  for c in select id,name,category from public.communities where slug in (
    'city-delhi','city-mumbai','city-bengaluru','city-kolkata','city-chennai','city-hyderabad','city-ahmedabad','city-surat','city-pune','city-ghaziabad','city-jaipur','city-kozhikode','city-lucknow','city-kochi','city-thrissur','activity-running','activity-swimming','activity-cycling'
  ) loop
    insert into public.community_categories (community_id,name,description,position)
    values (c.id,'General','General questions and discussions',1) returning id into cat_id;
    insert into public.topics (community_id,category_id,name,description)
    values (c.id,cat_id,'General','General questions and discussions');
  end loop;
end $$;

commit;

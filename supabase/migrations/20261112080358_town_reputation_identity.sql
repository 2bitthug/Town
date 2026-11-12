-- Town reputation integrity and member identity
-- Preserve existing reputation scores; this migration does not backfill or recalculate them.

create or replace function public.add_reputation_event(
  target_user uuid, event_kind text, point_value integer,
  target_post uuid default null, target_comment uuid default null
)
returns void language plpgsql security definer set search_path = ''
as $function$
begin
  if target_user is null or point_value = 0 then return; end if;
  insert into public.reputation_events(user_id, event_type, points, post_id, comment_id)
  values (target_user, event_kind, point_value, target_post, target_comment);
  update public.profiles
  set reputation_score = coalesce(reputation_score, 0) + point_value
  where id = target_user;
end;
$function$;

revoke all on function public.add_reputation_event(uuid, text, integer, uuid, uuid) from public, anon, authenticated;
revoke all on function public.recalculate_profile_reputation(uuid) from public, anon, authenticated;
revoke all on function public.reputation_on_post_vote_for_value(uuid, uuid, smallint, integer) from public, anon, authenticated;

revoke insert, update on table public.profiles from anon, authenticated;
revoke insert (
  id, username, created_at, bio, interests, display_name, accent_color,
  banner_preset, profile_sections, reputation_score, avatar_id, pet_name, pet_id
) on table public.profiles from authenticated;
revoke update (
  id, username, created_at, bio, interests, display_name, accent_color,
  banner_preset, profile_sections, reputation_score, avatar_id, pet_name, pet_id
) on table public.profiles from authenticated;
grant insert (
  id, username, bio, interests, display_name, accent_color,
  banner_preset, profile_sections, avatar_id, pet_name, pet_id
) on table public.profiles to authenticated;
grant update (
  username, bio, interests, display_name, accent_color,
  banner_preset, profile_sections, avatar_id, pet_name, pet_id
) on table public.profiles to authenticated;

revoke all privileges on table public.reputation_events from anon, authenticated;
grant select on table public.reputation_events to anon, authenticated;
drop policy if exists reputation_events_public_read on public.reputation_events;
create policy reputation_events_public_read on public.reputation_events
  for select to anon, authenticated using (true);
create index if not exists reputation_events_user_created_idx
  on public.reputation_events (user_id, created_at desc);

create or replace function public.get_public_reputation_breakdown(target_user_id uuid)
returns table(event_type text, event_count bigint, points_total bigint)
language sql stable security invoker set search_path = ''
as $function$
  select re.event_type, count(*)::bigint, coalesce(sum(re.points), 0)::bigint
  from public.reputation_events re
  where re.user_id = target_user_id
  group by re.event_type
  order by re.event_type;
$function$;
revoke all on function public.get_public_reputation_breakdown(uuid) from public;
grant execute on function public.get_public_reputation_breakdown(uuid) to anon, authenticated;

create or replace function public.accept_town_answer(p_post_id uuid, p_comment_id uuid)
returns void language plpgsql security definer set search_path = ''
as $function$
declare
  uid uuid := auth.uid();
  post_owner uuid;
  post_kind text;
  old_answer uuid;
  old_answer_author uuid;
  comment_post uuid;
  new_answer_author uuid;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  select author_id, post_type, accepted_answer_id
    into post_owner, post_kind, old_answer
  from public.posts where id = p_post_id and status = 'published' for update;
  if post_owner is distinct from uid then raise exception 'Only the post author can accept an answer'; end if;
  if post_kind <> 'question' then raise exception 'Accepted answers are available on questions'; end if;
  if old_answer is not distinct from p_comment_id then return; end if;
  select post_id, author_id into comment_post, new_answer_author
  from public.comments where id = p_comment_id and status = 'published';
  if comment_post is distinct from p_post_id then raise exception 'The answer must belong to this question'; end if;
  if old_answer is not null then
    select author_id into old_answer_author from public.comments where id = old_answer;
    if old_answer_author is not null and old_answer_author <> uid then
      perform public.add_reputation_event(old_answer_author, 'answer_unaccepted', -10, p_post_id, old_answer);
    end if;
  end if;
  update public.posts set accepted_answer_id = p_comment_id, question_status = 'answered', updated_at = now()
  where id = p_post_id;
  if new_answer_author is not null and new_answer_author <> uid then
    perform public.add_reputation_event(new_answer_author, 'answer_accepted', 10, p_post_id, p_comment_id);
  end if;
end;
$function$;
revoke all on function public.accept_town_answer(uuid, uuid) from public, anon;
grant execute on function public.accept_town_answer(uuid, uuid) to authenticated;

create or replace function public.prevent_town_self_vote()
returns trigger language plpgsql security definer set search_path = ''
as $function$
declare content_author uuid;
begin
  if tg_table_name = 'post_votes' then
    select p.author_id into content_author from public.posts p where p.id = new.post_id;
  else
    select c.author_id into content_author from public.comments c where c.id = new.comment_id;
  end if;
  if content_author is not null and content_author = new.user_id then
    raise exception 'You cannot vote on your own content';
  end if;
  return new;
end;
$function$;
revoke all on function public.prevent_town_self_vote() from public, anon, authenticated;
drop trigger if exists prevent_self_post_vote on public.post_votes;
create trigger prevent_self_post_vote before insert or update of post_id, user_id
  on public.post_votes for each row execute function public.prevent_town_self_vote();
drop trigger if exists prevent_self_comment_vote on public.comment_votes;
create trigger prevent_self_comment_vote before insert or update of comment_id, user_id
  on public.comment_votes for each row execute function public.prevent_town_self_vote();

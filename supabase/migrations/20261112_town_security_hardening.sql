-- Harden new RPC operations: keep callable business functions SECURITY INVOKER.
-- Notification writes that target other members are performed only by table triggers.

create or replace function public.accept_town_answer(p_post_id uuid,p_comment_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare uid uuid:=auth.uid(); post_owner uuid; comment_post uuid; post_kind text;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 select author_id,post_type into post_owner,post_kind from public.posts where id=p_post_id and status='published' for update;
 if post_owner is distinct from uid then raise exception 'Only the post author can accept an answer'; end if;
 if post_kind<>'question' then raise exception 'Accepted answers are available on questions'; end if;
 select post_id into comment_post from public.comments where id=p_comment_id and status='published';
 if comment_post is distinct from p_post_id then raise exception 'The answer must belong to this question'; end if;
 update public.posts set accepted_answer_id=p_comment_id,updated_at=now() where id=p_post_id;
end; $$;
revoke all on function public.accept_town_answer(uuid,uuid) from public,anon;
grant execute on function public.accept_town_answer(uuid,uuid) to authenticated;

create or replace function public.notify_accepted_town_answer()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.accepted_answer_id is not null and new.accepted_answer_id is distinct from old.accepted_answer_id then
  insert into public.town_notifications(user_id,actor_id,kind,post_id,comment_id,title,body,href)
  select c.author_id,new.author_id,'answer_accepted',new.id,c.id,'Your answer was accepted',left(c.body,180),'#/post/'||new.id::text
  from public.comments c where c.id=new.accepted_answer_id and c.author_id<>new.author_id;
 end if;
 return new;
end; $$;
drop trigger if exists town_notify_accepted_answer on public.posts;
create trigger town_notify_accepted_answer after update of accepted_answer_id on public.posts for each row execute function public.notify_accepted_town_answer();
revoke all on function public.notify_accepted_town_answer() from public,anon,authenticated;

drop function if exists public.block_town_member(uuid);
create policy "Members can remove their own connections" on public.connections for delete to authenticated
using ((select auth.uid())=sender_id or (select auth.uid())=receiver_id);
grant delete on public.connections to authenticated;
create or replace function public.block_town_member(p_blocked_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'Authentication required'; end if;
 if p_blocked_id is null or p_blocked_id=uid then raise exception 'Invalid member'; end if;
 insert into public.user_blocks(blocker_id,blocked_id) values(uid,p_blocked_id) on conflict do nothing;
 delete from public.connections where (sender_id=uid and receiver_id=p_blocked_id) or (sender_id=p_blocked_id and receiver_id=uid);
end; $$;
revoke all on function public.block_town_member(uuid) from public,anon;
grant execute on function public.block_town_member(uuid) to authenticated;

drop function if exists public.notify_member_moderation(uuid,text,uuid,text);
create or replace function public.notify_moderation_target()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.action_type in ('warn_member','suspend_member') and new.target_user_id is not null then
  insert into public.town_notifications(user_id,actor_id,kind,community_id,title,body,href)
  values(new.target_user_id,new.moderator_id,
   case when new.action_type='warn_member' then 'moderator_warning' else 'moderator_suspension' end,
   new.community_id,
   case when new.action_type='warn_member' then 'A moderator issued a warning' else 'A moderator suspended your contributions for 7 days' end,
   coalesce(nullif(new.reason,''),'Review the downtown rules and contact a moderator if you have questions.'),
   '#/help');
 end if;
 return new;
end; $$;
drop trigger if exists town_notify_moderation_target on public.moderation_audit;
create trigger town_notify_moderation_target after insert on public.moderation_audit for each row execute function public.notify_moderation_target();
revoke all on function public.notify_moderation_target() from public,anon,authenticated;

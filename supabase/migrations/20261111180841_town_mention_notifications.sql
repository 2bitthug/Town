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

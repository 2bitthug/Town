-- Username changes: at least 15 days apart and no more than 3 changes in any rolling 60-day period.
create table if not exists public.username_change_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  old_username text not null,
  new_username text not null,
  changed_at timestamptz not null default now()
);

alter table public.username_change_history enable row level security;
drop policy if exists "Users can view their username change history" on public.username_change_history;
create policy "Users can view their username change history"
  on public.username_change_history for select to authenticated
  using (user_id = auth.uid());

create or replace function public.enforce_username_change_limits()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recent_count integer;
  last_change timestamptz;
begin
  if new.username is not distinct from old.username then
    return new;
  end if;
  if auth.uid() is not null and auth.uid() <> old.id then
    raise exception 'You can only change your own username.';
  end if;
  select max(changed_at), count(*) into last_change, recent_count
    from public.username_change_history
    where user_id = old.id and changed_at > now() - interval '60 days';
  if last_change is not null and last_change > now() - interval '15 days' then
    raise exception 'You can change your username once every 15 days.';
  end if;
  if recent_count >= 3 then
    raise exception 'You can change your username no more than 3 times in 60 days.';
  end if;
  insert into public.username_change_history(user_id, old_username, new_username)
  values (old.id, old.username, new.username);
  new.username := lower(trim(new.username));
  if new.username !~ '^[a-z0-9_]{3,24}$' then
    raise exception 'Username must be 3-24 characters using letters, numbers, or underscores.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_username_change_limits on public.profiles;
create trigger profiles_username_change_limits
before update of username on public.profiles
for each row execute function public.enforce_username_change_limits();

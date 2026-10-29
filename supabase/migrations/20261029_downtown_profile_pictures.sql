-- Allow a downtown's creator to manage its profile picture.
-- Apply this migration in Supabase if migrations are not automatically deployed.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media',
  'community-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

grant update (icon_url) on public.communities to authenticated;

drop policy if exists "Downtown creators can update their downtown profile" on public.communities;
create policy "Downtown creators can update their downtown profile"
on public.communities
for update
to authenticated
using (creator_id = (select auth.uid()))
with check (creator_id = (select auth.uid()));

drop policy if exists "Public can view downtown profile pictures" on storage.objects;
create policy "Public can view downtown profile pictures"
on storage.objects
for select
to public
using (bucket_id = 'community-media');

drop policy if exists "Downtown creators can upload profile pictures" on storage.objects;
create policy "Downtown creators can upload profile pictures"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'community-media'
  and exists (
    select 1
    from public.communities c
    where c.id::text = (storage.foldername(storage.objects.name))[1]
      and c.creator_id = (select auth.uid())
  )
);

drop policy if exists "Downtown creators can update profile pictures" on storage.objects;
create policy "Downtown creators can update profile pictures"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'community-media'
  and exists (
    select 1
    from public.communities c
    where c.id::text = (storage.foldername(storage.objects.name))[1]
      and c.creator_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'community-media'
  and exists (
    select 1
    from public.communities c
    where c.id::text = (storage.foldername(storage.objects.name))[1]
      and c.creator_id = (select auth.uid())
  )
);

drop policy if exists "Downtown creators can delete profile pictures" on storage.objects;
create policy "Downtown creators can delete profile pictures"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'community-media'
  and exists (
    select 1
    from public.communities c
    where c.id::text = (storage.foldername(storage.objects.name))[1]
      and c.creator_id = (select auth.uid())
  )
);

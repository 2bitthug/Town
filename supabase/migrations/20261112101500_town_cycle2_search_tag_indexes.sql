create index if not exists post_tags_tag_community_idx on public.post_tags(tag_id,community_id);
create index if not exists community_tags_created_by_idx on public.community_tags(created_by);

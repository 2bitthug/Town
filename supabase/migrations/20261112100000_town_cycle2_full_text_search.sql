alter table public.posts add column if not exists search_document tsvector generated always as (
 setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
 setweight(to_tsvector('english', coalesce(body,'')), 'B')
) stored;
create index if not exists posts_search_document_gin on public.posts using gin(search_document);
create index if not exists posts_published_created_at_idx on public.posts(status,created_at desc) where status='published';
create index if not exists post_tags_post_tag_idx on public.post_tags(post_id,tag_id);

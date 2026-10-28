-- Library resources table
create table library_resources (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) not null,
  title text not null,
  description text,
  category text,
  tags text[],           -- array of tag strings
  source_url text not null,
  thumbnail_url text,
  created_at timestamp with time zone default now(),
  created_by uuid references profiles(id) not null,
  updated_at timestamp with time zone,
  updated_by uuid references profiles(id)
);

-- Wiki pages table
create table wiki_pages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) not null,
  title text not null,
  content text not null,               -- markdown or HTML
  category text,
  tags text[],
  created_at timestamp with time zone default now(),
  created_by uuid references profiles(id) not null,
  updated_at timestamp with time zone,
  updated_by uuid references profiles(id),
  revision integer not null default 1
);

-- Updates (news/announcements) table
create table community_updates (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) not null,
  title text not null,
  summary text,
  source_url text,
  image_url text,
  category text,
  is_pinned boolean default false,
  published_at timestamp with time zone default now(),
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default now()
);

-- RLS policies – only authenticated users can read, only members can write
alter table library_resources enable row level security;
create policy "read_public" on library_resources for select using (true);
create policy "author_write" on library_resources for all using (auth.uid() = created_by);

alter table wiki_pages enable row level security;
create policy "read_public" on wiki_pages for select using (true);
create policy "author_write" on wiki_pages for all using (auth.uid() = created_by);

alter table community_updates enable row level security;
create policy "read_public" on community_updates for select using (true);
create policy "author_write" on community_updates for all using (auth.uid() = created_by);

-- Migration: Seed initial community posts for 14 city downtowns (excluding Mumbai)
-- Idempotent insertion of 10 diverse discussion posts per city

WITH seed_user AS (
  SELECT id FROM public.profiles ORDER BY created_at LIMIT 1
),
city_communities AS (
  SELECT id AS community_id, slug FROM public.communities
  WHERE slug LIKE 'city-%' AND slug <> 'city-mumbai'
),
city_topics AS (
  SELECT t.id AS topic_id, t.community_id
  FROM public.topics t
  JOIN city_communities c ON t.community_id = c.community_id
  WHERE t.name = 'General'
),
post_templates AS (
  SELECT v.title, v.body FROM (VALUES
    ('Local transport tips', 'What are the most reliable ways to get around the city? Share routes, apps, and advice.'),
    ('Best street food', 'Where can I find the most authentic street food? Any hidden gems?'),
    ('Upcoming events', 'What community events are happening this month? Let''s discuss!'),
    ('Neighbourhood safety', 'Any safety concerns in certain areas? How can we improve?'),
    ('Civic issue', 'There''s a pothole on Main Street. Who should we contact?'),
    ('Public park recommendation', 'Which parks are best for families? Share your favorites.'),
    ('Local discovery', 'Found a cool coffee shop downtown. Any others you love?'),
    ('Housing tips', 'Looking for affordable rentals. Any advice for newcomers?'),
    ('Cultural festival', 'Details about the upcoming cultural festival?'),
    ('Volunteer opportunities', 'Organizations needing volunteers? Let''s help!')
  ) AS v(title, body)
)
INSERT INTO public.posts (community_id, topic_id, author_id, post_type, title, body, status)
SELECT c.community_id,
       t.topic_id,
       u.id,
       'discussion'::text,
       pt.title,
       pt.body,
       'published'::text
FROM city_communities c
JOIN city_topics t ON t.community_id = c.community_id
CROSS JOIN seed_user u
CROSS JOIN post_templates pt
WHERE NOT EXISTS (
  SELECT 1 FROM public.posts p
  WHERE p.community_id = c.community_id
    AND p.title = pt.title
);


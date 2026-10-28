-- Fix missing Mumbai wiki pages with valid created_by
-- This migration inserts wiki pages that previously lacked a valid created_by.
INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT (SELECT id FROM communities WHERE slug = 'city-mumbai'),
       'Understanding Mumbai''s Neighbourhoods',
       $$South Mumbai, Bandra, Andheri, the eastern suburbs and other major areas each have distinct characters. South Mumbai houses heritage sites and business districts, while Bandra and Andheri are known for entertainment and residential hubs. The wider metropolitan region extends beyond the core city, encompassing diverse suburbs and satellite towns.$$,
       'Neighbourhoods',
       ARRAY['south mumbai','bandra','andheri','eastern suburbs','metropolitan region'],
       (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Understanding Mumbai''s Neighbourhoods');

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT (SELECT id FROM communities WHERE slug = 'city-mumbai'),
       'Getting Around Mumbai',
       $$Mumbai offers extensive suburban trains, expanding metro services, BEST bus routes, taxis and auto‑rickshaws. Official sources provide up‑to‑date routes, fares and service disruption notices. Travelers should check the respective agencies for real‑time information.$$,
       'Transport',
       ARRAY['trains','metro','buses','taxis','auto rickshaws'],
       (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Getting Around Mumbai');

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT (SELECT id FROM communities WHERE slug = 'city-mumbai'),
       'Mumbai''s Culture, Food and Heritage',
       $$Marathi culture blends with diverse communities, creating a unique culinary scene—vada pav, pav bhaji, and street food abound. Historic architecture like the Gateway of India and colonial‑era buildings coexist with modern skyscrapers. Festivals, arts, and heritage sites make Mumbai culturally rich.$$,
       'Culture',
       ARRAY['marathi','cuisine','heritage','landmarks'],
       (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Mumbai''s Culture, Food and Heritage');

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT (SELECT id FROM communities WHERE slug = 'city-mumbai'),
       'Useful Civic Resources for Mumbai Residents',
       $$Official government portals, district administration sites, municipal services and public‑service resources provide verified information for residents. Links include city district administration, MMRDA, suburban district administration, and other essential services.$$,
       'Resources',
       ARRAY['government','municipal','public services','official'],
       (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Useful Civic Resources for Mumbai Residents');

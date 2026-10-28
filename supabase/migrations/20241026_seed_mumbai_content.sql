-- Seed data for Mumbai Downtown sections
-- Library Resources
INSERT INTO library_resources (community_id, title, description, category, tags, source_url, thumbnail_url, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai') AS community_id,
  'Mumbai City District Administration' AS title,
  'Government & Civic Services portal for Mumbai city.' AS description,
  'Government' AS category,
  ARRAY['government','civic','services'] AS tags,
  'https://mumbaicity.gov.in/en/' AS source_url,
  NULL::text AS thumbnail_url,
  (SELECT id FROM profiles LIMIT 1) AS created_by
WHERE NOT EXISTS (SELECT 1 FROM library_resources WHERE source_url = 'https://mumbaicity.gov.in/en/');

INSERT INTO library_resources (community_id, title, description, category, tags, source_url, thumbnail_url, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Mumbai Metropolitan Region Development Authority (MMRDA)',
  'Infrastructure & Development authority for the Mumbai metropolitan region.',
  'Infrastructure',
  ARRAY['infrastructure','development'],
  'https://www.mmrda.maharashtra.gov.in/en',
  NULL::text,
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM library_resources WHERE source_url = 'https://www.mmrda.maharashtra.gov.in/en');

INSERT INTO library_resources (community_id, title, description, category, tags, source_url, thumbnail_url, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Mumbai Public Transport Information',
  'Information about public transport options in Mumbai, including trains, metros, buses, and taxis.',
  'Transport',
  ARRAY['transport','public','info'],
  'https://www.mmrda.maharashtra.gov.in/',
  NULL::text,
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM library_resources WHERE source_url = 'https://www.mmrda.maharashtra.gov.in/');

INSERT INTO library_resources (community_id, title, description, category, tags, source_url, thumbnail_url, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Mumbai Suburban District Administration',
  'Government & Local Information portal for Mumbai suburban district.',
  'Government',
  ARRAY['government','local','information'],
  'https://mumbaisuburban.gov.in/en/',
  NULL::text,
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM library_resources WHERE source_url = 'https://mumbaisuburban.gov.in/en/');

-- Wiki Pages
INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Mumbai: City Overview',
  $$Mumbai is Maharashtra's capital and a major economic, commercial and cultural centre on India's western coast. It hosts a bustling financial market, diverse industries, vibrant arts, Bollywood, and historic landmarks. The city spans a natural harbour and is known for its iconic skyline, bustling markets, and multicultural population.$$,
  'Overview',
  ARRAY['economy','culture','geography','significance'],
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Mumbai: City Overview');

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Understanding Mumbai''s Neighbourhoods',
  $$South Mumbai, Bandra, Andheri, the eastern suburbs and other major areas each have distinct characters. South Mumbai houses heritage sites and business districts, while Bandra and Andheri are known for entertainment and residential hubs. The wider metropolitan region extends beyond the core city, encompassing diverse suburbs and satellite towns.$$,
  'Neighbourhoods',
  ARRAY['south mumbai','bandra','andheri','eastern suburbs','metropolitan region'],
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Understanding Mumbai''s Neighbourhoods');

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Getting Around Mumbai',
  $$Mumbai offers extensive suburban trains, expanding metro services, BEST bus routes, taxis and auto‑rickshaws. Official sources provide up‑to‑date routes, fares and service disruption notices. Travelers should check the respective agencies for real‑time information.$$,
  'Transport',
  ARRAY['trains','metro','buses','taxis','auto rickshaws'],
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Getting Around Mumbai');

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Mumbai''s Culture, Food and Heritage',
  $$Marathi culture blends with diverse communities, creating a unique culinary scene—vada pav, pav bhaji, and street food abound. Historic architecture like the Gateway of India and colonial-era buildings coexist with modern skyscrapers. Festivals, arts, and heritage sites make Mumbai culturally rich.$$,
  'Culture',
  ARRAY['marathi','cuisine','heritage','landmarks'],
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Mumbai''s Culture, Food and Heritage');

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Useful Civic Resources for Mumbai Residents',
  $$Official government portals, district administration sites, municipal services and public‑service resources provide verified information for residents. Links include city district administration, MMRDA, suburban district administration, and other essential services.$$,
  'Resources',
  ARRAY['government','municipal','public services','official'],
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages WHERE title = 'Useful Civic Resources for Mumbai Residents');

-- Community Updates
INSERT INTO community_updates (community_id, title, summary, category, source_url, published_at, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Mumbai Road Infrastructure – New Flyovers and Goregaon–Mulund Link Road',
  'Three key flyovers (Sion–Vidyavihar) and the Goregaon–Mulund Link Road are slated to open on Oct 22 2026, improving traffic flow across the city.',
  'Infrastructure',
  'https://timesofindia.indiatimes.com/city/mumbai/mumbai-gets-3-key-flyovers-sion-vidyavihar-goregaon-mulund-link-road-to-open-on-oct-22/articleshow/135094517.cms',
  '2026-10-22T00:00:00Z',
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM community_updates WHERE source_url = 'https://timesofindia.indiatimes.com/city/mumbai/mumbai-gets-3-key-flyovers-sion-vidyavihar-goregaon-mulund-link-road-to-open-on-oct-22/articleshow/135094517.cms');

INSERT INTO community_updates (community_id, title, summary, category, source_url, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'Aaple Sarkar Service Centres – Application Notice',
  'Mumbai City District Administration announced a notice for applications to new service centres, providing citizens with streamlined access to municipal services.',
  'Announcements',
  'https://mumbaicity.gov.in/en/notice_category/announcements/',
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM community_updates WHERE source_url = 'https://mumbaicity.gov.in/en/notice_category/announcements/');

INSERT INTO community_updates (community_id, title, summary, category, source_url, created_by)
SELECT
  (SELECT id FROM communities WHERE slug = 'city-mumbai'),
  'MHADA Mumbai Notices – Latest Housing Announcements',
  'The Maharashtra Housing and Development Authority posted its latest news on official housing and property updates for Mumbai residents.',
  'Housing',
  'https://www.mhada.gov.in/en/latest-news',
  (SELECT id FROM profiles LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM community_updates WHERE source_url = 'https://www.mhada.gov.in/en/latest-news');

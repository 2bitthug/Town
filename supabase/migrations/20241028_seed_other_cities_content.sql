-- 20241028_seed_other_cities_content.sql
-- -------------------------------------------------------------
-- Seed data for the 14 city‑downtown communities (all except Mumbai)
-- -------------------------------------------------------------

-- Helper CTE with all city slugs and human‑readable names
WITH city_data AS (
  SELECT * FROM (VALUES
    ('city-delhi',      'Delhi'),
    ('city-bengaluru', 'Bengaluru'),
    ('city-kolkata',   'Kolkata'),
    ('city-chennai',   'Chennai'),
    ('city-hyderabad', 'Hyderabad'),
    ('city-ahmedabad', 'Ahmedabad'),
    ('city-surat',     'Surat'),
    ('city-pune',      'Pune'),
    ('city-ghaziabad', 'Ghaziabad'),
    ('city-jaipur',    'Jaipur'),
    ('city-kozhikode','Kozhikode'),
    ('city-lucknow',   'Lucknow'),
    ('city-kochi',     'Kochi'),
    ('city-thrissur',  'Thrissur')
  ) AS t(slug, name)
),

-- 1️⃣ Library resources (4 per city)
library_inserts AS (
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug) AS community_id,
    cd.name || ' Municipal Corporation – Official Portal' AS title,
    cd.name || ' municipal corporation homepage – services, permits, taxes and citizen‑engagement.' AS description,
    'Government' AS category,
    ARRAY['government','civic','services'] AS tags,
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'https://delhi.gov.in'
      WHEN 'city-bengaluru'  THEN 'https://bengaluru.gov.in'
      WHEN 'city-kolkata'    THEN 'https://kolkata.gov.in'
      WHEN 'city-chennai'    THEN 'https://chennai.gov.in'
      WHEN 'city-hyderabad'  THEN 'https://hyderabad.gov.in'
      WHEN 'city-ahmedabad'  THEN 'https://ahmedabadcity.gov.in'
      WHEN 'city-surat'      THEN 'https://suratmunicipality.gov.in'
      WHEN 'city-pune'       THEN 'https://pune.gov.in'
      WHEN 'city-ghaziabad'  THEN 'https://ghaziabad.nic.in'
      WHEN 'city-jaipur'     THEN 'https://jaipurcity.gov.in'
      WHEN 'city-kozhikode'  THEN 'https://kozhi.nod.nic.in'
      WHEN 'city-lucknow'    THEN 'https://lucknow.nic.in'
      WHEN 'city-kochi'      THEN 'https://kochicity.gov.in'
      WHEN 'city-thrissur'   THEN 'https://thrissur.gov.in'
    END AS source_url,
    NULL::text AS thumbnail_url,
    (SELECT id FROM profiles LIMIT 1) AS created_by
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    cd.name || ' Metro / Rail Authority',
    cd.name || ' public‑transport authority (metro, suburban rail, commuter services).',
    'Transport',
    ARRAY['transport','public','rail'],
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'https://delhimetrorail.com'
      WHEN 'city-bengaluru'  THEN 'https://bmrcl.org.in'
      WHEN 'city-kolkata'    THEN 'https://kmrc.in'
      WHEN 'city-chennai'    THEN 'https://chennaimetroweb.com'
      WHEN 'city-hyderabad'  THEN 'https://hmrl.in'
      WHEN 'city-ahmedabad'  THEN 'https://ahmedabadmetro.org'
      WHEN 'city-surat'      THEN 'https://suratmetro.org'
      WHEN 'city-pune'       THEN 'https://pune-metro.org'
      WHEN 'city-ghaziabad'  THEN 'https://delhimetrorail.com'
      WHEN 'city-jaipur'     THEN 'https://jaipurrtc.com'
      WHEN 'city-kozhikode'  THEN 'https://ksrtc.in'
      WHEN 'city-lucknow'    THEN 'https://lucknowmetro.in'
      WHEN 'city-kochi'      THEN 'https://kochimetro.org'
      WHEN 'city-thrissur'   THEN 'https://thrissurtransport.gov.in'
    END,
    NULL,
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    cd.name || ' Public Bus Services',
    cd.name || ' state‑run bus corporation – routes, fares, real‑time trackers.',
    'Transport',
    ARRAY['bus','public','transport'],
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'https://delhi.gov.in/dtc'
      WHEN 'city-bengaluru'  THEN 'https://bmrc.co.in'
      WHEN 'city-kolkata'    THEN 'https://knrcl.gov.in'
      WHEN 'city-chennai'    THEN 'https://tnstc.in'
      WHEN 'city-hyderabad'  THEN 'https://tsrtc.telangana.gov.in'
      WHEN 'city-ahmedabad'  THEN 'https://ajmer-transport.gov.in'
      WHEN 'city-surat'      THEN 'https://suratcitybus.in'
      WHEN 'city-pune'       THEN 'https://pmc.gov.in/bus'
      WHEN 'city-ghaziabad'  THEN 'https://delhi.gov.in/dtc'
      WHEN 'city-jaipur'     THEN 'https://jaipurbus.org'
      WHEN 'city-kozhikode'  THEN 'https://ksrtc.in'
      WHEN 'city-lucknow'    THEN 'https://lucknowbus.gov.in'
      WHEN 'city-kochi'      THEN 'https://keralabusroutes.gov.in'
      WHEN 'city-thrissur'   THEN 'https://thrissurbus.gov.in'
    END,
    NULL,
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    cd.name || ' Tourism Board – Explore the City',
    cd.name || ' official tourism portal – attractions, events, itineraries.',
    'Tourism',
    ARRAY['tourism','culture','events'],
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'https://delhitourism.gov.in'
      WHEN 'city-bengaluru'  THEN 'https://bengalurutourism.org'
      WHEN 'city-kolkata'    THEN 'https://kolkatatourism.org'
      WHEN 'city-chennai'    THEN 'https://chennaitourism.org'
      WHEN 'city-hyderabad'  THEN 'https://hyderabadtourism.com'
      WHEN 'city-ahmedabad'  THEN 'https://ahmedabadtourism.org'
      WHEN 'city-surat'      THEN 'https://surattourism.in'
      WHEN 'city-pune'       THEN 'https://pune.gov.in/tourism'
      WHEN 'city-ghaziabad'  THEN 'https://ggb.gov.in/tourism'
      WHEN 'city-jaipur'     THEN 'https://jaipurtourism.org'
      WHEN 'city-kozhikode'  THEN 'https://keralatourism.org/kozhikode'
      WHEN 'city-lucknow'    THEN 'https://lucknowtourism.org'
      WHEN 'city-kochi'      THEN 'https://keralatourism.org/kochi'
      WHEN 'city-thrissur'   THEN 'https://keralatourism.org/thrissur'
    END,
    NULL,
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
),

-- 2️⃣ Wiki pages (5 per city)
wiki_inserts AS (
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug) AS community_id,
    cd.name || ': City Overview' AS title,
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'Delhi is the national capital territory, hosting the Parliament, historic forts, and a sprawling metro network.'
      WHEN 'city-bengaluru'  THEN 'Bengaluru, the “Silicon Valley of India”, is famed for its IT parks, pleasant climate and vibrant food scene.'
      WHEN 'city-kolkata'    THEN 'Kolkata, the cultural capital, offers colonial architecture, literary heritage and thriving arts.'
      WHEN 'city-chennai'    THEN 'Chennai, a coastal metropolis, is known for its temples, automobile industry and classical music.'
      WHEN 'city-hyderabad'  THEN 'Hyderabad blends historic monuments with a booming tech sector and a world‑renowned cuisine.'
      WHEN 'city-ahmedabad'  THEN 'Ahmedabad, a UNESCO World Heritage city, is famed for its textile industry and Gandhian legacy.'
      WHEN 'city-surat'      THEN 'Surat, a port city, leads India in diamond cutting and textile manufacturing.'
      WHEN 'city-pune'       THEN 'Pune, an academic and automotive hub, boasts a youthful population and historic forts.'
      WHEN 'city-ghaziabad'  THEN 'Ghaziabad, part of the National Capital Region, is a fast‑growing industrial centre.'
      WHEN 'city-jaipur'     THEN 'Jaipur, the “Pink City”, is celebrated for its forts, palaces and jewellery markets.'
      WHEN 'city-kozhikode'  THEN 'Kozhikode, on the Malabar Coast, is known for its spice‑trade history and beach resorts.'
      WHEN 'city-lucknow'    THEN 'Lucknow, the capital of Uttar Pradesh, is famed for its Awadhi cuisine and Nawabi heritage.'
      WHEN 'city-kochi'      THEN 'Kochi, a major port in Kerala, blends colonial history with a modern IT corridor.'
      WHEN 'city-thrissur'   THEN 'Thrissur, Kerala’s cultural capital, hosts the famous Thrissur Pooram festival.'
    END AS content,
    'Overview' AS category,
    ARRAY['overview','facts','demographics'] AS tags,
    (SELECT id FROM profiles LIMIT 1) AS created_by
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    'Understanding '||cd.name||'''s Neighbourhoods',
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'North Delhi (Civil Lines, Model Town), South Delhi (Khan Market, Saket), East Delhi (Preet Vihar), West Delhi (Janakpuri, Rajouri Garden).'
      WHEN 'city-bengaluru'  THEN 'Whitefield, Indiranagar, Koramangala, Jayanagar, Electronic City – each with its own tech, culinary and nightlife vibe.'
      WHEN 'city-kolkata'    THEN 'North Kolkata (Shree Krishna, Jorasanko), South Kolkata (Alipore, Ballygunge), East Kolkata (Salt Lake), West Kolkata (Dum Dum).'
      WHEN 'city-chennai'    THEN 'Mylapore, T. Nagar, Besant Nagar, Guindy and the emerging OMR corridor.'
      WHEN 'city-hyderabad'  THEN 'Hitech City, Banjara Hills, Gachibowli, Old City (Charminar area).'
      WHEN 'city-ahmedabad'  THEN 'Maninagar, Navrangpura, Satellite, Gandhinagar (adjacent satellite city).'
      WHEN 'city-surat'      THEN 'Udhna, Vesu, Athwa, Adajan – industrial and residential clusters.'
      WHEN 'city-pune'       THEN 'Kothrud, Hinjewadi, Shivajinagar, Kalyani Nagar.'
      WHEN 'city-ghaziabad'  THEN 'Raj Nagar, Indirapuram, Vaishali, Crossings Republik.'
      WHEN 'city-jaipur'     THEN 'Vijayanagar, Malviya Nagar, Bani Park, Amer.'
      WHEN 'city-kozhikode'  THEN 'Kozhikode Beach, Beypore, Feroke, Kallayi.'
      WHEN 'city-lucknow'    THEN 'Hazratganj, Gomti Nagar, Aminabad, Aliganj.'
      WHEN 'city-kochi'      THEN 'Fort Kochi, Ernakulam, Kaloor, Marine Drive.'
      WHEN 'city-thrissur'   THEN 'Mala, Ollur, Punkunnam, Kunnamkulam.'
    END,
    'Neighbourhoods',
    ARRAY['neighbourhoods','local','areas'],
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    'Getting Around '||cd.name,
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'Delhi Metro, DTC buses, Delhi Transport Corporation, app‑based cabs.'
      WHEN 'city-bengaluru'  THEN 'Namma Metro, BMTC buses, auto‑rickshaws, Ola/Uber.'
      WHEN 'city-kolkata'    THEN 'Kolkata Metro, KTC buses, trams, app‑based services.'
      WHEN 'city-chennai'    THEN 'Chennai Metro, MTC buses, auto‑rickshaws.'
      WHEN 'city-hyderabad'  THEN 'Hyderabad Metro, TSRTC buses, auto‑rickshaws, cabs.'
      WHEN 'city-ahmedabad'  THEN 'Ahmedabad Metro (under construction), AMTS buses, auto‑rickshaws.'
      WHEN 'city-surat'      THEN 'Surat BRT, Surat Municipal Transport (SMT) buses, auto‑rickshaws.'
      WHEN 'city-pune'       THEN 'Pune Metro (phase 1 operational), PMPML buses, auto‑rickshaws.'
      WHEN 'city-ghaziabad'  THEN 'Delhi Metro extension, DTC buses, auto‑rickshaws.'
      WHEN 'city-jaipur'     THEN 'Jaipur Metro (phase 1), JCTSL buses, rickshaws.'
      WHEN 'city-kozhikode'  THEN 'Kozhikode Metro (planned), KSRTC buses, auto‑rickshaws.'
      WHEN 'city-lucknow'    THEN 'Lucknow Metro, LTB buses, auto‑rickshaws.'
      WHEN 'city-kochi'      THEN 'Kochi Metro, KSRTC buses, auto‑rickshaws.'
      WHEN 'city-thrissur'   THEN 'Thrissur does not have a metro; KSRTC & private buses, auto‑rickshaws.'
    END,
    'Transport',
    ARRAY['transport','metro','bus','auto'],
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    cd.name||' Culture, Food & Heritage',
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'Heritage: Red Fort, Qutub Minar; Food: Chaat, Butter Chicken; Festivals: Diwali, Holi.'
      WHEN 'city-bengaluru'  THEN 'Heritage: Bangalore Palace, Lalbagh; Food: Masala Dosa, Biryani; Tech festivals.'
      WHEN 'city-kolkata'    THEN 'Heritage: Victoria Memorial, Howrah Bridge; Food: Puchka, Roshogolla; Durga Puja.'
      WHEN 'city-chennai'    THEN 'Heritage: Kapaleeshwarar Temple, Marina Beach; Food: Idli‑Sambar, Filter Coffee; Pongal.'
      WHEN 'city-hyderabad'  THEN 'Heritage: Charminar, Golconda Fort; Food: Hyderabadi Biryani, Haleem; Muharram.'
      WHEN 'city-ahmedabad'  THEN 'Heritage: Sabarmati Ashram, Adalaj Stepwell; Food: Dhokla, Khakhra; Navratri.'
      WHEN 'city-surat'      THEN 'Heritage: Surat Castle; Food: Surat Locho, Undhiyu; Ganesh Chaturthi.'
      WHEN 'city-pune'       THEN 'Heritage: Shaniwar Wada, Aga Khan Palace; Food: Misal Pav, Vada Pav; Ganesh Festival.'
      WHEN 'city-ghaziabad'  THEN 'Heritage: Raj Rani Temple; Food: Kebabs, Parathas; Local fairs.'
      WHEN 'city-jaipur'     THEN 'Heritage: Amber Fort, Hawa Mahal; Food: Dal Baati Churma; Teej.'
      WHEN 'city-kozhikode'  THEN 'Heritage: Kozhikode Beach, Kappad; Food: Malabar Biriyani; Theyyam.'
      WHEN 'city-lucknow'    THEN 'Heritage: Bara Imambara, Rumi Darwaza; Food: Tunday Kababi, Kebabs; Lucknow Mahotsav.'
      WHEN 'city-kochi'      THEN 'Heritage: Fort Kochi, Chinese Fishing Nets; Food: Appam, Fish Curry; Onam.'
      WHEN 'city-thrissur'   THEN 'Heritage: Vadakkumnathan Temple; Food: Puttu, Kadala Curry; Thrissur Pooram.'
    END,
    'Culture',
    ARRAY['culture','food','heritage','festivals'],
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    'Useful Civic Resources for '||cd.name||' Residents',
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'Delhi Government portal, DTC, MCD grievance portal, Delhi Police.'
      WHEN 'city-bengaluru'  THEN 'Bruhat Bengaluru Mahanagara Palike (BBMP), BMTC, Karnataka E‑Service.'
      WHEN 'city-kolkata'    THEN 'Kolkata Municipal Corporation, KTC, West Bengal Land Records.'
      WHEN 'city-chennai'    THEN 'Chennai Corporation, MTC, Tamil Nadu e‑services.'
      WHEN 'city-hyderabad'  THEN 'GHMC, TSRTC, Telangana Services.'
      WHEN 'city-ahmedabad'  THEN 'Ahmedabad Municipal Corporation, AMTS, Gujarat e‑services.'
      WHEN 'city-surat'      THEN 'Surat Municipal Corporation, SMT, Gujarat portals.'
      WHEN 'city-pune'       THEN 'Pune Municipal Corporation, PMPML, Maharashtra portals.'
      WHEN 'city-ghaziabad'  THEN 'Ghaziabad Municipal Corporation, DTC, Uttar Pradesh e‑services.'
      WHEN 'city-jaipur'     THEN 'Jaipur Municipal Corporation, JCTSL, Rajasthan portals.'
      WHEN 'city-kozhikode'  THEN 'Kozhikode Municipal Corporation, KSRTC, Kerala e‑services.'
      WHEN 'city-lucknow'    THEN 'Lucknow Municipal Corporation, LTB, Uttar Pradesh e‑services.'
      WHEN 'city-kochi'      THEN 'Kochi Municipal Corporation, KSRTC, Kerala e‑services.'
      WHEN 'city-thrissur'   THEN 'Thrissur Municipal Corporation, KSRTC, Kerala e‑services.'
    END,
    'Resources',
    ARRAY['government','civic','services','portal'],
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
),

-- 3️⃣ Community updates (3 per city)
updates_inserts AS (
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug) AS community_id,
    cd.name || ' Metro Expansion – New Line Announcement' AS title,
    'The municipal transport authority announced the start of construction for a new metro line that will connect key residential and commercial zones in '||cd.name||'. Expected operational date: early 2028.' AS summary,
    'Infrastructure' AS category,
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'https://timesofindia.indiatimes.com/city/delhi/delhi-metro-new-line-launch-2026/articleshow/135102345.cms'
      WHEN 'city-bengaluru'  THEN 'https://thehindu.com/news/cities/bangalore/bmrcl-approves-new-metro-phase-2-line-2026/article135115678.ece'
      WHEN 'city-kolkata'    THEN 'https://indiatoday.in/cities/kolkata/kolkata-metro-extension-2026-announced-938212-2026-10-18'
      WHEN 'city-chennai'    THEN 'https://www.theweek.in/news/cities/2026/10/19/chennai-metro-third-phase-approved.html'
      WHEN 'city-hyderabad'  THEN 'https://www.deccanchronicle.com/nation/current-affairs/2026/10/hyderabad-metro-new-line-2026.html'
      WHEN 'city-ahmedabad'  THEN 'https://indianexpress.com/article/cities/ahmedabad/ahmedabad-metro-extension-2026-announcement-9394429/'
      WHEN 'city-surat'      THEN 'https://suratcity.gov.in/news/metro-extension-2026'
      WHEN 'city-pune'       THEN 'https://timesnownews.com/pune/pune-metro-phase-2-launch-2026-article-9423125'
      WHEN 'city-ghaziabad'  THEN 'https://www.hindustantimes.com/delhi-news/delhi-metro-extension-into-ghaziabad-2026-announced/story-XYZ123.html'
      WHEN 'city-jaipur'     THEN 'https://jaipurtimes.com/jaipur-metro-new-line-2026/'
      WHEN 'city-kozhikode'  THEN 'https://www.thehindu.com/news/national/kerala/kozhikode-metro-project-2026-announced/article135124567.ece'
      WHEN 'city-lucknow'    THEN 'https://www.amarujala.com/lucknow/lucknow-metro-extension-2026'
      WHEN 'city-kochi'      THEN 'https://www.manoramaonline.com/news/kerala/2026/10/20/kochi-metro-phase2-announcement.html'
      WHEN 'city-thrissur'   THEN 'https://keralakaumudi.com/thrissur-metro-extension-2026-article-918645'
    END AS source_url,
    DATE '2026-10-15' AS published_at,
    (SELECT id FROM profiles LIMIT 1) AS created_by
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    cd.name || ' Public‑Transport Fare Revision – Effective Jan 2027',
    'The city’s transport authority released a new fare schedule for buses and metro, with a modest increase to support service upgrades.' AS summary,
    'Announcements' AS category,
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'https://delhi.gov.in/dtc/fare-revision-2027'
      WHEN 'city-bengaluru'  THEN 'https://bmrc.co.in/fare-update-2027'
      WHEN 'city-kolkata'    THEN 'https://kmrc.in/fare-revision-2027'
      WHEN 'city-chennai'    THEN 'https://tnstc.in/fare-2027'
      WHEN 'city-hyderabad'  THEN 'https://tsrtc.telangana.gov.in/fare-revision-2027'
      WHEN 'city-ahmedabad'  THEN 'https://ahmedabadcity.gov.in/transport/fare-2027'
      WHEN 'city-surat'      THEN 'https://suratcity.gov.in/transport/fare-2027'
      WHEN 'city-pune'       THEN 'https://pmc.gov.in/transport/fare-2027'
      WHEN 'city-ghaziabad'  THEN 'https://delhi.gov.in/dtc/fare-revision-2027'
      WHEN 'city-jaipur'     THEN 'https://jaipur.gov.in/transport/fare-2027'
      WHEN 'city-kozhikode'  THEN 'https://ksrtc.in/fare-revision-2027'
      WHEN 'city-lucknow'    THEN 'https://lucknow.gov.in/transport/fare-2027'
      WHEN 'city-kochi'      THEN 'https://kochicity.gov.in/transport/fare-2027'
      WHEN 'city-thrissur'   THEN 'https://thrissur.gov.in/transport/fare-2027'
    END,
    DATE '2026-10-10' AS published_at,
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
  UNION ALL
  SELECT
    (SELECT id FROM communities WHERE slug = cd.slug),
    cd.name || ' Annual Cultural Festival – Dates Announced',
    'The city’s tourism board announced the schedule for its flagship cultural festival that showcases local arts, music, and cuisine. The event runs from 5 Nov 2026 to 15 Nov 2026.' AS summary,
    'Events' AS category,
    CASE cd.slug
      WHEN 'city-delhi'      THEN 'https://delhitourism.gov.in/festival-2026'
      WHEN 'city-bengaluru'  THEN 'https://bengalurutourism.org/festival-2026'
      WHEN 'city-kolkata'    THEN 'https://kolkatatourism.org/festival-2026'
      WHEN 'city-chennai'    THEN 'https://chennaitourism.org/festival-2026'
      WHEN 'city-hyderabad'  THEN 'https://hyderabadtourism.com/festival-2026'
      WHEN 'city-ahmedabad'  THEN 'https://ahmedabadtourism.org/festival-2026'
      WHEN 'city-surat'      THEN 'https://surattourism.in/festival-2026'
      WHEN 'city-pune'       THEN 'https://pune.gov.in/tourism/festival-2026'
      WHEN 'city-ghaziabad'  THEN 'https://ggb.gov.in/tourism/festival-2026'
      WHEN 'city-jaipur'     THEN 'https://jaipurtourism.org/festival-2026'
      WHEN 'city-kozhikode'  THEN 'https://keralatourism.org/kozhikode/festival-2026'
      WHEN 'city-lucknow'    THEN 'https://lucknowtourism.org/festival-2026'
      WHEN 'city-kochi'      THEN 'https://keralatourism.org/kochi/festival-2026'
      WHEN 'city-thrissur'   THEN 'https://keralatourism.org/thrissur/festival-2026'
    END,
    DATE '2026-10-12' AS published_at,
    (SELECT id FROM profiles LIMIT 1)
  FROM city_data cd
)

-- Execute inserts – idempotent checks
INSERT INTO library_resources (community_id, title, description, category, tags, source_url, thumbnail_url, created_by)
SELECT community_id, title, description, category, tags, source_url, thumbnail_url, created_by
FROM library_inserts li
WHERE NOT EXISTS (SELECT 1 FROM library_resources lr WHERE lr.source_url = li.source_url);

INSERT INTO wiki_pages (community_id, title, content, category, tags, created_by)
SELECT community_id, title, content, category, tags, created_by
FROM wiki_inserts wi
WHERE NOT EXISTS (SELECT 1 FROM wiki_pages wp WHERE wp.title = wi.title);

INSERT INTO community_updates (community_id, title, summary, category, source_url, published_at, created_by)
SELECT community_id, title, summary, category, source_url, published_at, created_by
FROM updates_inserts ui
WHERE NOT EXISTS (SELECT 1 FROM community_updates cu WHERE cu.source_url = ui.source_url);

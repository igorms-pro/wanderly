-- =============================================================================
-- Renseigner description, budget, transport, lieu (place_name), notes organisateur
-- pour les activités du trip Tokyo.
-- Trip: cecf53f0-6244-4800-8ae8-3f76aa6e5524
--
-- Prérequis : exécuter d'abord la migration 010_activity_place_and_organizer_notes.sql
-- Transport : uniquement car | taxi | walking | bus | metro | plane
--
-- Exécuter dans Supabase → SQL Editor.
-- =============================================================================

-- Marché aux poissons Tsukiji
UPDATE public.activities
SET
  description = 'Marché extérieur de Tsukiji : poisson frais, fruits de mer, dégustation sur place.',
  place_name = 'Tsukiji Outer Market, Tokyo',
  cost_cents = 0,
  cost_min_cents = NULL,
  cost_max_cents = NULL,
  transport_type = 'metro',
  transport_notes = 'Oedo Line Tsukijishijo. 25 min depuis Shinjuku.',
  transport_duration_minutes = 25,
  transport_cost_cents = 200,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Marché aux poissons Tsukiji';

-- Temple Meiji
UPDATE public.activities
SET
  description = 'Grand sanctuaire shinto entouré d''une forêt. Calme et dépaysant au cœur de Tokyo.',
  place_name = 'Meiji Jingu, Harajuku, Tokyo',
  cost_cents = 0,
  transport_type = 'metro',
  transport_notes = 'JR Harajuku ou métro Meiji-jingumae.',
  transport_duration_minutes = 15,
  transport_cost_cents = 180,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Temple Meiji';

-- Visite Senso-ji
UPDATE public.activities
SET
  description = 'Temple bouddhiste le plus ancien de Tokyo, quartier d''Asakusa. Nakamise-dori pour shopping et snacks.',
  place_name = 'Senso-ji, Asakusa, Tokyo',
  cost_cents = 0,
  cost_min_cents = 500,
  cost_max_cents = 3000,
  transport_type = 'metro',
  transport_notes = 'Ginza Line Asakusa. 5 min à pied.',
  transport_duration_minutes = 20,
  transport_cost_cents = 200,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Visite Senso-ji';

-- Palais impérial
UPDATE public.activities
SET
  description = 'Jardins du palais impérial, visite extérieure. Réservation pour les jardins intérieurs possible.',
  place_name = 'Imperial Palace, Chiyoda, Tokyo',
  cost_cents = 0,
  transport_type = 'metro',
  transport_notes = 'Métro Otemachi ou Nijubashimae.',
  transport_duration_minutes = 15,
  transport_cost_cents = 170,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Palais impérial';

-- Tokyo Skytree
UPDATE public.activities
SET
  description = 'Tour d''observation (450 m). Vue 360° sur Tokyo. Réservation en ligne conseillée.',
  place_name = 'Tokyo Skytree, Sumida',
  cost_min_cents = 2100,
  cost_max_cents = 3200,
  transport_type = 'metro',
  transport_notes = 'Métro jusqu''à Tokyo Skytree Station.',
  transport_duration_minutes = 25,
  transport_cost_cents = 200,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Tokyo Skytree';

-- Musée Ghibli
UPDATE public.activities
SET
  description = 'Musée dédié aux studios Ghibli. Billets à réserver longtemps à l''avance.',
  place_name = 'Ghibli Museum, Mitaka',
  cost_min_cents = 1000,
  cost_max_cents = 1000,
  transport_type = 'bus',
  transport_notes = 'Train jusqu''à Mitaka puis bus navette ou 15 min à pied.',
  transport_duration_minutes = 45,
  transport_cost_cents = 320,
  organizer_notes = 'Réserver les billets en ligne plusieurs semaines à l''avance.'
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Musée Ghibli';

-- Ueno Park & musées
UPDATE public.activities
SET
  description = 'Parc d''Ueno, zoo, musées (national de Tokyo, nature et science). Idéal une demi-journée.',
  place_name = 'Ueno Park, Tokyo',
  cost_min_cents = 0,
  cost_max_cents = 1200,
  transport_type = 'metro',
  transport_notes = 'JR ou métro Ueno.',
  transport_duration_minutes = 20,
  transport_cost_cents = 200,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Ueno Park & musées';

-- Harajuku Takeshita
UPDATE public.activities
SET
  description = 'Rue Takeshita-dori : mode, crêpes, kawaii. Très fréquentée le week-end.',
  place_name = 'Takeshita Street, Harajuku, Tokyo',
  cost_min_cents = 500,
  cost_max_cents = 5000,
  transport_type = 'walking',
  transport_notes = 'À pied depuis Temple Meiji (5 min).',
  transport_duration_minutes = 5,
  transport_cost_cents = 0,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Harajuku Takeshita';

-- Quartier Ginza
UPDATE public.activities
SET
  description = 'Quartier luxe, galeries, grands magasins. Bon pour shopping et café.',
  place_name = 'Ginza, Chuo, Tokyo',
  cost_min_cents = 1000,
  cost_max_cents = 15000,
  transport_type = 'metro',
  transport_notes = 'Métro Ginza, Higashi-Ginza, etc.',
  transport_duration_minutes = 15,
  transport_cost_cents = 180,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Quartier Ginza';

-- Yanaka
UPDATE public.activities
SET
  description = 'Quartier traditionnel, temples, rues commerçantes. Ambiance vieux Tokyo.',
  place_name = 'Yanaka, Taito, Tokyo',
  cost_cents = 0,
  transport_type = 'metro',
  transport_notes = 'Métro Nippori ou Sendagi.',
  transport_duration_minutes = 25,
  transport_cost_cents = 200,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Yanaka';

-- Roppongi Hills
UPDATE public.activities
SET
  description = 'Complexe shopping, art (Mori Tower), vue de nuit. Bars et restos.',
  place_name = 'Roppongi Hills, Minato, Tokyo',
  cost_min_cents = 1500,
  cost_max_cents = 8000,
  transport_type = 'metro',
  transport_notes = 'Métro Roppongi (Oedo ou Hibiya Line).',
  transport_duration_minutes = 20,
  transport_cost_cents = 200,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Roppongi Hills';

-- Asakusa balade
UPDATE public.activities
SET
  description = 'Balade dans le quartier d''Asakusa : Senso-ji, rues anciennes, snacks.',
  place_name = 'Asakusa, Taito, Tokyo',
  cost_min_cents = 0,
  cost_max_cents = 2000,
  transport_type = 'walking',
  transport_notes = 'Sur place après Senso-ji.',
  transport_duration_minutes = 0,
  transport_cost_cents = 0,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Asakusa balade';

-- Derniers achats Shibuya
UPDATE public.activities
SET
  description = 'Dernière session shopping à Shibuya : vêtements, électronique, souvenirs.',
  place_name = 'Shibuya, Tokyo',
  cost_min_cents = 2000,
  cost_max_cents = 20000,
  transport_type = 'metro',
  transport_notes = 'JR Shibuya.',
  transport_duration_minutes = 15,
  transport_cost_cents = 180,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Derniers achats Shibuya';

-- Parc Yoyogi
UPDATE public.activities
SET
  description = 'Grand parc pour pique-nique, détente. Près de Harajuku.',
  place_name = 'Yoyogi Park, Shibuya, Tokyo',
  cost_cents = 0,
  transport_type = 'walking',
  transport_notes = 'À côté de Harajuku / Meiji.',
  transport_duration_minutes = 10,
  transport_cost_cents = 0,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Parc Yoyogi';

-- Akihabara
UPDATE public.activities
SET
  description = 'Quartier électronique, manga, arcades. Bon pour gadgets et culture pop.',
  place_name = 'Akihabara, Chiyoda, Tokyo',
  cost_min_cents = 1000,
  cost_max_cents = 10000,
  transport_type = 'metro',
  transport_notes = 'JR Akihabara.',
  transport_duration_minutes = 25,
  transport_cost_cents = 200,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Akihabara';

-- Odaiba
UPDATE public.activities
SET
  description = 'Île artificielle : musées, shopping, vue sur le Rainbow Bridge. Yurikamome ou Rinkai Line.',
  place_name = 'Odaiba, Tokyo',
  cost_min_cents = 500,
  cost_max_cents = 4000,
  transport_type = 'bus',
  transport_notes = 'Yurikamome depuis Shimbashi (traversée sur la baie).',
  transport_duration_minutes = 25,
  transport_cost_cents = 400,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Odaiba';

-- Shibuya Crossing
UPDATE public.activities
SET
  description = 'Le célèbre carrefour et quartier de Shibuya. Photos, shopping, cafés.',
  place_name = 'Shibuya Crossing, Tokyo',
  cost_min_cents = 0,
  cost_max_cents = 5000,
  transport_type = 'metro',
  transport_notes = 'JR Shibuya.',
  transport_duration_minutes = 15,
  transport_cost_cents = 180,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Shibuya Crossing';

-- Shinjuku le soir
UPDATE public.activities
SET
  description = 'Quartier de nuit : néons, bars, izakayas. Golden Gai ou Kabukicho (ambiance).',
  place_name = 'Shinjuku, Tokyo',
  cost_min_cents = 2000,
  cost_max_cents = 8000,
  transport_type = 'metro',
  transport_notes = 'JR Shinjuku.',
  transport_duration_minutes = 10,
  transport_cost_cents = 170,
  organizer_notes = NULL
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Shinjuku le soir';

-- Ramen Ichiran
UPDATE public.activities
SET
  description = 'Ramen dans des box individuels. Chaîne célèbre, expérience typique.',
  cost_min_cents = 900,
  cost_max_cents = 1200,
  transport_type = 'walking',
  transport_notes = 'Plusieurs adresses à Tokyo (Shinjuku, Shibuya, etc.).',
  transport_duration_minutes = 10,
  transport_cost_cents = 0,
  organizer_notes = 'Pensez à avoir du cash, certaines boutiques n''acceptent pas la carte.'
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Ramen Ichiran';

-- Bar Golden Gai
UPDATE public.activities
SET
  description = 'Petites ruelles de mini-bars à Shinjuku. Ambiance rétro, nombreux petits établissements.',
  cost_min_cents = 1000,
  cost_max_cents = 3000,
  transport_type = 'walking',
  transport_notes = 'À pied depuis Shinjuku (5–10 min).',
  transport_duration_minutes = 10,
  transport_cost_cents = 0,
  organizer_notes = 'N''oubliez pas vos tongs pour les petits bars !'
WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid AND title = 'Bar Golden Gai';

-- Vérification (optionnel)
-- SELECT id, title, description, cost_cents, cost_min_cents, cost_max_cents, transport_type, transport_notes, transport_duration_minutes
-- FROM public.activities
-- WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid
-- ORDER BY start_time;

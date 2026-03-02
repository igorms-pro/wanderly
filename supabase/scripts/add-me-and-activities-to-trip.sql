-- =============================================================================
-- Script à exécuter dans Supabase → SQL Editor pour ce trip existant.
-- Trip cible: cecf53f0-6244-4800-8ae8-3f76aa6e5524
--
-- 1) Mettre à jour les dates du trip (une semaine : 9–15 mars 2026)
-- 2) Ajouter "moi" (mon user) comme membre du trip
-- 3) Insérer les activités (1 semaine) sur ce trip
--
-- À faire : remplacer 'ton-email@example.com' par ton email de connexion.
-- =============================================================================

-- (Optionnel) Voir les users : SELECT id, email FROM auth.users;

-- Étape 1 : Mettre les dates du trip à une semaine propre (9–15 mars 2026)
UPDATE public.trips
SET start_date = '2026-03-09'::date, end_date = '2026-03-15'::date, updated_at = NOW()
WHERE id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid;

-- Étape 2 : M'ajouter comme membre du trip (editor)
INSERT INTO public.trip_members (trip_id, user_id, role)
SELECT
  'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid,
  u.id,
  'editor'
FROM auth.users u
WHERE u.email = 'ton-email@example.com'  -- ← REMPLACER par ton email
  AND NOT EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid
      AND tm.user_id = u.id
      AND tm.removed_at IS NULL
  );

-- -----------------------------------------------------------------------------
-- Étape 3 : Insérer les activités (1 semaine) sur ce trip
-- Dates = 9–15 mars 2026. On utilise column1, column2, column3 (noms par défaut de VALUES).
-- -----------------------------------------------------------------------------
WITH trip_info AS (
  SELECT id AS trip_id, start_date
  FROM public.trips
  WHERE id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid
),
seed_rows AS (
  VALUES
    ('Visite Senso-ji', '09:00', 0),
    ('Marché aux poissons Tsukiji', '07:00', 0),
    ('Shinjuku le soir', '19:00', 0),
    ('Musée Ghibli', '10:00', 1),
    ('Parc Yoyogi', '14:00', 1),
    ('Shibuya Crossing', '18:00', 1),
    ('Tokyo Skytree', '09:30', 2),
    ('Akihabara', '14:00', 2),
    ('Ramen Ichiran', '19:00', 2),
    ('Temple Meiji', '08:00', 3),
    ('Harajuku Takeshita', '11:00', 3),
    ('Odaiba', '15:00', 3),
    ('Palais impérial', '09:00', 4),
    ('Quartier Ginza', '13:00', 4),
    ('Bar Golden Gai', '20:00', 4),
    ('Ueno Park & musées', '10:00', 5),
    ('Yanaka', '15:00', 5),
    ('Roppongi Hills', '18:00', 5),
    ('Asakusa balade', '08:00', 6),
    ('Derniers achats Shibuya', '12:00', 6)
)
INSERT INTO public.activities (
  trip_id,
  title,
  start_time,
  status,
  source,
  created_at,
  updated_at
)
SELECT
  t.trip_id,
  r.column1,
  r.column2::time,
  'proposed',
  'manual',
  ((t.start_date + r.column3 * INTERVAL '1 day')::date + r.column2::time)::timestamptz,
  ((t.start_date + r.column3 * INTERVAL '1 day')::date + r.column2::time)::timestamptz
FROM trip_info t
CROSS JOIN seed_rows r
WHERE t.trip_id IS NOT NULL;

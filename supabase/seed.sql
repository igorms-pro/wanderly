-- Seed: voyage d'une semaine + activités réparties sur chaque jour (démo itinéraire)
-- Prérequis: au moins un utilisateur dans auth.users (s'inscrire avant ou utiliser Supabase Auth).
-- Exécution: supabase db reset (ou au premier supabase start).
-- Dates démo: une semaine fixe en mars 2026 (propre, pas de CURRENT_DATE).

WITH first_user AS (
  SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
),
ins_trip AS (
  INSERT INTO public.trips (
    owner_id,
    title,
    destination_text,
    start_date,
    end_date,
    status
  )
  SELECT
    id,
    'Tokyo - Semaine découverte',
    'Tokyo, Japan',
    '2026-03-09'::date,
    '2026-03-15'::date,
    'planned'
  FROM first_user
  RETURNING id, start_date
),
-- Une ligne (trip_id + start_date) pour CROSS JOIN
trip_info AS (
  SELECT id AS trip_id, start_date FROM ins_trip LIMIT 1
),
-- Activités: 2–3 par jour sur 7 jours (created_at par jour pour regroupement dans l'app)
-- VALUES retourne column1, column2, column3 par défaut (pas d'alias de colonnes pour compatibilité)
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
CROSS JOIN seed_rows r;

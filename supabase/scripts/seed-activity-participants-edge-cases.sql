-- =============================================================================
-- Edge cases pour les participants par activité (Tokyo trip)
-- - Parfois tout le monde, parfois 4, parfois 1
-- - 2 activités en parallèle (même créneau) : 3 personnes à l’une, 4 à l’autre
-- Exécuter après seed-fake-members.sql. Trip Tokyo: cecf53f0-6244-4800-8ae8-3f76aa6e5524
-- =============================================================================

-- 1) Ajouter test@example.com comme 7e membre du voyage (pour 3+4 en parallèle)
INSERT INTO public.trip_members (trip_id, user_id, role)
SELECT
  'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid,
  '73be18cb-fc38-41cb-a548-8958bb0be37e'::uuid,
  'viewer'
WHERE NOT EXISTS (
  SELECT 1 FROM public.trip_members tm
  WHERE tm.trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid
    AND tm.user_id = '73be18cb-fc38-41cb-a548-8958bb0be37e'::uuid
    AND tm.removed_at IS NULL
);

-- 2) Deux activités en parallèle (même jour, même heure) : 3 vs 4 participants
--    Spa / Onsen → Alice, Ben, Carla (3)
--    Shopping Akihabara → Diego, Emma, Igor, test (4)
WITH new_activities AS (
  INSERT INTO public.activities (
    trip_id, title, start_time, status, source, created_at, updated_at
  )
  VALUES
    (
      'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid,
      'Spa / Onsen',
      '14:00',
      'proposed',
      'manual',
      '2026-03-10 14:00:00+00'::timestamptz,
      '2026-03-10 14:00:00+00'::timestamptz
    ),
    (
      'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid,
      'Shopping Akihabara',
      '14:00',
      'proposed',
      'manual',
      '2026-03-10 14:00:00+00'::timestamptz,
      '2026-03-10 14:00:00+00'::timestamptz
    )
  RETURNING id, title
)
INSERT INTO public.activity_participants (activity_id, user_id)
SELECT na.id, u.user_id
FROM new_activities na
CROSS JOIN LATERAL (
  VALUES
    ('Spa / Onsen', '6f0d331d-8c63-44fa-b612-55a3cafa0ed2'::uuid),
    ('Spa / Onsen', 'dd0ed934-30d3-4504-a444-8c7b58de5f27'::uuid),
    ('Spa / Onsen', 'bbaa6df1-75cb-4d4a-927f-49ceb7706542'::uuid),
    ('Shopping Akihabara', 'd75073f5-756a-4d20-8d57-eb9969d6d5ff'::uuid),
    ('Shopping Akihabara', '3c98bc41-a168-48d1-be0e-993bd5f1633f'::uuid),
    ('Shopping Akihabara', 'b5b9866b-83e6-4be2-a27c-a2d1b23cf51b'::uuid),
    ('Shopping Akihabara', '73be18cb-fc38-41cb-a548-8958bb0be37e'::uuid)
) AS u(act_title, user_id)
WHERE na.title = u.act_title;

-- 3) Edge case : 1 seul participant (Visite Senso-ji → Alice)
INSERT INTO public.activity_participants (activity_id, user_id)
SELECT a.id, '6f0d331d-8c63-44fa-b612-55a3cafa0ed2'::uuid
FROM public.activities a
WHERE a.trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid
  AND a.title = 'Visite Senso-ji'
  AND a.deleted_at IS NULL
LIMIT 1
ON CONFLICT (activity_id, user_id) DO NOTHING;

-- 4) Edge case : 4 participants (Parc Yoyogi → Alice, Ben, Carla, Diego)
INSERT INTO public.activity_participants (activity_id, user_id)
SELECT a.id, u.user_id
FROM (
  SELECT id FROM public.activities
  WHERE trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid
    AND title = 'Parc Yoyogi'
    AND deleted_at IS NULL
  LIMIT 1
) a
CROSS JOIN (
  VALUES
    ('6f0d331d-8c63-44fa-b612-55a3cafa0ed2'::uuid),
    ('dd0ed934-30d3-4504-a444-8c7b58de5f27'::uuid),
    ('bbaa6df1-75cb-4d4a-927f-49ceb7706542'::uuid),
    ('d75073f5-756a-4d20-8d57-eb9969d6d5ff'::uuid)
) AS u(user_id)
ON CONFLICT (activity_id, user_id) DO NOTHING;

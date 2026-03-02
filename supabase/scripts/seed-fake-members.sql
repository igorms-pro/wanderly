-- =============================================================================
-- Lie les 5 faux comptes (alice → emma) au voyage Tokyo pour tester l’affichage
-- « All trip members » dans l’itinéraire.
-- Trip Tokyo: cecf53f0-6244-4800-8ae8-3f76aa6e5524
-- Exécuter dans Supabase → SQL Editor.
-- =============================================================================

-- UIDs des 5 faux comptes (auth.users)
-- alice.voyagely+1@example.com, ben+2, carla+3, diego+4, emma+5

-- 1) S’assurer que les profils existent (si les users ont été créés à la main en DB,
--    le trigger on_auth_user_created n’a peut‑être pas été déclenché)
INSERT INTO public.profiles (id, email, display_name)
VALUES
  ('6f0d331d-8c63-44fa-b612-55a3cafa0ed2', 'alice.voyagely+1@example.com', 'Alice'),
  ('dd0ed934-30d3-4504-a444-8c7b58de5f27', 'ben.voyagely+2@example.com', 'Ben'),
  ('bbaa6df1-75cb-4d4a-927f-49ceb7706542', 'carla.voyagely+3@example.com', 'Carla'),
  ('d75073f5-756a-4d20-8d57-eb9969d6d5ff', 'diego.voyagely+4@example.com', 'Diego'),
  ('3c98bc41-a168-48d1-be0e-993bd5f1633f', 'emma.voyagely+5@example.com', 'Emma')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  email = EXCLUDED.email;

-- 2) Les ajouter comme membres du voyage Tokyo (editor)
INSERT INTO public.trip_members (trip_id, user_id, role)
SELECT
  'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid,
  u.id,
  'editor'
FROM (VALUES
  ('6f0d331d-8c63-44fa-b612-55a3cafa0ed2'::uuid),
  ('dd0ed934-30d3-4504-a444-8c7b58de5f27'::uuid),
  ('bbaa6df1-75cb-4d4a-927f-49ceb7706542'::uuid),
  ('d75073f5-756a-4d20-8d57-eb9969d6d5ff'::uuid),
  ('3c98bc41-a168-48d1-be0e-993bd5f1633f'::uuid)
) AS u(id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.trip_members tm
  WHERE tm.trip_id = 'cecf53f0-6244-4800-8ae8-3f76aa6e5524'::uuid
    AND tm.user_id = u.id
    AND tm.removed_at IS NULL
);

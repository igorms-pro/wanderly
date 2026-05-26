# Tour des fichiers encore gros (Voyagely)

Règles du projet : **200 lignes** max composant/hook/slice, **300 lignes** max par fichier, **50 lignes** max par fonction.

**Dernière mise à jour :** refactor v2 (#35) sur `refactor/issue-35-split-large-files`.

---

## À exclure du refactor

| Fichier                                       | Lignes | Raison                                   |
| --------------------------------------------- | ------ | ---------------------------------------- |
| `src/lib/types/database.types.ts`             | 637    | Généré Supabase, ne pas éditer à la main |
| `src/lib/__tests__/store.test.ts`             | 708    | Test, seuils plus souples OK             |
| `src/pages/__tests__/TripDetailPage.test.tsx` | 500    | Test                                     |

---

## Au-dessus de 300 lignes (surveiller)

| Fichier                        | Lignes | Note                         |
| ------------------------------ | ------ | ---------------------------- |
| `src/pages/TripDetailPage.tsx` | ~307   | Proche limite ; splits faits |

---

## Entre 200 et 300 lignes (acceptables post-v2 ou à surveiller)

| Fichier                                                              | Lignes | Type      |
| -------------------------------------------------------------------- | ------ | --------- |
| `src/lib/ai/openai-itinerary-service.ts`                             | ~240   | service   |
| `src/lib/store/auth-slice.ts`                                        | ~272   | slice     |
| `src/pages/trip-detail/hooks/useTripDetailRealtime.ts`               | ~259   | hook      |
| `src/pages/trip-detail/components/explore/ExploreNearbyPlaces.tsx`   | ~244   | composant |
| `src/pages/trip-detail/hooks/useTripDetail.ts`                       | ~243   | hook      |
| `src/lib/store/tripDetailSlice.utils.ts`                             | ~212   | utils     |
| `src/features/activities/hooks/activityFormHelpers.ts`               | ~212   | helpers   |
| `src/lib/ai/openai-itinerary-mock.ts`                                | ~211   | mock      |
| `src/pages/dashboard/useDashboardPage.ts`                            | ~208   | hook      |
| `src/pages/trip-detail/components/itinerary/TripDetailItinerary.tsx` | ~205   | composant |

---

## Splits réalisés (refactor v2)

Voir `SPLIT_PLAN_BY_AGENT.md` — agents 1–13 appliqués sur `main` (mai 2026).

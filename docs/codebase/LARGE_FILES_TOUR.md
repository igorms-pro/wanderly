# Tour des fichiers encore gros (Voyagely)

Règles du projet : **200 lignes** max composant, **300 lignes** max par fichier, **50 lignes** max par fonction.

---

## À exclure du refactor

| Fichier                                       | Lignes | Raison                                   |
| --------------------------------------------- | ------ | ---------------------------------------- |
| `src/lib/types/database.types.ts`             | 519    | Généré Supabase, ne pas éditer à la main |
| `src/lib/__tests__/store.test.ts`             | 708    | Test, seuils plus souples OK             |
| `src/pages/__tests__/TripDetailPage.test.tsx` | 424    | Test                                     |

---

## Au-dessus de 300 lignes (à traiter en priorité)

| Fichier                                                  | Lignes | Limite dépassée |
| -------------------------------------------------------- | ------ | --------------- |
| `src/pages/TripDetailPage.tsx`                           | 340    | 300 (fichier)   |
| `src/lib/ai/openai-itinerary-service.ts`                 | 340    | 300 (fichier)   |
| `src/features/activities/hooks/useCreateActivityForm.ts` | 307    | 300 (fichier)   |

---

## Entre 200 et 300 lignes (composants / hooks / slices)

| Fichier                                                                          | Lignes | Type      |
| -------------------------------------------------------------------------------- | ------ | --------- |
| `src/lib/store/auth-slice.ts`                                                    | 278    | slice     |
| `src/features/chat/hooks/useTripChat.ts`                                         | 278    | hook      |
| `src/features/trips/components/CreateTripSteps.tsx`                              | 277    | composant |
| `src/lib/store/tripDetailSlice.aiScenarioOps.ts`                                 | 246    | slice     |
| `src/lib/store/tripDetailSlice.scenarios.ts`                                     | 244    | slice     |
| `src/pages/trip-detail/components/itinerary/TripDetailItinerary.tsx`             | 238    | composant |
| `src/pages/trip-detail/hooks/useItineraryDragAndDrop.ts`                         | 234    | hook      |
| `src/pages/trip-detail/components/itinerary/ItineraryActivityDetailsSection.tsx` | 234    | composant |
| `src/pages/dashboard/DashboardPage.tsx`                                          | 226    | page      |
| `src/lib/store/trips-slice.ts`                                                   | 211    | slice     |
| `src/lib/places-service.ts`                                                      | 200    | service   |

---

## Proche de la limite (200 lignes)

| Fichier                                                                        | Lignes |
| ------------------------------------------------------------------------------ | ------ |
| `src/pages/trip-detail/components/itinerary/ItineraryActivityItem.tsx`         | 199    |
| `src/pages/trip-detail/hooks/useTripDetailRealtime.ts`                         | 198    |
| `src/pages/trip-detail/hooks/useTripDetail.ts`                                 | 197    |
| `src/pages/trip-detail/components/itinerary/timeline/TimelineActivityCard.tsx` | 191    |

---

## Ordre suggéré pour reformat / petit refactor (sans split)

1. **Reformat global** : `npm run format` (Prettier sur tout le repo).
2. **Fichiers >300 lignes** : cleanup manuel (early returns, constantes, pas de split demandé).
3. **Fichiers 200–300** : idem si le code est “moche” (imbrications, magic numbers, etc.).

Généré pour la branche de test (permissions activités, création, scénarios IA).

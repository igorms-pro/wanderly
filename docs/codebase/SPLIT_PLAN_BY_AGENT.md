# Plan de division des gros fichiers — par agent

**Règle** : Chaque agent fait **tout** son périmètre (création de fichiers + refactor des existants). Aucune dépendance entre agents : tout peut être lancé **en parallèle**.

**Référence détaillée** : `docs/codebase/SPLIT_LARGE_FILES_PLAN.md`

---

## Agent 1 — Trip detail page

**Périmètre** : `src/pages/TripDetailPage.tsx` + tout ce qu’il faut extraire pour le faire passer sous 300 lignes.

| Étape | Fichier                                                  | Action                                                                                                                                                                                                                                                                                                                         |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `src/pages/trip-detail/utils/tripDetailPageHelpers.ts`   | **Créer**. Extraire `getTripBudgetFromConstraints`, `getConstraintsSummary` depuis `TripDetailPage.tsx`.                                                                                                                                                                                                                       |
| 2     | `src/pages/trip-detail/hooks/useTripDetailPageModals.ts` | **Créer**. Extraire état (`activityToEdit`, `activityToDelete`, `showDeleteModal`, `lastEditedActivityId`) et handlers `handleAddMeToActivity`, `handleRemoveMeFromActivity`. Le hook reçoit `tripId`, `user`, `tripMembers`, `activityParticipantsMap`, `refreshActivityParticipants` et retourne state + setters + handlers. |
| 3     | `src/pages/TripDetailPage.tsx`                           | **Modifier**. Importer helpers et hook ; supprimer le code extrait ; garder uniquement composition (layout, loading, error, onglets, modals).                                                                                                                                                                                  |

**Livrable** : Page < 300 lignes, même comportement. Aucun autre agent ne touche à ces fichiers.

---

## Agent 2 — OpenAI itinerary service

**Périmètre** : `src/lib/ai/openai-itinerary-service.ts` + extraction types + mock.

| Étape | Fichier                                  | Action                                                                                                                                                                                                                                                                                                                                                |
| ----- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/lib/ai/openai-itinerary-types.ts`   | **Créer**. Y mettre : `ItineraryRequest`, schémas Zod (`dayActivitySchema`, `itineraryDaySchema`, `aiItineraryScenarioSchema`, `activitySuggestionSchema`, `activitySuggestionsSchema`), types dérivés (`DayActivity`, `ItineraryDay`, `GeneratedItinerary`, `AIActivitySuggestion`), `GenerateItineraryParams`, `GenerateActivitySuggestionsParams`. |
| 2     | `src/lib/ai/openai-itinerary-mock.ts`    | **Créer**. Y déplacer `generateMockItinerary(request)` en entier.                                                                                                                                                                                                                                                                                     |
| 3     | `src/lib/ai/openai-itinerary-service.ts` | **Modifier**. Importer types et mock ; garder uniquement `generateItineraryFromConstraints`, `generateActivitySuggestions`, `isDemoApiKey`. Re-exporter le mock si des consommateurs l’utilisent.                                                                                                                                                     |

**Livrable** : Service < 300 lignes. Aucun autre agent ne touche à `lib/ai/`.

---

## Agent 3 — Activity form hook

**Périmètre** : `src/features/activities/hooks/useCreateActivityForm.ts` + helpers.

| Étape | Fichier                                                  | Action                                                                                                                                                                |
| ----- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/features/activities/hooks/activityFormHelpers.ts`   | **Créer**. Y mettre : `buildInitialFormData(options)`, `validateActivityFormData(formData, t): string                                                                 | null`, et une fonction de construction du payload (ex. `buildSubmitPayload(mode, formData, tripId, activity?, ...)` qui retourne l’objet pour create ou update). |
| 2     | `src/features/activities/hooks/useCreateActivityForm.ts` | **Modifier**. Importer les helpers ; `handleSubmit` appelle validate puis build payload puis create/update. Réduire le hook à état + `handleChange` + `handleSubmit`. |

**Livrable** : Hook < 300 lignes. Aucun autre agent ne touche à `features/activities/hooks/`.

---

## Agent 4 — Auth slice

**Périmètre** : `src/lib/store/auth-slice.ts` + utils.

| Étape | Fichier                       | Action                                                                                                                                                    |
| ----- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/lib/store/auth-utils.ts` | **Créer**. Y mettre `profileToUser(profile)`. Optionnel : `fetchUserFromSession()` (logique “get session + fetch profile”) pour alléger `initializeAuth`. |
| 2     | `src/lib/store/auth-slice.ts` | **Modifier**. Importer depuis `auth-utils.ts` ; appeler `fetchUserFromSession` dans `initializeAuth` si extrait.                                          |

**Livrable** : Slice < 200 lignes. Aucun autre agent ne touche à auth.

---

## Agent 5 — Chat hook

**Périmètre** : `src/features/chat/hooks/useTripChat.ts`.

| Étape | Fichier                                  | Action                                                                                                                                                                                                              |
| ----- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/features/chat/hooks/useTripChat.ts` | **Modifier**. Extraire en fonctions nommées (même fichier ou `useTripChatMessages.ts`) : chargement des messages, subscription realtime, envoi / édition. Le hook garde l’état et orchestre. Objectif < 200 lignes. |

**Livrable** : Un seul fichier modifié (ou un helper interne créé). Aucun autre agent ne touche à `features/chat/`.

---

## Agent 6 — Create trip steps

**Périmètre** : `src/features/trips/components/CreateTripSteps.tsx` → un fichier par step.

| Étape | Fichier                                                               | Action                                                                                                               |
| ----- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/features/trips/components/create-trip-steps/types.ts`            | **Créer**. `TripFormData`, `StepProps`, `INTEREST_OPTIONS`, `PACE_ICONS`.                                            |
| 2     | `src/features/trips/components/create-trip-steps/StepDestination.tsx` | **Créer**. Copier le contenu de `StepDestination` depuis `CreateTripSteps.tsx`.                                      |
| 3     | `src/features/trips/components/create-trip-steps/StepTravelers.tsx`   | **Créer**. Idem pour `StepTravelers`.                                                                                |
| 4     | `src/features/trips/components/create-trip-steps/StepStyle.tsx`       | **Créer**. Idem pour `StepStyle`.                                                                                    |
| 5     | `src/features/trips/components/create-trip-steps/StepInterests.tsx`   | **Créer**. Idem pour `StepInterests`.                                                                                |
| 6     | `src/features/trips/components/CreateTripSteps.tsx`                   | **Modifier**. Ré-exporter les 4 steps depuis `create-trip-steps/` (barrel) pour ne pas casser les imports du wizard. |

**Livrable** : Chaque step < 80 lignes, barrel < 30. Aucun autre agent ne touche à `features/trips/components/`.

---

## Agent 7 — Store : scenarios + AI scenario ops + utils

**Périmètre** : `tripDetailSlice.utils.ts` (nouveau) + `tripDetailSlice.aiScenarioOps.ts` + `tripDetailSlice.scenarios.ts`. **Un seul agent** pour éviter qu’un slice dépende d’un fichier créé par un autre agent.

| Étape | Fichier                                          | Action                                                                                                                                                                                                         |
| ----- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/lib/store/tripDetailSlice.utils.ts`         | **Créer**. Y mettre `normalizeTime`, `parseTripConstraints` (extraits de `aiScenarioOps`).                                                                                                                     |
| 2     | `src/lib/store/tripDetailSlice.aiScenarioOps.ts` | **Modifier**. Importer `normalizeTime` et `parseTripConstraints` depuis `tripDetailSlice.utils.ts`. Optionnel : extraire `persistGeneratedItinerary` pour alléger `generateAiScenario`. Objectif < 200 lignes. |
| 3     | `src/lib/store/tripDetailSlice.scenarios.ts`     | **Modifier**. Extraire la logique fetch de `loadScenarios` dans une fonction `fetchScenariosData(tripId)` (même fichier ou dans un petit module dédié), puis l’appeler depuis le slice. Objectif < 200 lignes. |

**Livrable** : Les 3 fichiers respectent les limites. Aucun autre agent ne touche à ces slices.

---

## Agent 8 — Trip detail itinerary (composant)

**Périmètre** : `src/pages/trip-detail/components/itinerary/TripDetailItinerary.tsx`.

| Étape | Fichier                   | Action                                                                                                                                                                                                                                                                                                    |
| ----- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | (option A) Context        | **Créer** `TripDetailItineraryContext` qui fournit les props lourdes ; le composant consomme le context. **Ou** (option B) extraire sous-composants : `TripDetailItineraryScenarios.tsx`, `TripDetailItineraryViews.tsx` ; `TripDetailItinerary` ne fait que layout (tabs + summary + views + scenarios). |
| 2     | `TripDetailItinerary.tsx` | **Modifier**. Réduire la taille à < 200 lignes en utilisant le context ou les sous-composants.                                                                                                                                                                                                            |

**Livrable** : Fichier principal < 200 lignes. Aucun autre agent ne touche à ce composant.

---

## Agent 9 — Itinerary drag and drop

**Périmètre** : `src/pages/trip-detail/hooks/useItineraryDragAndDrop.ts` + `itinerary-reorder-utils.ts`.

| Étape | Fichier                                                  | Action                                                                                                                                                                                                                                |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/pages/trip-detail/hooks/itinerary-reorder-utils.ts` | **Modifier** (déjà existant). Y déplacer la logique “calcul des updates + persist” (ex. `persistReorder` ou équivalent) actuellement dans le hook, pour que le hook ne garde que state (dragging) + handlers qui appellent les utils. |
| 2     | `src/pages/trip-detail/hooks/useItineraryDragAndDrop.ts` | **Modifier**. Utiliser les utils pour la persistance ; garder uniquement état et handlers. Objectif < 120 lignes.                                                                                                                     |

**Livrable** : Hook < 120 lignes, utils bien séparés. Aucun autre agent ne touche à ces hooks.

---

## Agent 10 — Itinerary activity details section

**Périmètre** : `src/pages/trip-detail/components/itinerary/ItineraryActivityDetailsSection.tsx`.

| Étape | Fichier                                                         | Action                                                                                                                                                                          |
| ----- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Sous-composants (même dossier ou `itinerary/activity-details/`) | **Créer** : `ItineraryActivityDescription`, `ItineraryActivityLocation`, `ItineraryActivityCost`, `ItineraryActivityTransport`, `ItineraryActivityParticipants` (bloc pliable). |
| 2     | `ItineraryActivityDetailsSection.tsx`                           | **Modifier**. Composer les sous-composants ; fichier principal < 80 lignes.                                                                                                     |

**Livrable** : Section < 80 lignes, blocs < 60 chacun. Aucun autre agent ne touche à ce composant.

---

## Agent 11 — Dashboard page

**Périmètre** : `src/pages/dashboard/DashboardPage.tsx`.

| Étape | Fichier                                   | Action                                                                                                                                                                                  |
| ----- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `src/pages/dashboard/useDashboardPage.ts` | **Créer**. Y déplacer : état (loading, error, statusFilter, searchQuery, sortBy, tripMemberCounts, openMenuId), `loadTripsData`, effet realtime, handlers (filter, sort, delete, menu). |
| 2     | `src/pages/dashboard/DashboardPage.tsx`   | **Modifier**. Importer le hook ; ne garder que le rendu (layout, header, filters, sections, modals). Objectif < 120 lignes.                                                             |

**Livrable** : Page < 120 lignes. Aucun autre agent ne touche à `pages/dashboard/`.

---

## Agent 12 — Trips slice

**Périmètre** : `src/lib/store/trips-slice.ts`.

| Étape | Fichier                        | Action                                                                                                                                                       |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `src/lib/store/trips-api.ts`   | **Créer**. Une fonction `loadTripsFromApi(): Promise<Trip[]>` qui fait memberships + fetch trips + mapping.                                                  |
| 2     | `src/lib/store/trips-slice.ts` | **Modifier**. Dans `loadTrips`, appeler `loadTripsFromApi()` puis `set({ trips })`. Idem pour `createTrip` si le bloc est long. Objectif slice < 150 lignes. |

**Livrable** : Slice < 150 lignes. Aucun autre agent ne touche à trips-slice / trips-api.

---

## Agent 13 — Places service

**Périmètre** : `src/lib/places-service.ts`.

| Étape | Fichier                                 | Action                                                                                                                                                                                                                                                                      |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Option A — helpers dans le même fichier | Extraire `buildPlacesSearchParams`, `mapPlaceResult` (ou équivalent) pour raccourcir les fonctions. **Ou** Option B — split : `places-types.ts` (interfaces), `places-search.ts`, `places-nearby.ts`, `places-details.ts` + barrel `places-service.ts` qui re-exporte tout. |
| 2     | `src/lib/places-service.ts`             | **Modifier** (ou remplacer par barrel). Aucun fichier > 100 lignes.                                                                                                                                                                                                         |

**Livrable** : Code organisé, pas de fichier > 100 lignes si split. Aucun autre agent ne touche à `lib/places-service*`.

---

## Récap — qui fait quoi

| Agent | Périmètre                | Fichiers principaux                                                              |
| ----- | ------------------------ | -------------------------------------------------------------------------------- |
| 1     | Trip detail page         | TripDetailPage.tsx, tripDetailPageHelpers.ts, useTripDetailPageModals.ts         |
| 2     | OpenAI itinerary         | openai-itinerary-types.ts, openai-itinerary-mock.ts, openai-itinerary-service.ts |
| 3     | Activity form            | activityFormHelpers.ts, useCreateActivityForm.ts                                 |
| 4     | Auth store               | auth-utils.ts, auth-slice.ts                                                     |
| 5     | Chat hook                | useTripChat.ts                                                                   |
| 6     | Create trip steps        | create-trip-steps/\*, CreateTripSteps.tsx                                        |
| 7     | Store scenarios + AI ops | tripDetailSlice.utils.ts, aiScenarioOps.ts, scenarios.ts                         |
| 8     | Trip detail itinerary    | TripDetailItinerary.tsx + context ou sous-composants                             |
| 9     | Drag and drop            | useItineraryDragAndDrop.ts, itinerary-reorder-utils.ts                           |
| 10    | Activity details section | ItineraryActivityDetailsSection.tsx + sous-composants                            |
| 11    | Dashboard                | useDashboardPage.ts, DashboardPage.tsx                                           |
| 12    | Trips store              | trips-api.ts, trips-slice.ts                                                     |
| 13    | Places service           | places-service (split ou helpers)                                                |

**Ordre d’exécution** : Tous les agents peuvent tourner **en parallèle**. Aucune dépendance entre agents.

**Après merge** : Lancer les tests et le build ; corriger les imports si un barrel a changé (ex. `CreateTripSteps`, `lib/ai`).

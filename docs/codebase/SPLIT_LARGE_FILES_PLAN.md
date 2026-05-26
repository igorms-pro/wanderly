# Plan : Division des gros fichiers

Objectif : ramener les fichiers au respect des limites (200 lignes composant, 300 lignes fichier, 50 lignes fonction) par **extraction et split** sans changer le comportement.

---

## Priorité 1 (obligatoire)

### 1. `src/pages/TripDetailPage.tsx` (340 → <300)

**Problème** : Une seule page qui fait layout + état modals + handlers participants + rendu onglets.

**Actions :**

| Action                                | Fichier / contenu                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extraire helpers                      | `src/pages/trip-detail/utils/tripDetailPageHelpers.ts` : `getTripBudgetFromConstraints`, `getConstraintsSummary` (déjà des fonctions pures).                                                                                                                                                                                                            |
| Extraire état + handlers participants | `src/pages/trip-detail/hooks/useTripDetailPageModals.ts` : état `activityToEdit`, `activityToDelete`, `showDeleteModal`, `lastEditedActivityId`, `handleAddMeToActivity`, `handleRemoveMeFromActivity`. Le hook prend `tripId`, `user`, `tripMembers`, `activityParticipantsMap`, `refreshActivityParticipants` et retourne state + setters + handlers. |
| Garder la page                        | `TripDetailPage.tsx` : importe le hook et les helpers, compose layout (header, hero, tabs, main) et rendu conditionnel (loading, error, contenu). Pas de logique métier lourde.                                                                                                                                                                         |

**Résultat attendu** : page ~180–220 lignes, reste dans `pages/`, sous-logique dans `trip-detail/`.

---

### 2. `src/lib/ai/openai-itinerary-service.ts` (340 → <300)

**Problème** : Types + schémas Zod + 2 fonctions API + une grosse fonction mock (~130 lignes) dans un seul fichier.

**Actions :**

| Action                   | Fichier / contenu                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extraire schémas + types | `src/lib/ai/openai-itinerary-types.ts` : `ItineraryRequest`, `dayActivitySchema`, `itineraryDaySchema`, `aiItineraryScenarioSchema`, `activitySuggestionSchema`, `activitySuggestionsSchema`, types dérivés (`DayActivity`, `ItineraryDay`, `GeneratedItinerary`, `AIActivitySuggestion`), `GenerateItineraryParams`, `GenerateActivitySuggestionsParams`. |
| Extraire mock            | `src/lib/ai/openai-itinerary-mock.ts` : `generateMockItinerary(request)` (toute la logique jour par jour). Export depuis `openai-itinerary-service.ts` en re-export si besoin.                                                                                                                                                                             |
| Garder le service        | `openai-itinerary-service.ts` : import des types/schémas et du mock ; `generateItineraryFromConstraints`, `generateActivitySuggestions`, `isDemoApiKey`. Appels à `buildItineraryPrompt`, `buildActivitySuggestionsPrompt`, `callOpenAIChat`, `parseJSONResponse`.                                                                                         |

**Résultat attendu** : service ~120–150 lignes ; types ~70 ; mock ~140 (un seul fichier “gros” mais isolé).

---

### 3. `src/features/activities/hooks/useCreateActivityForm.ts` (307 → <300)

**Problème** : Hook avec `buildInitialFormData` + validation + construction du payload en un bloc.

**Actions :**

| Action                                            | Fichier / contenu                                                                                                                                                                                                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Extraire données initiales + validation + payload | `src/features/activities/hooks/activityFormHelpers.ts` : `buildInitialFormData(options)` (déjà une fonction pure), `validateActivityFormData(formData, t): string                                                                                               | null`, `buildCreatePayload(formData, tripId, ...)`, `buildUpdatePayload(formData, activityId, ...)`(ou une seule`buildSubmitPayload(mode, formData, ...)` qui retourne l’objet pour create ou update). |
| Garder le hook                                    | `useCreateActivityForm.ts` : import des helpers ; état `formData`, `loading`, `error` ; `handleChange` ; `handleSubmit` appelle validate puis build payload puis create/update. Pas de logique de validation détaillée ni de construction d’objet dans le hook. |

**Résultat attendu** : hook ~100–130 lignes ; helpers ~120–150 lignes.

---

## Priorité 2 (si possible)

### 4. `src/lib/store/auth-slice.ts` (278)

- Extraire `profileToUser` dans `src/lib/store/auth-utils.ts` (déjà une fonction pure).
- Optionnel : extraire la logique “get session + fetch profile” de `initializeAuth` dans une fonction `fetchUserFromSession()` dans `auth-utils.ts`, appelée depuis le slice. Garder `signInWithOAuth`, `signOut`, etc. dans le slice.
- Objectif : slice sous 200 lignes.

---

### 5. `src/features/chat/hooks/useTripChat.ts` (278)

- Extraire dans `useTripChatMessages.ts` (ou dans le même fichier en fonctions nommées) : `loadMessages(tripId, setMessages, setMessagesWithProfiles, setUserProfiles)`, `subscribeRealtime(...)`, logique d’envoi et d’édition.
- `useTripChat` garde l’état (loading, sending, messagesWithProfiles, etc.) et appelle ces fonctions dans des `useCallback` / `useEffect`. Ou garder un seul hook mais extraire 2–3 blocs en fonctions pures (map messages + profiles, build send payload).
- Objectif : fichier sous 200 lignes.

---

### 6. `src/features/trips/components/CreateTripSteps.tsx` (277)

- Un fichier par step : `StepDestination.tsx`, `StepTravelers.tsx`, `StepStyle.tsx`, `StepInterests.tsx` dans `src/features/trips/components/create-trip-steps/`.
- Types partagés : `TripFormData`, `StepProps`, `INTEREST_OPTIONS`, `PACE_ICONS` dans `create-trip-steps/types.ts` ou dans un `index.ts` qui ré-exporte les 4 steps.
- `CreateTripSteps.tsx` : ré-exporte les 4 steps depuis le dossier (ou reste un barrel) pour ne pas casser les imports du wizard.
- Objectif : chaque step < 80 lignes, barrel < 30.

---

### 7. `src/lib/store/tripDetailSlice.aiScenarioOps.ts` (246)

- Déplacer `normalizeTime` et `parseTripConstraints` dans `src/lib/store/tripDetailSlice.utils.ts` (ou `tripDetailSlice.common.ts`) et les importer ici.
- Optionnel : extraire “insert itinerary + days + activities” de `generateAiScenario` dans une fonction `persistGeneratedItinerary(result, tripId, itineraryId)` dans le même fichier ou dans un petit module dédié, pour alléger la fonction.
- Objectif : fichier sous 200 lignes.

---

### 8. `src/lib/store/tripDetailSlice.scenarios.ts` (244)

- Garder `mapItineraryToScenario` et les types dans ce fichier.
- Extraire la logique “fetch itineraries + days + activities” de `loadScenarios` dans une fonction `fetchScenariosData(tripId)` qui retourne les données brutes ; dans le slice, appeler cette fonction puis mapper avec `mapItineraryToScenario`. Même idée pour `createScenario` / `deleteScenario` si des blocs sont longs (ex. construction du payload).
- Objectif : fichier sous 200 lignes.

---

### 9. `src/pages/trip-detail/components/itinerary/TripDetailItinerary.tsx` (238)

- Réduire les props : introduire un `TripDetailItineraryContext` qui fournit `activitiesByDate`, `sortedDates`, `canEdit`, `canReorder`, etc. Le composant consomme le context au lieu de recevoir 25+ props. Le context est fourni par le parent (TripDetailPage ou un wrapper).
- Ou : extraire la section “Scénarios” dans un composant `TripDetailItineraryScenarios.tsx` qui reçoit seulement les props scénarios ; et la zone “vue (list/calendar/timeline)” dans `TripDetailItineraryViews.tsx`. `TripDetailItinerary` ne fait que layout (tabs + summary + views + scenarios).
- Objectif : fichier sous 200 lignes.

---

### 10. `src/pages/trip-detail/hooks/useItineraryDragAndDrop.ts` (234)

- La logique “calcul des nouveaux order_index + itinerary_day_id” et les appels `updateActivity` peuvent rester dans le hook ou être déplacés dans `itinerary-reorder-utils.ts` (ex. `computeReorderUpdates(...)` et `persistReorder(activityId, newDate, ...)` qui appelle le store). Le hook ne garde que l’état (draggingActivityId, draggingDate) et les handlers (handleDragStart, handleDragOver, handleDropOnActivity, handleDropOnEmptyDay) qui appellent les utils.
- Objectif : hook sous 120 lignes, utils sous 100.

---

### 11. `src/pages/trip-detail/components/itinerary/ItineraryActivityDetailsSection.tsx` (234)

- Extraire en sous-composants (même fichier ou petits fichiers) : `ItineraryActivityDescription`, `ItineraryActivityLocation` (lieu + lien Google Maps), `ItineraryActivityCost`, `ItineraryActivityTransport`, `ItineraryActivityParticipants` (bloc pliable avec liste + chevron). `ItineraryActivityDetailsSection` devient une composition de ces blocs.
- Objectif : section principale < 80 lignes, chaque bloc < 60.

---

### 12. `src/pages/dashboard/DashboardPage.tsx` (226)

- Extraire un hook `useDashboardPage.ts` : état (loading, error, statusFilter, searchQuery, sortBy, tripMemberCounts, openMenuId), `loadTripsData`, effet realtime, handlers (filter, sort, delete, open/close menu). La page importe le hook et rend uniquement layout (header, filters, sections, modals).
- Optionnel : extraire la récupération des “trip member counts” dans une fonction ou un petit hook `useTripMemberCounts(tripIds)`.
- Objectif : page < 120 lignes.

---

### 13. `src/lib/store/trips-slice.ts` (211)

- Extraire la logique “fetch memberships + fetch trips + map” dans `src/lib/store/trips-api.ts` (ou `trips-slice.api.ts`) : une fonction `loadTripsFromApi(): Promise<Trip[]>` qui fait les 2 appels Supabase et le mapping. Le slice appelle cette fonction dans `loadTrips` et fait `set({ trips })`. Même principe pour `createTrip` si le bloc est long.
- Objectif : slice < 150 lignes.

---

### 14. `src/lib/places-service.ts` (200)

- Soit garder un seul fichier (déjà à la limite) et extraire seulement des helpers (ex. `buildPlacesSearchParams`, `mapPlaceResult`) pour raccourcir les fonctions.
- Soit split par domaine : `places-search.ts` (searchPlaces), `places-nearby.ts` (getNearbyPlaces), `places-details.ts` (getPlaceDetails) + `places-types.ts` (interfaces partagées) et un `places-service.ts` ou `index.ts` qui re-exporte tout pour ne pas casser les imports.
- Objectif : aucun fichier > 100 lignes si on split.

---

## Ordre d’exécution suggéré

1. **Priorité 1** : TripDetailPage → openai-itinerary-service → useCreateActivityForm (pour respecter la limite 300 lignes).
2. **Priorité 2** : dans l’ordre qui t’arrange (ex. CreateTripSteps pour gain rapide, puis TripDetailItinerary, DashboardPage, hooks, slices, places-service).

---

## Règles pendant le split

- Aucun changement de comportement : mêmes exports publics, mêmes signatures d’API.
- Les tests existants doivent rester verts ; ajouter ou adapter les imports si des symboles changent de fichier.
- Conserver l’architecture feature-based : pas d’imports entre features ; shared dans `lib/` ou `hooks/`.

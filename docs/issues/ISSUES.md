# Voyagely Issues & Tasks Tracker

> Goal: Build a complete SaaS travel planning platform with AI-powered itineraries, real-time collaboration, and seamless user experience.

**Last Updated:** May 13, 2026 (merge local `main` — chat #11 + IA Edge #12 + timeline #13)

## 📋 Status Legend

- 🔴 **Not Started** - Task identified but not begun
- 🟡 **In Progress** - Actively being worked on
- 🟢 **Completed** - Task finished and tested
- ⏸️ **Blocked** - Waiting on dependencies or decisions
- 🔵 **Testing** - In QA or testing phase
- 🟣 **On Hold** - Deferred for later

---

### État repo / code (référence)

- **`main` (local)** : inclut désormais **`feature/issue-11-chat-unread-tab`** en fast-forward — chat **#11**, IA Edge **#12** (fonctions, `018`, quotas tier), timeline **temps entre activités** (#13 slice). **À faire :** `git push origin main` pour aligner **GitHub** ; fermer / lier les Issues GitHub **#11** / **#12** si besoin.
- **`origin/main`** (distant) : sera aligné après le **push** ci-dessus.

---

## 🚀 IMMEDIATE NEXT ACTION (For AI Agent)

1. **`git push origin main`** — publier le merge local (CI + équipe).
2. **GitHub** : fermer ou mettre à jour les Issues **#11** / **#12** ; ouvrir / merger une **PR** rétroactive si tu préfères le flux PR avant push (dans ce cas `main` local peut devancer `origin` jusqu’au merge PR).
3. **Issue #13** : suite — **carte activités** / route (optionnel) ; E2E smoke **Edge** sur staging si utile.
4. **PR #36** : optionnel — traiter ou fermer.

---

## ✅ Issues #0–#10 (archivées — terminées)

Les sections détaillées **#0 à #10** ont été retirées pour limiter la maintenance de ce fichier. État : **tout est livré sur `main`** (sauf notes optionnelles dans les anciennes AC).

| #      | Sujet                                          | Réf. rapide            |
| ------ | ---------------------------------------------- | ---------------------- |
| 0      | Tooling / CI / tests / Sentry / PostHog        | ✅ `main`              |
| 1      | Schéma Supabase, RLS, migrations               | ✅ `main`              |
| 2      | i18n                                           | ✅ `main`              |
| 3 / 3b | Archi doc + dossiers `features/`               | ✅ `main`              |
| 4      | Design system                                  | ✅ `main`              |
| 5–7    | Landing, auth, dashboard                       | ✅ `main`              |
| 8      | Trip detail core (tabs, itinéraire, recherche) | ✅ `main`              |
| 9      | Activités & scénarios IA                       | ✅ PR **#34**          |
| 10     | Votes, décision, finaliser, notifs chat        | ✅ PR **#38**, **#39** |

### 📌 Terminologie (itinéraire vs scénarios)

- **Itinéraire actif** : vérité du voyage (activités par jour, statuts, votes).
- **Scénarios** : options (souvent IA) ; choisir une base ou importer = **copie** vers l’itinéraire actif — une seule timeline « réelle ».

---

## 🎯 Issue #11: Trip Detail Screen - Chat & Collaboration

**Status:** 🟢 **COMPLETED (MVP)** — non-lus onglet, réactions (`017`), mentions, typings Postgrest ; présence / frappe. Code sur **`main` (local)** via merge `feature/issue-11-chat-unread-tab` — **pousser `origin/main`**. Réfs GitHub [#40](https://github.com/igorms-pro/voyagely/issues/40) / PR [#41](https://github.com/igorms-pro/voyagely/pull/41) si applicable. **Hors MVP :** `last_seen` SQL, reply threads, non-lus multi-device.  
**Priority:** HIGH  
**Phase:** Screen 4d  
**Dependencies:** Issues #0–#10 (archivées — `main`)

### Description

Complete chat with presence, typing indicators, and collaboration features.

### Tasks

#### Basic Chat

- [x] 🟢 **Chat already implemented**:
  - [x] Message sending/receiving
  - [x] Message history loading
  - [x] Real-time messages
  - [x] User avatars

#### Presence Tracking

- [x] 🟢 **Add presence tracking** (MVP — Supabase Realtime Presence, pas de `last_seen` SQL) :
  - [x] Show who's online in trip (pastilles + compteur dans l’en-tête chat)
  - [x] Online/offline indicator on avatars (messages des autres)
  - [ ] Last seen timestamps (hors scope MVP — persistance profil / table dédiée)
  - [x] Active users count (compteur « membres en ligne »)

#### Typing Indicators

- [x] 🟢 **Add typing indicators**:
  - [x] Broadcast typing state (canal Realtime `trip:{id}:chat-collab`, debounce ~450 ms)
  - [x] Display "User is typing..." (ligne sous le titre du chat, `aria-live="polite"`)
  - [x] Debounce typing events

#### Enhanced Chat Features

- [x] 🟢 **Chat enhancements (MVP)** :
  - [x] Message reactions (👍 👎 ❤️ 😂) — `message_reactions` + barre sous chaque bulle (`017_message_reactions.sql`)
  - [x] @mentions — slugs stables + surbrillance + suggestions à la frappe (pas de notif / pas de threads)
  - [ ] Reply to message - optional
  - [x] Message timestamps (déjà affichés sur chaque bulle — `TripChatMessageList`)
  - [x] Unread message counter (badge onglet Chat — `localStorage` + Realtime INSERT, sans migration)

#### i18n

- [x] 🟡 **Verify all chat text is internationalized**:
  - [x] Input placeholder
  - [x] Send button (`aria-label`)
  - [x] Empty state
  - [x] Presence indicators (compteur + liste membres + points en ligne)
  - [x] Typing indicators
  - [x] Réactions + mentions (MVP léger) + libellés `chat.reactionToggle`, `chat.mentionSuggestions`
  - [x] Tab unread badge + `aria-label` / libellé navigation onglets (`tripDetail.chatTabAriaUnread` avec `{{display}}`, `tripDetail.tabsNavAria`)

### Acceptance Criteria

- [x] Chat works fully (envoi / réception / édition / suppression, temps réel messages)
- [x] Presence tracking works (MVP Realtime — sans last_seen persistant)
- [x] Typing indicators work
- [x] Real-time updates work
- [x] Texte chat couvert par i18n (y compris présence / frappe / badge non-lus onglet / réactions / mentions) — extensions futures : reply threads, réactions custom
- [x] Tests unitaires ciblés (presence helper) ; E2E chat optionnel

---

## 🎯 Issue #12: Trip Detail Screen - AI Itinerary Generation

**Status:** 🟢 **COMPLETED (MVP)** — code fusionné dans **`main` (local)** mai 2026 : Edge **`ai-generate-itinerary`** / **`ai-generate-activity-suggestions`**, migration **`018`**, quotas **tier** + RBAC, client **`edge`** par défaut, E2E + tests unitaires. **Distant :** pousser `main`. Optionnel : reporting coûts agrégé admin, **Stripe** → `ai_tier` premium.  
**GitHub:** fermer / référencer Issue **#12** après push `main`.  
**Branche historique :** `feature/issue-11-chat-unread-tab` (fast-forward → `main`).  
**Priority:** HIGH  
**Phase:** Screen 4e  
**Dependencies:** Issues #0–#10 (archivées — `main`)

### Pourquoi c’est pertinent (business / produit)

- **Temps de cadrage** : un groupe part rarement d’une page blanche efficace. Des scénarios IA comparables réduisent le « blanc » et donnent un **premier langage commun** (jours, ordre de grandeur budget, rythme).
- **Décision collective** : Voyagely n’est pas un planner solo — l’IA alimente des **options** que le groupe vote / finalise (#10). La valeur vendable est la **convergence** (moins de allers-retours WhatsApp).
- **Contrôle des coûts & confiance** : sans observabilité (tokens, taux d’échec) et sans UX d’erreur claire, l’IA devient un risque **support + facture**. La #12 technique sécurise une future **monétisation** (crédits de génération, plans payants).
- **Positionnement** : « humains décident, l’IA accélère » — différenciation vs outils purement génératifs où personne ne vote.

### Description

Génération IA d’**itinéraires scénarisés** (copie possible vers l’itinéraire actif), suggestions d’activités, prompts alignés sur les **contraintes** du trip, robustesse réseau/API.

### État code (mai 2026)

- **Livré** : `openai-itinerary-service.ts` (mode **`edge`** par défaut → `aiEdgeClient` → fonctions **`ai-generate-itinerary`** / **`ai-generate-activity-suggestions`**), Zod + prompts, **`018`** `profiles.ai_tier` + **`ai_generation_logs`** (serveur), quotas alignés **`aiScenarioLimits`** / `_shared/limits.ts`, **Generate with AI** réservé aux **organisateurs** (owner/editor/moderator), suggestions modal + quota mensuel, retry client (`openai-client`), votes scénarios (#10), analytics **trip_id** + tokens + coût approx., **E2E** `ai-scenario-generation.spec.ts` (à valider contre projet avec Edge déployé).
- **Suite #12** : optionnel — dashboards admin coûts agrégés ; E2E smoke **`VITE_AI_GENERATION_MODE=edge`** sur staging ; **monétisation** `ai_tier` **premium** (Stripe / autre).

### Tasks

#### AI Service

- [x] 🟢 Structured JSON + **Zod** (`openai-itinerary-service.ts`)
- [x] 🟢 **Constraint-aware** prompts (rythme, budget, préférences + **enfants**, **must_dos**, **no_gos**)
- [x] 🟢 **Prompt version** (`ITINERARY_PROMPT_VERSION` → événement analytics)
- [x] 🟢 **Retry** exponentiel sur erreurs transitoires (`openai-client` + `openaiRetry.ts`)
- [x] 🟢 **Token usage** dans events PostHog (itinéraire + suggestions)
- [x] 🟢 **Edge Functions** — OpenAI **uniquement serveur** (`OPENAI_API_KEY` Secret Supabase), **`verify_jwt`**, logs **`ai_generation_logs`** (tokens / durée)
- [x] 🟢 **Cost / quotas métier** — par **tier** `free` / `premium` (`profiles.ai_tier`) : plafonds scénarios / trip + suggestions / mois (Edge + client alignés), comptage DB `itineraries.generated_by_ai`, bouton désactivé + toast quota
- [x] 🟢 **RBAC IA** — seuls **owner / editor / moderator** peuvent lancer la génération (403 `forbidden_ai` + i18n)
- [x] 🟢 **Erreurs** génération scénario → **Sentry** (`captureFeatureError` dans `tripDetailSlice.aiScenarioOps`)
- [x] 🟢 **Merge `main`** — fast-forward depuis `feature/issue-11-chat-unread-tab` (mai 2026, local)

#### AI Generation UI

- [x] 🟢 Bouton **Generate with AI** (itinéraire / scénarios)
- [x] 🟢 Indicateur de progression + **aria-busy** pendant la génération (`TripScenariosSection`)
- [x] 🟢 Loading sur l’action de génération (composant scénarios)
- [x] 🟢 Toasts **succès / échec** (codes `AiScenarioGenerationError` → i18n) + **prod** : plus de fallback mock silencieux sur erreur API (mock seulement clé démo / **DEV**)

#### Constraint Collection

- [x] 🟢 Contraintes du trip injectées dans le prompt quand présentes
- [x] 🟡 Parcours léger : **encart** « de meilleurs résultats » si contraintes faibles (`getAiConstraintsHintLevel`) — édition trip reste le flux existant (hero)
- [x] 🟢 Message **« meilleurs résultats avec contraintes »** (copy + i18n EN/FR)

#### AI Scenario Generation

- [x] 🟢 Scénario IA jour par jour persisté (`itineraries` + `itinerary_days` + `activities` source `ai`)
- [x] 🟢 Affichage aux côtés des scénarios humains + votes (#10)

#### AI Activity Suggestions

- [x] 🟢 `generateActivitySuggestions` branché sur le **modal activité** (EN/FR + mock si clé démo)

#### AI Workflow

- [x] 🟢 Humains + IA + votes + finalisation (parcours global #9–#10–#11)

#### i18n

- [x] 🟢 Libellés bouton / section scénarios (clés `tripDetail.*`)
- [x] 🟢 Messages d’erreur / quota / succès génération — **i18n** `tripDetail.ai*` (EN/FR)

### Acceptance Criteria

- [x] L’IA produit un scénario cohérent avec les dates et la destination
- [x] Les scénarios IA apparaissent avec les autres ; le groupe peut voter
- [x] Erreurs API : retry + **erreurs typées** en prod (plus de mock silencieux hors DEV / clé démo)
- [x] Messages utilisateur IA (succès / erreurs / quota / hints) via **i18n**
- [x] Tests unitaires : **retry** (`openaiRetry`) + **hint contraintes** (`tripConstraintsHint`) + **parse suggestions** (`openai-activity-suggestions-parse`) ; E2E `e2e/ai-scenario-generation.spec.ts` (auth + trip seed ; sinon skip)

---

## 🎯 Issue #13: Trip Detail Screen - Context & Enrichment

**Status:** 🟡 **IN PROGRESS**  
**Priority:** MEDIUM  
**Phase:** Screen 4f  
**Dependencies:** Issue #9 (activities)

### Description

Add weather, places, and travel time context to trip detail screen.

### Tasks

#### Weather Widget

- [x] 🟢 **Weather API** : `VITE_OPENWEATHER_API_KEY` (sans clé → mock) ; pas de clé en dur
- [x] 🟢 **Forecast** pour les dates du voyage (comportement inchangé + fallback mock)
- [x] 🟢 **Icônes / température / vent / humidité** (affichage existant + i18n)

#### Places Widget

- [x] 🟢 **Google Places** : `VITE_GOOGLE_MAPS_API_KEY` uniquement (sans clé → mock `getMockNearbyPlaces`)
- [x] 🟢 **POI à proximité** + libellés catégories **i18n** (`tripDetail.explore*`)
- [ ] 🔴 Place details (photos, horaires) — post-MVP
- [ ] 🔴 "Add to itinerary" — post-MVP

#### Travel Time

- [x] 🟢 **Temps entre activités** — préfère `transport_duration_minutes` sur l’activité **suivante** ; sinon estimation **Haversine** + vitesse moyenne (affichage « approximatif ») si `lat`/`lon` sur les deux
- [x] 🟢 Affichage sur la **timeline** (connecteur entre cartes)
- [ ] 🔴 **Route visualization** (optional)

#### Maps

- [ ] 🔴 **Add maps view** (optional for MVP):
  - [ ] Display activities on map
  - [ ] Activity markers
  - [ ] Route between activities

#### i18n

- [x] 🟢 Libellés météo / lieux (`tripDetail.explore*`)

### Acceptance Criteria

- [x] Weather displays correctly (API or mock)
- [x] Places display correctly (API or mock)
- [x] Travel time between consecutive activities (stored duration or coordinate estimate)
- [x] Weather and places labels internationalized (`tripDetail.explore*`)
- [x] Tests pass

---

## 🎯 PHASE 3: Post-MVP Enhancements

These can wait until after MVP launch.

---

## 🎯 Issue #14: Group Expense Tracking (Tricount-like)

**Status:** 🔴 **NOT STARTED**  
**Priority:** MEDIUM  
**Phase:** Phase 2 (Month 4)  
**Dependencies:** Phase 1 MVP complete

### Description

Implement group expense tracking. Simple split calculation, no payment processing.

### Tasks

- [ ] 🔴 Expense data model (tables, RLS)
- [ ] 🔴 Expense CRUD
- [ ] 🔴 Expense splitting algorithm
- [ ] 🔴 "Who owes whom" calculation
- [ ] 🔴 Expense UI in trip detail
- [ ] 🔴 Currency conversion
- [ ] 🔴 Export CSV/PDF
- [ ] 🔴 i18n
- [ ] 🔴 Tests

---

## 🎯 Issue #15: PWA & Offline Support

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Phase 2 (Month 5)  
**Dependencies:** Phase 1 MVP complete

### Description

Make Voyagely usable during trips with PWA and offline capabilities.

### Tasks

- [ ] 🔴 Service worker + caching
- [ ] 🔴 Offline queue (IndexedDB)
- [ ] 🔴 PWA manifest
- [ ] 🔴 Background sync
- [ ] 🔴 Mobile performance tuning
- [ ] 🔴 Tests

---

## 🎯 Issue #16: Trip Templates & Sharing

**Status:** 🔴 **NOT STARTED**  
**Priority:** MEDIUM  
**Phase:** Phase 2 (Month 6)  
**Dependencies:** Phase 1 MVP complete

### Description

Add trip templates and sharing capabilities.

### Tasks

- [ ] 🔴 Template system
- [ ] 🔴 Duplicate trip
- [ ] 🔴 Sharing links
- [ ] 🔴 Timezone support
- [ ] 🔴 Tests

---

## 🎯 Current Sprint / Active Tasks

### En cours / décisions

- [ ] **PR #36** : merger les refactors branche `35-trip-detail-screen---activities-scenarios-v2` dans `main` (ou fermer / rebaser si obsolète).
- [x] 🟢 **Issue #11 (chat)** : **MVP COMPLETED** — fusionné dans **`main` (local)** ; pousser `origin/main`.
- [x] 🟢 **Issues #0–#10** : terminées sur `main` (voir tableau archive ci-dessus).
- [x] 🟢 **Issue #12 (IA)** : **MVP COMPLETED** — merge local `main` (voir section #12) ; pousser `origin/main`.

---

## 🐛 Known Issues / Bugs

### High Priority

_None yet_

### Medium Priority

_None yet_

### Low Priority

_None yet_

---

## 💡 Feature Requests / Ideas (Backlog)

- [x] 🌟 ~~**Recherche dans l’itinéraire**~~ — **livré** (voir vues itinéraire + hook recherche).
- [ ] 🌟 Multi-language trip planning
- [ ] 🌟 AR/VR destination previews
- [ ] 🌟 Voice assistant integration
- [ ] 🌟 Photo sharing in trips
- [ ] 🌟 Integration with travel booking sites
- [ ] 🌟 Weather alerts and trip adjustments

---

## 📝 Notes

### Decisions Made

- Using Supabase for backend, auth, and real-time
- OpenAI for AI itinerary generation (not minimax)
- Vite + React + TypeScript for frontend
- PostHog for analytics
- Sentry for error tracking
- **Focus: Planification first, expenses in Phase 2**
- **MVP: 100% free to validate usage**
- **Humans can create activities/scenarios, AI assists**
- **Screen-by-screen approach: Complete each screen before moving to next**

### Technical Debt

_Will be tracked here as discovered_

---

## 📊 Progress Tracking

### Foundation & écrans #5–#10 (terminés)

- **Issues #0–#10** : 🟢 **100%** sur `main` — détail retiré ; PR clés **#34**, **#38**, **#39** ; GitHub [#37](https://github.com/igorms-pro/voyagely/issues/37) fermée.

### Trip detail — suite MVP

- **Issue #11 (Chat)**: 🟢 **COMPLETED (MVP)** — sur **`main` (local)** ; `git push origin main`
- **Issue #12 (AI Generation)**: 🟢 **COMPLETED (MVP)** — Edge + migration 018 + tier + logs ; optionnel smoke E2E staging / reporting agrégé
- **Issue #13 (Context)**: 🟡 **partiel** — météo / lieux / i18n ; **temps entre activités** sur timeline livré ; carte / route post-MVP (voir section #13)

### Phase 2 (Post-MVP)

- **Issue #14 (Expenses)**: 🔴 0% - Phase 2
- **Issue #15 (PWA/Offline)**: 🔴 0% - Phase 2
- **Issue #16 (Templates)**: 🔴 0% - Phase 2

**Overall MVP Completion: ~78%** (#11 / **#12** sur **`main` local** — push `origin` ; suite **#13** carte / route)

---

**Next Review:** Weekly

**CRITICAL PATH**:

1. **`git push origin main`** — publier #11 + #12 + slices #13.
2. **GitHub** : fermer / mettre à jour Issues **#11** / **#12** si applicable.
3. **#13** : carte activités / route (optionnel) ; **PR #36** : optionnel.

**BLOCKER** : aucun bloquant produit — **push `origin/main`** est la prochaine étape pour aligner le distant ; **PR #36** non bloquant.

# Voyagely Issues & Tasks Tracker

> Goal: Build a complete SaaS travel planning platform with AI-powered itineraries, real-time collaboration, and seamless user experience.

**Last Updated:** May 13, 2026

## 📋 Status Legend

- 🔴 **Not Started** - Task identified but not begun
- 🟡 **In Progress** - Actively being worked on
- 🟢 **Completed** - Task finished and tested
- ⏸️ **Blocked** - Waiting on dependencies or decisions
- 🔵 **Testing** - In QA or testing phase
- 🟣 **On Hold** - Deferred for later

---

### État repo / code (référence)

- **`origin/main`** : fondations **#0–#7** ; trip detail **#8–#10** (dont voting PR [#38](https://github.com/igorms-pro/voyagely/pull/38) / [#39](https://github.com/igorms-pro/voyagely/pull/39), GitHub [#37](https://github.com/igorms-pro/voyagely/issues/37) fermée) ; activités/scénarios **PR #34** ; refactors optionnels **PR #36** (non bloquant).
- **#11 Chat** : code sur branche **`feature/issue-11-chat-unread-tab`** — ouvrir / merger la PR → `main`.
- **Suite MVP doc** : **#12** (IA durcie), **#13** (contexte / enrichissement).

---

## 🚀 IMMEDIATE NEXT ACTION (For AI Agent)

1. **Merger la PR Issue #11** (chat : non-lus, réactions `017`, mentions, typings) depuis `feature/issue-11-chat-unread-tab` → `main`.
2. **Enchaîner Issue #12** (service IA, UX, observabilité) puis **#13**.
3. **PR #36** : traiter ou fermer quand prêt (refactors seuls).

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

**Status:** 🟢 **MVP (code sur branche `feature/issue-11-chat-unread-tab`)** — badge **non-lus** onglet Chat, **réactions** (`017_message_reactions.sql`), **@mentions**, typings Postgrest (`Relationships` + table `activity_participants`) ; chat de base + présence / frappe déjà sur `main` (GitHub [#40](https://github.com/igorms-pro/voyagely/issues/40) / PR [#41](https://github.com/igorms-pro/voyagely/pull/41) si applicable). **Suite :** ouvrir / merger la PR Issue #11 → `main`. **Hors MVP / optionnel :** `last_seen` SQL, **reply** threads, non-lus multi-device (`last_read`).  
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

**Status:** 🟡 **PARTIALLY DONE** — génération IA **déjà utilisée** pour scénarios / suggestions dans le trip detail ; reste **durcissement** service & UX “Issue #12 complète”  
**Priority:** HIGH  
**Phase:** Screen 4e  
**Dependencies:** Issue #1 (constraints), Issue #9 (activities), Issue #10 (voting)

### Description

Implement AI-powered itinerary generation. AI proposes scenarios, humans vote.

### État code (mai 2026)

- **Existe** : `src/lib/ai/openai-itinerary-service.ts` (+ client, prompts, types Zod, mock), appels depuis le store trip-detail (`tripDetailSlice.aiScenarioOps` etc.), scénarios marqués IA dans l’UI.
- **À faire** (cette issue telle que rédigée) : observabilité / coûts tokens, versioning prompts, retry exponentiel robuste, parcours UI “Generate with AI” si encore à clarifier, et votes agrégés sur scénarios une fois #10 avancé.

### Tasks

#### AI Service

- [ ] 🔴 **Enhance OpenAI service**:
  - [ ] Structured JSON output with Zod validation
  - [ ] Constraint-aware prompts
  - [ ] Prompt versioning system
  - [ ] Retry logic with exponential backoff
  - [ ] Token usage tracking
  - [ ] Cost monitoring
  - [ ] Error handling

#### AI Generation UI

- [ ] 🔴 **Add AI generation button**:
  - [ ] "Generate with AI" button in itinerary tab
  - [ ] Generation progress indicator
  - [ ] Loading state
  - [ ] Success feedback

#### Constraint Collection

- [ ] 🔴 **Use constraints for AI**:
  - [ ] If constraints exist, use them in prompt
  - [ ] If no constraints, ask user to add them
  - [ ] Display "better results with constraints" message

#### AI Scenario Generation

- [ ] 🔴 **Generate scenarios**:
  - [ ] AI generates 2-3 complete scenarios
  - [ ] Each scenario is a day-by-day plan
  - [ ] Mark scenarios as AI-generated
  - [ ] Display AI scenarios alongside human scenarios
  - [ ] Group votes on all scenarios (AI + human)

#### AI Activity Suggestions

- [ ] 🔴 **Generate activity suggestions**:
  - [ ] AI suggests individual activities
  - [ ] Mark activities as AI-generated
  - [ ] Display AI activities alongside human activities
  - [ ] Group votes on all activities (AI + human)

#### AI Workflow

- [ ] 🔴 **Complete AI workflow**:
  - [ ] Humans create activities/scenarios
  - [ ] AI proposes activities/scenarios
  - [ ] Group votes on everything
  - [ ] Decision made based on votes

#### i18n

- [ ] 🔴 **Verify all AI text is internationalized**:
  - [ ] Generate button
  - [ ] Loading messages
  - [ ] Success messages
  - [ ] Error messages
  - [ ] AI badges

### Acceptance Criteria

- [ ] AI generates scenarios based on constraints
- [ ] AI scenarios appear alongside human ones
- [ ] Group can vote on all scenarios
- [ ] Error handling works gracefully
- [ ] All text is internationalized
- [ ] Tests pass (unit + E2E)

---

## 🎯 Issue #13: Trip Detail Screen - Context & Enrichment

**Status:** 🔴 **NOT STARTED**  
**Priority:** MEDIUM  
**Phase:** Screen 4f  
**Dependencies:** Issue #9 (activities)

### Description

Add weather, places, and travel time context to trip detail screen.

### Tasks

#### Weather Widget

- [x] 🟢 **Weather widget exists**:
  - [x] Basic weather display
  - [ ] 🔴 Weather API integration
  - [ ] 🔴 Display forecast for trip dates
  - [ ] 🔴 Weather icons
  - [ ] 🔴 Temperature, precipitation, wind

#### Places Widget

- [x] 🟢 **Nearby places widget exists**:
  - [x] Basic places display
  - [ ] 🔴 Google Places API integration
  - [ ] 🔴 Display nearby POIs
  - [ ] 🔴 Place details (rating, photos, hours)
  - [ ] 🔴 "Add to itinerary" button

#### Travel Time

- [ ] 🔴 **Add travel time between activities**:
  - [ ] Calculate travel time between consecutive activities
  - [ ] Display travel time on timeline
  - [ ] Route visualization (optional)

#### Maps

- [ ] 🔴 **Add maps view** (optional for MVP):
  - [ ] Display activities on map
  - [ ] Activity markers
  - [ ] Route between activities

#### i18n

- [ ] 🔴 **Verify all context text is internationalized**:
  - [ ] Weather labels
  - [ ] Places labels
  - [ ] Travel time labels

### Acceptance Criteria

- [ ] Weather displays correctly
- [ ] Places display correctly
- [ ] Travel time calculates correctly
- [ ] All text is internationalized
- [ ] Tests pass

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
- [x] 🟡 **Issue #11 (chat)** : **PR à ouvrir** depuis `feature/issue-11-chat-unread-tab` — merger sur `main`.
- [x] 🟢 **Issues #0–#10** : terminées sur `main` (voir tableau archive ci-dessus).

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

- **Issue #11 (Chat)**: 🟡 **PR en attente** — code sur `feature/issue-11-chat-unread-tab` (non-lus + réactions + mentions + typings) ; merger → 🟢 MVP
- **Issue #12 (AI Generation)**: 🟡 ~35% - Partially Done (service + génération dans l’app ; manque durcissement & scope doc entier)
- **Issue #13 (Context)**: 🔴 10% - Not Started

### Phase 2 (Post-MVP)

- **Issue #14 (Expenses)**: 🔴 0% - Phase 2
- **Issue #15 (PWA/Offline)**: 🔴 0% - Phase 2
- **Issue #16 (Templates)**: 🔴 0% - Phase 2

**Overall MVP Completion: ~68%** (#8–#11 code livré ; **#11** en attente merge PR ; suite : **#12** IA durcie / UX, puis **#13**)

---

**Next Review:** Weekly

**CRITICAL PATH**:

1. **#11** : merger la PR chat (`feature/issue-11-chat-unread-tab`) → `main`.
2. **#12** puis **#13** : IA durcie / UX, puis contexte & enrichissement.
3. **PR #36** : optionnel — traiter ou fermer.

**BLOCKER** : **#11** — merger la PR chat. **PR #36** — non bloquant.

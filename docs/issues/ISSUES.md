# Voyagely Issues & Tasks Tracker

> Goal: Build a complete SaaS travel planning platform with AI-powered itineraries, real-time collaboration, and seamless user experience.

**Last Updated:** May 12, 2026 — **#17 Premium** (GitHub [#42](https://github.com/igorms-pro/voyagely/issues/42)) 🟡 : impl. **poussée** sur `origin/feature/issue-42-premium-stripe` ; **PR → `main`** à ouvrir pour clore ; vérification GitHub #11/#12 + CI documentées.

## 📋 Status Legend

- 🔴 **Not Started** - Task identified but not begun
- 🟡 **In Progress** - Actively being worked on
- 🟢 **Completed** - Task finished and tested
- ⏸️ **Blocked** - Waiting on dependencies or decisions
- 🔵 **Testing** - In QA or testing phase
- 🟣 **On Hold** - Deferred for later

---

### État repo / code (référence)

- **Vérification GitHub (mai 2026)** : doc **#11** ↔ GitHub **[#40](https://github.com/igorms-pro/voyagely/issues/40)** — **CLOSED**. Doc **#12** (IA Edge) : pas d’issue GitHub dédiée historique ; livré sur **`main`**. **CI** : [Actions `main`](https://github.com/igorms-pro/voyagely/actions?query=branch%3Amain) — vérifier le dernier run après chaque push.
- **`main` / `origin/main`** : chat **#11**, IA Edge **#12** (`018`, quotas `free`/`premium`, Edge Functions), timeline **temps entre activités** (#13 slice).
- **Monétisation** : GitHub **[#42 — Premium / Stripe](https://github.com/igorms-pro/voyagely/issues/42)** — voir **Issue #17** ci-dessous : code sur **`origin/feature/issue-42-premium-stripe`** (🟡 **PR à ouvrir / merger**).

---

## 🚀 IMMEDIATE NEXT ACTION (For AI Agent)

1. **Issue #17 / GitHub [#42](https://github.com/igorms-pro/voyagely/issues/42)** : ouvrir une **PR** `feature/issue-42-premium-stripe` → `main` (réf. **Fixes #42**) ; configurer **secrets Stripe** + **migration `019`** + **webhook** sur le projet Supabase ; voir section #17.
2. **CI** : [Actions sur `main`](https://github.com/igorms-pro/voyagely/actions?query=branch%3Amain) — attendre **success** après push doc.
3. **Issue #13** : suite optionnelle — carte activités / route ; E2E Edge staging si utile.
4. **PR #36** : optionnel — traiter ou fermer ; GitHub **[#35](https://github.com/igorms-pro/voyagely/issues/35)** (scenarios v2) encore **OPEN**.

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

**Status:** 🟢 **COMPLETED (MVP)** — non-lus onglet, réactions (`017`), mentions, typings Postgrest ; présence / frappe. Sur **`main`** (merge `feature/issue-11-chat-unread-tab`). Réfs GitHub [#40](https://github.com/igorms-pro/voyagely/issues/40) / PR [#41](https://github.com/igorms-pro/voyagely/pull/41) si applicable. **Hors MVP :** `last_seen` SQL, reply threads, non-lus multi-device.  
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
  - [x] **Décision produit** : pas de **last seen** par membre ni d’**accusés de lecture** type WhatsApp (« tout le monde a vu ») sur le fil trip — trop bruyant / peu utile à ~20 personnes ; présence **live** + **non-lus** + mentions suffisent.
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
- [x] Texte chat couvert par i18n (y compris présence / frappe / badge non-lus onglet / réactions / mentions) — extensions futures possibles : **reply threads** (optionnel), réactions custom — **pas** last seen / relevés de lecture massifs sur le fil.
- [x] Tests unitaires ciblés (presence helper) ; E2E chat optionnel

---

## 🎯 Issue #12: Trip Detail Screen - AI Itinerary Generation

**Status:** 🟢 **COMPLETED (MVP)** — sur **`main` / `origin`** (mai 2026) : Edge **`ai-generate-itinerary`** / **`ai-generate-activity-suggestions`**, migration **`018`**, quotas **tier** + RBAC, client **`edge`** par défaut, E2E + tests unitaires. Optionnel : reporting coûts agrégé admin, **Stripe** → `ai_tier` premium.  
**GitHub (doc #11)** : [#40](https://github.com/igorms-pro/voyagely/issues/40) **CLOSED**. **GitHub (doc #12)** : pas d’issue numérotée ; suivi = cette section + code sur `main`. **Suite monétisation** : **Issue #17** + [#42](https://github.com/igorms-pro/voyagely/issues/42).  
**Branche historique (livraison #11 + #12)** : `feature/issue-11-chat-unread-tab` (fast-forward → `main`).  
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
- **Suite #12** : **Issue #17** — monétisation `premium` (Stripe / webhook) ; optionnel — dashboards admin coûts agrégés ; E2E smoke **`VITE_AI_GENERATION_MODE=edge`** sur staging.

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
- [x] 🟢 **Merge `main`** — fast-forward depuis `feature/issue-11-chat-unread-tab` → poussé sur **`origin/main`** (mai 2026)

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

## 🎯 Issue #17: Monétisation Premium (`profiles.ai_tier`)

**Status:** 🟡 **IN PROGRESS** — implémentation **poussée** sur **`origin/feature/issue-42-premium-stripe`** ; statut **🟢 COMPLETED** après merge PR vers `main` + vérif. staging (secrets + webhook).  
**GitHub:** [#42 — Premium: Stripe + profiles.ai_tier (monétisation IA)](https://github.com/igorms-pro/voyagely/issues/42)  
**Branche:** `feature/issue-42-premium-stripe` (**à jour sur `origin`**, mai 2026)  
**PR:** _à créer sur GitHub_ (comparer `feature/issue-42-premium-stripe` → `main`, corps avec `Fixes #42`)  
**Priority:** HIGH (revenu + alignement quotas IA déjà en prod)  
**Phase:** Revenue / Screen compte  
**Dependencies:** Issue **#12** (MVP IA + `018` sur `main`)

### Description

Passer d’un modèle **100 % gratuit** à des **abonnements ou achats** qui positionnent `profiles.ai_tier` à **`premium`**, débloquant les plafonds déjà appliqués côté **Edge Functions** et côté **client** (`aiScenarioLimits`, `useTripDetail.userAiTier`).

### Pourquoi maintenant

- Les **quotas différenciés** `free` / `premium` sont déjà en base et dans les fonctions ; sans paiement, `premium` ne s’active jamais.
- **Stripe** (ou équivalent) reste le chemin standard : Checkout, webhooks, annulations.

### Tasks

- [x] **Stripe (code + doc)** : Edge `create-checkout-session` ; secrets **uniquement** côté Supabase (voir `.env.example`) — **reste ops** : deux prix Stripe (`STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`) + clés / webhook.
- [x] **Webhook** : Edge `stripe-webhook` — signature `constructEvent`, idempotence via table `stripe_webhook_events`, mise à jour `profiles` (`ai_tier`, ids Stripe).
- [x] **RLS / DB** : migration **`019_stripe_billing_and_ai_tier_lock.sql`** — colonnes facturation + trigger empêchant les clients JWT de modifier `ai_tier` / champs Stripe.
- [x] **UI** : route **`/account`**, bouton Premium, retours checkout (bannière succès / annulé), états loading / erreur / disabled.
- [x] **i18n** : **EN** + **FR** pour le flux compte ; autres fichiers `locales/*.json` : clés `account.*` présentes (fallback aligné EN où besoin).
- [ ] **Tests** : test automatisé **webhook** (payload signé mock) — **non fait** ; régression : `TripDetailPage.test` + `User.ai_tier` ajusté.

### Acceptance Criteria

- [x] Comportement **implémenté** : après `checkout.session.completed` (abonnement) le profil passe **`premium`** côté service ; plafonds **Edge** inchangés côté règles — **à valider** sur projet avec secrets + migration appliqués.
- [x] **`customer.subscription.deleted`** → repasse **`free`** et nettoie `stripe_subscription_id` (impl. webhook).
- [x] Aucune clé secrète Stripe dans le bundle Vite (uniquement `invoke` vers Edge avec JWT utilisateur).

### Ops / Déploiement (reste à faire — toi)

- [ ] **Déployer les Edge Functions** sur le projet Supabase :
  ```bash
  supabase functions deploy create-checkout-session --project-ref <ref>
  supabase functions deploy stripe-webhook --project-ref <ref>
  ```
- [ ] **Appliquer la migration 019** (`019_stripe_billing_and_ai_tier_lock.sql`) sur la base de production/staging.
- [ ] **Configurer les secrets Supabase Edge** :
  ```bash
  supabase secrets set STRIPE_SECRET_KEY=sk_... --project-ref <ref>
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref <ref>
  supabase secrets set STRIPE_PRICE_ID_MONTHLY=price_... --project-ref <ref>
  supabase secrets set STRIPE_PRICE_ID_YEARLY=price_... --project-ref <ref>
  supabase secrets set SITE_URL=https://... --project-ref <ref>
  ```
- [ ] **Créer le produit / deux prix Stripe** : même produit **Voyagely Premium**, un prix **mensuel récurrent**, un prix **annuel récurrent** (annuel doit être moins cher par mois que x12 mensuel).
- [ ] **Configurer le webhook Stripe** : Dashboard Stripe → Developers → Webhooks → ajouter endpoint `https://<ref>.supabase.co/functions/v1/stripe-webhook` ; événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`.
- [ ] **Ajouter `VITE_STRIPE_PUBLISHABLE_KEY`** dans le `.env` de déploiement (pk*test*... ou pk*live*...).
- [ ] **Tester le flux complet** : Checkout → webhook → vérifier `profiles.ai_tier = 'premium'` en base.

### Reste côté code (optionnel / nice-to-have)

- [ ] **Test automatisé webhook** : test unitaire avec payload signé mock (non fait — voir tâche Tests ci-dessus).
- [ ] **Customer Portal** : lien Stripe pour gérer / annuler l'abonnement depuis `/account` (optionnel v1).

### Finish (workflow)

- [ ] **PR** [#44](https://github.com/igorms-pro/voyagely/pull/44) vers `main` avec **`Fixes #42`** ; CI verte sur la PR ; puis mettre cette section en **🟢 COMPLETED**.

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

- [ ] 🟡 **Issue #17 (Premium / Stripe)** : **IN PROGRESS** — impl. poussée sur **`origin/feature/issue-42-premium-stripe`** ; GitHub **[#42](https://github.com/igorms-pro/voyagely/issues/42)** — **ouvrir PR** → `main`.
- [ ] **PR #36** : merger les refactors branche `35-trip-detail-screen---activities-scenarios-v2` dans `main` (ou fermer / rebaser si obsolète) ; GitHub **[#35](https://github.com/igorms-pro/voyagely/issues/35)** encore ouverte.
- [x] 🟢 **Issue #11 (chat)** : **MVP COMPLETED** — sur **`main`** ; GitHub [#40](https://github.com/igorms-pro/voyagely/issues/40) **CLOSED**.
- [x] 🟢 **Issues #0–#10** : terminées sur `main` (voir tableau archive ci-dessus).
- [x] 🟢 **Issue #12 (IA)** : **MVP COMPLETED** — sur **`main`** (voir section #12).

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
- **MVP planning was free-first** ; **monétisation Premium** = Issue **#17** + GitHub [#42](https://github.com/igorms-pro/voyagely/issues/42) (`profiles.ai_tier`, Stripe, webhooks sécurisés)
- **Humans can create activities/scenarios, AI assists**
- **Screen-by-screen approach: Complete each screen before moving to next**

### Technical Debt

_Will be tracked here as discovered_

---

## 📊 Progress Tracking

### Foundation & écrans #5–#10 (terminés)

- **Issues #0–#10** : 🟢 **100%** sur `main` — détail retiré ; PR clés **#34**, **#38**, **#39** ; GitHub [#37](https://github.com/igorms-pro/voyagely/issues/37) fermée.

### Trip detail — suite MVP

- **Issue #11 (Chat)**: 🟢 **COMPLETED (MVP)** — sur **`main`** ; GitHub [#40](https://github.com/igorms-pro/voyagely/issues/40) **CLOSED**
- **Issue #12 (AI Generation)**: 🟢 **COMPLETED (MVP)** — Edge + migration 018 + tier + logs ; optionnel smoke E2E staging / reporting agrégé
- **Issue #17 (Premium / Stripe)**: 🟡 **IN PROGRESS** — code sur **`origin/feature/issue-42-premium-stripe`** ; GitHub [#42](https://github.com/igorms-pro/voyagely/issues/42) — **PR à merger**
- **Issue #13 (Context)**: 🟡 **partiel** — météo / lieux / i18n ; **temps entre activités** sur timeline livré ; carte / route post-MVP (voir section #13)

### Phase 2 (Post-MVP)

- **Issue #14 (Expenses)**: 🔴 0% - Phase 2
- **Issue #15 (PWA/Offline)**: 🔴 0% - Phase 2
- **Issue #16 (Templates)**: 🔴 0% - Phase 2

**Overall MVP Completion: ~78%** — **#17** : impl. sur branche, **PR pour [#42](https://github.com/igorms-pro/voyagely/issues/42)** à ouvrir ; suite **#13** carte / route

---

**Next Review:** Weekly

**CRITICAL PATH**:

1. **Issue #17 / [#42](https://github.com/igorms-pro/voyagely/issues/42)** : **PR** branche `feature/issue-42-premium-stripe` → `main` ; déploiement **migration `019`** + secrets + webhook Stripe.
2. **CI** : [Actions `main`](https://github.com/igorms-pro/voyagely/actions?query=branch%3Amain).
3. **#13** : carte activités / route (optionnel).
4. **PR #36** / GitHub [#35](https://github.com/igorms-pro/voyagely/issues/35) : optionnel.

**BLOCKER** : aucun bloquant produit ; **PR #36** non bloquant.

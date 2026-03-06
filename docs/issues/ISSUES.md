# Voyagely Issues & Tasks Tracker

> Goal: Build a complete SaaS travel planning platform with AI-powered itineraries, real-time collaboration, and seamless user experience.

**Last Updated:** February 2025

---

## 📋 Status Legend

- 🔴 **Not Started** - Task identified but not begun
- 🟡 **In Progress** - Actively being worked on
- 🟢 **Completed** - Task finished and tested
- ⏸️ **Blocked** - Waiting on dependencies or decisions
- 🔵 **Testing** - In QA or testing phase
- 🟣 **On Hold** - Deferred for later

---

## ✅ Issue #0: Project Initialization & Setup

**Status:** 🟢 **COMPLETED**  
**Priority:** HIGH  
**Phase:** Foundation

### Completed Features

#### Development Environment

- [x] 🟢 Vite + React + TypeScript setup
- [x] 🟢 ESLint configuration with React rules
- [x] 🟢 Prettier configuration with auto-formatting
- [x] 🟢 Tailwind CSS configuration
- [x] 🟢 PostCSS configuration
- [x] 🟢 TypeScript strict mode configuration
- [x] 🟢 Path aliases and module resolution

#### Testing Infrastructure

- [x] 🟢 Vitest setup with jsdom environment
- [x] 🟢 Testing Library for React component tests
- [x] 🟢 Playwright E2E testing setup
- [x] 🟢 Test coverage configuration (70% thresholds)
- [x] 🟢 Example unit tests (utils.test.ts)
- [x] 🟢 Example E2E tests (smoke.spec.ts)
- [x] 🟢 Test setup files and configuration

#### Code Quality & Git Hooks

- [x] 🟢 Husky pre-commit hooks (lint, format, related tests)
- [x] 🟢 Husky pre-push hooks (type-check, full test suite)
- [x] 🟢 lint-staged configuration
- [x] 🟢 Git ignore patterns

#### CI/CD Pipeline

- [x] 🟢 GitHub Actions workflow for CI
- [x] 🟢 Automated linting and type checking
- [x] 🟢 Automated unit tests with coverage
- [x] 🟢 Automated E2E tests with Playwright
- [x] 🟢 Automated build verification
- [x] 🟢 Artifact uploads for coverage and reports

#### Monitoring & Analytics

- [x] 🟢 Sentry error tracking setup
- [x] 🟢 PostHog analytics setup
- [x] 🟢 Error handling utilities
- [x] 🟢 Analytics event tracking utilities
- [x] 🟢 useErrorTracking hook
- [x] 🟢 usePostHog hook
- [x] 🟢 ErrorBoundary with Sentry integration

**Notes:**

- Project is fully configured and ready for MVP development
- All foundational tooling in place
- CI/CD pipeline active

---

## 🎯 PHASE 1: MVP Core – Foundation (Before Screens)

These issues MUST be completed before working on screen-specific features.

---

## 🎯 Issue #1: Database Schema & Backend Setup

**Status:** 🟢 **COMPLETED**  
**Priority:** CRITICAL  
**Phase:** Foundation  
**Dependencies:** Issue #0

### Description

Complete database schema, RLS policies, migrations, and all Supabase infrastructure.

### Tasks

#### Database Tables

- [x] 🟢 **Verify all tables exist and are correct**:
  - [x] `users` (profiles)
  - [x] `trips` (with `constraints` JSONB for budget/children/preferences/pace/must-dos/no-gos)
  - [x] `trip_members` (with roles: owner, editor, viewer, moderator)
  - [x] `activities` (with source: human/ai, status, cost, location)
  - [x] `scenarios` (implemented as `itineraries` table)
  - [x] `scenario_activities` (implemented via `itinerary_days` + link to `activities`)
  - [x] `votes` (for activities)
  - [x] `messages` (chat)
  - [ ] `expenses` (Phase 2, can wait)

#### RLS Policies

- [x] 🟢 **Review and update ALL RLS policies**:
  - [x] Users can only see trips they're members of
  - [x] Trip members policies (CRUD based on role owner/editor/viewer/moderator)
  - [x] Activities policies (admins = owner/editor/moderator can create/update/delete)
  - [x] Scenarios policies (itineraries + itinerary_days follow same writer rules)
  - [x] Votes policies (any member can vote; users can update their own votes)
  - [x] Messages policies (trip members only)
  - [ ] Expenses policies (Phase 2)

#### Migrations

- [x] 🟢 **Verify all migrations are applied**:
  - [x] 🟢 001_initial_schema.sql
  - [x] 🟢 002_rls_policies.sql
  - [x] 🟢 003_enable_realtime.sql
  - [x] 🟢 004_preferences_audit_logs.sql
  - [x] 🟢 005_rls_preferences_audit.sql
  - [x] 🟢 006_realtime_preferences.sql (kept commented/optional)
  - [x] 🟢 007_trip_constraints.sql

#### Real-time Setup

- [x] 🟢 Supabase Realtime enabled (trips, activities, votes, messages; preferences optional)
- [ ] 🔴 Verify realtime works for all tables (manual runtime check later)
- [ ] 🔴 Test real-time subscriptions (manual runtime check later)

#### TypeScript Types

- [x] 🟢 **Regenerate types from database (initial version)**:
  - [x] `src/lib/types/database.types.ts` reflects all current tables and `trips.constraints`
  - [ ] Optionally re-run `supabase gen types typescript` later to sync with remote DB

### Acceptance Criteria

- [x] All tables exist with correct schema (MVP + Phase 2 placeholders)
- [x] All RLS policies are configured according to roles and trip membership
- [ ] Real-time works for all tables (to be verified via runtime tests)
- [x] TypeScript types are up-to-date for current schema
- [x] Can create/read/update/delete all core entities (trips, activities, votes, messages) with proper permissions

---

## 🎯 Issue #2: Internationalization (i18n) Complete Setup

**Status:** 🟢 **COMPLETED for MVP**  
**Priority:** HIGH  
**Phase:** Foundation  
**Dependencies:** Issue #0

### Description

Ensure ALL text in the application is internationalized. No hardcoded strings.

### Tasks

#### i18n Infrastructure

- [x] 🟢 i18next + react-i18next setup
- [x] 🟢 Browser language detector
- [x] 🟢 21 languages configured
- [x] 🟢 useLanguage hook
- [x] 🟢 Language switcher component

#### Translation Files Audit

- [x] 🟢 **Audit MVP screens and components for hardcoded text**:
  - [x] LandingPage - all visible text uses `t()`
  - [x] LoginPage - all visible text uses `t()`
  - [x] SignupPage - all visible text uses `t()`
  - [x] DashboardPage - all visible text uses `t()`
  - [x] TripDetailPage - all visible text uses `t()` (titles, tabs, empty states)
  - [x] Chat (TripChat) - all visible text uses `t()`
  - [x] Theme toggle - aria-labels and titles use `t()`
  - [ ] Non-critical toasts / form validation messages can be added iteratively

#### Translation Keys Organization

- [x] 🟢 **Organize translation keys by feature (MVP)**:
  - [x] `landing.*` - Landing page
  - [x] `auth.*` - Auth screens (login, signup)
  - [x] `dashboard.*` - Dashboard screen
  - [x] `trip.*` / `tripDetail.*` - Trip list + detail screen
  - [x] `activity*` / `itinerary*` - Activities & itinerary
  - [x] `chat.*` - Chat
  - [x] `common.*` - Common UI elements
  - [x] `errors.*` - Error messages
  - [ ] `constraints.*`, `expenses.*`, `validation.*` to be expanded with future features

#### Add Missing Translations

- [ ] 🔴 **Add translations for all 21 languages** (post-MVP hardening):
  - [x] English (en) - complete for MVP
  - [x] French (fr) - complete for MVP
  - [ ] Other languages can be filled progressively as we localize beyond EN/FR
  - [ ] Czech (cs) - complete
  - [ ] Hungarian (hu) - complete
  - [ ] Turkish (tr) - complete
  - [ ] Vietnamese (vi) - complete

### Acceptance Criteria

- [ ] No hardcoded text in any component
- [ ] All text uses `t()` function
- [ ] All 21 languages have complete translations
- [ ] Language switching works on all screens
- [ ] RTL support works for Arabic

---

## 🎯 Issue #3: Architecture Documentation Update

**Status:** 🟢 **COMPLETED for MVP**  
**Priority:** MEDIUM  
**Phase:** Foundation  
**Dependencies:** Issue #1

### Description

Update architecture documentation to reflect current MVP (was based on pre-MVP with minimax LLM).

### Tasks

#### Review Current Architecture

- [x] 🟢 **Read existing `docs/architecture_design.md`**
- [x] 🟢 **Identify outdated sections** (minimax references, old tech stack)

#### Update Architecture Document

- [x] 🟢 **Update tech stack**:
  - [x] Frontend: Vite + React + TypeScript
  - [x] Backend: Supabase (Postgres + Auth + Realtime)
  - [x] AI: OpenAI (not minimax)
  - [x] State: Zustand
  - [x] Styling: Tailwind CSS
  - [x] i18n: i18next
  - [x] Monitoring: Sentry + PostHog

- [x] 🟢 **Update data models**:
  - [x] Trips with constraints
  - [x] Activities (human + AI)
  - [x] Scenarios (human + AI)
  - [x] Votes (democratic decision-making)
  - [x] Messages (real-time chat)

- [x] 🟢 **Update workflows**:
  - [x] Trip creation with constraints
  - [x] Activity/scenario creation (human or AI)
  - [x] Voting workflow
  - [x] Itinerary finalization
  - [x] Post-finalization editing (admin only)

- [x] 🟢 **Add architecture diagrams**:
  - [x] System architecture
  - [x] Data flow
  - [x] Real-time architecture
  - [x] Authentication flow
  - [x] Voting flow

#### Create Screen Architecture

- [x] 🟢 **Document screen hierarchy**:
  - [x] Screen navigation flow
  - [x] Screen state management
  - [x] Screen-to-screen communication
  - [x] Shared components per screen

### Acceptance Criteria

- [x] Architecture document is up-to-date
- [x] No references to minimax or old tech
- [x] Diagrams are clear and helpful
- [x] Screen architecture is documented

---

## 🎯 Issue #3b: Codebase Reorganization – Feature-Based Architecture

**Status:** 🟢 **COMPLETED for MVP**  
**Priority:** HIGH  
**Phase:** Foundation  
**Dependencies:** Issue #3 (architecture doc)

### Description

Reorganize the codebase from the current flat/pre-MVP structure into a **feature-based architecture** aligned with big-tech standards and with `docs/architecture_design.md` and `.cursor/rules/architecture-structure/RULE.md`. This must be done **before** adding or heavily modifying feature code so that new work happens in the right place.

**Current state:** Components and logic are mostly in `src/components/`, `src/hooks/`, `src/lib/` with no feature boundaries.

**Target state:** Feature modules under `src/features/<domain>/` with clear public APIs (`index.ts`), shared primitives in `src/components/`, and pages that assemble features only. Dependency rule: pages → features → components → lib.

### Tasks

#### Create Feature Folders and Public APIs

- [x] 🟢 **Create `src/features/` and feature modules**:
  - [x] `src/features/auth/` – placeholder (LoginForm/SignupForm extraction deferred)
  - [x] `src/features/trips/` – CreateTripModal; public API via `index.ts`
  - [x] `src/features/activities/` – CreateActivityModal; public API via `index.ts`
  - [x] `src/features/chat/` – TripChat; public API via `index.ts`
  - [x] `src/features/voting/` – placeholder for Issue #10
  - [x] Each feature has `index.ts` exporting only the public API (no deep imports from outside into feature internals)

#### Move Code into Features

- [ ] 🔴 **Move auth-related code** (deferred):
  - [ ] Extract auth UI/logic from pages into `features/auth/` (e.g. login/signup forms)
  - [ ] Keep or move `useAuth`-style hook into `features/auth` or shared `hooks/` per rule

- [x] 🟢 **Move trip-related code**:
  - [x] CreateTripModal → `features/trips/components/`
  - [ ] Trip-related API in `features/trips/services/` (optional follow-up; store in lib for now)
  - [ ] Trip-specific hooks in `features/trips/hooks/` (optional follow-up)

- [x] 🟢 **Move activity-related code**:
  - [x] CreateActivityModal → `features/activities/`
  - [ ] Activity CRUD services in feature (optional follow-up; store in lib for now)

- [x] 🟢 **Move chat-related code**:
  - [x] TripChat and message UI → `features/chat/`
  - [x] Chat/realtime subscription logic lives inside `features/chat` component

#### Shared Layer

- [x] 🟢 **Keep `src/components/` for shared primitives only**:
  - [x] Layout, ErrorBoundary, ThemeToggle, LanguageSwitcher, WeatherWidget, NearbyPlaces remain in `components/`
  - [x] CreateTripModal, TripChat, CreateActivityModal removed from `components/` (moved to features)

- [x] 🟢 **Keep `src/hooks/` for cross-feature hooks only** (useLanguage, useErrorTracking, usePostHog, use-mobile)

- [x] 🟢 **Keep `src/lib/` for infrastructure** (supabase, store, i18n, sentry, analytics, utils, types, locales)

#### Pages and Imports

- [x] 🟢 **Update pages to assemble features only**:
  - [x] DashboardPage imports `CreateTripModal` from `@/features/trips`
  - [x] TripDetailPage imports `TripChat` from `@/features/chat`, `CreateActivityModal` from `@/features/activities`
  - [x] No circular dependencies; dependency direction: pages → features → components → lib

#### Verification and Docs

- [x] 🟢 **Verify dependency rules**: No feature imports another feature directly
- [x] 🟢 **Update imports across codebase** so that lint and build pass
- [x] 🟢 **Document**: Codebase is now feature-based; new UI goes in the matching feature or in `components/` if shared

### Acceptance Criteria

- [x] `src/features/` exists with auth, trips, activities, chat, voting (placeholders where applicable)
- [x] Each feature has a public API (`index.ts`) and no external deep imports into its internals
- [x] `src/components/` contains only shared UI primitives; feature-specific UI lives in features
- [x] Pages import from features (via index), shared components, and lib
- [x] Lint and build pass; no circular dependencies
- [x] Architecture aligned with `.cursor/rules/architecture-structure/RULE.md` and ready for scaling

---

## 🎯 Issue #4: Design System & Screen System

**Status:** 🟢 **COMPLETED for MVP**  
**Priority:** HIGH  
**Phase:** Foundation  
**Dependencies:** Issue #0

### Description

Complete design system and define screen system for consistent UI/UX.

### Tasks

#### Design System

- [x] 🟢 **Complete `docs/design/design-system.md`**:
  - [x] Color system
  - [x] Typography
  - [x] Spacing
  - [x] Component library (buttons, inputs, cards, modals)
  - [x] Loading states (skeletons, spinners)
  - [x] Empty states
  - [x] Error states
  - [x] Toast notifications
  - [x] Modal patterns
  - [x] Form patterns

#### Screen System

- [x] 🟢 **Complete `docs/design/screen-system.md`**:
  - [x] Screen structure (header, content, footer)
  - [x] Navigation patterns (mobile + desktop)
  - [x] Tab patterns
  - [x] Modal patterns
  - [x] Drawer patterns
  - [x] Bottom sheet patterns (mobile)
  - [x] Screen transitions
  - [x] Loading states per screen
  - [x] Error states per screen
  - [x] Empty states per screen

#### Screen Inventory

- [x] 🟢 **Document all screens**:
  - [x] Landing Page
  - [x] Login Page
  - [x] Signup Page
  - [x] Dashboard Page (Trip List)
  - [x] Trip Detail Page
  - [x] Profile Settings (future)
  - [x] Team Settings (future)

#### Component Library

- [x] 🟢 **Create reusable components** (`src/components/ui/`):
  - [x] Button variants (primary, secondary, ghost, outline, accent, destructive; sm/md/lg)
  - [x] Input (with label, error, hint)
  - [x] Card (default, interactive, elevated) + CardHeader
  - [x] Modal (backdrop, close, title, footer)
  - [x] Toast (success, error, warning, info) + ToastProvider / useToast
  - [x] Spinner (sm/md/lg)
  - [x] Skeleton + SkeletonCard
  - [x] EmptyState (icon, title, description, action)
  - [x] ErrorState (icon, title, description, retry)

### Acceptance Criteria

- [x] Design system doc is complete (conceptual; warm palette, states, patterns)
- [x] Screen system is documented (navigation, screens, modals, loading/empty/error)
- [ ] All screens use design system components (iterative; apply in Issues #5+)
- [x] Component library is implemented and exported from `@/components/ui`

---

## 🎯 PHASE 2: MVP Core – Screens

Work on screens sequentially. Each screen must be complete before moving to the next.

---

## 🎯 Issue #5: Landing Page

**Status:** 🟢 **COMPLETED (MVP)**  
**Priority:** HIGH  
**Phase:** Screen 1  
**Dependencies:** Issue #2 (i18n), Issue #4 (design system)

### Description

Complete landing page with proper i18n, design system, and SEO.

### Tasks

#### Content & i18n

- [x] 🟢 **Verify all text is internationalized**:
  - [x] Hero section
  - [x] Features section
  - [x] CTA buttons
  - [x] Footer
  - [x] Navigation (app.name for brand)

#### Design & UX

- [x] 🟢 **Apply design system**:
  - [x] Colors match design system (warm orange/amber/rose, stone neutrals)
  - [x] Typography matches design system
  - [x] Spacing matches design system
  - [x] Responsive design (mobile, tablet, desktop)
  - [x] Card component for feature cards

#### Features

- [x] 🟢 **Complete features section**:
  - [x] Feature cards
  - [ ] Feature animations (optional, deferred)
  - [ ] Screenshots/mockups (optional, deferred)

#### SEO & Meta

- [x] 🟢 **Add SEO meta tags**:
  - [x] Title (react-helmet-async, i18n)
  - [x] Description
  - [x] Open Graph tags
  - [x] Twitter Card tags
  - [x] Favicon (SVG in public)
  - [ ] Structured data (Schema.org) (optional, deferred)

#### Performance

- [x] 🟢 **Optimize performance**:
  - [ ] Image optimization (N/A until images added)
  - [ ] Lazy loading (N/A for current assets)
  - [x] Code splitting (React.lazy for Login, Signup, Dashboard, TripDetail)
  - [ ] First Load < 2s (target; monitor in production)

### Acceptance Criteria

- [x] All text is internationalized
- [x] Design system is applied
- [x] SEO meta tags are set
- [x] Performance is optimized (code splitting)
- [x] Mobile responsive
- [x] Tests pass

---

## 🎯 Issue #6: Auth Screens (Login + Signup)

**Status:** 🟢 **COMPLETED**  
**Priority:** HIGH  
**Phase:** Screen 2  
**Dependencies:** Issue #1 (database), Issue #2 (i18n), Issue #4 (design system)

### Description

Login and signup screens with passwordless auth (magic link + OAuth), aligned with OneLink: no email/password, magic link + Google (Facebook placeholder for later).

### Tasks

#### Login Page

- [x] 🟢 **Login functionality (passwordless)**:
  - [x] Magic link (email → Supabase OTP)
  - [x] Supabase Auth integration
  - [x] Form validation (email required)
  - [x] Error handling (toasts, inline errors)
  - [x] Loading states (email send + per-OAuth button)
  - [x] OAuth URL cleanup after redirect (code/token/hash removed)

- [x] 🟢 **Design system**: Form inputs, Button, Card, stone/orange

- [x] 🟢 **Social login**:
  - [x] Google login
  - [x] Facebook (UI placeholder; enable when app verified)

#### Signup Page

- [x] 🟢 **Signup functionality (passwordless)**:
  - [x] Magic link (same flow as login)
  - [x] Supabase Auth integration
  - [x] Error handling + loading states
  - [x] Design system (Input, Button, Card, OAuth buttons)

#### Session & tracking (OneLink-style)

- [x] 🟢 **Session tracking**: `user_sessions` + `login_history` tables + RLS
- [x] 🟢 **createUserSession** / **logLoginAttempt** on sign-in (migration 008)

#### i18n

- [x] 🟢 **Auth text internationalized**: magic link, OAuth, errors (en + fr)

### Acceptance Criteria

- [x] Login works (magic link + Google)
- [x] Signup works (magic link + Google)
- [x] All auth text internationalized
- [x] Design system applied (Login + Signup)
- [x] Error handling + loading states
- [x] Unit tests (LoginPage, SignupPage, store auth)
- [x] E2E: smoke only (landing/header); no E2E on activities/votes in current scope

---

## 🎯 Issue #7: Dashboard Screen (Trip List)

**Status:** 🟢 **COMPLETED**  
**Priority:** HIGH  
**Phase:** Screen 3  
**Dependencies:** Issue #1 (database), Issue #2 (i18n), Issue #4 (design system), Issue #6 (auth)

### Description

Complete dashboard with trip list, filters, search, create trip flow, constraints persistence, and bold design overhaul.

### Tasks

#### Trip List

- [x] 🟢 **Trip list functionality**:
  - [x] Load trips from Supabase
  - [x] Display trip cards
  - [x] Real-time updates
  - [x] Filters (status: planned, locked, archived)
  - [x] Search (by title, destination)
  - [x] Sorting (date, title)
  - [ ] Pagination or infinite scroll (optional, later)
  - [x] Empty state (no trips / no match)
  - [x] Loading state (spinner)
  - [x] Error state (message + retry)

#### Create Trip Flow

- [x] 🟢 **Create trip modal – constraints persistence**:
  - [x] Basic trip creation (destination, dates, title)
  - [x] UI: group size, pace, budget, interests (used for AI today)
  - [x] **Persist constraints to DB**: save `constraints` JSONB on trip (budget_per_person_cents, has_children, pace, preferences) when creating
  - [x] Add "Children present" (yes/no) to form and into constraints
  - [x] Error handling (modal)
  - [x] Form validation (required destination, dates, date order)
  - [x] Multi-step wizard (4 steps: Destination & Dates → Travelers → Style & Budget → Interests)
  - [x] Step indicator with progress bar

#### Trip Card

- [x] 🟢 **Enhanced trip cards**:
  - [x] Basic info (title, dates, destination)
  - [x] Member count
  - [x] Status badge
  - [x] Display constraints summary (pace, budget/person, "Family" badge)
  - [x] Destination-based color gradients (deterministic per destination)
  - [x] Trip countdown ("in X days", "Tomorrow", "Today", "Ongoing", "Completed")
  - [ ] Member avatars (optional – future)
  - [x] Quick actions: archive + delete via dropdown menu on card

#### Dashboard Design Overhaul

- [x] 🟢 **Bold design refresh**:
  - [x] Gradient hero welcome section
  - [x] Stats bar (total trips, upcoming, destinations)
  - [x] Sticky glassmorphism header
  - [x] Stone color palette (light + dark mode)
  - [x] Pill-style status filters
  - [x] Animated card hover (translate-y + shadow)
  - [x] Improved empty state with large icon

#### Navigation

- [x] 🟢 **Navigation**:
  - [x] Header with user menu
  - [x] Logout
  - [ ] Profile / Settings links (future)

#### i18n

- [x] 🟢 **Dashboard text internationalized**: trip._, dashboard._, tripModal.\* (en + fr)
  - [x] New keys: children, constraints, time labels, stats, quick actions

### Acceptance Criteria

- [x] Trip list displays correctly (filters, search, sort)
- [x] Create trip persists constraints to DB (constraints JSONB with pace, budget, has_children, preferences)
- [x] Card shows constraints summary chips
- [x] Quick actions (archive, delete) work from card menu
- [x] Real-time updates work
- [x] Loading, empty, error states work
- [x] Text internationalized (en + fr)
- [x] Design system applied with bold new design
- [x] All existing unit tests pass (60/60)

---

## 🎯 Issue #8: Trip Detail Screen - Core & Navigation

**Status:** 🟡 **PARTIALLY DONE**  
**Priority:** HIGH  
**Phase:** Screen 4a  
**Dependencies:** Issue #1 (database), Issue #2 (i18n), Issue #4 (design system), Issue #7 (dashboard)

### Description

Complete trip detail screen core: header, tabs, trip info, edit/delete trip. Vue itinéraire : liste/calendrier/timeline, dépenses cumulées vs budget, statut/votes (proposé → votes ; validé/rejeté → badge uniquement).

**Décisions (intégrées ici, pas de doc séparé « planning brainstorm »)**

- Lien d’invitation : à faire dans l’issue **création du trip** (ou issue dédiée invite).
- Lieu structuré (place API nom/adresse) : **nouvelle issue** dédiée.
- IA itinéraire : plus tard ; l’IA propose le plan, le groupe valide ou propose ; pas de pré-validation admin.
- `activity_participants` : optionnel (par défaut = tous les membres du trip). Voir migration 009 et `docs/design/invite-and-participants-flow.md`.

### Tasks

#### Trip Header

- [x] 🟢 **Complete trip header**:
  - [x] Display trip title
  - [x] Display trip dates
  - [x] Display destination
  - [x] Display constraints summary (rythme, budget, enfants dans hero)
  - [x] Display member list with roles (count + role badges in hero)
  - [x] Role badge (owner, editor, viewer, moderator)
  - [x] Status badge (planned, locked, archived)
  - [x] Edit button (based on role)
  - [x] Delete button (owner only)

#### Edit Trip

- [x] 🟢 **Complete edit trip functionality**:
  - [x] Edit basic info (title, dates, destination)
  - [x] Edit constraints (budget, currency, pace, has_children, preferences)
  - [x] Form validation
  - [x] Success feedback (toast)
  - [x] Error handling
  - [ ] 🔴 Real-time updates (optional)

#### Delete Trip

- [x] 🟢 **Complete delete trip functionality**:
  - [x] Confirmation modal
  - [x] Owner-only permission
  - [x] Success feedback
  - [x] Navigate to dashboard after delete

#### Tab Navigation

- [x] 🟢 **Complete tab navigation**:
  - [x] Itinerary tab
  - [x] Chat tab
  - [x] Weather tab
  - [x] Explore tab
  - [x] Tab state persistence (URL + storage)
  - [ ] 🔴 Tab animations (optional)
  - [x] 🟢 Mobile bottom navigation (dock)

#### Vue Itinéraire (dans le cadre #8)

- [x] 🟢 Liste par jour (expand/collapse), vue Calendrier, vue Voyage (timeline)
- [x] 🟢 Barre sticky : dépenses cumulées vs budget (X € utilisés / Y € budget, indicateur OK/dépassement)
- [x] 🟢 Statut/votes : si activité **proposée** → afficher votes (X pour, Y contre) + boutons ; si **validée/rejetée** → badge uniquement (Validé / Rejeté)
- [x] 🟢 Affichage coût par activité en vue expandable (exact ou fourchette cost_min/max, gratuit)
- [x] 🟢 Affichage transport par activité en vue expandable (notes/type/durée)
- [x] 🟢 Résumé contraintes dans la vue itinéraire (rythme, enfants, préférences + nombre de membres)
- [ ] 🔴 **Recherche dans l’itinéraire** (issue dédiée plus tard) : champ de recherche à côté d’Add Activity (dock fixed desktop + mobile) pour retrouver un événement sans scroller — par nom, jour ou créneau. Essentiel pour rendre la vue + création vraiment utilisables.

#### Trip Members

- [ ] 🔴 **Add trip members management** **(déplacé hors scope de l’issue #8)**:
  - [ ] Invite members (email or link) — couvert par l’issue de création/partage de trip
  - [ ] Display member list
  - [ ] Change member roles (owner only)
  - [ ] Remove members (owner only)
  - [ ] Member avatars with presence

#### i18n

- [x] 🟢 **Verify all trip detail text is internationalized**:
  - [x] Tab labels
  - [x] Buttons
  - [x] Modals
  - [x] Error messages

### Ce qu’il manque pour fermer l’issue #8

1. ~~**Header**~~ : fait (contraintes, membres, rôles, statut dans hero).
2. ~~**Vue itinéraire**~~ : fait (coût fourchette, transport, résumé contraintes + membres dans l’onglet itinéraire ; vue expandable par activité).
3. ~~**Trip members**~~ : la gestion fine des membres (invite, rôles, retrait, avatars / présence) est **déléguée à l’issue création/partage de trip**, pas bloquant pour fermer #8.
4. ~~**i18n**~~ : tous les textes de l’écran trip detail sont internationalisés (onglets, boutons, modales, erreurs).
5. **Obligatoire** : animations d’onglets + real-time updates après edit (cohérence visuelle et mise à jour immédiate du header/apercus).
6. **Tests** : couverture minimale (unit + E2E) après validation de l’UX mobile.
7. **Recherche itinéraire** : issue dédiée plus tard — recherche (nom / jour / créneau) à côté d’Add Activity, dock fixed, pour faciliter vue + création (essentiel, pas post-MVP).

### Acceptance Criteria

- [x] Trip header displays correctly with all info (including constraints summary and members)
- [x] Edit trip works with constraints
- [x] Delete trip works (owner only)
- [x] Tab navigation works (with persistence and mobile dock)
- [x] Vue itinéraire : dépenses, contraintes, coût/transport par activité en vue expandable
- [ ] Member management (invite, roles, remove) — délégué à une autre issue (non bloquant pour #8)
- [x] All text is internationalized (vérification)
- [x] Design system is applied
- [ ] Tests pass (unit + E2E)

---

## 📌 Terminologie importante (itinéraire vs scénarios)

Pour éviter la confusion “plusieurs plannings en parallèle” :

- **Itinéraire actif (source of truth)** : la timeline réelle du trip. C’est **la seule** vue “planning” que les membres utilisent au quotidien. Elle contient les **activités** du trip, réparties par jour / créneau, avec statuts (`proposed` / `confirmed` / `rejected`) et votes.
- **Scénarios (propositions IA)** : des **versions alternatives** du voyage (souvent 2–3 générées par l’IA). Un scénario n’est **pas** vécu en parallèle : il sert à comparer des options.
- **Choisir un scénario de base** : initialise l’itinéraire actif en **copiant** les activités du scénario sélectionné (les scénarios restent stables).
- **Importer une activité depuis un scénario** : “piocher” une activité de n’importe quel scénario → **copie** dans l’itinéraire actif, puis on vote/valide comme une activité normale.

Ce modèle permet :

- de garder **un seul mardi à Tokyo** dans la réalité (itinéraire actif),
- tout en gardant des scénarios IA comme **catalogue d’options** (base + cherry-pick).

## 🎯 Issue #9: Trip Detail Screen - Activities & Scenarios

**Status:** 🟡 **PARTIALLY DONE**  
**Priority:** HIGH  
**Phase:** Screen 4b  
**Dependencies:** Issue #8 (trip detail core)

### Description

Implement activities CRUD (truth = itinerary actif) + AI scenario proposals (base selection + import/copy into itinerary).

**Important**: On ne “vit” pas plusieurs scénarios en parallèle. L’utilisateur travaille sur **un itinéraire actif**. Les scénarios sont des options (souvent IA) qu’on peut sélectionner comme base et/ou depuis lesquels on peut importer des activités.

### Tasks

#### Activities List

- [x] 🟢 **Display activities (itinéraire actif)**:
  - [x] Day-by-day timeline view
  - [x] Activity cards with all info
  - [x] Activity status (proposed, confirmed, rejected)
  - [x] Activity source badge (human, AI)
  - [x] Activity cost
  - [x] Activity time
  - [x] Activity location
  - [x] "Must-have" / "no-go" markers
  - [x] Empty state (no activities)
  - [x] Loading state (skeleton)

#### Create Activity (Human)

- [x] 🟢 **Human activity creation**:
  - [x] "Add Activity" button
  - [x] Activity form modal:
    - [x] Title
    - [x] Description
    - [x] Day (date picker)
    - [x] Time (time picker)
    - [x] Location (text input with autocomplete)
    - [x] Cost (optional)
    - [x] Must-have checkbox
    - [x] No-go checkbox
  - [x] Form validation
  - [x] Success feedback
  - [x] Real-time updates
  - [x] Anyone can create during planning phase

#### Edit Activity

- [x] 🟢 **Activity editing**:
  - [x] Edit button on activity card
  - [x] Edit form (same as create)
  - [x] **During planning**: Anyone can edit activities
  - [x] **After finalized**: Only admins (owner, editor, moderator) can edit
  - [x] Form validation
  - [x] Success feedback
  - [x] Real-time updates

#### Delete Activity

- [x] 🟢 **Activity deletion**:
  - [x] Delete button on activity card
  - [x] Confirmation modal
  - [x] **During planning**: Anyone can delete activities
  - [x] **After finalized**: Only admins can delete
  - [x] Success feedback
  - [x] Real-time updates

#### AI Scenarios (propositions) + Import into itinerary

- [x] 🟢 **Display scenarios (AI proposals)**:
  - [x] List scenarios for the trip (title, AI badge, createdAt)
  - [x] Preview scenario day-by-day (activities grouped by day)
  - [x] Compare scenarios (lightweight UI; no need for perfect diff yet)
- [x] 🟢 **Choose base scenario**:
  - [x] Action: “Use as base” → copy all scenario activities into itinerary actif
  - [x] Scenarios remain stable (no mutation when selecting base)
- [x] 🟢 **Import an activity from a scenario**:
  - [x] Action: “Add to itinerary” (copy)
  - [x] Imported activity becomes a normal activity in itinerary actif (then vote/confirm/reorder)
- [ ] 🟣 **Optional / later**: Human scenario creation & editing (builder). Not required for MVP if scenarios are primarily AI-generated.

#### Drag & Drop

- [x] 🟢 **Itinerary editing**:
  - [x] Drag & drop activities to reorder
  - [x] Move activities between days
  - [x] Visual feedback during drag
  - [x] Save changes
  - [x] Real-time updates

#### Role-Based Permissions

- [x] 🟢 **Implement permissions**:
  - [x] Check user role before actions
  - [x] **Planning phase**: Everyone can create and manage activities
  - [x] **Finalized phase**: Only admins (owner, editor, moderator) can CRUD
  - [x] Display appropriate UI based on role

#### i18n

- [x] 🟢 **Verify all activities + scenarios text is internationalized**:
  - [x] Form labels
  - [x] Buttons
  - [x] Activity statuses
  - [x] Error messages

### État actuel (mars 2026)

- En place via `TripDetailItinerary` + `CreateActivityModal` + `EditActivityModal` + slice `activities` du store :
  - Affichage des activités jour par jour avec vues **liste / calendrier / timeline** et recherche.
  - Cartes d’activités avec statut (proposed/confirmed/rejected), source (humain / IA), coût, lieu, participants et badge IA.
  - Création, édition et suppression d’activités humaines via modales dédiées (validation, persistance Supabase, i18n, realtime).
  - Scénarios IA complets : génération avec contraintes, preview par jour, “Use as base” (clone en nouvel itinéraire actif), “Add to itinerary” (copie d’activités dans l’itinéraire actif).
  - Drag & drop pour réordonner les activités et les déplacer entre jours.
  - Permissions par rôle + phase (planning vs trip verrouillé) sur la création et la gestion d’activités et de scénarios.
  - Tests unitaires ciblés sur la logique d’AI scenarios (helpers de contraintes/temps) et de regroupement par jours.

### Acceptance Criteria

- [x] Activities display in day-by-day view
- [x] Human activity creation works
- [x] Activity editing works with role permissions
- [x] Activity deletion works with role permissions
- [x] AI scenarios can be previewed, a base scenario can be selected (copy to itinerary), and individual activities can be imported (copy)
- [x] Drag & drop works
- [x] Real-time updates work
- [x] All text is internationalized
- [x] Tests pass (unit + targeted unit tests; E2E to follow with voting)

**BLOCKER**: Must be complete before Issue #10 (Voting)

---

## 🎯 Issue #10: Trip Detail Screen - Voting System

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Screen 4c  
**Dependencies:** Issue #9 (activities & scenarios MUST be complete)

### Description

Implement voting system for activities and scenarios. Everyone can vote.

### Tasks

#### Activity Voting UI

- [ ] 🔴 **Add voting buttons to activities**:
  - [ ] Upvote button (ThumbsUp icon)
  - [ ] Downvote button (ThumbsDown icon)
  - [ ] Display vote counts (upvotes - downvotes)
  - [ ] Highlight current user's vote
  - [ ] Real-time vote updates

#### Vote Logic

- [ ] 🔴 **Implement voting logic**:
  - [ ] Create/update vote on click
  - [ ] Toggle vote (click again to remove)
  - [ ] Update vote counts in real-time
  - [ ] **Everyone can vote** (owner, editor, viewer, moderator)
  - [ ] Vote on human-created activities
  - [ ] Vote on AI-generated activities

#### Scenario Voting

- [ ] 🔴 **Implement scenario voting**:
  - [ ] Display scenarios side-by-side
  - [ ] Vote on complete scenarios
  - [ ] Show vote counts per scenario
  - [ ] Highlight winning scenario
  - [ ] Real-time vote updates

#### Decision View

- [ ] 🔴 **Create decision view**:
  - [ ] Filter: Show validated activities (positive votes)
  - [ ] Filter: Show rejected activities (negative votes)
  - [ ] Filter: Show undecided activities (no votes or tie)
  - [ ] Visual indicators (green/red/yellow)

#### Finalize Itinerary

- [ ] 🔴 **Add finalize button**:
  - [ ] "Finalize Itinerary" button (owner only)
  - [ ] Confirmation modal
  - [ ] Change trip status to "locked"
  - [ ] Notify all members
  - [ ] Switch to admin-only editing mode

#### Post-Finalization Voting

- [ ] 🔴 **Voting after finalization**:
  - [ ] Admins can add/edit/delete activities
  - [ ] Everyone can vote on changes
  - [ ] Display "proposed change" badge
  - [ ] Notify when changes are made

#### Real-Time

- [ ] 🔴 **Real-time vote updates**:
  - [ ] Subscribe to vote changes
  - [ ] Update UI when votes change
  - [ ] Optimistic UI updates

#### i18n

- [ ] 🔴 **Verify all voting text is internationalized**:
  - [ ] Vote buttons
  - [ ] Vote counts
  - [ ] Decision view
  - [ ] Finalize modal
  - [ ] Notifications

### Acceptance Criteria

- [ ] Voting works on activities
- [ ] Voting works on scenarios
- [ ] Real-time vote updates work
- [ ] Everyone can vote
- [ ] Decision view works
- [ ] Finalize itinerary works
- [ ] Post-finalization voting works
- [ ] All text is internationalized
- [ ] Tests pass (unit + E2E)

**CRITICAL**: Issue #9 (Activities) MUST be complete before starting this.

---

## 🎯 Issue #11: Trip Detail Screen - Chat & Collaboration

**Status:** 🟡 **PARTIALLY DONE**  
**Priority:** HIGH  
**Phase:** Screen 4d  
**Dependencies:** Issue #8 (trip detail core)

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

- [ ] 🔴 **Add presence tracking**:
  - [ ] Show who's online in trip
  - [ ] Online/offline indicator on avatars
  - [ ] Last seen timestamps
  - [ ] Active users count

#### Typing Indicators

- [ ] 🔴 **Add typing indicators**:
  - [ ] Broadcast typing state
  - [ ] Display "User is typing..."
  - [ ] Debounce typing events

#### Enhanced Chat Features

- [ ] 🔴 **Add chat enhancements**:
  - [ ] Message reactions (👍 👎 ❤️ 😂) - optional
  - [ ] @mentions - optional
  - [ ] Reply to message - optional
  - [ ] Message timestamps
  - [ ] Unread message counter

#### i18n

- [ ] 🔴 **Verify all chat text is internationalized**:
  - [ ] Input placeholder
  - [ ] Send button
  - [ ] Empty state
  - [ ] Presence indicators
  - [ ] Typing indicators

### Acceptance Criteria

- [ ] Chat works fully
- [ ] Presence tracking works
- [ ] Typing indicators work
- [ ] Real-time updates work
- [ ] All text is internationalized
- [ ] Tests pass (unit + E2E)

---

## 🎯 Issue #12: Trip Detail Screen - AI Itinerary Generation

**Status:** 🔴 **NOT STARTED**  
**Priority:** HIGH  
**Phase:** Screen 4e  
**Dependencies:** Issue #1 (constraints), Issue #9 (activities), Issue #10 (voting)

### Description

Implement AI-powered itinerary generation. AI proposes scenarios, humans vote.

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

### This Week

- [x] 🟢 **Issue #3b**: Codebase reorganization (feature-based architecture) – DONE

### Next Week

- [ ] 🔴 **Issue #4**: Design System & Screen System
- [x] 🟢 **Issue #5**: Landing Page completion

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

- [ ] 🌟 **Recherche dans l’itinéraire** (issue dédiée, essentiel vue + création) : champ de recherche à côté d’Add Activity pour retrouver un événement sans scroller (nom, jour, créneau). Desktop + mobile, dock fixed.
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

### Foundation (Must complete first)

- **Issue #0 (Project Initialization)**: 🟢 100% - ✅ COMPLETE
- **Issue #1 (Database Setup)**: 🟢 100% - ✅ COMPLETE
- **Issue #2 (i18n Complete)**: 🟢 100% - ✅ COMPLETE (MVP)
- **Issue #3 (Architecture Update)**: 🟢 100% - ✅ COMPLETE (MVP)
- **Issue #3b (Codebase Reorganization)**: 🟢 100% - ✅ COMPLETE (MVP)
- **Issue #4 (Design System)**: 🟢 100% - ✅ COMPLETE (MVP)

- **Issue #5 (Landing Page)**: 🟢 100% - Completed (MVP)
- **Issue #6 (Auth Screens)**: 🟢 100% - Completed (MVP, passwordless + OAuth)
- **Issue #7 (Dashboard)**: 🟢 100% - Completed (constraints, design overhaul, quick actions)
- **Issue #8 (Trip Detail Core)**: 🟡 70% - Partially Done (reste : animations + realtime post-edit + tests)
- **Issue #9 (Activities & Scenarios)**: 🟢 100% - Completed (itinéraire actif + CRUD activités + scénarios IA base/import, drag & drop, i18n, tests ciblés)
- **Issue #10 (Voting System)**: 🔴 0% - Not Started (BLOCKED by #9)
- **Issue #11 (Chat)**: 🟡 50% - Partially Done
- **Issue #12 (AI Generation)**: 🔴 0% - Not Started
- **Issue #13 (Context)**: 🔴 10% - Not Started

### Phase 2 (Post-MVP)

- **Issue #14 (Expenses)**: 🔴 0% - Phase 2
- **Issue #15 (PWA/Offline)**: 🔴 0% - Phase 2
- **Issue #16 (Templates)**: 🔴 0% - Phase 2

**Overall MVP Completion: ~45%** (Foundation complete, Dashboard complete, screens in progress)

---

**Last Updated:** February 2025  
**Next Review:** Weekly

**CRITICAL PATH**:

1. Complete Issue #1 (Database) ✅
2. Complete Issue #2 (i18n) ✅
3. Complete Issue #3 (Architecture doc) ✅
4. Complete Issue #3b (Codebase reorganization – feature-based) ✅
5. Complete Issue #4 (Design System) ✅
6. Then work on screens sequentially (#5 → #6 → #7 → #8 → #9 → #10 → etc.)

**BLOCKER**: Issue #10 (Voting) CANNOT start until Issue #9 (Activities) is complete.

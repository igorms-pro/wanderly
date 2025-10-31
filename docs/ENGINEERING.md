# Wanderly Engineering Playbook (CTO-Level)

## Agent Role and Operating Model

- **Agent mission**: Orchestrate AI-assisted trip planning, collaboration, and real-time coordination while enforcing security, cost, and performance guardrails.
- **Core responsibilities**:
  - **Intent capture**: Translate user inputs (destination, dates, preferences) into structured constraints for itinerary generation.
  - **AI orchestration**: Call provider models with versioned prompts; enforce schema-valid JSON; apply safety, validation, deduplication.
  - **Context assembly**: Enrich with weather, places/POI, routing, and FX via provider abstraction layer; cache and throttle to control spend.
  - **Collaboration glue**: Emit real-time events (chat, presence, votes, itinerary updates) with idempotency and ordering guarantees.
  - **Governance**: Respect RLS, roles, and audit; capture model/version, token usage, and change history for reproducibility.
- **Success metrics**: Plan acceptance rate, time-conflict rate, chat latency, reconnection success, API error rates, and spend per user/trip.

## Architecture (High-Level)

- **Client SPA (Vite + React + TS)**: Mobile-first UI, offline caches, optimistic updates, Testing Library + Vitest for unit/UX tests.
- **Realtime layer (Supabase Realtime)**: WebSockets, channels per trip, CRDT presence, DB change streams; backoff + jitter on reconnect.
- **Data platform (Postgres)**: RLS policies per trip; normalized schemas for users, trips, itineraries, activities, votes, messages; audit logs.
- **AI services**: Prompt templates, schema validation, moderation/safety, partial regeneration to recover from invalid outputs.
- **Integrations**: Provider adapters for maps/places, routing, weather, flights/hotels, FX; central request manager with rate-limit governance, caching, circuit breakers.
- **Observability**: Metrics, logs, traces; cost telemetry; SLI dashboards and on-call runbooks.

### Trust Boundaries

- Untrusted client -> Auth/Realtime gateways -> Business services -> Database with RLS. All sensitive decisions are enforced server-side.

## Design System (Mobile-First)

- **Tokens**: Spacing, radius, shadows, typography scale, semantic colors (roles for background, surface, text, interactive, status).
- **Components**: Cards, Lists, Modals/Sheets, Date/Time pickers, Tabs, Toasts, Skeletons, Chat bubbles.
- **Accessibility**: WCAG 2.1 AA; keyboard focus, ARIA roles/labels; reduced motion; high-contrast themes.
- **Responsiveness**: Breakpoints at <=480, 481–768, 769–1024, >=1025px; progressive disclosure on smaller screens.
- **Performance**: Virtualize long lists; lazy-load heavy routes; memoize complex components; prefer CSS over runtime JS where possible.

## Engineering Guidelines (Scale to Millions)

- **Type safety and APIs**
  - Strict TypeScript; no `any` in exported APIs; zod/JSON schema for IO boundaries.
  - Versioned prompts and response schemas; treat AI like an unreliable network call with structured retries.

- **State and data**
  - Single source of truth via React Query; invalidate narrowly; cache TTLs aligned to provider freshness.
  - Optimistic UI with server reconciliation; explicit conflict resolution for itinerary edits.

- **Performance and reliability**
  - P95 budgets: <=300 ms server read, <=1 s chat round-trip on good networks.
  - Backpressure: exponential backoff with jitter, request coalescing, circuit breakers.
  - Cost guards: field masks (Places), autocomplete sessions, FX caching; per-provider quotas and alarms.

- **Security and privacy**
  - RLS on all trip-scoped tables; role-aware channels; short-lived tokens; rotate secrets.
  - Data minimization in prompts; redact PII from logs; encrypted at rest and in transit.
  - Audit trails for sensitive actions (role changes, moderation, plan locks, votes).

- **Quality gates**
  - Pre-commit: eslint --max-warnings=0, typecheck, related tests; format.
  - CI: build, typecheck, unit + component tests, Playwright smoke; artifact upload; PR size and coverage gates.
  - Release: feature flags, canary, automated rollback criteria.

- **Testing strategy**
  - Unit (Vitest): pure functions and small components.
  - Component/integration (Testing Library): user flows without implementation coupling.
  - E2E (Playwright): core journeys (landing -> signup, login, create trip, chat, vote).
  - Resilience: rate-limit simulations, offline/outbox, reconnect, idempotency.

- **Observability**
  - Standard spans for UI actions and network calls; logs include correlation IDs and trip IDs.
  - SLIs/SLOs tracked: chat latency, connection success, AI plan success, DB latency, provider error rate.

- **Documentation**
  - Architecture and roles live in `docs/`; prompts and templates versioned; API contracts and event catalogs maintained.

## Agent Execution Playbooks

- **Itinerary generation**: Gather constraints -> fetch context -> call model -> parse/validate -> persist -> emit events -> audit.
- **Provider errors**: Classify (429/timeouts/schema/policy) -> retry/backoff -> partial regeneration or cached fallback -> notify UI.
- **Realtime hygiene**: Heartbeats, exponential backoff, idempotent events, presence metadata hygiene.

## Roadmap Guardrails

- Ship MVP with reliability over breadth; add depth behind flags; never block core chat/presence on AI or external APIs.

---

This document is the engineering north star for Wanderly and the reference for agents operating within it.

# Wanderly Agent System: Roles, Architecture, Design System, and Engineering Guidelines

## Agent Roles and Responsibilities

- **Agent Lead (this project)**: Orchestrates multi-agent workflows for itinerary planning, collaboration, and data enrichment. Owns decision policies, safety rails, escalation paths, and cost/latency budgets.
- **Planning Agent**: Transforms constraints (destination, dates, preferences, budget) into a day-by-day plan; handles regeneration and partial updates.
- **Research Agent**: Fetches places, weather, routing; applies field masks, caching, and cost guards; normalizes to internal schemas.
- **Collaboration Agent**: Moderates chat, summarizes threads, detects decisions, proposes tie-breaks; enforces trip roles and auditability.
- **Quality Agent**: Validates schedules (time windows, distances, feasibility), deduplicates activities, flags unsafe content, and requests clarifications.
- **Optimization Agent**: Tunes prompts and provider selection based on latency, error rates, and cost; recommends cache policies and retries.

## High-Level Architecture (Agent + App)

- **Client (Vite React SPA)**: Mobile-first UI, offline caches, optimistic updates, presence and chat. Uses `@tanstack/react-query` and `zustand`.
- **Realtime**: Supabase Realtime channels per trip for chat, voting, activity updates; presence via CRDT-backed state.
- **Backend Services**: API gateway, provider adapters (places, weather, FX), AI orchestration endpoints, and validation pipeline.
- **Data Layer**: Postgres with RLS for trip-scoped access; audit logs; caches for weather/places/FX.
- **Agent Runtime**: Deterministic prompt templates, schema-validated outputs, cost/latency budgets, and guardrails. Supports stepwise generation and partial retries.

## Agent Orchestration

- **Inputs**: Trip context (dates, members, roles), preferences, constraints, provider health, weather snapshot.
- **Steps**:
  1. Constraint assembly and prompt build
  2. Generation → structured parse → validation
  3. Enrichment (places/weather/routing) → normalization
  4. Safety pass (policy, feasibility, dedup)
  5. Persistence with versioning and audit trail
  6. Publish diffs to realtime channels; propose next actions
- **Policies**:
  - Time/space feasibility, quorum rules, idempotency on votes/messages
  - Escalate to humans on low confidence or policy flags
  - Respect rate limits; use exponential backoff and circuit breakers

## Design System (Mobile-First)

- **Tokens**: Color (semantic), spacing, radius, shadow, typography scale, z-index. Dark mode via `next-themes` tokens.
- **Components**: Cards, Lists, Modals/Sheets, Tabs, Toasts, Date/Time Pickers, Chat Bubbles, Presence Avatars, Voting Controls.
- **Accessibility**: WCAG 2.1 AA, ARIA roles, focus management, keyboard support, reduced motion.
- **Responsiveness**: Breakpoints for mobile, tablet, desktop with adaptive layouts (single column → two column → multi-panel).

## Engineering Guidelines (CTO-Level)

- **Security & Privacy**
  - Enforce RLS for all trip-scoped tables; short-lived tokens; secure cookies.
  - Minimize PII in prompts/logs; redact at source; encrypt at rest and in transit.
  - CSP, dependency scanning, signed releases, secret rotation, principle of least privilege.

- **Reliability & Scale**
  - Target p95 chat delivery ≤1s; core read p95 ≤300ms.
  - Backpressure strategies for realtime; offline outbox for chat/votes.
  - Multi-region readiness: stateless frontends, sticky-less sessions, region-aware Realtime.

- **Performance & Cost**
  - Cache and coalesce provider calls; apply field masks; budget tokens per generation.
  - Use request hedging and timeouts; degrade features gracefully.
  - Track cost per trip and per feature; enforce budgets with feature flags.

- **AI Safety & Quality**
  - Version prompts; schema-validate outputs; quarantine invalid items.
  - Implement deterministic tests for parsers and validators.
  - Maintain audit logs of model, tokens, prompt version, and decisions.

- **DevEx & CI/CD**
  - Pre-commit: lint + typecheck + affected unit tests.
  - CI: build, lint, typecheck, unit tests, e2e smoke on PR; canary deploys.
  - Observability: metrics, structured logs, traces; SLO dashboards and alerts.

- **Testing Strategy**
  - Unit: pure functions (utils, parsers, validators) with Vitest.
  - Component: @testing-library/react with jsdom and accessibility checks.
  - E2E: Playwright against Vite preview; mock external APIs.
  - Load: targeted for realtime and provider adapters; rate-limit stress tests.

- **Versioning & Feature Flags**
  - Semantic versioning; environment-based flags for risky features.
  - Dark launches and gradual rollouts; regional toggles for provider mix.

- **Data & Schema**
  - Soft deletes with `deleted_at`; consistent naming; explicit FKs and indexes.
  - Idempotency keys for votes/messages; sequence numbers for ordering.

## Operational Playbooks

- **Incident Response**: Triage matrix, ownership, comms templates, postmortems with action items.
- **Provider Outage**: Trigger fallbacks, increase cache TTLs, reduce enrichment, inform users.
- **Key Rotation**: Quarterly rotation, break-glass procedures, automated revocation tests.

## Acceptance Criteria (MVP)

- Itinerary generation produces schema-valid plans with ≤5% validation failures.
- Chat and voting realtime updates under good network conditions within 1s p95.
- Unit test coverage ≥70% on core logic; e2e smoke for core flows passes.
- Pre-commit hooks enforce lint and affected tests; main always green.

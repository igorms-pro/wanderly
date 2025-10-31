# Wanderly: End-to-End Application Architecture and UI/UX Specification Blueprint

## Executive Summary and Product Scope

Wanderly is a collaborative, AI-first travel planning platform that enables individuals and groups to create trips, generate day-by-day itineraries with AI, discuss options in real time, and vote to converge on a plan. The core value proposition is straightforward: reduce the cognitive load of planning, make collaboration effortless, and produce itineraries that are coherent, time-aware, and grounded in external context such as weather and place data.

The problem-solution fit is anchored in three user pain points. First, travel planning is fragmented across chat apps, spreadsheets, bookmarked pages, and static templates, which creates coordination overhead for friends, families, and colleagues. Second, most itinerary tools are either too rigid or too generic to reflect real constraints like travel time, weather, budget, or group preferences. Third, offline and poor connectivity realities break naïve real-time expectations, which挫eries collaboration experiences. Wanderly addresses these by combining a mobile-first user experience, AI itinerary generation with structured parsing and validation, and a real-time collaboration layer for chat, presence, and voting, all on a relational foundation that remains consistent under intermittent connectivity. The product’s differentiated AI experience is modeled after the direction of intent-driven personalization in travel, exemplified by industry leaders integrating large language models to accelerate discovery and decision-making for users[^1].

The scope for version 1 (MVP) emphasizes reliability over breadth. The must-have capabilities include: authentication and profiles; trip creation with invite links and roles; day-by-day AI itinerary generation with basic safety checks; collaborative chat and presence; activity proposal and voting with tie-breakers; real-time updates; and a mobile-first responsive design. Should-have features include map views and place details, forecast overlays, richer preference memory, and deduplicated suggestions. Could-have enhancements include multi-modal routing, group call integrations, and analytics dashboards.

Success will be measured through collaboration engagement (members active per trip, chat messages per trip, votes cast), itinerary quality (AI acceptance rate, time-conflict rate, plan edit distance), and real-time robustness (message delivery latency, offline-to-online reconnection success). Operationally, the platform targets high availability and predictable latency for chat, presence, and plan updates, with graceful degradation during external API or network disruptions.

## Assumptions, Constraints, and Non-Functional Requirements

The architecture rests on a set of assumptions designed to balance speed and extensibility. Supabase provides authentication, relational storage, and real-time capabilities via WebSockets, broadcast channels, presence tracking, and streaming database changes. The frontend is a single-page application with a mobile-first responsive design and progressive enhancement. External integrations include OpenAI for itinerary generation and providers for maps, routing, and weather, with strict rate limiting and caching. The system is privacy-first with GDPR-compliant consent and data minimization principles. Observability and audit trails are built-in from day one.

Given the travel domain’s variability, several information gaps will shape design trade-offs: the target scale in terms of users, concurrent trips, and messages per day; final choice of OpenAI model and required rate limits; the definitive list of travel/maps/weather providers and their SLAs; localization scope and supported languages; compliance requirements beyond GDPR (e.g., CCPA, DPA, data residency); accessibility targets and conformance level; notification channels beyond in-app (email/SMS/push) and delivery guarantees; and revenue model and data retention policies. These gaps are called out in relevant sections with decision checklists and architectural provisions that can flex as the unknowns become clear.

On non-functional requirements, availability is prioritized through database replication, real-time service high availability, and client backoff and retry strategies. Performance targets include sub-300 ms server-side p95 latency for core read endpoints under typical loads and sub-1 second time-to-first-message in chat under good networks, recognizing cellular variability. Offline support focuses on read caches of itinerary data, draft editing, and message outbox patterns. Privacy and security rely on strong authentication, scoped authorization for trip roles, rate limiting, encryption in transit and at rest, and comprehensive audit logging. Observability covers metrics, logs, traces, and audit events with dashboards and alerts.

## System Architecture Overview

The system comprises three layers: a client SPA with a mobile-first responsive design; a real-time collaboration layer that supports chat, presence, voting updates, and database change streams; and a backend data platform with Postgres, business logic services, and integrations to external APIs for places, weather, and maps. Supabase Realtime provides globally distributed WebSocket connectivity via Phoenix Channels, Phoenix PubSub, and CRDT-backed presence state, enabling efficient broadcast and streaming of database changes[^2][^3]. The Realtime cluster routes messages along the shortest path and maintains high availability within each region[^2]. Database changes are streamed via Postgres logical replication slots with WAL polling, delivering change events to subscribed clients[^2].

Security boundaries are enforced through per-row authorization policies anchored in trip membership and roles. Real-time channels are partitioned per trip, with explicit joins and presence tracking scoped to trip contexts. Integration events from weather, maps, or places providers flow through backend services that normalize and cache results, rate limit requests, and emit notifications for severe weather or critical updates.

To illustrate the trust boundaries and access patterns, the following matrix summarizes component responsibilities and their security controls.

### Component Responsibilities and Trust Boundaries Matrix

| Component | Responsibilities | Trust Boundary | Key Security Controls |
|---|---|---|---|
| Client SPA | Render UI, manage local state, offline caches, chat, presence, voting | Untrusted client environment | Auth tokens in memory/secure storage, short-lived tokens, input validation, CSP, offline data encryption |
| Realtime Layer | WebSocket connections, channels, presence, broadcast, DB change streams | Network boundary with client | Channel authorization, role checks, per-trip scoping, rate limiting, encrypted transport[^2][^3] |
| Auth Service | Signup/login, social auth, session management | App boundary | OAuth/OIDC integration, MFA optional, secure cookie flags, token rotation |
| Business Logic Services | Trip management, AI orchestration, external API proxies | App boundary | Per-row authorization (RLS), policy enforcement, input/output schemas, rate limiting |
| Database (Postgres) | Users, trips, itineraries, activities, votes, messages | Trusted data boundary | RLS policies, encryption at rest, backups, audit logging |
| External APIs | Maps, routing, weather, places | Third-party boundary | API key vaulting, quotas, caching, circuit breakers |
| Notifications | In-app alerts, email/SMS/push (optional) | App boundary | Preference-driven delivery, throttling, audit trails |

This separation clarifies that the client is treated as untrusted for authorization decisions; all sensitive enforcement remains server-side via row-level security (RLS) and policy checks. Realtime channels provide efficient distribution and presence, but policy enforcement occurs at the data and service layers[^2][^3].

## Data Model and Database Schema Design

The schema models core entities and relationships: users, trips, itineraries, activities, votes, and messages. Relationships are designed to support collaborative trips where multiple members may propose activities, discuss them in chat, and vote to accept or reject proposals. Each table includes primary keys, foreign keys with cascade or set-null rules, status enums, timestamps, and audit fields. Soft deletes are implemented via `deleted_at` to protect history while allowing retrieval filters. Indexing and constraints ensure consistency and performance under concurrent updates. RLS policies enforce that only authorized trip members can read or mutate rows associated with a trip. Audit logging tables capture key actions (e.g., role changes, vote cast, message moderation).

The schema draws on travel data modeling principles—configurable products, group bookings, and complex configurations—emphasizing explicit mapping of preferences and events while avoiding unnecessary complexity[^4][^5]. It also leverages best practices for database schema clarity and normalization, adopting consistent naming conventions, minimal redundancy, and explicit foreign keys[^6].

### Entities and Attributes Specification

The following table outlines major entities and selected attributes with types and constraints. It is a representative subset to illuminate design decisions; full specifications should be implemented during build.

| Entity | Selected Attributes | Type/Constraints | Notes |
|---|---|---|---|
| users | id, email, display_name, avatar_url, locale, timezone, created_at, updated_at, deleted_at | UUID; email unique; timestamps; soft delete | Profiles store preferences minimally; consent captured via events |
| trips | id, owner_id, title, destination_text, start_date, end_date, status (planned, locked, archived), budget_cents, currency, created_at, updated_at, deleted_at | FK owner_id → users; status enum; dates; soft delete | Collaborative trips with invite links; owner may delegate |
| trip_members | id, trip_id, user_id, role (owner, editor, viewer, moderator), invited_by, joined_at, removed_at | FKs → trips/users; role enum; timestamps; unique(trip_id, user_id) | Role-based access; preserved history |
| itineraries | id, trip_id, version, title, generated_by_ai, created_at, updated_at, deleted_at | FK trip_id; version integer; AI flag | Supports AI version snapshots and human edits |
| itinerary_days | id, itinerary_id, day_index, date, created_at, updated_at, deleted_at | FK itinerary_id; day_index; date | Day granularity for scheduling |
| activities | id, itinerary_day_id, trip_id, place_id, title, description, category, start_time, end_time, cost_cents, currency, lat, lon, status (proposed, confirmed), source (manual, ai, import), created_at, updated_at, deleted_at | FK itinerary_day_id, trip_id; status enum; geolocation optional | AI-generated activities flagged for traceability |
| votes | id, activity_id, user_id, choice (up, down), idempotency_key, created_at | FK activity_id, user_id; unique(idempotency_key) | Tie-breakers use tie_break_rules on trip |
| messages | id, trip_id, user_id, content, message_type (text, system, attachment), client_msg_id, reply_to, created_at, updated_at, deleted_at | FK trip_id, user_id; content text; client-side ID for dedup | Real-time chat with presence and history |
| invitations | id, trip_id, inviter_id, invite_code, expires_at, max_uses, used_count, created_at | FK trip_id; unique(invite_code) | Shareable links; usage limited |
| audit_logs | id, actor_id, target_type, target_id, action, metadata, created_at | FK actor_id; JSON metadata | Comprehensive action logging |
| preferences (user) | user_id, travel_style, pace, dietary_restrictions, accessibility_needs, preferred_transport | FK user_id; JSON | Preference memory for AI personalization |
| weather_cache | place_id, lat, lon, forecast_time, payload_json, fetched_at | Geohash/time index | Cached weather payloads for offline resilience |
| places_cache | place_id, provider, name, categories, lat, lon, score, payload_json, fetched_at | Unique(provider, place_id) | Map place details and categories |

### Relationship and Cascade Rules

Foreign key and cascade rules are chosen to preserve history and prevent accidental data loss while avoiding orphaned rows. Soft deletes allow retrieval of trip timelines without exposing deprecated items. The following table highlights key relationships and actions.

| Relationship | FK | On Delete | On Update | Rationale |
|---|---|---|---|---|
| trips.owner_id → users | trips.owner_id | RESTRICT | CASCADE | Prevent deleting trips via user removal; transfer ownership explicitly |
| trip_members.trip_id → trips | trip_members.trip_id | CASCADE (soft delete) | CASCADE | Remove membership records logically with trips; preserve history with deleted_at |
| trip_members.user_id → users | trip_members.user_id | RESTRICT | CASCADE | Prevent removing users while still members; archive trips first |
| itineraries.trip_id → trips | itineraries.trip_id | CASCADE (soft delete) | CASCADE | Itineraries scoped to trips; soft delete for version history |
| itinerary_days.itinerary_id → itineraries | itinerary_days.itinerary_id | CASCADE | CASCADE | Days belong to itinerary; cascade ensures clean removal |
| activities.itinerary_day_id → itinerary_days | activities.itinerary_day_id | SET NULL | CASCADE | Retain activity if day removed; assign manually orAI reattach |
| votes.activity_id → activities | votes.activity_id | CASCADE | CASCADE | Remove votes with activity; prevents orphaned votes |
| messages.trip_id → trips | messages.trip_id | CASCADE (soft delete) | CASCADE | Chat scoped to trip; soft delete to preserve context |
| messages.user_id → users | messages.user_id | SET NULL | CASCADE | Preserve message authorship metadata if user deleted |

### RLS Policy Matrix

Row-level security is mandatory for all trip-scoped tables. Policies ensure that only authorized members can read or modify data and that roles constrain write capabilities. The matrix below provides a pattern for policy application.

| Table | Policy Condition | Roles | Permissions |
|---|---|---|---|
| trips | EXISTS trip_members WHERE trip_id = trips.id AND user_id = auth.uid() | owner, editor, viewer, moderator | Read |
| trips | auth.uid() = owner_id OR (EXISTS trip_members WHERE trip_id = trips.id AND user_id = auth.uid() AND role IN ('editor','moderator')) | owner, editor, moderator | Write |
| itineraries | Trip membership as above | owner, editor, viewer, moderator | Read |
| itineraries | auth.uid() = owner_id OR role IN ('editor','moderator') | owner, editor, moderator | Write |
| activities | Trip membership as above | owner, editor, viewer, moderator | Read |
| activities | role IN ('editor','moderator','owner') | owner, editor, moderator | Write |
| votes | Trip membership as above for associated trip | owner, editor, viewer, moderator | Read |
| votes | auth.uid() = user_id | owner, editor, viewer, moderator | Insert (own votes); Update restricted; Delete by moderator/owner |
| messages | Trip membership as above | owner, editor, viewer, moderator | Read |
| messages | role IN ('editor','moderator','owner') OR auth.uid() = user_id | owner, editor, moderator, viewer | Insert; Update own; Delete by moderator/owner |
| invitations | Trip membership as above | owner, moderator | Read/Write |

Indexes support typical query patterns: trip membership joins, chronological activity listings, and chat message retrieval. Composite indexes on (trip_id, created_at) for messages and activities, and (activity_id, created_at) for votes, are recommended. Additionally, unique constraints (e.g., idempotency_key on votes) prevent duplicate actions during retries.

Travel CRM best practices inform this model: maintain simplified recommendation catalogues for AI training and mapping, and capture preferences and events to power personalization without over-collecting data[^4]. Schema consistency and normalization follow established guidance[^6].

## User Authentication and Profile Management

Authentication supports email/password, magic links, and social login via OAuth/OIDC providers. Sessions use short-lived access tokens and refresh tokens rotated upon use. The profile includes minimal PII, preferences, and consent events stored as audit records. Device management supports multiple concurrent sessions per user, with explicit logout from specific devices and global logout.

Password flows implement secure hashing, lockout policies, and throttling. Magic link flows verify email ownership via time-limited links, with replay protection. Social auth uses standard OIDC scopes and secure callback handling. Profile privacy settings include visibility scopes (private, trip members only) and control over display name and avatar exposure. Consent records capture legal basis and timestamps for GDPR compliance.

The following table enumerates auth flows and success paths:

### Auth Flows vs Steps vs Success Paths

| Flow | Steps | Success Path | Notes |
|---|---|---|---|
| Email/Password | Signup → Email verification → Password set → Session creation | Redirect to dashboard | Lockout on repeated failures; rate limiting on signup |
| Magic Link | Request link → Email delivery → Link click → Session creation | Redirect to dashboard | Time-limited tokens; replay detection |
| Social (OIDC) | Redirect to provider → Consent → Callback exchange → Session creation | Redirect to dashboard | Scopes minimal; account linking via verified email |

Role-based access is enforced through trip membership roles: owner, editor, viewer, and moderator. The mapping clarifies permissions across features:

### Trip Roles vs Permissions

| Feature | Owner | Editor | Viewer | Moderator |
|---|---|---|---|---|
| View trip | Yes | Yes | Yes | Yes |
| Invite members | Yes | No | No | Yes |
| Remove members | Yes | No | No | Yes |
| Edit itinerary | Yes | Yes | No | Yes |
| Propose activities | Yes | Yes | No | Yes |
| Vote | Yes | Yes | Yes | Yes |
| Moderate chat | Yes | No | No | Yes |
| Lock plan | Yes | Yes (if delegated) | No | Yes |

## AI Itinerary Generation Workflow (OpenAI Integration)

The AI itinerary generation workflow transforms trip constraints and preferences into a structured day-by-day plan, aligning with modern personalization approaches in travel[^1][^7]. The pipeline comprises prompt assembly and template management; provider integration; response parsing; safety and validation; and persistence with traceability.

User constraints form the backbone of the prompt: destinations, dates, group composition, budget, travel pace, dietary needs, accessibility requirements, and preferences. The prompt template injects these variables plus system-level guardrails. Planner style may be “balanced,” “packed,” or “relaxed,” shaping activity density and transitions. Real-time weather context is optionally integrated via a pre-fetch to enrich day planning. The provider integration uses standardized headers and timeouts, handling rate limiting and retries with exponential backoff.

Response parsing employs a schema-validated JSON output to create itinerary_day and activity records. The parser enforces temporal ordering, time-window sanity, and geographic consistency, while tagging AI-generated items for auditability. Safety checks reject content that violates policy and trigger moderation review for borderline items. If generation fails or is partially invalid, the system falls back to partial regeneration or prompts for missing fields. Audit trails capture model, token usage, and prompt version to support reproducibility and iteration.

The prompt template variables and constraints are cataloged below:

### Prompt Template Variables and Constraints Catalog

| Variable | Description | Constraints |
|---|---|---|
| destination | City, region, or coordinates | Required; normalize to canonical place |
| start_date / end_date | Trip window | Required; end_date ≥ start_date |
| group_size | Number of travelers | Required; integer |
| group_composition | Adults, children, seniors | Optional; counts by age band |
| pace | Relaxed, balanced, packed | Optional; defaults to balanced |
| budget_cents / currency | Overall budget and currency | Optional; currency ISO code |
| dietary_restrictions | Vegan, gluten-free, allergies | Optional; list |
| accessibility_needs | Mobility, vision, hearing | Optional; list |
| preferences | Interests (museums, hiking, food) | Optional; weighted |
| weather_context | Forecast per day | Optional; include severe alerts |
| must_see | Hard constraints | Optional; list of places |
| transport_mode | Walking, transit, driving | Optional; affects routing and timing |

The workflow handles provider errors with structured fallbacks:

### AI Error Taxonomy and Fallback Strategy

| Error Class | Examples | Strategy |
|---|---|---|
| Rate limit | 429 responses | Exponential backoff; queue; degrade to cached suggestions |
| Provider timeout | Network timeout | Retry with jitter; partial regeneration for missing days |
| Schema mismatch | Missing fields | Regenerate affected sections; prompt for clarifications |
| Policy violation | Unsafe content | Reject; log; trigger moderation; suggest alternatives |
| Partial invalid | Time conflicts, impossible transitions | Auto-correct using solver; mark items for review |

### Prompt Engineering and Safety

System and user prompts are versioned, with dynamic injection of constraints and a brief history of prior iterations to maintain continuity. Hard constraints prevent unsafe or impossible recommendations (e.g., crossing continents within hours). Privacy safeguards minimize PII leakage into prompts; only necessary attributes are included, and PII is not persisted in prompts or logs. Post-processing sanity checks enforce time windows, distance constraints, and budget adherence before persisting activities.

### Response Parsing and Validation

The parser validates the JSON output, converts it into itinerary_days and activities, and applies time and geolocation sanity checks. Items failing validation are quarantined for review or regenerated. Identical or near-duplicate proposals across members or AI iterations are deduplicated via heuristic matching on title, coordinates, and time windows. Versioning of AI-generated itineraries is preserved, with differential views highlighting changes between versions.

## Collaborative Planning Interface Design

The collaborative interface is designed for clarity and speed. Group trip creation begins with a short wizard that captures destination, dates, trip purpose, privacy, and role assignments. An invite link shares the trip with clear expectations on access levels. Activity proposal flows allow any member to suggest items, attach place details and notes, and see AI-suggested activities in a unified feed. Voting uses a simple up/down model with quorum and tie-breaker rules that the owner or moderator can configure. Real-time chat and presence make coordination fluid; users see who is online, read new messages immediately, and receive in-app notifications for important events.

Navigation patterns follow bottom tabs: Trips, Explore, Chat, Profile. Contextual sheets for day plans keep the focus on the current day while preserving access to the full itinerary. On mobile, tap targets are generous, sticky actions keep common commands accessible, and progressive disclosure avoids overwhelming users with options. These design choices align with travel app UI/UX best practices: simplicity, structure, visual appeal, functionality, and reusability[^8], reinforced by mobile-first guidelines that prioritize content and thoughtful hierarchy[^9][^11].

Feature-to-screen mappings clarify the main surfaces:

### Features vs Screens/Components Mapping

| Feature | Screen(s) | Key Components |
|---|---|---|
| Trip creation | Create Trip Wizard | Destination input, date pickers, privacy toggle, invite options |
| Invite | Share Trip Sheet | Invite link, role selector, copy/share actions |
| Itinerary day | Day Plan View | Day header, activity list, map mini-view, sticky add button |
| Activity proposal | Add Activity Sheet | Place search, manual entry, notes, time picker, cost input |
| Voting | Activity Card | Up/Down buttons, vote count, tie-breaker indicator |
| Chat | Trip Chat | Message list, composer, presence avatars, thread reply |
| Explore | Explore | Map, filters, place cards, weather overlay toggle |
| Profile | Profile | User info, preferences, device management, settings |

### Voting States, Rules, and UI Indicators

| State | Rule | UI Indicator |
|---|---|---|
| Proposed | Default when added | Badge “Proposed”; count “0” |
| Tied | Upvotes = downvotes | Badge “Tie”; prompt to discuss |
| Accepted | Upvotes > downvotes and quorum met | Badge “Accepted”; activity highlighted |
| Rejected | Downvotes > upvotes and quorum met | Badge “Rejected”; grayed out; hide by default |

### Accessibility Considerations (MVP Targets)

- Semantic roles and labels for all interactive elements
- Minimum contrast ratios for text and key UI components
- Scalable typography and spacing tokens
- Focus management and keyboard navigability on web
- Reduced motion preference respected

## Real-Time Features Architecture

Real-time features are implemented with Supabase Realtime’s globally distributed WebSocket architecture, leveraging Phoenix Channels and PubSub for low-latency broadcast and presence[^2][^3]. Presence is backed by a CRDT, enabling consistent synchronized state across nodes[^2]. Streaming database changes is achieved through a logical replication slot with WAL polling, allowing clients to subscribe to inserts, updates, and deletes across scoped tables[^2]. Broadcast messages are also supported via inserts into the `realtime.messages` table, which is partitioned daily with short retention; this can be used for signaling and ephemeral messages[^2].

Channels are organized per trip with scoped authorization at join time. Clients maintain connection health through heartbeat and exponential backoff with jitter, reconnecting transparently after brief drops. Presence metadata includes user display name, avatar, role, and last activity timestamp. Ordering guarantees use client-side sequence numbers and server timestamps; conflict resolution for concurrent edits relies on version checks and merge strategies at the activity level. Where two edits conflict, the latest write wins for non-critical fields, with a merge log capturing conflicts for audit.

Channel naming conventions and event contracts clarify topic structure:

### Realtime Channels and Events Catalog

| Channel | Event | Payload Schema | Consumers |
|---|---|---|---|
| trip:{id}:chat | message.new | { id, user_id, content, message_type, client_msg_id, reply_to, created_at } | Trip members |
| trip:{id}:presence | presence.sync | [{ user_id, meta }] | Trip members |
| trip:{id}:vote | vote.cast | { id, activity_id, user_id, choice, idempotency_key, created_at } | Trip members |
| trip:{id}:activity | activity.updated | { id, itinerary_day_id, trip_id, changes, updated_by, updated_at } | Trip members |
| db:public:activities | * | Postgres change event | Clients subscribed to trip via policy |
| realtime.messages | broadcast | JSON payload per partition | Clients with channel authorization |

### Presence State and Metadata

| Field | Description |
|---|---|
| user_id | User identifier |
| display_name | Current display name |
| role | Trip role |
| last_seen | Timestamp of last activity |
| device | Client device metadata |
| cursor | Optional chat cursor position |

### Ordering, Idempotency, and Consistency

Messages and votes include idempotency keys to prevent duplicates during retries. Server timestamps establish ordering, and client sequence numbers aid local rendering. For activity edits, optimistic UI updates are applied with version checks; conflicting writes prompt a reconciliation UI that highlights differences. Data-level consistency is enforced through RLS and transactional writes, ensuring that concurrent operations do not violate authorization.

Offline chat uses an outbox pattern: messages are queued locally and sent when connectivity resumes, with deduplication by `client_msg_id`. For votes, an outbox also prevents loss during offline periods; idempotency ensures duplicates are ignored upon replay.

## Mobile-First Responsive Design

Wanderly adopts a mobile-first approach with progressive enhancement for larger screens. Layouts scale from single-column mobile views to multi-panel desktop experiences, with content prioritized for constrained screens. Navigation patterns include bottom tabs for primary sections and a drawer for secondary features on larger viewports. Key screens adapt fluidly: trip creation and activity sheets prioritize simplicity, while day plans and chat benefit from sticky actions and slim action bars.

Forms use input masks, inline validation, and clear error messages, with accessible labels and hints. Interaction feedback includes loading skeletons, optimistic UI updates, and subtle haptics where supported. Design tokens define spacing, typography, and color semantics; component libraries cover cards, lists, sheets, modals, date/time pickers, and chat bubbles. These principles follow mobile-first best practices emphasizing content-first design and progressive enhancement[^9][^10][^11].

### Responsive Breakpoints and Layout Behavior

| Breakpoint | Layout | Navigation |
|---|---|---|
| ≤480px (mobile) | Single column | Bottom tabs; sticky FAB for add |
| 481–768px (phablet) | Single column with expanded cards | Bottom tabs + drawer for secondary |
| 769–1024px (tablet) | Two-column (chat + day plan) | Top bar + drawer; side-by-side lists |
| ≥1025px (desktop) | Multi-panel (trip list, chat, itinerary) | Persistent left nav; context panels |

### Form Controls and Validation Rules Catalog

| Control | Attributes | Validation |
|---|---|---|
| Destination input | Place search, geolocation | Required; canonical place |
| Date picker | Start/end dates | Required; end ≥ start |
| Time picker | 24h/12h | Required for activities |
| Budget | Amount, currency | Non-negative; currency ISO |
| Notes | Free text | Length limits; moderation |
| Invite | Email/username | Existing user check; rate limit |

### Core Component Library Inventory

| Component | Props | States | Accessibility Notes |
|---|---|---|---|
| Card | title, subtitle, media | Hover, focus, selected | Role=article; headings |
| List | items, actions | Loading, empty | List semantics; keyboard nav |
| Sheet | content, actions | Open, close, drag | Dialog role; focus trap |
| Modal | title, body | Open, close | ARIA labelledby |
| Date/Time picker | value, min/max | Invalid, range | Labels; keyboard accessible |
| Chat bubble | author, content | Edited, deleted | Role=article; readable contrast |

### Accessibility Targets (MVP)

Adopt WCAG 2.1 AA as the default target, with core controls verified via screen readers on iOS and Android and keyboard navigation on web. Provide descriptive labels for actionable items and maintain logical focus order across forms and lists. Respect user preferences such as reduced motion and high contrast themes.

## API Integration Strategy

The platform integrates maps, places, routing, and weather to contextualize itineraries and enhance recommendations. Maps and routing leverage HERE’s REST APIs for geocoding, place search, and directions across multiple transport modes[^12]. Weather data integrates via providers offering current conditions, hourly/daily forecasts, and severe alerts; The Weather Company and Google Maps Platform Weather provide comprehensive datasets for travel contexts[^13][^14]. Travel APIs categories span flights, hotels, attractions, and more, enabling future booking or content enrichment while keeping an eye on integration complexity and vendor lock-in[^15].

External API calls are proxied through backend services to protect API keys, manage rate limits, and apply caching and normalization. Fallbacks prioritize on-device maps when available, cached weather snapshots, and graceful handling of provider outages. A key management system stores secrets with rotation policies and access audits.

### External API Catalog

| Provider | Endpoints | Data | Rate Limits | Caching Strategy |
|---|---|---|---|---|
| HERE | Geocoding, Places, Routing | Coordinates, POI, directions | Per contract | Cache POI and routes per trip window[^12] |
| Weather Company | Current, forecast, alerts | Temperature, precipitation, severe alerts | Per contract | Cache forecast per day; TTL aligned to provider update cadence[^13] |
| Google Weather | AI forecasts, hourly/daily | Weather overlays and data | Per contract | Cache daily aggregates; fallback snapshots[^14] |
| Travel APIs (various) | Flights, hotels, attractions | Rates, availability, reviews | Per contract | Cache static metadata; short TTL for dynamic rates[^15] |

### Rate Limiting and Backoff Policies per Provider

| Provider | Rate Limit Strategy | Backoff |
|---|---|---|
| HERE | Token bucket per endpoint; burst allowed | Exponential with jitter; max retry caps |
| Weather Company | Sliding window per API key | Exponential with token refill; circuit breaker |
| Google Weather | Sliding window; quota alerts | Exponential; failover to cached snapshots |
| Travel APIs | Endpoint-specific | Exponential; degrade features gracefully |

### Key Management and Secret Rotation

- API keys stored in secure vault with audit logging
- Rotation schedule per provider; automated where supported
- Scoped keys per environment and service
- Access limited by least privilege; regular access reviews

## Privacy, Security, and Compliance

Wanderly implements privacy-by-design with data minimization, explicit consent capture, and configurable retention policies. PII is restricted to necessary fields and encrypted at rest and in transit. Audit logging captures key actions for traceability and forensics, including role changes, vote actions, and message moderation. Data subject rights are supported through export and deletion workflows that respect legal retention requirements. Trip data supports export to portable formats and controlled deletion for departed members, ensuring group context is preserved for remaining members.

RLS policies enforce per-row authorization for trip-scoped tables, and all Realtime channel joins are authorized against membership and roles. Secure coding practices include input validation, output encoding, content security policy (CSP), and rate limiting. Incident response playbooks cover detection, containment, notification, and postmortem processes.

### Data Categories vs Storage vs Retention vs Encryption

| Data Category | Stored | Retention | Encryption |
|---|---|---|---|
| PII (email, name) | Yes | Active + limited archival | At rest + TLS |
| Preferences | Yes | Active | At rest + TLS |
| Trip content (itineraries, activities) | Yes | Active + archival (user opt-in) | At rest + TLS |
| Messages | Yes (with soft delete) | Active + configurable | At rest + TLS |
| Votes | Yes | Active + archival | At rest + TLS |
| Audit logs | Yes | As per policy | At rest + TLS |

### Audit Events Catalog

| Action | Target | Metadata | Retention |
|---|---|---|---|
| Role change | Trip member | actor, target_role, reason | As per policy |
| Vote cast | Activity | user_id, choice, idempotency_key | As per policy |
| Message moderation | Message | moderator_id, action | As per policy |
| Invite created/used | Trip | inviter_id, code, uses | As per policy |
| Plan lock | Trip | actor_id, version | As per policy |

Consent records capture legal basis, timestamp, and scope, stored as immutable events. Deletion workflows propagate to ensure that user-driven deletions do not corrupt group histories, using soft delete markers where necessary.

## Observability and Operations

Observability spans metrics, logs, and traces to maintain reliability and performance. Core SLIs include chat message delivery latency, real-time connection success rate, AI generation success, error rates for external APIs, and database query latency. Dashboards visualize per-trip health, real-time connection distribution, and AI pipeline performance. Alerts trigger on threshold breaches such as chat p95 latency, failed AI generations, and provider error spikes.

Operational playbooks cover scaling Realtime connections (e.g., region-aware routing, channel balancing), database backups and point-in-time recovery, and incident response. Client telemetry captures crash reports and performance metrics, with opt-in controls.

### SLI/SLO Definitions and Thresholds

| SLI | Definition | SLO Target (Initial) | Notes |
|---|---|---|---|
| Chat p95 latency | Time from send to render | ≤1s on good networks | Cellular variability recognized |
| Realtime connect success | Successful WS connection rate | ≥99% per region | Backoff with jitter |
| AI generation success | Completed valid plans | ≥95% | Fallbacks improve resilience |
| DB query latency | p95 for core reads | ≤300 ms | Indexing and query optimization |
| External API error rate | Provider failures | ≤2% | Circuit breakers and cache |

## Roadmap and Phased Delivery

Delivery proceeds in phases to de-risk core capabilities while building towards intelligent personalization.

Phase 0 (Foundation) establishes auth, profiles, trips, and real-time chat and presence, with basic itinerary views. Phase 1 adds AI itinerary generation with schema-based parsing and validation. Phase 2 introduces collaborative voting with tie-breakers, audit logging, and moderation tools. Phase 3 enriches integrations (maps, routing, weather overlays) and offline improvements. Phase 4 explores multi-agent planning patterns and advanced personalization.

Rollout strategies include dark launches, feature flags, staged region releases, and proactive rollback criteria. Decision gates assess real-time stability, AI output quality, and developer productivity metrics.

### Feature-by-Phase Matrix

| Feature | Phase | Dependencies | Acceptance Criteria |
|---|---|---|---|
| Auth + Profiles | 0 | Database, Realtime | Signup/login flows; session security; profile edit |
| Trips + Chat | 0 | Auth, RLS | Trip creation; real-time chat; presence; per-row auth |
| Itinerary Views | 0 | Trips, DB | Day listings; read performance; offline cache |
| AI Itinerary | 1 | Trips, Profiles | Valid JSON; time sanity; persistence; audit trail |
| Voting | 2 | Chat, Itinerary | Up/down; quorum; tie-breakers; dedup |
| Moderation | 2 | Chat, Voting | Delete/flag actions; audit logs |
| Maps + Routing | 3 | External APIs | Place search; directions; offline caches |
| Weather Overlay | 3 | External APIs | Current + forecast; severe alerts; caching |
| Personalization | 4 | Preferences, Events | Recommendation catalogue mapping; improved plans |

## Appendices

### Canonical Message Payloads

- Chat message.new: id, trip_id, user_id, content, message_type, client_msg_id, reply_to, created_at
- Vote.cast: id, activity_id, user_id, choice, idempotency_key, created_at
- Activity.updated: id, itinerary_day_id, trip_id, changes, updated_by, updated_at

### Status Enums and State Machines

- Trip status: planned → locked → archived
- Activity status: proposed → confirmed → rejected
- Vote choice: up, down

### RLS Policy Templates and Check Functions

- `is_trip_member(trip_id, auth.uid())`
- `is_editable_trip(trip_id, auth.uid())`
- `can_moderate(trip_id, auth.uid())`

### Prompt Templates (Outline)

- System: versioning, safety constraints, structured output
- User: destination, dates, group, preferences, weather context
- Post-processing: time and distance sanity, budget checks

### Sample OpenAPI Schemas

- Activities: activity fields, status, geolocation
- Messages: content, type, reply_to
- Votes: idempotency_key, choice

### Canonical Message Payloads and Events

| Event | Fields |
|---|---|
| message.new | id, trip_id, user_id, content, message_type, client_msg_id, reply_to, created_at |
| presence.sync | [{ user_id, meta }] |
| vote.cast | id, activity_id, user_id, choice, idempotency_key, created_at |
| activity.updated | id, itinerary_day_id, trip_id, changes, updated_by, updated_at |

### Enumerations Catalog

| Enum | Values |
|---|---|
| trip.status | planned, locked, archived |
| role | owner, editor, viewer, moderator |
| activity.status | proposed, confirmed, rejected |
| message.type | text, system, attachment |
| vote.choice | up, down |

These schemas and payloads enable consistent implementations across clients and services while ensuring real-time events can be processed reliably under varying network conditions.

---

## References

[^1]: Booking.com and OpenAI personalize travel at scale. https://openai.com/index/booking-com/
[^2]: Realtime Architecture | Supabase Docs. https://supabase.com/docs/guides/realtime/architecture
[^3]: Realtime | Supabase Docs. https://supabase.com/docs/guides/realtime
[^4]: Efficient Data Structures for the Travel Industry: Key Design Principles. https://vecton.pl/2024/06/02/efficient-data-structures-for-the-travel-industry-key-design-principles/
[^5]: How to Design a Database for Booking and Reservation Systems. https://www.geeksforgeeks.org/dbms/how-to-design-a-database-for-booking-and-reservation-systems/
[^6]: Seven essential database schema best practices | Fivetran. https://www.fivetran.com/blog/database-schema-best-practices
[^7]: Generative AI in Travel: A Measured Look at the Tourism Industry | AltexSoft. https://www.altexsoft.com/blog/generative-ai-travel/
[^8]: How to Design a Travel App UI/UX & Case Study. https://fuselabcreative.com/how-to-design-a-travel-app-ui-ux/
[^9]: A Hands-On Guide to Mobile-First Responsive Design. https://www.uxpin.com/studio/blog/a-hands-on-guide-to-mobile-first-design/
[^10]: Mobile-First Design: Examples + Strategies | Figma. https://www.figma.com/resource-library/mobile-first-design/
[^11]: Mobile App UX Principles | Think with Google. https://www.thinkwithgoogle.com/_qs/documents/2081/Mobile_App_UX_Principles_3.pdf
[^12]: HERE REST APIs | Maps, Routing and More. https://www.here.com/developer/rest-apis
[^13]: Weather Data APIs: Real-Time & Historical | The Weather Company. https://www.weathercompany.com/weather-data-apis/
[^14]: Weather API: AI Forecasts, Data & Insights | Google Maps Platform. https://mapsplatform.google.com/maps-products/weather/
[^15]: Travel APIs: Types, Providers and Integration | AltexSoft. https://www.altexsoft.com/blog/travel-and-booking-apis-for-online-travel-and-tourism-service-providers/
[^16]: Database Schema for Itinerary - Stack Overflow. https://stackoverflow.com/questions/27644540/database-schema-for-itinerary
[^17]: Building Real-Time Apps with Supabase: A Step-by-Step Guide. https://www.supadex.app/blog/building-real-time-apps-with-supabase-a-step-by-step-guide
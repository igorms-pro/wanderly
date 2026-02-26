---
description: Backend, Supabase, database, and security guidelines for Voyagely
alwaysApply: true
---

# Voyagely – Backend & Supabase Guidelines

## Architecture

- **Supabase** is the single backend: Auth, Database (Postgres), Realtime, Storage.
- All database access from the front-end goes through **well-defined modules**:
  - `src/lib/supabase.ts` — client instance.
  - `src/lib/store.ts` — Zustand store with Supabase actions.
  - `src/lib/realtime-service.ts` — realtime subscription management.
  - Feature-level `services/` files for domain-specific queries.
- **Never** put raw Supabase calls directly in React components. Always go through a hook or store.

## Database Schema

### Table Standards

Every table must have:

- A **UUID primary key** (`id uuid DEFAULT gen_random_uuid()`).
- `created_at timestamptz DEFAULT now()`.
- `updated_at timestamptz DEFAULT now()` (where relevant).
- **Foreign keys** with `ON DELETE CASCADE` or explicit handling.

### Current Core Tables

| Table                 | Purpose                       | Key fields                                                                                         |
| --------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| `users`               | User profiles                 | id, email, display_name, avatar_url, preferences                                                   |
| `trips`               | Trip definitions              | id, name, destination, start_date, end_date, status, owner_id                                      |
| `trip_members`        | Group membership + roles      | trip_id, user_id, role (owner/editor/viewer/moderator)                                             |
| `activities`          | Individual activities         | id, trip_id, title, description, date, time, location, cost, source (human/ai), status, created_by |
| `scenarios`           | Day-by-day plans              | id, trip_id, title, source (human/ai), created_by                                                  |
| `scenario_activities` | Link table                    | scenario_id, activity_id, day, order                                                               |
| `votes`               | Votes on activities/scenarios | id, user_id, target_type (activity/scenario), target_id, value                                     |
| `messages`            | Chat messages                 | id, trip_id, user_id, content, created_at                                                          |

### Adding New Tables

1. Create a **migration file** in `supabase/migrations/` with sequential numbering.
2. Add **RLS policies** in the same or next migration.
3. Enable **Realtime** if the table needs live updates.
4. Regenerate TypeScript types: `supabase gen types typescript --local > src/lib/types/database.types.ts`.
5. Update the Zustand store or create a feature service for the new table.

## Row Level Security (RLS)

### RLS is Mandatory

- Every table must have **RLS enabled**.
- Every table must have **explicit policies** — no reliance on "RLS enabled but no policies" (which blocks all access).

### Policy Patterns

```sql
-- Users can only see trips they are members of
CREATE POLICY "Members can view trips"
  ON trips FOR SELECT
  USING (
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- Anyone in the trip can create activities during planning
CREATE POLICY "Members can create activities"
  ON activities FOR INSERT
  WITH CHECK (
    trip_id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- Only admins can modify activities after finalization
CREATE POLICY "Admins can update activities"
  ON activities FOR UPDATE
  USING (
    trip_id IN (
      SELECT trip_id FROM trip_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'editor', 'moderator')
    )
  );
```

### Role-Based Access

| Role          | During planning       | After finalized            |
| ------------- | --------------------- | -------------------------- |
| **owner**     | Full access           | Full access                |
| **editor**    | Full access           | Add/edit/delete activities |
| **moderator** | Full access           | Add/edit/delete activities |
| **viewer**    | View + vote + propose | View + vote only           |

**Everyone can always vote**, regardless of role or trip status.

## Realtime

- Enable Realtime on tables that need live updates: `activities`, `votes`, `messages`, `trip_members`.
- Encapsulate all subscription logic in `realtime-service.ts` or feature-level hooks.
- Always **unsubscribe / remove channels** on component unmount.

```typescript
// In a hook or service — not in a component directly
const channel = supabase
  .channel(`trip:${tripId}:activities`)
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'activities', filter: `trip_id=eq.${tripId}` },
    (payload) => handleActivityChange(payload),
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## Migrations

- File naming: `NNN_description.sql` (e.g. `007_add_constraints_to_trips.sql`).
- Each migration should be **idempotent** where possible (`IF NOT EXISTS`, `CREATE OR REPLACE`).
- Never modify an already-applied migration. Create a new one instead.
- Test migrations locally before pushing.
- Keep `.env.example` up to date with all required Supabase keys and URLs.

## Security

### Secrets & Environment

- **Never** commit secrets (API keys, Supabase service key, JWT secrets).
- All secrets go in `.env` (gitignored). Document them in `.env.example` with placeholder values.
- The Supabase **anon key** is public (safe to expose). The **service role key** is secret (server-only, never in client code).

### Input Validation

- Validate on **both sides**:
  - Client-side: for UX (fast feedback to user).
  - Server-side: via **RLS policies + database constraints** (CHECK, NOT NULL, foreign keys).
- Never trust client-only validation for security — RLS is the real gate.

### XSS Prevention

- React's JSX escapes strings by default. This is safe.
- **Never** use `dangerouslySetInnerHTML` with user-provided content.
- If you must render rich text, use a sanitization library (e.g. `DOMPurify`).

### Permissions – Defense in Depth

The **front-end hides buttons** the user shouldn't see (e.g., hide "Edit" for viewers).
The **backend enforces** the rule via RLS (even if someone bypasses the UI, the DB rejects the action).

Both layers are required. Neither alone is sufficient.

## Error Handling

- Handle Supabase errors **explicitly**: check `{ data, error }` on every query.
- Log meaningful error info to **Sentry** (without leaking user data or secrets).
- Show **user-friendly messages** in the UI (not raw SQL errors or stack traces).
- Use structured error types when possible (see `error-resilience` rule).

```typescript
// GOOD
const { data, error } = await supabase.from('activities').select('*');
if (error) {
  captureException(error);
  throw new DatabaseError('Failed to load activities', error);
}

// BAD
const { data } = await supabase.from('activities').select('*');
// silently ignores errors
```

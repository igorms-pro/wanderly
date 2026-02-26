---
description: General coding guidelines for Voyagely – TypeScript, code style, file limits, naming
alwaysApply: true
---

# Voyagely – General Coding Guidelines

## TypeScript – Strict by Default

- **ALL new code must be TypeScript.** No `.js` / `.jsx` files.
- Enforce proper typing: avoid `any`. Use `unknown` when a type is truly unknown.
- Define **explicit types** for function parameters and return values.
- Use **interfaces** for object shapes, **type aliases** for unions / complex types.
- Use **discriminated unions** for state machines (loading / success / error).
- Keep domain types in dedicated modules (`src/lib/types/*`, or feature-level `types.ts`).

```typescript
// GOOD
interface TripConstraints {
  budget: number | null;
  hasChildren: boolean;
  pace: 'chill' | 'normal' | 'intense';
  preferences: string[];
}

function buildPrompt(constraints: TripConstraints): string {
  // ...
}

// BAD
function buildPrompt(constraints: any) { ... }
```

## File Size & Complexity Limits

These limits prevent god-components and unmaintainable files:

| Metric                                 | Limit             | Action when exceeded            |
| -------------------------------------- | ----------------- | ------------------------------- |
| Lines per **component file**           | **200 lines** max | Extract sub-components or hooks |
| Lines per **function / hook**          | **50 lines** max  | Extract helper functions        |
| Lines per **file** (any)               | **300 lines** max | Split into modules              |
| **Nesting depth** (if/for/map/ternary) | **3 levels** max  | Extract to a named function     |
| **Function parameters**                | **4 params** max  | Use an options object           |

If a file approaches these limits, it's a signal to refactor — not a reason to add `// eslint-disable`.

## Code Style & Readability

### Early Returns

Flatten logic with early returns instead of deep nesting:

```typescript
// GOOD
function getRole(member: TripMember): string {
  if (!member) return 'unknown';
  if (member.isOwner) return 'owner';
  if (member.canEdit) return 'editor';
  return 'viewer';
}

// BAD
function getRole(member: TripMember): string {
  if (member) {
    if (member.isOwner) {
      return 'owner';
    } else {
      if (member.canEdit) {
        return 'editor';
      } else {
        return 'viewer';
      }
    }
  } else {
    return 'unknown';
  }
}
```

### const by Default

- Use `const` for everything.
- Use `let` only when reassignment is genuinely needed.
- Never use `var`.

### Destructuring

- Destructure props, function params, and objects when it improves clarity.
- Destructure at the top of the function body, not inline in deeply nested code.

```typescript
// GOOD
const { title, startDate, budget } = trip;

// BAD
console.log(trip.title, trip.startDate, trip.budget);
```

### No Magic Numbers / Strings

- Extract constants with meaningful names.
- Group related constants in a dedicated file or at the top of the module.

```typescript
// GOOD
const MAX_SCENARIOS_PER_TRIP = 5;
const VOTE_DEBOUNCE_MS = 300;

// BAD
if (scenarios.length >= 5) { ... }
setTimeout(fn, 300);
```

### No console.log in Production Code

- Use the Sentry logger or a dedicated logging utility for diagnostics.
- `console.log` is acceptable **only** in development / debugging.
- Remove or replace all `console.log` before committing.

## Imports – Order & Organization

Keep imports consistent across all files, in this order:

1. **React** and external libraries (`react`, `zustand`, `@supabase/supabase-js`, etc.)
2. **Internal absolute imports** (`@/lib/...`, `@/features/...`, `@/components/...`)
3. **Relative imports** (`./SubComponent`, `../utils`)
4. **Type-only imports** (`import type { ... }`)
5. **Styles / assets** (CSS modules, images, etc.)

Separate each group with a blank line.

## Exports

- Prefer **named exports** for everything (components, hooks, utils).
- Use **default exports** only for page-level components (enables `React.lazy`).
- Never re-export everything with `export * from` (causes circular dependency issues and tree-shaking problems).

## Naming Conventions

| What                   | Convention              | Example              |
| ---------------------- | ----------------------- | -------------------- |
| Components             | PascalCase              | `TripDetailPage.tsx` |
| Hooks                  | `use` prefix, camelCase | `useTrip.ts`         |
| Services / utils       | camelCase               | `tripService.ts`     |
| Constants              | UPPER_SNAKE_CASE        | `MAX_BUDGET`         |
| Types / Interfaces     | PascalCase              | `TripConstraints`    |
| CSS classes (Tailwind) | kebab-case when custom  | `trip-card`          |
| Test files             | `*.test.ts(x)`          | `useTrip.test.ts`    |
| E2E specs              | `*.spec.ts`             | `voting.spec.ts`     |

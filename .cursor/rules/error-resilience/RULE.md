---
description: Error handling, error boundaries, and resilience patterns for Voyagely
alwaysApply: true
---

# Voyagely – Error Handling & Resilience

## Principle

**No white screens. No silent failures. No cryptic error messages.**

Every failure should result in:

1. A **clear message** to the user (what happened + what they can do).
2. A **log** to Sentry (for diagnostics).
3. The **rest of the app still working** (graceful degradation).

## Error Boundaries

### Placement

Error boundaries catch rendering errors in their subtree. Place them at:

| Level                  | Purpose                 | Fallback                                              |
| ---------------------- | ----------------------- | ----------------------------------------------------- |
| **App level**          | Last resort catch-all   | "Something went wrong. Reload the app."               |
| **Page / route level** | Isolate page crashes    | "This page encountered an error." + back to dashboard |
| **Feature section**    | Isolate feature crashes | "Could not load [feature]." + retry button            |

```tsx
// App-level (in App.tsx)
<ErrorBoundary fallback={<AppCrashFallback />}>
  <RouterProvider router={router} />
</ErrorBoundary>

// Page-level (in router or page wrapper)
<ErrorBoundary fallback={<PageErrorFallback />}>
  <TripDetailPage />
</ErrorBoundary>

// Feature-level (inside a page)
<ErrorBoundary fallback={<SectionError message="Could not load chat." />}>
  <ChatTab />
</ErrorBoundary>
```

### Rules

- Error boundaries catch **rendering errors** only (not async errors or event handler errors).
- For async/event errors, use try/catch + error state + UI feedback.
- Always provide a **recovery action** in the fallback (retry button, link to dashboard, reload).

## Structured Error Types

Use typed errors instead of generic `Error` for better handling:

```typescript
class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

This allows the UI to react differently:

- `AuthError` → redirect to login.
- `NetworkError` → show "offline / connection issue" + retry.
- `ValidationError` → highlight the specific form fields.
- `DatabaseError` → show generic error + report to Sentry.

## Graceful Degradation

When a non-critical feature fails, the rest of the app must keep working:

| Feature failure       | User impact              | Expected behavior                                                |
| --------------------- | ------------------------ | ---------------------------------------------------------------- |
| Weather API down      | Can't see forecast       | Show "Weather unavailable" message. Trip planning works fine.    |
| Realtime disconnected | No live updates          | Show "Reconnecting..." banner. User can still view/edit locally. |
| AI generation fails   | Can't generate scenarios | Show "AI unavailable. Create scenarios manually."                |
| Chat fails to load    | Can't see messages       | Show error in chat tab only. Itinerary tab works.                |
| Avatar image fails    | Broken image             | Show initials fallback.                                          |

**Rule**: Never let a secondary feature crash a primary feature.

## Retry Logic

### Automatic Retries (React Query)

React Query handles retries natively. Configure sensible defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed queries twice
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1, // Retry mutations once
    },
  },
});
```

### Manual Retry

For operations outside React Query, provide a retry mechanism:

```tsx
const ActivityList = () => {
  const { activities, error, refetch } = useActivities(tripId);

  if (error) {
    return <ErrorMessage message="Could not load activities." onRetry={refetch} />;
  }
  // ...
};
```

**Always** give the user a way to retry — don't leave them stuck.

## Loading States

- Show **skeletons** that match the shape of the expected content (not generic spinners).
- For actions (save, vote, send message): show a **loading indicator on the button** (disabled + spinner).
- For page-level loads: show a **full-page skeleton** that matches the layout.
- Set **timeouts** for very long operations: if loading takes > 10s, show "This is taking longer than expected..." with a cancel option.

## Optimistic Updates

For fast-feeling interactions (voting, chat messages):

1. **Update the UI immediately** (assume success).
2. Send the request to the server.
3. If the server **confirms** → done.
4. If the server **rejects** → roll back the optimistic update + show error toast.

React Query's `onMutate` / `onError` / `onSettled` pattern handles this cleanly.

## Logging & Monitoring

- **Sentry** captures:
  - Unhandled exceptions (auto-captured by ErrorBoundary integration).
  - Manually captured errors (`Sentry.captureException(error)`).
  - Performance transactions for key flows.
- **PostHog** tracks:
  - Feature usage events (not errors).
  - User behavior analytics.
- **Never log** user passwords, tokens, or PII to Sentry or console.
- Add **context** to Sentry errors: trip ID, user role, action being performed.

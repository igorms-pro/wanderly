---
description: React component patterns and anti-patterns for Voyagely
alwaysApply: true
---

# Voyagely – React Patterns & Anti-Patterns

## Component Design

### Single Responsibility

Each component does **one thing**. If you can describe what it does with "and" ("it fetches data AND renders a list AND handles voting AND shows errors"), it needs to be split.

```tsx
// BAD: God component
const TripPage = () => {
  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [votes, setVotes] = useState([]);
  const [messages, setMessages] = useState([]);
  // 15 useEffects, 300 lines of JSX...
};

// GOOD: Composed from focused pieces
const TripPage = () => {
  return (
    <TripProvider tripId={tripId}>
      <TripHeader />
      <TripTabs>
        <ItineraryTab />
        <ChatTab />
        <WeatherTab />
      </TripTabs>
    </TripProvider>
  );
};
```

### Separation: Logic vs Rendering

- **Custom hooks** own the logic (data fetching, state, computations).
- **Components** own the rendering (JSX, styles, layout).
- A component should **never** contain raw Supabase calls, complex business logic, or multi-step data transformations.

```tsx
// GOOD: Hook owns logic, component owns rendering
function useActivities(tripId: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  // fetch, subscribe, error handling...
  return { activities, loading, error };
}

const ActivityList = ({ tripId }: { tripId: string }) => {
  const { activities, loading, error } = useActivities(tripId);
  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  return <ul>{activities.map(a => <ActivityCard key={a.id} activity={a} />)}</ul>;
};

// BAD: Everything mixed in the component
const ActivityList = ({ tripId }: { tripId: string }) => {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    supabase.from('activities').select('*').eq('trip_id', tripId)
      .then(({ data }) => {
        const sorted = data?.sort((a, b) => /* ... */);
        const grouped = sorted?.reduce(/* ... */);
        setActivities(grouped);
      });
  }, [tripId]);
  // 200 lines of render logic...
};
```

## Hooks – Rules & Best Practices

### useEffect – Use Sparingly

`useEffect` is for **side effects only**: subscriptions, timers, DOM manipulation, data fetching (when not using React Query).

Before adding a `useEffect`, ask:

1. Can this be **computed during render** instead? → Use a variable or `useMemo`.
2. Is this **responding to a user event**? → Put it in the event handler, not an effect.
3. Is this **fetching data**? → Prefer React Query (`useQuery`) or a dedicated hook.

### FORBIDDEN: Cascading useEffects

This is the **#1 anti-pattern** that creates bugs, infinite loops, and unmaintainable code.

```tsx
// FORBIDDEN: Effect chain / cascade
const [data, setData] = useState(null);
const [filtered, setFiltered] = useState([]);
const [sorted, setSorted] = useState([]);

useEffect(() => { fetchData().then(setData); }, []);
useEffect(() => { setFiltered(data?.filter(...)); }, [data]);       // triggers on data change
useEffect(() => { setSorted(filtered?.sort(...)); }, [filtered]);   // triggers on filtered change

// CORRECT: Derive values, don't chain effects
const [data, setData] = useState(null);

useEffect(() => { fetchData().then(setData); }, []); // one effect for fetch

const filtered = useMemo(() => data?.filter(...) ?? [], [data]);
const sorted = useMemo(() => [...filtered].sort(...), [filtered]);
```

**Rule**: If effect A sets state that triggers effect B → you have a cascade. Refactor to:

- Derived values (`useMemo`, computed in render).
- A single effect that does the whole flow.
- A custom hook that encapsulates the logic.

### Always Clean Up Effects

```tsx
useEffect(() => {
  const channel = supabase.channel(`trip:${tripId}`);
  channel
    .on(
      'postgres_changes',
      {
        /* ... */
      },
      handleChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  }; // cleanup
}, [tripId]);
```

### useMemo & useCallback – When to Use

- `useMemo`: expensive computations (sorting large lists, complex filtering, building objects for context).
- `useCallback`: callbacks passed to memoized child components.
- **Do NOT** wrap everything in `useMemo` / `useCallback`. Profile first (React DevTools), optimize second.

## Props

### No Prop Drilling Beyond 2 Levels

If a prop passes through more than 2 intermediate components that don't use it:

1. **Composition** (children / render props) — simplest fix.
2. **React Context** — for cross-cutting concerns (auth, theme, current trip).
3. **Zustand store** — for shared client state.

```tsx
// BAD: Prop drilling
<TripPage trip={trip}>
  <TripBody trip={trip}>
    <ActivitySection trip={trip}>
      <ActivityCard tripId={trip.id} />  // trip drilled through 3 levels

// GOOD: Context or direct hook
const ActivityCard = () => {
  const { tripId } = useTripContext(); // or useParams()
  // ...
};
```

### No Inline Object / Array Literals in JSX

Creating new objects/arrays in JSX causes unnecessary re-renders for child components.

```tsx
// BAD: New object every render
<ActivityCard style={{ marginTop: 10 }} options={['a', 'b']} />;

// GOOD: Stable references
const cardStyle = { marginTop: 10 };
const defaultOptions = ['a', 'b'];
<ActivityCard style={cardStyle} options={defaultOptions} />;

// GOOD: Or use useMemo if it depends on props/state
const cardStyle = useMemo(() => ({ marginTop: offset }), [offset]);
```

## Conditional Rendering

- Prefer **early returns** in the component body over deeply nested ternaries in JSX.
- For complex conditions, extract to a small helper component or variable.

```tsx
// GOOD
const ActivityCard = ({ activity }: Props) => {
  if (!activity) return null;
  if (activity.status === 'rejected') return <RejectedBadge />;

  return <div>{activity.title}</div>;
};

// BAD
const ActivityCard = ({ activity }: Props) => {
  return (
    <div>
      {activity ? (
        activity.status === 'rejected' ? (
          <RejectedBadge />
        ) : (
          <div>{activity.title}</div>
        )
      ) : null}
    </div>
  );
};
```

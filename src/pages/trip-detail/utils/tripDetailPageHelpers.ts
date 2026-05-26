import type { TripConstraints } from '@/lib/types/database.types';
import type { EditFormState } from '@/pages/trip-detail/components/layout/TripDetailHero';

export function getTripBudgetFromConstraints(
  currentTrip: { constraints: unknown },
  membersCount: number,
): number | null {
  const constraints = currentTrip.constraints as TripConstraints | null;

  if (!constraints) {
    return null;
  }

  if (typeof constraints.budget_total_cents === 'number') {
    return constraints.budget_total_cents;
  }

  if (typeof constraints.budget_per_person_cents === 'number' && membersCount > 0) {
    return constraints.budget_per_person_cents * membersCount;
  }

  return null;
}

export function getConstraintsSummary(currentTrip: { constraints: unknown }) {
  const constraints = currentTrip.constraints as TripConstraints | null;

  return constraints
    ? {
        pace: constraints.pace,
        has_children: constraints.has_children,
        preferences: constraints.preferences,
      }
    : null;
}

type TripEditSource = {
  title: string;
  destination_text: string;
  start_date: string;
  end_date: string;
  status: EditFormState['status'];
  currency: string | null;
  constraints: unknown;
  timezone?: string | null;
};

export function buildEditFormFromTrip(currentTrip: TripEditSource): EditFormState {
  const c = currentTrip.constraints as TripConstraints | null;
  return {
    title: currentTrip.title,
    destination_text: currentTrip.destination_text,
    start_date: currentTrip.start_date,
    end_date: currentTrip.end_date,
    status: currentTrip.status,
    pace: (c?.pace as 'relaxed' | 'balanced' | 'packed') || 'balanced',
    budget: c?.budget_per_person_cents ? String(Math.round(c.budget_per_person_cents / 100)) : '',
    currency: currentTrip.currency || 'EUR',
    has_children: !!c?.has_children,
    timezone: currentTrip.timezone ?? 'UTC',
  };
}

export function sumActivityCostsCents(
  activitiesByDate: Record<
    string,
    { cost_max_cents?: number | null; cost_min_cents?: number | null; cost_cents?: number | null }[]
  >,
): number {
  return Object.values(activitiesByDate)
    .flat()
    .reduce((s, a) => s + (a.cost_max_cents ?? a.cost_min_cents ?? a.cost_cents ?? 0), 0);
}

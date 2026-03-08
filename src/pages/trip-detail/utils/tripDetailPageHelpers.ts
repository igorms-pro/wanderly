import type { TripConstraints } from '@/lib/types/database.types';

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

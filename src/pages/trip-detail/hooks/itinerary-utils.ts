import { addDays, format, isWithinInterval, parseISO, startOfWeek } from 'date-fns';
import type { Activity } from '@/lib/types/database.types';

const WEEK_STARTS_MONDAY = 1; // 0 = Sunday, 1 = Monday

/**
 * Returns an array of weeks covering the trip. Each week is an array of 7 date strings (YYYY-MM-DD)
 * or null for weekdays outside the trip. Index 0 = Monday, 6 = Sunday.
 */
export function getWeeksForTrip(startDate: string, endDate: string): (string | null)[][] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const weeks: (string | null)[][] = [];
  let current = startOfWeek(start, { weekStartsOn: WEEK_STARTS_MONDAY });

  while (current <= end) {
    const row: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(current, d);
      const dateStr = format(day, 'yyyy-MM-dd');
      row.push(isWithinInterval(day, { start, end }) ? dateStr : null);
    }
    // Only push week if at least one day is in the trip
    if (row.some((cell) => cell !== null)) {
      weeks.push(row);
    }
    current = addDays(current, 7);
  }

  return weeks;
}

/** Weekday labels (short) for grid header, Mon–Sun */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    const date = activity.start_time?.includes('T')
      ? activity.start_time.split('T')[0]
      : activity.created_at.split('T')[0];

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(activity);
    return acc;
  }, {});
}

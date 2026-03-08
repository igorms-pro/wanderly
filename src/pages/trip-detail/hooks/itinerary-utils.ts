import { addDays, format, isWithinInterval, parseISO, startOfWeek } from 'date-fns';
import type { Activity, ItineraryDay } from '@/lib/types/database.types';

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

export function buildItineraryDayMaps(activeItineraryDays?: ItineraryDay[] | null): {
  sortedDates: string[];
  itineraryDayIdByDate: Record<string, string>;
  dateByItineraryDayId: Record<string, string>;
} {
  const sortedDays = [...(activeItineraryDays ?? [])]
    .filter((d) => !d.deleted_at)
    .sort((a, b) => a.day_index - b.day_index);

  const sortedDates = sortedDays.map((d) => d.date);

  const itineraryDayIdByDate: Record<string, string> = {};
  const dateByItineraryDayId: Record<string, string> = {};
  for (const day of sortedDays) {
    itineraryDayIdByDate[day.date] = day.id;
    dateByItineraryDayId[day.id] = day.date;
  }

  return { sortedDates, itineraryDayIdByDate, dateByItineraryDayId };
}

/** Display order: order_index (persisted drag order), then start_time, then created_at. */
export function sortActivitiesByDayOrder(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => {
    const orderA = a.order_index ?? Infinity;
    const orderB = b.order_index ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    const timeCmp = (a.start_time || '').localeCompare(b.start_time || '');
    if (timeCmp !== 0) return timeCmp;
    return (a.created_at || '').localeCompare(b.created_at || '');
  });
}

export function buildActivitiesByDateForItinerary(
  activities: Activity[],
  dateByItineraryDayId: Record<string, string>,
): Record<string, Activity[]> {
  return activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    const dayId = activity.itinerary_day_id ?? null;
    const date =
      (dayId ? dateByItineraryDayId[dayId] : undefined) ?? activity.created_at.split('T')[0];
    if (!date) return acc;

    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});
}

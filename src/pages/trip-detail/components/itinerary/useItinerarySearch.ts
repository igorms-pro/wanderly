import { useEffect, useMemo, useState } from 'react';
import type { Activity } from '@/lib/types/database.types';

function normalizeSearchText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function filterActivitiesByQuery(
  activitiesByDate: Record<string, Activity[]>,
  sortedDates: string[],
  query: string,
): { activitiesByDate: Record<string, Activity[]>; sortedDates: string[] } {
  const q = normalizeSearchText(query.trim());
  if (!q) {
    return { activitiesByDate, sortedDates };
  }
  const filtered: Record<string, Activity[]> = {};
  for (const date of sortedDates) {
    const activities = activitiesByDate[date] ?? [];
    const match = activities.filter(
      (a) =>
        normalizeSearchText(a.title).includes(q) ||
        normalizeSearchText(a.place_name).includes(q) ||
        normalizeSearchText(a.description).includes(q),
    );
    if (match.length > 0) filtered[date] = match;
  }
  return {
    activitiesByDate: filtered,
    sortedDates: sortedDates.filter((d) => filtered[d]?.length),
  };
}

export function useItinerarySearch(
  activitiesByDate: Record<string, Activity[]>,
  sortedDates: string[],
  query: string,
): { activitiesByDate: Record<string, Activity[]>; sortedDates: string[] } {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);

    return () => clearTimeout(handle);
  }, [query]);

  return useMemo(
    () => filterActivitiesByQuery(activitiesByDate, sortedDates, debouncedQuery),
    [activitiesByDate, sortedDates, debouncedQuery],
  );
}

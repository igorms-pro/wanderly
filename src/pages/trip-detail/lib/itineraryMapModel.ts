import type { Activity } from '@/lib/types/database.types';

import { sortActivitiesByDayOrder } from '../hooks/itinerary-utils';

export type ItineraryMapStop = {
  activityId: string;
  title: string;
  lat: number;
  lon: number;
  order: number;
};

export type ItineraryMapLatLng = [lat: number, lon: number];

export type ItineraryMapModel =
  | { kind: 'no-trip-days' }
  | { kind: 'no-coordinates'; date: string }
  | { kind: 'ready'; date: string; stops: ItineraryMapStop[]; route: ItineraryMapLatLng[] };

export function activityHasMapCoordinates(activity: Activity): boolean {
  return activity.lat != null && activity.lon != null;
}

export function findDefaultMapDate(
  sortedDates: string[],
  activitiesByDate: Record<string, Activity[]>,
): string | null {
  if (sortedDates.length === 0) {
    return null;
  }

  const withCoords = sortedDates.find((date) =>
    (activitiesByDate[date] ?? []).some(activityHasMapCoordinates),
  );
  return withCoords ?? sortedDates[0];
}

export function buildItineraryMapModel(date: string, dayActivities: Activity[]): ItineraryMapModel {
  const ordered = sortActivitiesByDayOrder(dayActivities);
  const withCoords = ordered.filter(activityHasMapCoordinates);

  if (withCoords.length === 0) {
    return { kind: 'no-coordinates', date };
  }

  const stops: ItineraryMapStop[] = withCoords.map((activity, index) => ({
    activityId: activity.id,
    title: activity.title,
    lat: activity.lat as number,
    lon: activity.lon as number,
    order: index + 1,
  }));

  const route: ItineraryMapLatLng[] = stops.map((stop) => [stop.lat, stop.lon]);

  return { kind: 'ready', date, stops, route };
}

export function computeMapCenter(route: ItineraryMapLatLng[]): ItineraryMapLatLng {
  if (route.length === 0) {
    return [0, 0];
  }
  const sum = route.reduce((acc, [lat, lon]) => ({ lat: acc.lat + lat, lon: acc.lon + lon }), {
    lat: 0,
    lon: 0,
  });
  return [sum.lat / route.length, sum.lon / route.length];
}

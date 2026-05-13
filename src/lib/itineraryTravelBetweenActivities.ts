import type { Activity } from '@/lib/types/database.types';

/** Average speed (km/h) for a rough “local move” estimate (walk + short transit). */
const ESTIMATED_SPEED_KMH = 22;
const MIN_KM_FOR_ESTIMATE = 0.05;
const MIN_MINUTES_ESTIMATE = 5;
const MAX_MINUTES_ESTIMATE = 180;

export type TravelBetweenActivitiesResult =
  | { kind: 'stored'; minutes: number }
  | { kind: 'estimated'; minutes: number }
  | { kind: 'none' };

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function roundToStep(minutes: number, step: number): number {
  return Math.round(minutes / step) * step;
}

/**
 * Travel from `prev` stop to `next` stop: prefers `next.transport_duration_minutes`,
 * else estimates from coordinates when both activities have lat/lon.
 */
export function getTravelBetweenActivities(
  prev: Activity,
  next: Activity,
): TravelBetweenActivitiesResult {
  const stored = next.transport_duration_minutes;
  if (stored != null && stored > 0) {
    return { kind: 'stored', minutes: stored };
  }

  const lat1 = prev.lat;
  const lon1 = prev.lon;
  const lat2 = next.lat;
  const lon2 = next.lon;
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return { kind: 'none' };
  }

  const km = haversineKm(lat1, lon1, lat2, lon2);
  if (km < MIN_KM_FOR_ESTIMATE) {
    return { kind: 'none' };
  }

  const rawMinutes = (km / ESTIMATED_SPEED_KMH) * 60;
  const rounded = roundToStep(rawMinutes, 5);
  const minutes = Math.min(MAX_MINUTES_ESTIMATE, Math.max(MIN_MINUTES_ESTIMATE, rounded));
  return { kind: 'estimated', minutes };
}

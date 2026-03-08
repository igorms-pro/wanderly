import { format } from 'date-fns';
import type { Activity } from '@/lib/types/database.types';

export type MemberProfile = {
  display_name: string | null;
  avatar_url: string | null;
  email?: string | null;
};

export function getDisplayName(profile: MemberProfile | undefined, fallback: string): string {
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  if (profile?.email) {
    const beforeAt = profile.email.split('@')[0].trim();
    if (beforeAt) return beforeAt;
  }
  return fallback;
}

export function getInitial(profile: MemberProfile | undefined, fallback: string): string {
  const name = getDisplayName(profile, fallback);
  return name.charAt(0).toUpperCase();
}

export function formatTime(timeStr: string, pattern: string = 'h:mm a'): string {
  const normalized = timeStr.includes('T') ? timeStr : `2000-01-01T${timeStr}`;
  return format(new Date(normalized), pattern);
}

/** Display time without seconds; "18h" when minutes are 00, else "18:30". */
export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr?.trim()) return '';
  const part = timeStr.trim().slice(0, 5);
  const [hh, mm] = part.split(':');
  if (!hh) return timeStr;
  const minutes = mm ?? '00';
  return minutes === '00' ? `${hh}h` : `${hh}:${minutes}`;
}

export function formatActivityCost(
  activity: Activity,
  currency: string,
  tFree: string,
): string | null {
  const min = activity.cost_min_cents ?? activity.cost_cents;
  const max = activity.cost_max_cents ?? activity.cost_cents;
  if (min == null && max == null) return null;
  const lo = min ?? 0;
  const hi = max ?? 0;
  if (lo === 0 && hi === 0) return tFree;
  const fmt = (c: number) => `${(c / 100).toFixed(0)} ${currency}`;
  if (lo === hi) return fmt(lo);
  return `${fmt(lo)} – ${fmt(hi)}`;
}

export function getGoogleMapsUrl(activity: Activity): string | null {
  if (activity.lat != null && activity.lon != null) {
    return `https://www.google.com/maps?q=${activity.lat},${activity.lon}`;
  }
  const name = activity.place_name?.trim() || activity.title;
  if (name) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  return null;
}

export function getTransportLabel(
  transportType: string | null | undefined,
  t: (k: string) => string,
): string {
  if (!transportType) return '';
  const key = `tripDetail.transport${transportType.charAt(0).toUpperCase()}${transportType.slice(
    1,
  )}`;
  const label = t(key);
  return label !== key ? label : transportType;
}

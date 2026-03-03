import { format } from 'date-fns';
import { Clock, DollarSign, Sparkles, MapPin, Car } from 'lucide-react';
import type { Activity } from '@/lib/types/database.types';

interface TimelineActivityMetaProps {
  activity: Activity;
  currency: string;
  t: (key: string) => string;
}

function formatTime(timeStr: string): string {
  const normalized = timeStr.includes('T') ? timeStr : `2000-01-01T${timeStr}`;
  return format(new Date(normalized), 'HH:mm');
}

function formatActivityCost(
  activity: Activity,
  defaultCurrency: string,
  t: (key: string) => string,
): string | null {
  const min = activity.cost_min_cents ?? activity.cost_cents;
  const max = activity.cost_max_cents ?? activity.cost_cents;
  if (min == null && max == null) return null;
  const lo = min ?? 0;
  const hi = max ?? 0;
  const curr = activity.currency || defaultCurrency;
  if (lo === 0 && hi === 0) return t('tripDetail.costFree');
  const fmt = (c: number) => `${(c / 100).toFixed(0)} ${curr}`;
  if (lo === hi) return fmt(lo);
  return `${fmt(lo)} – ${fmt(hi)}`;
}

function getGoogleMapsUrl(activity: Activity): string | null {
  if (activity.lat != null && activity.lon != null) {
    return `https://www.google.com/maps?q=${activity.lat},${activity.lon}`;
  }
  const name = (activity.place_name || activity.title || '').trim();
  if (name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  }
  return null;
}

function getTransportLabel(
  transportType: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!transportType) return '';
  const key = `tripDetail.transport${transportType.charAt(0).toUpperCase()}${transportType.slice(
    1,
  )}`;
  const label = t(key);
  return label !== key ? label : transportType;
}

export function TimelineActivityMeta({ activity, currency, t }: TimelineActivityMetaProps) {
  return (
    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
      {activity.start_time && (
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(activity.start_time)}
        </span>
      )}
      <>
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          {formatActivityCost(activity, currency, t) || t('tripDetail.costNotSet')}
        </span>
        {activity.transport_type || activity.transport_notes ? (
          <span className="flex items-center gap-1">
            <Car className="w-3 h-3" />
            {[
              getTransportLabel(activity.transport_type, t),
              activity.transport_notes,
              activity.transport_duration_minutes != null && activity.transport_duration_minutes > 0
                ? `${activity.transport_duration_minutes} min`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Car className="w-3 h-3" />
            {t('tripDetail.transportNotSet')}
          </span>
        )}
        {getGoogleMapsUrl(activity) && (
          <a
            href={getGoogleMapsUrl(activity) as string}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <MapPin className="w-3 h-3" />
            {t('tripDetail.viewOnGoogleMaps')}
          </a>
        )}
        {activity.source === 'ai' && (
          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-3 h-3" />
            {t('tripDetail.aiSuggested')}
          </span>
        )}
      </>
    </div>
  );
}

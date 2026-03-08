import { MapPin } from 'lucide-react';
import type { Activity } from '../../../../../lib/types/database.types';
import { getGoogleMapsUrl } from '../../../ItineraryActivityTypes';

interface ItineraryActivityLocationProps {
  activity: Activity;
  t: (key: string) => string;
}

export function ItineraryActivityLocation({ activity, t }: ItineraryActivityLocationProps) {
  const locationText =
    activity.place_name?.trim() ||
    (activity.lat != null && activity.lon != null
      ? `${activity.lat.toFixed(4)}, ${activity.lon.toFixed(4)}`
      : t('tripDetail.placeNotSet'));

  const mapsUrl = getGoogleMapsUrl(activity);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <MapPin className="w-4 h-4 shrink-0" />
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {locationText}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t('tripDetail.viewOnGoogleMaps')}
          </a>
        )}
      </span>
    </div>
  );
}

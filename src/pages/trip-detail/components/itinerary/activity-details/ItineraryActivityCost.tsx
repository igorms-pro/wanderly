import { DollarSign, Car, Sparkles } from 'lucide-react';
import type { Activity } from '../../../../../lib/types/database.types';
import { formatActivityCost, getTransportLabel } from '../../../ItineraryActivityTypes';

interface ItineraryActivityCostProps {
  activity: Activity;
  currency: string;
  t: (key: string) => string;
}

export function ItineraryActivityCost({ activity, currency, t }: ItineraryActivityCostProps) {
  const transportText =
    activity.transport_type || activity.transport_notes
      ? [
          getTransportLabel(activity.transport_type, t),
          activity.transport_notes,
          activity.transport_duration_minutes != null && activity.transport_duration_minutes > 0
            ? `${activity.transport_duration_minutes} min`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : t('tripDetail.transportNotSet');

  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
      <div className="flex items-center">
        <DollarSign className="w-4 h-4 mr-1 shrink-0" />
        <span>
          {formatActivityCost(activity, activity.currency ?? currency, t('tripDetail.costFree')) ||
            t('tripDetail.costNotSet')}
        </span>
      </div>
      <div className="flex items-center">
        <Car className="w-4 h-4 mr-1 shrink-0" />
        <span>{transportText}</span>
      </div>
      {activity.category && (
        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
          {activity.category}
        </span>
      )}
      {activity.source === 'ai' && (
        <div className="flex items-center text-purple-600 dark:text-purple-400">
          <Sparkles className="w-4 h-4 mr-1" />
          {t('tripDetail.aiSuggested')}
        </div>
      )}
    </div>
  );
}

import { Route } from 'lucide-react';

import { getTravelBetweenActivities } from '@/lib/itineraryTravelBetweenActivities';
import type { Activity } from '@/lib/types/database.types';

type TimelineTravelBetweenProps = {
  prev: Activity;
  next: Activity;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export function TimelineTravelBetween({ prev, next, t }: TimelineTravelBetweenProps) {
  const result = getTravelBetweenActivities(prev, next);
  if (result.kind === 'none') {
    return null;
  }

  const label =
    result.kind === 'stored'
      ? t('tripDetail.timelineTravelGap', { minutes: result.minutes })
      : t('tripDetail.timelineTravelGapEstimated', { minutes: result.minutes });

  return (
    <div
      className="flex items-center gap-2 py-1 pl-1 text-xs text-gray-500 dark:text-gray-400"
      role="status"
      aria-label={label}
    >
      <Route className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

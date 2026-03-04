import { useCallback, KeyboardEvent } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { Activity } from '../../../../lib/types/database.types';

interface ItineraryActivityHeaderRowProps {
  activity: Activity;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  t: (key: string) => string;
  upvotes: number;
  downvotes: number;
}

export function ItineraryActivityHeaderRow({
  activity,
  isExpanded,
  onToggleExpanded,
  t,
  upvotes,
  downvotes,
}: ItineraryActivityHeaderRowProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggleExpanded();
      }
    },
    [onToggleExpanded],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggleExpanded}
      onKeyDown={handleKeyDown}
      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {activity.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          {activity.start_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 shrink-0" />
              {activity.end_time
                ? `${activity.start_time} – ${activity.end_time}`
                : activity.start_time}
            </span>
          )}
          {activity.status === 'proposed' && (upvotes > 0 || downvotes > 0) && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {upvotes} {t('tripDetail.votesFor')} · {downvotes} {t('tripDetail.votesAgainst')}
            </span>
          )}
          {activity.status === 'confirmed' && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {t('tripDetail.activityValidated')}
            </span>
          )}
          {activity.status === 'rejected' && (
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              {t('tripDetail.activityRejected')}
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </span>
    </div>
  );
}

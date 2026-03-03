import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Activity } from '@/lib/types/database.types';

interface TimelineActivityHeaderProps {
  activity: Activity;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function TimelineActivityHeader({
  activity,
  isExpanded,
  onToggleExpanded,
}: TimelineActivityHeaderProps) {
  return (
    <button type="button" onClick={onToggleExpanded} className="w-full text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {activity.title}
          </h4>
          {activity.place_name && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
              {activity.place_name}
            </p>
          )}
        </div>
        <span className="ml-2 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </div>
    </button>
  );
}

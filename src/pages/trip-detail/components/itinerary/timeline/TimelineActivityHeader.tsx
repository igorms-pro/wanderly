import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import type { Activity } from '@/lib/types/database.types';

interface TimelineActivityHeaderProps {
  activity: Activity;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  canEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  t?: (key: string) => string;
}

export function TimelineActivityHeader({
  activity,
  isExpanded,
  onToggleExpanded,
  canEdit,
  onEdit,
  onDelete,
  t,
}: TimelineActivityHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <button type="button" onClick={onToggleExpanded} className="min-w-0 flex-1 text-left">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {activity.title}
        </h4>
        {activity.place_name && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
            {activity.place_name}
          </p>
        )}
      </button>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        {canEdit && t && (
          <>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label={t('activities.actions.edit')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                aria-label={t('activities.actions.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
        <span className="text-gray-400 dark:text-gray-500 mt-0.5" aria-hidden>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </div>
    </div>
  );
}

import { format } from 'date-fns';
import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from './ItineraryActivityTypes';
import { ItineraryActivityItem } from './ItineraryActivityItem';

interface ItineraryDayBlockProps {
  date: string;
  activities: Activity[];
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  currency?: string;
  tripMembersCount?: number;
  activityParticipantsMap?: Record<string, string[]>;
  tripMembers?: TripMember[];
  memberProfiles?: Record<string, MemberProfile>;
  showClose?: boolean;
  onClose?: () => void;
}

export function ItineraryDayBlock({
  date,
  activities,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  currency = 'EUR',
  tripMembersCount,
  activityParticipantsMap = {},
  tripMembers = [],
  memberProfiles = {},
  showClose,
  onClose,
}: ItineraryDayBlockProps) {
  const sorted = [...activities].sort((a, b) =>
    (a.start_time || '').localeCompare(b.start_time || ''),
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {activities.length} {t('tripDetail.activities')}
          </p>
        </div>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
          >
            {t('tripDetail.close')}
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {sorted.map((activity, index) => (
          <ItineraryActivityItem
            key={activity.id}
            activity={activity}
            index={index}
            canVote={canVote}
            votingActivityId={votingActivityId}
            getVoteCounts={getVoteCounts}
            getUserVote={getUserVote}
            onVote={onVote}
            t={t}
            currency={currency}
            tripMembersCount={tripMembersCount}
            activityParticipantsMap={activityParticipantsMap || {}}
            tripMembers={tripMembers}
            memberProfiles={memberProfiles || {}}
          />
        ))}
      </div>
    </div>
  );
}

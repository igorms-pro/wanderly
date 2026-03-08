import { Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { MemberProfile } from '@/pages/trip-detail/ItineraryActivityTypes';
import { getDisplayName } from '@/pages/trip-detail/ItineraryActivityTypes';

interface ActivityEditParticipantsSectionProps {
  activityId: string;
  participantIds: string[];
  isAllMembers: boolean;
  tripMembersCount: number;
  currentUserId: string | null;
  memberProfiles: Record<string, MemberProfile>;
  t: (key: string) => string;
  onAddMe: (activityId: string) => Promise<void>;
  onRemoveMe: (activityId: string) => Promise<void>;
}

export function ActivityEditParticipantsSection({
  activityId,
  participantIds,
  isAllMembers,
  tripMembersCount,
  currentUserId,
  memberProfiles,
  t,
  onAddMe,
  onRemoveMe,
}: ActivityEditParticipantsSectionProps) {
  const { t: tFn } = useTranslation();
  const isCurrentUserInList = currentUserId != null && participantIds.includes(currentUserId);

  const handleAddMe = async () => {
    await onAddMe(activityId);
  };

  const handleRemoveMe = async () => {
    await onRemoveMe(activityId);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Users className="w-4 h-4" />
        {t('activityModal.participantsSectionTitle')}
      </h3>
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
        {isAllMembers && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {tFn('tripDetail.participantsAll')} ({tripMembersCount})
          </p>
        )}
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
          {participantIds.map((uid) => {
            const profile = memberProfiles[uid];
            const name = getDisplayName(profile, tFn('tripDetail.member'));
            const isSelf = uid === currentUserId;
            return (
              <li key={uid} className="flex items-center justify-between gap-2 min-h-[28px]">
                <span className="truncate">{name}</span>
                {isSelf && (
                  <button
                    type="button"
                    onClick={handleRemoveMe}
                    className="shrink-0 p-1 rounded text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                    aria-label={t('activityModal.removeMe')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {currentUserId && !isCurrentUserInList && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={handleAddMe}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              {t('activityModal.addMe')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

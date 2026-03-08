import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { MemberProfile } from '@/pages/trip-detail/ItineraryActivityTypes';
import { getDisplayName } from '@/pages/trip-detail/ItineraryActivityTypes';

const PARTICIPANTS_COLLAPSE_THRESHOLD = 10;

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
  const [isListExpanded, setIsListExpanded] = useState(
    () => participantIds.length <= PARTICIPANTS_COLLAPSE_THRESHOLD,
  );

  const handleAddMe = async () => {
    await onAddMe(activityId);
  };

  const handleRemoveMe = async () => {
    await onRemoveMe(activityId);
  };

  const summaryLabel = isAllMembers
    ? `${tFn('tripDetail.participantsAll')} (${tripMembersCount})`
    : t('activityModal.participantsSectionTitle');

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsListExpanded((prev) => !prev)}
        className="flex w-full items-center gap-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <Users className="w-4 h-4 shrink-0" />
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="truncate">{summaryLabel}</span>
          <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
            {isListExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </span>
      </button>
      <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
        {isListExpanded && (
          <>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
              {participantIds.map((uid) => {
                const profile = memberProfiles[uid];
                const name = getDisplayName(profile, tFn('tripDetail.member'));
                const isSelf = uid === currentUserId;
                return (
                  <li key={uid} className="flex items-center justify-between gap-2 min-h-[28px]">
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    {isSelf ? (
                      <button
                        type="button"
                        onClick={handleRemoveMe}
                        className="shrink-0 ml-auto p-1 rounded text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                        aria-label={t('activityModal.removeMe')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="w-6 shrink-0" aria-hidden />
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
          </>
        )}
      </div>
    </div>
  );
}

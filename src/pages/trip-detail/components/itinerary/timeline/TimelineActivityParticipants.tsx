import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import type { MemberProfile } from '../../../ItineraryActivityTypes';
import { getDisplayName, getInitial } from '../../../ItineraryActivityTypes';

interface TimelineActivityParticipantsProps {
  participantIds: string[];
  participantsCount: number;
  participantsLabel: string;
  memberProfiles: Record<string, MemberProfile>;
  isOpen: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}

export function TimelineActivityParticipants({
  participantIds,
  participantsCount,
  participantsLabel,
  memberProfiles,
  isOpen,
  onToggle,
  t,
}: TimelineActivityParticipantsProps) {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-left w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <Users className="w-4 h-4 shrink-0" />
        <span className="flex items-center gap-1.5 shrink-0">
          {participantIds.slice(0, 4).map((uid) => {
            const profile = memberProfiles[uid];
            const name = getDisplayName(profile, t('tripDetail.member'));
            const initial = getInitial(profile, t('tripDetail.member'));
            return (
              <span
                key={uid}
                className="inline-flex h-6 w-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800 shrink-0"
                title={name}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    {initial}
                  </span>
                )}
              </span>
            );
          })}
          {participantIds.length > 4 && (
            <span className="text-[11px] text-gray-400">+{participantIds.length - 4}</span>
          )}
        </span>
        <span className="flex items-center gap-1 truncate">
          <span className="truncate sm:hidden">{String(participantsCount)}</span>
          <span className="hidden sm:inline truncate">{participantsLabel}</span>
          <span className="shrink-0 text-gray-400 dark:text-gray-500">
            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </span>
        </span>
      </button>
      {isOpen && (
        <div className="ml-6 mt-1 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            {t('tripDetail.participantsList')}
          </p>
          <ul className="space-y-1.5">
            {participantIds.map((uid) => {
              const profile = memberProfiles[uid];
              const name = getDisplayName(profile, t('tripDetail.member'));
              const initial = getInitial(profile, t('tripDetail.member'));
              return (
                <li
                  key={uid}
                  className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300"
                >
                  <span className="inline-flex h-6 w-6 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
                        {initial}
                      </span>
                    )}
                  </span>
                  <span>{name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

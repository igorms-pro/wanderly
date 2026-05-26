import { useState } from 'react';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { MemberProfile } from '../../../ItineraryActivityTypes';
import { getDisplayName, getInitial } from '../../../ItineraryActivityTypes';
import { ItineraryActivityParticipantsList } from './ItineraryActivityParticipantsList';

interface ItineraryActivityParticipantsProps {
  participantIds: string[];
  participantsLabel: string;
  memberProfiles: Record<string, MemberProfile>;
  t: (key: string) => string;
}

export function ItineraryActivityParticipants({
  participantIds,
  participantsLabel,
  memberProfiles,
  t,
}: ItineraryActivityParticipantsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-left w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <Users className="w-4 h-4 shrink-0" />
        <span className="flex items-center gap-1.5 shrink-0">
          {participantIds.slice(0, 6).map((uid) => {
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
          {participantIds.length > 6 && (
            <span className="text-xs text-gray-400">+{participantIds.length - 6}</span>
          )}
        </span>
        <span className="flex items-center gap-1 min-w-0">
          <span className="truncate">{participantsLabel}</span>
          <span className="shrink-0 text-gray-400 dark:text-gray-500">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </span>
      </button>
      {open && (
        <ItineraryActivityParticipantsList
          participantIds={participantIds}
          memberProfiles={memberProfiles}
          t={t}
        />
      )}
    </div>
  );
}

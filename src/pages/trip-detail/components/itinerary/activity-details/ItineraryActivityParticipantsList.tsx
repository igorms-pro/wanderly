import type { MemberProfile } from '../../../ItineraryActivityTypes';
import { getDisplayName, getInitial } from '../../../ItineraryActivityTypes';

interface ItineraryActivityParticipantsListProps {
  participantIds: string[];
  memberProfiles: Record<string, MemberProfile>;
  t: (key: string) => string;
}

export function ItineraryActivityParticipantsList({
  participantIds,
  memberProfiles,
  t,
}: ItineraryActivityParticipantsListProps) {
  return (
    <div className="ml-6 mt-1 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="inline-flex h-7 w-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
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
  );
}

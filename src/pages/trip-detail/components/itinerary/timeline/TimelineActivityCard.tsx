import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from '../../../ItineraryActivityTypes';
import { getDisplayName, getInitial } from '../../../ItineraryActivityTypes';
import { TimelineActivityHeader } from './TimelineActivityHeader';
import { TimelineActivityMeta } from './TimelineActivityMeta';
import { TimelineActivityVotes } from './TimelineActivityVotes';

export interface TimelineActivityCardProps {
  activity: Activity;
  index: number;
  currency: string;
  canVote: boolean;
  votingActivityId: string | null;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  getUserVote: (activityId: string) => 'up' | 'down' | null;
  onVote: (activityId: string, choice: 'up' | 'down') => void;
  t: (key: string) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  tripMembersCount?: number;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfile>;
}

export function TimelineActivityCard({
  activity,
  index,
  currency,
  canVote,
  votingActivityId,
  getVoteCounts,
  getUserVote,
  onVote,
  t,
  isExpanded,
  onToggleExpanded,
  tripMembersCount,
  activityParticipantsMap,
  tripMembers,
  memberProfiles,
}: TimelineActivityCardProps) {
  const { upvotes, downvotes } = getVoteCounts(activity.id);
  const userVote = getUserVote(activity.id);
  const isRight = index % 2 === 0;

  const [openParticipants, setOpenParticipants] = useState(false);

  const participantIds =
    activityParticipantsMap[activity.id] != null && activityParticipantsMap[activity.id].length > 0
      ? activityParticipantsMap[activity.id]
      : tripMembers.map((m) => m.user_id);
  const participantsCount = participantIds.length;

  const participantsLabel =
    activityParticipantsMap[activity.id] != null && activityParticipantsMap[activity.id].length > 0
      ? participantsCount === 1
        ? t('tripDetail.participantCount_one')
        : t('tripDetail.participantsCount').replace('{{count}}', String(participantsCount))
      : tripMembersCount != null && tripMembersCount > 0
        ? `${t('tripDetail.participantsAll')} (${tripMembersCount})`
        : t('tripDetail.participantsNotSet');

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm overflow-hidden ${
        isRight ? 'sm:ml-8' : 'sm:mr-8'
      }`}
    >
      <div className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <TimelineActivityHeader
            activity={activity}
            isExpanded={isExpanded}
            onToggleExpanded={onToggleExpanded}
          />
          {activity.category && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              {activity.category}
            </span>
          )}
          {isExpanded && activity.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{activity.description}</p>
          )}
          {isExpanded && (
            <>
              <div className="mt-3 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setOpenParticipants((prev) => !prev)}
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
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
                              {initial}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {participantIds.length > 4 && (
                      <span className="text-[11px] text-gray-400">
                        +{participantIds.length - 4}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <span className="truncate">{participantsLabel}</span>
                    <span className="shrink-0 text-gray-400 dark:text-gray-500">
                      {openParticipants ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  </span>
                </button>
                {openParticipants && (
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
                                <img
                                  src={profile.avatar_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
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
              <TimelineActivityMeta activity={activity} currency={currency} t={t} />
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <TimelineActivityVotes
            activityStatus={activity.status}
            canVote={canVote}
            votingActivityId={votingActivityId}
            activityId={activity.id}
            upvotes={upvotes}
            downvotes={downvotes}
            userVote={userVote}
            onVote={onVote}
            t={t}
          />
        </div>
      </div>
    </div>
  );
}

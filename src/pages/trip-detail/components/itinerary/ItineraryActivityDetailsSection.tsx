import type { Activity, TripMember } from '../../../../lib/types/database.types';
import type { MemberProfile } from '../../ItineraryActivityTypes';
import { ItineraryActivityDescription } from './activity-details/ItineraryActivityDescription';
import { ItineraryActivityLocation } from './activity-details/ItineraryActivityLocation';
import { ItineraryActivityParticipants } from './activity-details/ItineraryActivityParticipants';
import { ItineraryActivityCost } from './activity-details/ItineraryActivityCost';

interface ItineraryActivityDetailsSectionProps {
  activity: Activity;
  t: (key: string) => string;
  currency: string;
  tripMembersCount?: number;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfile>;
}

export function ItineraryActivityDetailsSection({
  activity,
  t,
  currency,
  tripMembersCount,
  activityParticipantsMap,
  tripMembers,
  memberProfiles,
}: ItineraryActivityDetailsSectionProps) {
  const explicitParticipants = activityParticipantsMap[activity.id];
  const hasExplicit = explicitParticipants != null && explicitParticipants.length > 0;
  const participantIds = hasExplicit ? explicitParticipants : tripMembers.map((m) => m.user_id);

  const participantsLabel = hasExplicit
    ? participantIds.length === 1
      ? t('tripDetail.participantCount_one')
      : t('tripDetail.participantsCount').replace('{{count}}', String(participantIds.length))
    : tripMembersCount != null && tripMembersCount > 0
      ? `${t('tripDetail.participantsAll')} (${tripMembersCount})`
      : t('tripDetail.participantsNotSet');

  return (
    <div className="space-y-3 mb-4">
      <ItineraryActivityDescription description={activity.description} t={t} />
      <ItineraryActivityLocation activity={activity} t={t} />
      <ItineraryActivityParticipants
        participantIds={participantIds}
        participantsLabel={participantsLabel}
        memberProfiles={memberProfiles}
        t={t}
      />
      {activity.organizer_notes?.trim() && (
        <div className="mb-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-0.5">
            {t('tripDetail.organizerNote')}
          </p>
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {activity.organizer_notes.trim()}
          </p>
        </div>
      )}
      {Array.isArray(activity.packing_checklist) &&
        (activity.packing_checklist as unknown[]).length > 0 && (
          <div className="mb-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
              {t('tripDetail.packingChecklist')}
            </p>
            <ul className="list-disc list-inside text-sm text-blue-900 dark:text-blue-100 space-y-0.5">
              {(activity.packing_checklist as unknown[])
                .filter((x) => typeof x === 'string' && (x as string).trim().length > 0)
                .map((x, idx) => (
                  <li key={idx}>{(x as string).trim()}</li>
                ))}
            </ul>
          </div>
        )}
      <ItineraryActivityCost activity={activity} currency={currency} t={t} />
    </div>
  );
}

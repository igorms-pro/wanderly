import { useState } from 'react';
import {
  FileText,
  MapPin,
  Users,
  DollarSign,
  Car,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Activity, TripMember } from '../../../../lib/types/database.types';
import type { MemberProfile } from '../../ItineraryActivityTypes';
import {
  formatActivityCost,
  getDisplayName,
  getGoogleMapsUrl,
  getInitial,
  getTransportLabel,
} from '../../ItineraryActivityTypes';

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
    <div className="space-y-3 mb-4">
      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
        <FileText className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{activity.description?.trim() || t('tripDetail.descriptionNotSet')}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <MapPin className="w-4 h-4 shrink-0" />
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {activity.place_name?.trim()
            ? activity.place_name.trim()
            : activity.lat != null && activity.lon != null
              ? `${activity.lat.toFixed(4)}, ${activity.lon.toFixed(4)}`
              : t('tripDetail.placeNotSet')}
          {getGoogleMapsUrl(activity) && (
            <a
              href={getGoogleMapsUrl(activity)!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {t('tripDetail.viewOnGoogleMaps')}
            </a>
          )}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setOpenParticipants((prev) => !prev)}
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
              {openParticipants ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </span>
          </span>
        </button>
        {openParticipants && (
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
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
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
        )}
      </div>

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
                .filter((x) => typeof x === 'string' && x.trim().length > 0)
                .map((x, idx) => (
                  <li key={idx}>{(x as string).trim()}</li>
                ))}
            </ul>
          </div>
        )}

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div key="cost" className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1 shrink-0" />
          <span>
            {formatActivityCost(
              activity,
              activity.currency ?? currency,
              t('tripDetail.costFree'),
            ) || t('tripDetail.costNotSet')}
          </span>
        </div>
        <div className="flex items-center">
          <Car className="w-4 h-4 mr-1 shrink-0" />
          <span>
            {activity.transport_type || activity.transport_notes
              ? [
                  getTransportLabel(activity.transport_type, t),
                  activity.transport_notes,
                  activity.transport_duration_minutes != null &&
                  activity.transport_duration_minutes > 0
                    ? `${activity.transport_duration_minutes} min`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : t('tripDetail.transportNotSet')}
          </span>
        </div>
        {activity.category && (
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
            {activity.category}
          </span>
        )}
        {activity.source === 'ai' && (
          <div className="flex items-center text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4 mr-1" />
            {t('tripDetail.aiSuggested')}
          </div>
        )}
      </div>
    </div>
  );
}

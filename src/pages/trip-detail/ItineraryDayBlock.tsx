import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Car,
  MapPin,
  Users,
  FileText,
} from 'lucide-react';
import type { Activity, TripMember } from '@/lib/types/database.types';

export type MemberProfile = { display_name: string | null; avatar_url: string | null };

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

function formatActivityCost(activity: Activity, currency: string, tFree: string): string | null {
  const min = activity.cost_min_cents ?? activity.cost_cents;
  const max = activity.cost_max_cents ?? activity.cost_cents;
  if (min == null && max == null) return null;
  const lo = min ?? 0;
  const hi = max ?? 0;
  if (lo === 0 && hi === 0) return tFree;
  const fmt = (c: number) => `${(c / 100).toFixed(0)} ${currency}`;
  if (lo === hi) return fmt(lo);
  return `${fmt(lo)} – ${fmt(hi)}`;
}

function getGoogleMapsUrl(activity: Activity): string | null {
  if (activity.lat != null && activity.lon != null) {
    return `https://www.google.com/maps?q=${activity.lat},${activity.lon}`;
  }
  const name = activity.place_name?.trim() || activity.title;
  if (name) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  return null;
}

function getTransportLabel(
  transportType: string | null | undefined,
  t: (k: string) => string,
): string {
  if (!transportType) return '';
  const key = `tripDetail.transport${transportType.charAt(0).toUpperCase()}${transportType.slice(1)}`;
  const label = t(key);
  return label !== key ? label : transportType;
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openParticipantsActivityId, setOpenParticipantsActivityId] = useState<string | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const formatTime = (timeStr: string) => {
    const normalized = timeStr.includes('T') ? timeStr : `2000-01-01T${timeStr}`;
    return format(new Date(normalized), 'h:mm a');
  };

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
        {sorted.map((activity, index) => {
          const { upvotes, downvotes } = getVoteCounts(activity.id);
          const userVote = getUserVote(activity.id);
          const isExpanded = expandedIds.has(activity.id);

          const accentClass =
            index % 2 === 1
              ? // Even rows: subtle colored background
                'border-l-2 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 dark:border-emerald-400 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 transition'
              : // Odd rows: neutral white background
                'border-l-2 border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:bg-gray-800/70 transition';

          return (
            <div key={activity.id} className={accentClass}>
              {/* Collapsed row: title + time (+ vote summary). Click to expand. Like/dislike only when expanded. */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleExpanded(activity.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpanded(activity.id);
                  }
                }}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {activity.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    {activity.start_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 shrink-0" />
                        {activity.end_time
                          ? `${formatTime(activity.start_time)} – ${formatTime(activity.end_time)}`
                          : formatTime(activity.start_time)}
                      </span>
                    )}
                    {activity.status === 'proposed' && (upvotes > 0 || downvotes > 0) && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {upvotes} {t('tripDetail.votesFor')} · {downvotes}{' '}
                        {t('tripDetail.votesAgainst')}
                      </span>
                    )}
                    {activity.status === 'confirmed' && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {t('tripDetail.activityValidated')}
                      </span>
                    )}
                    {activity.status === 'rejected' && (
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">
                        {t('tripDetail.activityRejected')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </span>
              </div>

              {/* Expanded: description, lieu, participants, coût, transport (toujours affichés), votes */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        {activity.description?.trim() || t('tripDetail.descriptionNotSet')}
                      </span>
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
                        onClick={() =>
                          setOpenParticipantsActivityId((prev) =>
                            prev === activity.id ? null : activity.id,
                          )
                        }
                        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-left w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <Users className="w-4 h-4 shrink-0" />
                        {(() => {
                          const participantIds =
                            activityParticipantsMap[activity.id] != null &&
                            activityParticipantsMap[activity.id].length > 0
                              ? activityParticipantsMap[activity.id]
                              : tripMembers.map((m) => m.user_id);
                          const count = participantIds.length;
                          const label =
                            activityParticipantsMap[activity.id] != null &&
                            activityParticipantsMap[activity.id].length > 0
                              ? count === 1
                                ? t('tripDetail.participantCount_one')
                                : t('tripDetail.participantsCount').replace(
                                    '{{count}}',
                                    String(count),
                                  )
                              : tripMembersCount != null && tripMembersCount > 0
                                ? `${t('tripDetail.participantsAll')} (${tripMembersCount})`
                                : t('tripDetail.participantsNotSet');
                          return (
                            <>
                              <span className="flex items-center gap-1.5 shrink-0">
                                {participantIds.slice(0, 6).map((uid) => {
                                  const profile = memberProfiles[uid];
                                  const name =
                                    profile?.display_name?.trim() || uid.slice(0, 8) + '…';
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
                                          {(profile?.display_name || '?').charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                                {participantIds.length > 6 && (
                                  <span className="text-xs text-gray-400">
                                    +{participantIds.length - 6}
                                  </span>
                                )}
                              </span>
                              <span>{label}</span>
                            </>
                          );
                        })()}
                      </button>
                      {openParticipantsActivityId === activity.id && (
                        <div className="ml-6 mt-1 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {t('tripDetail.participantsList')}
                          </p>
                          <ul className="space-y-1.5">
                            {(() => {
                              const participantIds =
                                activityParticipantsMap[activity.id] != null &&
                                activityParticipantsMap[activity.id].length > 0
                                  ? activityParticipantsMap[activity.id]
                                  : tripMembers.map((m) => m.user_id);
                              return participantIds.map((uid) => {
                                const profile = memberProfiles[uid];
                                const name = profile?.display_name?.trim() || uid.slice(0, 8) + '…';
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
                                          {(profile?.display_name || '?').charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </span>
                                    <span>{name}</span>
                                  </li>
                                );
                              });
                            })()}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  {activity.organizer_notes?.trim() && (
                    <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
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
                      <div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2">
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
                  {/* Votes : seulement si pas encore validé par admin (status = proposed) */}
                  {activity.status === 'proposed' ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {upvotes - downvotes > 0 ? '+' : ''}
                        {upvotes - downvotes} {t('tripDetail.votesNet')}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVote(activity.id, 'up');
                          }}
                          disabled={votingActivityId === activity.id || !canVote}
                          aria-label={
                            userVote === 'up'
                              ? t('tripDetail.removeUpvote') || 'Remove upvote'
                              : t('tripDetail.upvote') || 'Upvote'
                          }
                          className={`p-2 rounded-lg transition ${
                            userVote === 'up'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <ThumbsUp
                            className={`w-5 h-5 ${votingActivityId === activity.id ? 'animate-pulse' : ''}`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVote(activity.id, 'down');
                          }}
                          disabled={votingActivityId === activity.id || !canVote}
                          aria-label={
                            userVote === 'down'
                              ? t('tripDetail.removeDownvote') || 'Remove downvote'
                              : t('tripDetail.downvote') || 'Downvote'
                          }
                          className={`p-2 rounded-lg transition ${
                            userVote === 'down'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <ThumbsDown
                            className={`w-5 h-5 ${votingActivityId === activity.id ? 'animate-pulse' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-medium">
                      {activity.status === 'confirmed' && (
                        <span className="text-green-600 dark:text-green-400">
                          {t('tripDetail.activityValidated')}
                        </span>
                      )}
                      {activity.status === 'rejected' && (
                        <span className="text-red-600 dark:text-red-400">
                          {t('tripDetail.activityRejected')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

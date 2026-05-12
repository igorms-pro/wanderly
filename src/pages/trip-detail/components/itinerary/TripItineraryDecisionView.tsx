import { CheckCircle2, CircleHelp, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';

import { useStore } from '@/lib/store';
import type { Activity } from '@/lib/types/database.types';
import {
  buildActivityDecisionSections,
  type ActivityDecision,
  type DecisionStatus,
} from './itinerary-decision-utils';
import { ProposedChangeBadge } from './ProposedChangeBadge';

const DECISION_ORDER: DecisionStatus[] = ['accepted', 'undecided', 'rejected'];

const SECTION_STYLES: Record<DecisionStatus, string> = {
  accepted:
    'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
  undecided:
    'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100',
  rejected:
    'border-red-200 bg-red-50/80 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100',
};

const BADGE_STYLES: Record<DecisionStatus, string> = {
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200',
  undecided: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
};

interface TripItineraryDecisionViewProps {
  sortedDates: string[];
  activitiesByDate: Record<string, Activity[]>;
  getVoteCounts: (activityId: string) => { upvotes: number; downvotes: number };
  t: (key: string) => string;
  searchQuery?: string;
}

export function TripItineraryDecisionView({
  sortedDates,
  activitiesByDate,
  getVoteCounts,
  t,
  searchQuery = '',
}: TripItineraryDecisionViewProps) {
  const sections = buildActivityDecisionSections({ activitiesByDate, sortedDates, getVoteCounts });
  const totalActivities = DECISION_ORDER.reduce((sum, status) => sum + sections[status].length, 0);

  if (totalActivities === 0) {
    const message = searchQuery.trim()
      ? t('tripDetail.searchNoResults')
      : t('tripDetail.decisionEmpty');

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label={t('tripDetail.decisionViewTitle')}>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
          {t('tripDetail.decisionViewTitle')}
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {t('tripDetail.decisionViewDescription')}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {DECISION_ORDER.map((status) => (
          <DecisionSection key={status} status={status} decisions={sections[status]} t={t} />
        ))}
      </div>
    </section>
  );
}

function DecisionSection({
  status,
  decisions,
  t,
}: {
  status: DecisionStatus;
  decisions: ActivityDecision[];
  t: (key: string) => string;
}) {
  const Icon = getSectionIcon(status);

  return (
    <section className={`rounded-2xl border p-4 ${SECTION_STYLES[status]}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" aria-hidden />
          <h3 className="text-base font-semibold">{t(`tripDetail.${status}Activities`)}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_STYLES[status]}`}>
          {decisions.length}
        </span>
      </div>

      {decisions.length === 0 ? (
        <p className="rounded-xl bg-white/60 p-3 text-sm dark:bg-gray-900/30">
          {t(`tripDetail.${status}ActivitiesEmpty`)}
        </p>
      ) : (
        <ul className="space-y-3">
          {decisions.map((decision) => (
            <DecisionCard key={decision.activity.id} decision={decision} t={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

function DecisionCard({ decision, t }: { decision: ActivityDecision; t: (key: string) => string }) {
  const tripLocked = useStore((s) => s.currentTrip?.status === 'locked');

  return (
    <li className="rounded-xl bg-white/80 p-3 shadow-sm dark:bg-gray-900/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <p className="truncate text-sm font-semibold">{decision.activity.title}</p>
            <ProposedChangeBadge
              visible={!!tripLocked && decision.activity.status === 'proposed'}
              t={t}
            />
          </div>
          <p className="mt-1 text-xs opacity-75">{formatDecisionDate(decision.date)}</p>
        </div>
        <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold dark:bg-gray-800">
          {decision.netVotes > 0 ? '+' : ''}
          {decision.netVotes}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs opacity-80">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          {decision.upvotes} {t('tripDetail.votesFor')}
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
          {decision.downvotes} {t('tripDetail.votesAgainst')}
        </span>
      </div>
    </li>
  );
}

function getSectionIcon(status: DecisionStatus): typeof CheckCircle2 {
  if (status === 'accepted') return CheckCircle2;
  if (status === 'rejected') return XCircle;
  return CircleHelp;
}

function formatDecisionDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

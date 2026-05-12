import type { Activity } from '@/lib/types/database.types';

export type ActivityVoteCounts = {
  upvotes: number;
  downvotes: number;
};

export type DecisionStatus = 'accepted' | 'rejected' | 'undecided';

export type ActivityDecision = {
  activity: Activity;
  date: string;
  status: DecisionStatus;
  upvotes: number;
  downvotes: number;
  netVotes: number;
};

export type ActivityDecisionSections = Record<DecisionStatus, ActivityDecision[]>;

const EMPTY_SECTIONS: ActivityDecisionSections = {
  accepted: [],
  rejected: [],
  undecided: [],
};

export function getDecisionStatus(
  activity: Activity,
  voteCounts: ActivityVoteCounts,
): DecisionStatus {
  if (activity.status === 'confirmed') return 'accepted';
  if (activity.status === 'rejected') return 'rejected';

  const netVotes = voteCounts.upvotes - voteCounts.downvotes;
  if (netVotes > 0) return 'accepted';
  if (netVotes < 0) return 'rejected';
  return 'undecided';
}

export function buildActivityDecisionSections({
  activitiesByDate,
  sortedDates,
  getVoteCounts,
}: {
  activitiesByDate: Record<string, Activity[]>;
  sortedDates: string[];
  getVoteCounts: (activityId: string) => ActivityVoteCounts;
}): ActivityDecisionSections {
  return sortedDates.reduce<ActivityDecisionSections>((sections, date) => {
    const activities = activitiesByDate[date] ?? [];

    for (const activity of activities) {
      const counts = getVoteCounts(activity.id);
      const status = getDecisionStatus(activity, counts);
      sections[status].push({
        activity,
        date,
        status,
        upvotes: counts.upvotes,
        downvotes: counts.downvotes,
        netVotes: counts.upvotes - counts.downvotes,
      });
    }

    return sections;
  }, cloneEmptySections());
}

function cloneEmptySections(): ActivityDecisionSections {
  return {
    accepted: [...EMPTY_SECTIONS.accepted],
    rejected: [...EMPTY_SECTIONS.rejected],
    undecided: [...EMPTY_SECTIONS.undecided],
  };
}

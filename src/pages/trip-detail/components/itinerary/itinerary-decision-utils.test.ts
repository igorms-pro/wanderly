import { describe, expect, it } from 'vitest';

import type { Activity } from '@/lib/types/database.types';
import { buildActivityDecisionSections, getDecisionStatus } from './itinerary-decision-utils';

function makeActivity(id: string, status: Activity['status'] = 'proposed'): Activity {
  return {
    id,
    trip_id: 'trip-1',
    title: id,
    description: '',
    category: 'sightseeing',
    status,
    source: 'manual',
    created_at: '2026-05-12T10:00:00Z',
  } as Activity;
}

describe('itinerary decision utils', () => {
  it('classifies proposed activities from net votes', () => {
    expect(getDecisionStatus(makeActivity('accepted'), { upvotes: 2, downvotes: 1 })).toBe(
      'accepted',
    );
    expect(getDecisionStatus(makeActivity('rejected'), { upvotes: 1, downvotes: 2 })).toBe(
      'rejected',
    );
    expect(getDecisionStatus(makeActivity('undecided'), { upvotes: 1, downvotes: 1 })).toBe(
      'undecided',
    );
  });

  it('treats confirmed and rejected activity statuses as explicit decisions', () => {
    expect(
      getDecisionStatus(makeActivity('confirmed', 'confirmed'), { upvotes: 0, downvotes: 3 }),
    ).toBe('accepted');
    expect(
      getDecisionStatus(makeActivity('rejected', 'rejected'), { upvotes: 3, downvotes: 0 }),
    ).toBe('rejected');
  });

  it('builds decision sections in itinerary order', () => {
    const accepted = makeActivity('accepted');
    const undecided = makeActivity('undecided');
    const rejected = makeActivity('rejected');

    const sections = buildActivityDecisionSections({
      sortedDates: ['2026-05-12', '2026-05-13'],
      activitiesByDate: {
        '2026-05-12': [accepted, undecided],
        '2026-05-13': [rejected],
      },
      getVoteCounts: (activityId) => {
        if (activityId === 'accepted') return { upvotes: 3, downvotes: 1 };
        if (activityId === 'rejected') return { upvotes: 1, downvotes: 2 };
        return { upvotes: 0, downvotes: 0 };
      },
    });

    expect(sections.accepted.map((decision) => decision.activity.id)).toEqual(['accepted']);
    expect(sections.undecided.map((decision) => decision.activity.id)).toEqual(['undecided']);
    expect(sections.rejected.map((decision) => decision.activity.id)).toEqual(['rejected']);
  });
});

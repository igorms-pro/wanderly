import { describe, expect, it } from 'vitest';

import type { Activity } from '@/lib/types/database.types';

import { buildItineraryMapModel, findDefaultMapDate } from './itineraryMapModel';

function activity(partial: Partial<Activity> & Pick<Activity, 'id' | 'title'>): Activity {
  return {
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    trip_id: 'trip-1',
    status: 'planned',
    source: 'human',
    ...partial,
  } as Activity;
}

describe('findDefaultMapDate', () => {
  it('returns first day with coordinates when available', () => {
    const sortedDates = ['2026-06-01', '2026-06-02'];
    const activitiesByDate = {
      '2026-06-01': [activity({ id: 'a1', title: 'A', lat: null, lon: null })],
      '2026-06-02': [activity({ id: 'a2', title: 'B', lat: 48.85, lon: 2.35 })],
    };

    expect(findDefaultMapDate(sortedDates, activitiesByDate)).toBe('2026-06-02');
  });

  it('falls back to first trip day when none have coordinates', () => {
    expect(findDefaultMapDate(['2026-06-03'], {})).toBe('2026-06-03');
  });
});

describe('buildItineraryMapModel', () => {
  it('orders stops by order_index and builds route polyline', () => {
    const model = buildItineraryMapModel('2026-06-01', [
      activity({ id: 'b', title: 'Second', order_index: 2, lat: 48.86, lon: 2.36 }),
      activity({ id: 'a', title: 'First', order_index: 1, lat: 48.85, lon: 2.35 }),
      activity({ id: 'c', title: 'No coords', order_index: 3, lat: null, lon: null }),
    ]);

    expect(model.kind).toBe('ready');
    if (model.kind !== 'ready') return;

    expect(model.stops.map((s) => s.activityId)).toEqual(['a', 'b']);
    expect(model.route).toEqual([
      [48.85, 2.35],
      [48.86, 2.36],
    ]);
  });

  it('returns no-coordinates when day has no lat/lon', () => {
    const model = buildItineraryMapModel('2026-06-01', [
      activity({ id: 'a', title: 'A', lat: null, lon: null }),
    ]);
    expect(model).toEqual({ kind: 'no-coordinates', date: '2026-06-01' });
  });
});

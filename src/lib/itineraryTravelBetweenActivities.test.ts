import { describe, it, expect } from 'vitest';

import type { Activity } from '@/lib/types/database.types';

import { getTravelBetweenActivities } from './itineraryTravelBetweenActivities';

const base: Activity = {
  id: 'a',
  trip_id: 't',
  title: 'A',
  description: null,
  category: null,
  status: 'confirmed',
  source: 'manual',
  created_at: '2024-01-01T00:00:00Z',
};

describe('getTravelBetweenActivities', () => {
  it('uses stored transport_duration_minutes on next activity', () => {
    const prev = { ...base, id: '1' };
    const next = {
      ...base,
      id: '2',
      transport_duration_minutes: 25,
    };
    expect(getTravelBetweenActivities(prev, next)).toEqual({
      kind: 'stored',
      minutes: 25,
    });
  });

  it('returns none when no duration and missing coordinates', () => {
    const prev = { ...base, id: '1' };
    const next = { ...base, id: '2', transport_duration_minutes: null };
    expect(getTravelBetweenActivities(prev, next)).toEqual({ kind: 'none' });
  });

  it('estimates from lat/lon when no stored duration', () => {
    const prev = {
      ...base,
      id: '1',
      lat: 48.8566,
      lon: 2.3522,
    };
    const next = {
      ...base,
      id: '2',
      lat: 48.8606,
      lon: 2.3376,
      transport_duration_minutes: null,
    };
    const r = getTravelBetweenActivities(prev, next);
    expect(r.kind).toBe('estimated');
    if (r.kind === 'estimated') {
      expect(r.minutes).toBeGreaterThanOrEqual(5);
      expect(r.minutes).toBeLessThanOrEqual(180);
    }
  });

  it('returns none for same spot (very short distance)', () => {
    const prev = { ...base, id: '1', lat: 48.86, lon: 2.35 };
    const next = {
      ...base,
      id: '2',
      lat: 48.86001,
      lon: 2.35001,
      transport_duration_minutes: null,
    };
    expect(getTravelBetweenActivities(prev, next)).toEqual({ kind: 'none' });
  });
});

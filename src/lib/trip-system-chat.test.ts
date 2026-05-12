import { describe, it, expect } from 'vitest';

import { parseTripSystemPayload } from './trip-system-chat';

describe('trip-system-chat', () => {
  it('parses trip_finalized payload', () => {
    const raw = JSON.stringify({ v: 1, kind: 'trip_finalized' });
    expect(parseTripSystemPayload(raw)).toEqual({ v: 1, kind: 'trip_finalized' });
  });

  it('parses activity_change payload', () => {
    const raw = JSON.stringify({
      v: 1,
      kind: 'activity_change',
      title: 'Museum',
      change: 'created',
    });
    expect(parseTripSystemPayload(raw)).toEqual({
      v: 1,
      kind: 'activity_change',
      title: 'Museum',
      change: 'created',
    });
  });

  it('returns null for invalid JSON', () => {
    expect(parseTripSystemPayload('not json')).toBeNull();
  });
});

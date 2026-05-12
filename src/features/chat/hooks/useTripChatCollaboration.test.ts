import { describe, it, expect } from 'vitest';

import { presenceStateToOnlineIds } from './useTripChatCollaboration';

describe('presenceStateToOnlineIds', () => {
  it('returns user ids from presence keys', () => {
    const state = {
      'user-a': [{ x: 1 }],
      'user-b': [{ x: 2 }],
    };
    expect([...presenceStateToOnlineIds(state)].sort()).toEqual(['user-a', 'user-b']);
  });

  it('returns empty set for empty state', () => {
    expect(presenceStateToOnlineIds({}).size).toBe(0);
  });
});

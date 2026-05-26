import { describe, expect, it } from 'vitest';
import {
  isValidOfflineActionType,
  shouldSkipFlush,
  sortOfflineQueueItems,
} from './offlineQueueHelpers';
import type { OfflineQueueItem } from './types';
import { OFFLINE_SYNC_TAG } from './types';

describe('offlineQueue helpers', () => {
  it('sorts queue items by createdAt ascending', () => {
    const items: OfflineQueueItem[] = [
      {
        id: '2',
        type: 'vote',
        payload: {},
        createdAt: '2026-05-26T12:00:00.000Z',
        attempts: 0,
      },
      {
        id: '1',
        type: 'chat_message',
        payload: {},
        createdAt: '2026-05-26T11:00:00.000Z',
        attempts: 0,
      },
    ];

    expect(sortOfflineQueueItems(items).map((item) => item.id)).toEqual(['1', '2']);
  });

  it('skips flush when offline or already flushing', () => {
    expect(shouldSkipFlush(false, false)).toBe(true);
    expect(shouldSkipFlush(true, true)).toBe(true);
    expect(shouldSkipFlush(true, false)).toBe(false);
  });

  it('validates supported offline action types', () => {
    expect(isValidOfflineActionType('chat_message')).toBe(true);
    expect(isValidOfflineActionType('vote')).toBe(true);
    expect(isValidOfflineActionType('expense')).toBe(false);
  });

  it('uses stable background sync tag', () => {
    expect(OFFLINE_SYNC_TAG).toBe('voyagely-offline-sync');
  });
});

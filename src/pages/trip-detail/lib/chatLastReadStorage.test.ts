import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  chatLastReadStorageKey,
  readChatLastReadIso,
  writeChatLastReadIso,
} from './chatLastReadStorage';

describe('chatLastReadStorage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('uses a stable key per trip and user', () => {
    expect(chatLastReadStorageKey('trip-1', 'user-2')).toBe(
      'voyagely:chatLastReadIso:trip-1:user-2',
    );
  });

  it('writes and reads ISO timestamps', () => {
    writeChatLastReadIso('t1', 'u1', '2026-05-01T12:00:00.000Z');
    expect(readChatLastReadIso('t1', 'u1')).toBe('2026-05-01T12:00:00.000Z');
  });

  it('returns null when getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(readChatLastReadIso('t', 'u')).toBeNull();
  });

  it('swallows setItem errors', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeChatLastReadIso('t', 'u', '2026-01-01T00:00:00.000Z')).not.toThrow();
  });
});

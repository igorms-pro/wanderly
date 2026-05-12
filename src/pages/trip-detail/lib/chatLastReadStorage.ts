const STORAGE_PREFIX = 'voyagely:chatLastReadIso:';

export function chatLastReadStorageKey(tripId: string, userId: string): string {
  return `${STORAGE_PREFIX}${tripId}:${userId}`;
}

export function readChatLastReadIso(tripId: string, userId: string): string | null {
  try {
    return localStorage.getItem(chatLastReadStorageKey(tripId, userId));
  } catch {
    return null;
  }
}

export function writeChatLastReadIso(tripId: string, userId: string, iso: string): void {
  try {
    localStorage.setItem(chatLastReadStorageKey(tripId, userId), iso);
  } catch {
    // Quota / private mode — unread UX degrades without throwing
  }
}

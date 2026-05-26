import type { OfflineQueueItem } from './types';

export function sortOfflineQueueItems(items: OfflineQueueItem[]): OfflineQueueItem[] {
  return [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function shouldSkipFlush(isOnline: boolean, flushInProgress: boolean): boolean {
  return flushInProgress || !isOnline;
}

export function isValidOfflineActionType(type: string): boolean {
  return type === 'chat_message' || type === 'vote';
}

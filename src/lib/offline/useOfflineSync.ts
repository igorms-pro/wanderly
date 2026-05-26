import { useEffect, useState } from 'react';
import {
  flushOfflineQueue,
  subscribeOfflineQueue,
  setupOfflineSyncListeners,
} from './offlineQueue';

export function useOfflineQueueCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    return subscribeOfflineQueue(setCount);
  }, []);

  return count;
}

export function useOfflineSync(onSynced?: () => void): { pendingCount: number } {
  const pendingCount = useOfflineQueueCount();

  useEffect(() => setupOfflineSyncListeners(onSynced), [onSynced]);

  useEffect(() => {
    if (navigator.onLine) {
      void flushOfflineQueue();
    }
  }, []);

  return { pendingCount };
}

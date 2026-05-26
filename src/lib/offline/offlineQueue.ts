import { v4 as uuidv4 } from 'uuid';
import { sendChatMessage } from '@/features/chat/hooks/tripChatApi';
import { supabase } from '@/lib/supabase';
import { deleteOfflineQueueItem, listOfflineQueueItems, putOfflineQueueItem } from './offlineDb';
import { shouldSkipFlush } from './offlineQueueHelpers';
import { isBrowserOnline } from './networkStatus';
import type { ChatMessagePayload, OfflineActionType, OfflineQueueItem, VotePayload } from './types';
import { OFFLINE_SYNC_TAG } from './types';

type ServiceWorkerRegistrationWithSync = ServiceWorkerRegistration & {
  readonly sync: { register(tag: string): Promise<void> };
};

type QueueListener = (count: number) => void;

const listeners = new Set<QueueListener>();
let flushInProgress = false;

function notifyListeners(count: number): void {
  listeners.forEach((listener) => listener(count));
}

export function subscribeOfflineQueue(listener: QueueListener): () => void {
  listeners.add(listener);
  void refreshQueueCount();
  return () => listeners.delete(listener);
}

export async function refreshQueueCount(): Promise<number> {
  const items = await listOfflineQueueItems();
  notifyListeners(items.length);
  return items.length;
}

async function registerBackgroundSync(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = (await navigator.serviceWorker.ready) as ServiceWorkerRegistrationWithSync;
    if ('sync' in registration) {
      await registration.sync.register(OFFLINE_SYNC_TAG);
    }
  } catch {
    // Background Sync is optional; online event still flushes the queue.
  }
}

export async function enqueueOfflineAction(
  type: OfflineActionType,
  payload: Record<string, unknown>,
): Promise<OfflineQueueItem> {
  const item: OfflineQueueItem = {
    id: uuidv4(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  await putOfflineQueueItem(item);
  await refreshQueueCount();
  await registerBackgroundSync();
  return item;
}

async function processChatMessage(item: OfflineQueueItem): Promise<void> {
  const payload = item.payload as ChatMessagePayload;
  await sendChatMessage(payload.tripId, payload.userId, payload.content, payload.clientMsgId);
}

async function processVote(item: OfflineQueueItem): Promise<void> {
  const payload = item.payload as VotePayload;
  const { error } = await supabase.from('votes').upsert(
    {
      activity_id: payload.activityId,
      user_id: payload.userId,
      choice: payload.choice,
    },
    { onConflict: 'activity_id,user_id' },
  );

  if (error) throw error;
}

async function processItem(item: OfflineQueueItem): Promise<void> {
  if (item.type === 'chat_message') {
    await processChatMessage(item);
    return;
  }
  if (item.type === 'vote') {
    await processVote(item);
    return;
  }
  throw new Error(`Unknown offline action: ${String(item.type)}`);
}

export async function flushOfflineQueue(): Promise<{ processed: number; failed: number }> {
  if (shouldSkipFlush(isBrowserOnline(), flushInProgress)) {
    return { processed: 0, failed: 0 };
  }

  flushInProgress = true;
  let processed = 0;
  let failed = 0;

  try {
    const items = await listOfflineQueueItems();

    for (const item of items) {
      try {
        await processItem(item);
        await deleteOfflineQueueItem(item.id);
        processed += 1;
      } catch {
        failed += 1;
        await putOfflineQueueItem({ ...item, attempts: item.attempts + 1 });
      }
    }
  } finally {
    flushInProgress = false;
    await refreshQueueCount();
  }

  return { processed, failed };
}

export async function queueChatMessage(
  tripId: string,
  userId: string,
  content: string,
  clientMsgId: string,
): Promise<OfflineQueueItem> {
  return enqueueOfflineAction('chat_message', {
    tripId,
    userId,
    content,
    clientMsgId,
  } satisfies ChatMessagePayload);
}

export async function queueVote(
  activityId: string,
  userId: string,
  choice: VotePayload['choice'],
): Promise<OfflineQueueItem> {
  return enqueueOfflineAction('vote', {
    activityId,
    userId,
    choice,
  } satisfies VotePayload);
}

export function setupOfflineSyncListeners(onFlush?: () => void): () => void {
  const handleOnline = () => {
    void flushOfflineQueue().then((result) => {
      if (result.processed > 0) onFlush?.();
    });
  };

  const handleSwMessage = (event: MessageEvent) => {
    if (event.data?.type !== 'VOYAGELY_FLUSH_OFFLINE_QUEUE') return;
    void flushOfflineQueue().then((result) => {
      if (result.processed > 0) onFlush?.();
    });
  };

  window.addEventListener('online', handleOnline);
  navigator.serviceWorker?.addEventListener('message', handleSwMessage);

  return () => {
    window.removeEventListener('online', handleOnline);
    navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
  };
}

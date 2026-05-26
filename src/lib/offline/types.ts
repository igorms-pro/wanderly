export type OfflineActionType = 'chat_message' | 'vote';

export type OfflineQueueItem = {
  id: string;
  type: OfflineActionType;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
};

export type ChatMessagePayload = {
  tripId: string;
  userId: string;
  content: string;
  clientMsgId: string;
};

export type VotePayload = {
  activityId: string;
  userId: string;
  choice: 'up' | 'down';
};

export const OFFLINE_SYNC_TAG = 'voyagely-offline-sync';
export const OFFLINE_DB_NAME = 'voyagely-offline';
export const OFFLINE_STORE_NAME = 'outbox';

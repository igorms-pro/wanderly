import type { OfflineQueueItem } from './types';
import { OFFLINE_DB_NAME, OFFLINE_STORE_NAME } from './types';

const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE_NAME)) {
        db.createObjectStore(OFFLINE_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open offline DB'));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(OFFLINE_STORE_NAME, mode);
        const store = tx.objectStore(OFFLINE_STORE_NAME);
        const request = fn(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error ?? new Error('Offline DB transaction failed'));

        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error ?? new Error('Offline DB transaction failed'));
      }),
  );
}

export async function listOfflineQueueItems(): Promise<OfflineQueueItem[]> {
  const items = await runTransaction('readonly', (store) => store.getAll());
  return (items as OfflineQueueItem[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function putOfflineQueueItem(item: OfflineQueueItem): Promise<void> {
  await runTransaction('readwrite', (store) => store.put(item));
}

export async function deleteOfflineQueueItem(id: string): Promise<void> {
  await runTransaction('readwrite', (store) => store.delete(id));
}

export async function countOfflineQueueItems(): Promise<number> {
  const items = await listOfflineQueueItems();
  return items.length;
}

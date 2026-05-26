/* Background sync bridge — notifies open clients to flush the IndexedDB outbox. */
var SYNC_TAG = 'voyagely-offline-sync';

self.addEventListener('sync', function (event) {
  if (event.tag !== SYNC_TAG) return;
  event.waitUntil(notifyClientsToFlush());
});

function notifyClientsToFlush() {
  return self.clients
    .matchAll({ type: 'window', includeUncontrolled: true })
    .then(function (clients) {
      clients.forEach(function (client) {
        client.postMessage({ type: 'VOYAGELY_FLUSH_OFFLINE_QUEUE' });
      });
    });
}

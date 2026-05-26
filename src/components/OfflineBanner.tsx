import { useTranslation } from 'react-i18next';
import { WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNetworkStatus } from '@/lib/offline/networkStatus';
import { flushOfflineQueue } from '@/lib/offline/offlineQueue';
import { useOfflineQueueCount } from '@/lib/offline/useOfflineSync';
import { useState } from 'react';

export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOnline } = useNetworkStatus();
  const pendingCount = useOfflineQueueCount();
  const [syncing, setSyncing] = useState(false);

  if (isOnline && pendingCount === 0) return null;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await flushOfflineQueue();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/80 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {isOnline ? (
            <RefreshCw className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <p className="truncate">
            {!isOnline
              ? t('offline.bannerOffline')
              : t('offline.bannerPending', { count: pendingCount })}
          </p>
        </div>
        {isOnline && pendingCount > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={syncing}
            onClick={() => void handleSync()}
            aria-label={t('offline.syncNow')}
            className="shrink-0 border-amber-300 bg-white/80 dark:border-amber-800 dark:bg-stone-900/80"
          >
            <CloudOff className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {syncing ? t('offline.syncing') : t('offline.syncNow')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

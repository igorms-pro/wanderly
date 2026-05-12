import { useTranslation } from 'react-i18next';

import type { TripChatMemberPresence } from '../hooks/useTripChatCollaboration';

interface TripChatHeaderProps {
  onlineCount: number;
  memberPresenceRows: TripChatMemberPresence[];
  typingText: string | null;
}

export function TripChatHeader({
  onlineCount,
  memberPresenceRows,
  typingText,
}: TripChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {t('chat.tripChatTitle')}
      </h3>
      {typingText ? (
        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400" aria-live="polite">
          {typingText}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t('chat.tripChatSubtitle')}</p>
      <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {t('chat.onlineCount', { count: onlineCount })}
      </p>
      {memberPresenceRows.length > 0 ? (
        <ul
          className="mt-2 flex max-h-16 flex-wrap gap-2 overflow-y-auto"
          aria-label={t('chat.memberPresenceListLabel')}
        >
          {memberPresenceRows.map((m) => (
            <li
              key={m.userId}
              className="inline-flex max-w-[140px] items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  m.isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-500'
                }`}
                aria-hidden
              />
              <span className="truncate">{m.displayName}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

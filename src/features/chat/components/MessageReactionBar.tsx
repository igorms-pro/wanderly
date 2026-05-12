import { useTranslation } from 'react-i18next';

import { CHAT_REACTION_EMOJIS, type ReactionSummary } from '../hooks/useTripChatReactions';

interface MessageReactionBarProps {
  messageId: string;
  summaries: ReactionSummary[] | undefined;
  onToggle: (messageId: string, emoji: string) => void;
}

export function MessageReactionBar({ messageId, summaries, onToggle }: MessageReactionBarProps) {
  const { t } = useTranslation();

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {CHAT_REACTION_EMOJIS.map((emoji) => {
        const row = summaries?.find((s) => s.emoji === emoji);
        const count = row?.count ?? 0;
        const active = row?.self ?? false;
        const label = t('chat.reactionToggle', { emoji });
        return (
          <button
            key={emoji}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onToggle(messageId, emoji)}
            className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-xs transition min-h-[32px] ${
              active
                ? 'border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            <span aria-hidden>{emoji}</span>
            {count > 0 ? <span className="tabular-nums">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

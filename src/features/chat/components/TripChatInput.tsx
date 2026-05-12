import { FormEvent, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { MentionableMember } from '../lib/mentionSlugs';

interface TripChatInputProps {
  messageText: string;
  sending: boolean;
  mentionableMembers: MentionableMember[];
  onChangeMessageText: (value: string) => void;
  onDraftActivity?: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

function parseTrailingMention(text: string): { start: number; query: string } | null {
  const m = text.match(/@([^\s@]*)$/);
  if (!m || m.index === undefined) return null;
  return { start: m.index, query: (m[1] ?? '').toLowerCase() };
}

export function TripChatInput({
  messageText,
  sending,
  mentionableMembers,
  onChangeMessageText,
  onDraftActivity,
  onSubmit,
}: TripChatInputProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const mentionCtx = useMemo(() => parseTrailingMention(messageText), [messageText]);

  const filteredMentions = useMemo(() => {
    if (!mentionCtx) return [];
    const q = mentionCtx.query;
    return mentionableMembers.filter(
      (m) => m.slug.startsWith(q) || m.label.toLowerCase().includes(q),
    );
  }, [mentionCtx, mentionableMembers]);

  const mentionOpen = Boolean(mentionCtx) && filteredMentions.length > 0;

  const applyMention = (member: MentionableMember): void => {
    if (!mentionCtx) return;
    const before = messageText.slice(0, mentionCtx.start);
    const next = `${before}@${member.slug} `;
    onChangeMessageText(next);
    setActiveIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (!mentionOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredMentions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredMentions.length > 0) {
      e.preventDefault();
      applyMention(filteredMentions[activeIndex] ?? filteredMentions[0]!);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (mentionCtx) {
        const before = messageText.slice(0, mentionCtx.start);
        onChangeMessageText(before);
      }
    }
  };

  return (
    <div ref={rootRef} className="relative border-t border-gray-200 p-4 dark:border-gray-700">
      {mentionOpen ? (
        <ul
          className="absolute bottom-full left-4 right-4 mb-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 z-10"
          role="listbox"
          aria-label={t('chat.mentionSuggestions')}
        >
          {filteredMentions.map((m, idx) => (
            <li key={m.userId} role="option" aria-selected={idx === activeIndex}>
              <button
                type="button"
                className={`flex w-full px-3 py-2 text-left text-sm ${
                  idx === activeIndex
                    ? 'bg-orange-50 dark:bg-orange-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  applyMention(m);
                }}
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">{m.label}</span>
                <span className="ml-2 text-xs text-gray-500">@{m.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form onSubmit={onSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => {
            const v = e.target.value;
            onChangeMessageText(v);
            onDraftActivity?.(v);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.messagePlaceholder')}
          disabled={sending}
          aria-label={t('chat.messagePlaceholder')}
          autoComplete="off"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={sending || !messageText.trim()}
          aria-label={t('chat.send')}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}

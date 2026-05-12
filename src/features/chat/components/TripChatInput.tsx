import { FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TripChatInputProps {
  messageText: string;
  sending: boolean;
  onChangeMessageText: (value: string) => void;
  onDraftActivity?: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function TripChatInput({
  messageText,
  sending,
  onChangeMessageText,
  onDraftActivity,
  onSubmit,
}: TripChatInputProps) {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-200 p-4 dark:border-gray-700">
      <form onSubmit={onSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => {
            const v = e.target.value;
            onChangeMessageText(v);
            onDraftActivity?.(v);
          }}
          placeholder={t('chat.messagePlaceholder')}
          disabled={sending}
          aria-label={t('chat.messagePlaceholder')}
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

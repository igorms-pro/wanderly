import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { parseTripSystemPayload } from '@/lib/trip-system-chat';

import type { MessageWithProfile } from '../hooks/useTripChat';
import type { ReactionSummary } from '../hooks/useTripChatReactions';
import { SystemChatNotice } from './SystemChatNotice';
import { TripChatUserMessageRow } from './TripChatUserMessageRow';

interface TripChatMessageListProps {
  messages: MessageWithProfile[];
  onlineUserIds?: Set<string>;
  currentUserId?: string;
  mentionSlugToLabel: Map<string, string>;
  reactionsByMessageId: Map<string, ReactionSummary[]>;
  onToggleReaction: (messageId: string, emoji: string) => void;
  editingMessageId: string | null;
  editText: string;
  onChangeEditText: (value: string) => void;
  onStartEdit: (message: MessageWithProfile) => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  canEditMessage: (message: MessageWithProfile) => boolean;
  canDeleteMessage: (message: MessageWithProfile) => boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function TripChatMessageList({
  messages,
  onlineUserIds,
  currentUserId,
  mentionSlugToLabel,
  reactionsByMessageId,
  onToggleReaction,
  editingMessageId,
  editText,
  onChangeEditText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  canEditMessage,
  canDeleteMessage,
  messagesEndRef,
}: TripChatMessageListProps) {
  const { t } = useTranslation();

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('chat.noMessagesYet')}</p>
        </div>
        <div ref={messagesEndRef} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => {
        if (message.message_type === 'system') {
          const payload = parseTripSystemPayload(message.content);
          if (payload) {
            return (
              <div key={message.id} className="w-full">
                <SystemChatNotice payload={payload} />
                <p className="text-center text-xs text-gray-400 mt-1">
                  {format(new Date(message.created_at), 'h:mm a')}
                </p>
              </div>
            );
          }
          return (
            <div key={message.id} className="w-full text-center text-sm text-gray-500 py-2">
              {message.content}
            </div>
          );
        }

        return (
          <TripChatUserMessageRow
            key={message.id}
            message={message}
            onlineUserIds={onlineUserIds}
            currentUserId={currentUserId}
            mentionSlugToLabel={mentionSlugToLabel}
            reactionsByMessageId={reactionsByMessageId}
            onToggleReaction={onToggleReaction}
            editingMessageId={editingMessageId}
            editText={editText}
            onChangeEditText={onChangeEditText}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onDelete={onDelete}
            canEditMessage={canEditMessage}
            canDeleteMessage={canDeleteMessage}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

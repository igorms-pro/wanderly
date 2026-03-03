import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MessageWithProfile } from '../hooks/useTripChat';

interface TripChatMessageListProps {
  messages: MessageWithProfile[];
  currentUserId?: string;
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
  currentUserId,
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
        const isOwnMessage = message.user_id === currentUserId;
        const isEditing = editingMessageId === message.id;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
          >
            <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
              {!isOwnMessage && (
                <div className="flex items-center mb-1">
                  <img
                    src={
                      message.sender_avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user_id}`
                    }
                    alt={t('chat.avatarAlt')}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {message.sender_name || t('chat.unknownUser')}
                  </span>
                </div>
              )}
              <div className="relative">
                {isEditing ? (
                  <div className="bg-white border-2 border-blue-500 rounded-2xl p-3">
                    <textarea
                      value={editText}
                      onChange={(e) => onChangeEditText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => onSaveEdit(message.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        {t('common.save')}
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <div
                      className={`flex items-center gap-2 mt-1 ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <p className="text-xs text-gray-500">
                        {format(new Date(message.created_at), 'h:mm a')}
                      </p>
                      {(canEditMessage(message) || canDeleteMessage(message)) && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          {canEditMessage(message) && (
                            <button
                              onClick={() => onStartEdit(message)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition"
                              title={t('chat.editMessage')}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          {canDeleteMessage(message) && (
                            <button
                              onClick={() => onDelete(message.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition"
                              title={t('chat.deleteMessage')}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

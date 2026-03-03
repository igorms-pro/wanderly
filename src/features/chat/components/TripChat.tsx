import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTripChat } from '../hooks/useTripChat';
import { TripChatHeader } from './TripChatHeader';
import { TripChatMessageList } from './TripChatMessageList';
import { TripChatInput } from './TripChatInput';

interface TripChatProps {
  tripId: string;
  userRole?: 'owner' | 'editor' | 'viewer' | 'moderator' | null;
}

export default function TripChat({ tripId, userRole }: TripChatProps) {
  const { t } = useTranslation();
  const {
    loading,
    sending,
    editingMessageId,
    editText,
    messageText,
    messagesWithProfiles,
    messagesEndRef,
    setMessageText,
    setEditText,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDelete,
    canEditMessage,
    canDeleteMessage,
    user,
  } = useTripChat({ tripId, userRole });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600">{t('chat.loadingChat')}</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
      style={{ height: '600px' }}
    >
      <TripChatHeader />
      <TripChatMessageList
        messages={messagesWithProfiles}
        currentUserId={user?.id}
        editingMessageId={editingMessageId}
        editText={editText}
        onChangeEditText={setEditText}
        onStartEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        onDelete={handleDelete}
        canEditMessage={canEditMessage}
        canDeleteMessage={canDeleteMessage}
        messagesEndRef={messagesEndRef}
      />
      <TripChatInput
        messageText={messageText}
        sending={sending}
        onChangeMessageText={setMessageText}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

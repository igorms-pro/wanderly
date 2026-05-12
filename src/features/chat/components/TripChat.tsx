import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { TripMember } from '@/lib/types/database.types';

import { useTripChat } from '../hooks/useTripChat';
import { useTripChatCollaboration } from '../hooks/useTripChatCollaboration';
import type { MemberProfileLite } from '../hooks/useTripChatCollaboration';
import { useTripChatReactions } from '../hooks/useTripChatReactions';
import { buildMentionableMembers } from '../lib/mentionSlugs';
import { TripChatHeader } from './TripChatHeader';
import { TripChatMessageList } from './TripChatMessageList';
import { TripChatInput } from './TripChatInput';

interface TripChatProps {
  tripId: string;
  userRole?: 'owner' | 'editor' | 'viewer' | 'moderator' | null;
  tripMembers?: TripMember[];
  memberProfiles?: MemberProfileLite;
}

export default function TripChat({
  tripId,
  userRole,
  tripMembers = [],
  memberProfiles = {},
}: TripChatProps) {
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

  const mentionableMembers = useMemo(
    () => buildMentionableMembers(tripMembers, memberProfiles),
    [tripMembers, memberProfiles],
  );

  const mentionSlugToLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const row of mentionableMembers) {
      m.set(row.slug.toLowerCase(), row.label);
    }
    return m;
  }, [mentionableMembers]);

  const { reactionsByMessageId, toggleReaction } = useTripChatReactions(tripId, user?.id);

  const displayName = user?.display_name?.trim() || user?.email?.split('@')[0]?.trim() || 'Member';

  const { onlineUserIds, onlineCount, memberPresenceRows, typingText, notifyTyping } =
    useTripChatCollaboration({
      tripId,
      userId: user?.id,
      userDisplayName: displayName,
      tripMembers,
      memberProfiles,
    });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">{t('chat.loadingChat')}</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
      style={{ height: '600px' }}
    >
      <TripChatHeader
        onlineCount={onlineCount}
        memberPresenceRows={memberPresenceRows}
        typingText={typingText}
      />
      <TripChatMessageList
        messages={messagesWithProfiles}
        onlineUserIds={onlineUserIds}
        currentUserId={user?.id}
        mentionSlugToLabel={mentionSlugToLabel}
        reactionsByMessageId={reactionsByMessageId}
        onToggleReaction={toggleReaction}
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
        mentionableMembers={mentionableMembers}
        onChangeMessageText={setMessageText}
        onDraftActivity={notifyTyping}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

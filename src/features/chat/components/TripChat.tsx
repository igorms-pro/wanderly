import { useEffect, useState, useRef, FormEvent, useCallback } from 'react';
import { useStore } from '@/lib/store';
import type { Message } from '@/lib/types/database.types';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

interface MessageWithProfile extends Message {
  sender_name?: string;
  sender_avatar?: string;
}

interface TripChatProps {
  tripId: string;
  userRole?: 'owner' | 'editor' | 'viewer' | 'moderator' | null;
}

export default function TripChat({ tripId, userRole }: TripChatProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messagesWithProfiles, setMessagesWithProfiles] = useState<MessageWithProfile[]>([]);
  const [userProfiles, setUserProfiles] = useState<
    Record<string, { name: string; avatar: string }>
  >({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const setMessages = useStore((state) => state.setMessages);
  const addMessage = useStore((state) => state.addMessage);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);

      // Load messages from Supabase
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', tripId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        throw messagesError;
      }

      // Map to Message format
      const mappedMessages: Message[] = (messagesData || []).map((m) => ({
        id: m.id,
        trip_id: m.trip_id,
        user_id: m.user_id || '',
        content: m.content,
        message_type: m.message_type,
        created_at: m.created_at,
      }));

      setMessages(mappedMessages);

      // Load user profiles for all message senders
      const userIds = [...new Set(mappedMessages.map((m) => m.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', userIds);

        if (!profilesError && profiles) {
          const profilesMap: Record<string, { name: string; avatar: string }> = {};
          ((profiles || []) as any[]).forEach((profile: any) => {
            profilesMap[profile.id] = {
              name: profile.display_name || profile.id.substring(0, 8),
              avatar:
                profile.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
            };
          });
          setUserProfiles(profilesMap);

          // Merge messages with profiles
          const messagesWithProfilesData: MessageWithProfile[] = mappedMessages.map((msg) => ({
            ...msg,
            sender_name: msg.user_id ? profilesMap[msg.user_id]?.name : 'Unknown',
            sender_avatar: msg.user_id ? profilesMap[msg.user_id]?.avatar : undefined,
          }));
          setMessagesWithProfiles(messagesWithProfilesData);
        } else {
          setMessagesWithProfiles(mappedMessages);
        }
      } else {
        setMessagesWithProfiles(mappedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [tripId, setMessages]);

  const setupRealtimeSubscription = useCallback(() => {
    // Remove existing subscription if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel for this trip's messages
    const channel = supabase
      .channel(`trip:${tripId}:messages`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`,
        },
        async (payload) => {
          // Reload messages when changes occur
          await loadMessages();
        },
      )
      .subscribe();

    channelRef.current = channel;
  }, [tripId, loadMessages]);

  // Load messages and user profiles
  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();

    return () => {
      // Cleanup subscription on unmount
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [tripId, loadMessages, setupRealtimeSubscription]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesWithProfiles]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    setSending(true);
    const text = messageText;
    setMessageText('');

    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          trip_id: tripId,
          user_id: user.id,
          content: text,
          message_type: 'text',
        } as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (message) {
        const messageData = message as any;
        const mappedMessage: Message = {
          id: messageData.id,
          trip_id: messageData.trip_id,
          user_id: messageData.user_id || '',
          content: messageData.content,
          message_type: messageData.message_type,
          created_at: messageData.created_at,
        };
        addMessage(mappedMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(text); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleEdit = (message: MessageWithProfile) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editText.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        // @ts-expect-error - Supabase type inference issue
        .update({ content: editText, updated_at: new Date().toISOString() } as any)
        .eq('id', messageId)
        .eq('user_id', user.id); // Ensure user can only edit their own messages

      if (error) {
        throw error;
      }

      // Update local state
      const updatedMessages = messagesWithProfiles.map((msg) =>
        msg.id === messageId ? { ...msg, content: editText } : msg,
      );
      setMessagesWithProfiles(updatedMessages);

      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating message:', error);
      alert(t('errors.failedToUpdateMessage'));
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!user) return;
    if (!confirm(t('chat.confirmDeleteMessage'))) return;

    try {
      // Check if user is moderator or owner
      const canDeleteAny = userRole === 'moderator' || userRole === 'owner';

      const { error } = await supabase
        .from('messages')
        // @ts-expect-error - Supabase type inference issue
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', messageId)
        .eq(canDeleteAny ? 'trip_id' : 'user_id', canDeleteAny ? tripId : user.id);

      if (error) {
        throw error;
      }

      // Reload messages to reflect deletion
      await loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(t('errors.failedToDeleteMessage'));
    }
  };

  const canEditMessage = (message: MessageWithProfile): boolean => {
    if (!user) return false;
    return message.user_id === user.id;
  };

  const canDeleteMessage = (message: MessageWithProfile): boolean => {
    if (!user) return false;
    // Users can delete their own messages, moderators/owners can delete any
    return message.user_id === user.id || userRole === 'moderator' || userRole === 'owner';
  };

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
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{t('chat.tripChatTitle')}</h3>
        <p className="text-sm text-gray-600">{t('chat.tripChatSubtitle')}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messagesWithProfiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('chat.noMessagesYet')}</p>
          </div>
        ) : (
          messagesWithProfiles.map((message) => {
            const isOwnMessage = message.user_id === user?.id;
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
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEdit(message.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            {t('common.save')}
                          </button>
                          <button
                            onClick={handleCancelEdit}
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
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <p className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'h:mm a')}
                          </p>
                          {(canEditMessage(message) || canDeleteMessage(message)) && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                              {canEditMessage(message) && (
                                <button
                                  onClick={() => handleEdit(message)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition"
                                  title={t('chat.editMessage')}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                              {canDeleteMessage(message) && (
                                <button
                                  onClick={() => handleDelete(message.id)}
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={t('chat.messagePlaceholder')}
            disabled={sending}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import type { Message } from '@/lib/types/database.types';

export interface MessageWithProfile extends Message {
  sender_name?: string;
  sender_avatar?: string;
}

export interface UseTripChatOptions {
  tripId: string;
  userRole?: 'owner' | 'editor' | 'viewer' | 'moderator' | null;
}

export function useTripChat({ tripId, userRole }: UseTripChatOptions) {
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const setMessages = useStore((state) => state.setMessages);
  const addMessage = useStore((state) => state.addMessage);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);

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

      const mappedMessages: Message[] = (messagesData || []).map((m) => ({
        id: m.id,
        trip_id: m.trip_id,
        user_id: m.user_id || '',
        content: m.content,
        message_type: m.message_type,
        created_at: m.created_at,
      }));

      setMessages(mappedMessages);

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
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

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
        async () => {
          await loadMessages();
        },
      )
      .subscribe();

    channelRef.current = channel;
  }, [tripId, loadMessages]);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();

    return () => {
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
      setMessageText(text);
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
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

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
    return message.user_id === user.id || userRole === 'moderator' || userRole === 'owner';
  };

  return {
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
  };
}

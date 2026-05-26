import { useCallback, useEffect, useRef, useState, FormEvent } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import type { Message } from '@/lib/types/database.types';
import {
  fetchMessagesWithProfiles,
  sendChatMessage,
  updateChatMessage,
  softDeleteChatMessage,
  type UserProfilesMap,
} from './tripChatApi';

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
  const [, setUserProfiles] = useState<UserProfilesMap>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const user = useStore((state) => state.user);
  const setMessages = useStore((state) => state.setMessages);
  const addMessage = useStore((state) => state.addMessage);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const {
        messages,
        profiles,
        messagesWithProfiles: enriched,
      } = await fetchMessagesWithProfiles(tripId);
      setMessages(messages);
      setUserProfiles(profiles);
      setMessagesWithProfiles(enriched);
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

    channelRef.current = supabase
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
      const message = await sendChatMessage(tripId, user.id, text);
      addMessage(message);
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
      await updateChatMessage(messageId, user.id, editText);
      setMessagesWithProfiles((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: editText } : msg)),
      );
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
      await softDeleteChatMessage(messageId, tripId, user.id, canDeleteAny);
      await loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      alert(t('errors.failedToDeleteMessage'));
    }
  };

  const canEditMessage = (message: MessageWithProfile): boolean => {
    if (!user) return false;
    if (message.message_type === 'system') return false;
    return message.user_id === user.id;
  };

  const canDeleteMessage = (message: MessageWithProfile): boolean => {
    if (!user) return false;
    if (message.message_type === 'system') return false;
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

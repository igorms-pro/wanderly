import { supabase } from '@/lib/supabase';
import type { Message, Profile } from '@/lib/types/database.types';
import type { MessageWithProfile } from './useTripChat';

export type UserProfilesMap = Record<string, { name: string; avatar: string }>;

export interface FetchMessagesResult {
  messages: Message[];
  profiles: UserProfilesMap;
  messagesWithProfiles: MessageWithProfile[];
}

export async function fetchMessagesWithProfiles(tripId: string): Promise<FetchMessagesResult> {
  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .eq('trip_id', tripId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (messagesError) throw messagesError;

  const messages: Message[] = (messagesData || []).map((m) => ({
    id: m.id,
    trip_id: m.trip_id,
    user_id: m.user_id || '',
    content: m.content,
    message_type: m.message_type,
    created_at: m.created_at,
  }));

  const userIds = [...new Set(messages.map((m) => m.user_id).filter(Boolean))];
  if (userIds.length === 0) {
    return { messages, profiles: {}, messagesWithProfiles: messages };
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', userIds);

  if (profilesError || !profilesData) {
    return { messages, profiles: {}, messagesWithProfiles: messages };
  }

  const profiles: UserProfilesMap = {};
  const rows = profilesData as Pick<Profile, 'id' | 'display_name' | 'avatar_url'>[];
  rows.forEach((profile) => {
    profiles[profile.id] = {
      name: profile.display_name || profile.id.substring(0, 8),
      avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
    };
  });

  const messagesWithProfiles: MessageWithProfile[] = messages.map((msg) => ({
    ...msg,
    sender_name: msg.user_id ? profiles[msg.user_id]?.name : 'Unknown',
    sender_avatar: msg.user_id ? profiles[msg.user_id]?.avatar : undefined,
  }));

  return { messages, profiles, messagesWithProfiles };
}

export async function sendChatMessage(
  tripId: string,
  userId: string,
  text: string,
): Promise<Message> {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      trip_id: tripId,
      user_id: userId,
      content: text,
      message_type: 'text',
    })
    .select()
    .single();

  if (error) throw error;
  if (!message) throw error;

  return {
    id: message.id,
    trip_id: message.trip_id,
    user_id: message.user_id || '',
    content: message.content,
    message_type: message.message_type,
    created_at: message.created_at,
  };
}

export async function updateChatMessage(
  messageId: string,
  userId: string,
  content: string,
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function softDeleteChatMessage(
  messageId: string,
  tripId: string,
  userId: string,
  canDeleteAny: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq(canDeleteAny ? 'trip_id' : 'user_id', canDeleteAny ? tripId : userId);

  if (error) throw error;
}

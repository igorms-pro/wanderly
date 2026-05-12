import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';

import { supabase } from '@/lib/supabase';

export type TripMemberLite = { user_id: string; removed_at?: string | null };

export type MemberProfileLite = Record<
  string,
  { display_name: string | null; avatar_url?: string | null }
>;

export interface TripChatMemberPresence {
  userId: string;
  displayName: string;
  isOnline: boolean;
}

export function presenceStateToOnlineIds(state: Record<string, unknown[]>): Set<string> {
  return new Set(Object.keys(state));
}

export interface UseTripChatCollaborationOptions {
  tripId: string;
  userId: string | undefined;
  userDisplayName: string;
  tripMembers: TripMemberLite[];
  memberProfiles: MemberProfileLite;
}

export function useTripChatCollaboration({
  tripId,
  userId,
  userDisplayName,
  tripMembers,
  memberProfiles,
}: UseTripChatCollaborationOptions) {
  const { t } = useTranslation();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(() => new Set());
  const [typingByUserId, setTypingByUserId] = useState<Map<string, string>>(() => new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingRecvTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearRecvTimer = useCallback((uid: string) => {
    const existing = typingRecvTimersRef.current.get(uid);
    if (existing) clearTimeout(existing);
    typingRecvTimersRef.current.delete(uid);
  }, []);

  const markRemoteTyping = useCallback(
    (uid: string, name: string) => {
      setTypingByUserId((prev) => new Map(prev).set(uid, name));
      clearRecvTimer(uid);
      const timer = setTimeout(() => {
        setTypingByUserId((prev) => {
          const next = new Map(prev);
          next.delete(uid);
          return next;
        });
        typingRecvTimersRef.current.delete(uid);
      }, 3000);
      typingRecvTimersRef.current.set(uid, timer);
    },
    [clearRecvTimer],
  );

  useEffect(() => {
    if (!tripId || !userId) return;

    const channel = supabase.channel(`trip:${tripId}:chat-collab`, {
      config: {
        presence: { key: userId },
        broadcast: { self: false },
      },
    });

    const syncPresence = () => {
      const state = channel.presenceState() as Record<string, unknown[]>;
      setOnlineUserIds(presenceStateToOnlineIds(state));
    };

    channel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const p = payload as { user_id?: string; name?: string };
        if (!p?.user_id || p.user_id === userId) return;
        markRemoteTyping(p.user_id, p.name?.trim() || p.user_id.slice(0, 8));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, name: userDisplayName });
        }
      });

    channelRef.current = channel;

    const recvTimersRef = typingRecvTimersRef;

    return () => {
      if (typingSendTimerRef.current) clearTimeout(typingSendTimerRef.current);
      const recvTimers = recvTimersRef.current;
      recvTimers.forEach((tm) => clearTimeout(tm));
      recvTimers.clear();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [tripId, userId, userDisplayName, markRemoteTyping]);

  const notifyTyping = useCallback(
    (draftText: string) => {
      if (!userId) return;
      const ch = channelRef.current;
      if (!ch) return;
      if (typingSendTimerRef.current) clearTimeout(typingSendTimerRef.current);
      if (!draftText.trim()) return;
      typingSendTimerRef.current = setTimeout(() => {
        void ch.send({
          type: 'broadcast',
          event: 'typing',
          payload: { user_id: userId, name: userDisplayName },
        });
      }, 450);
    },
    [userId, userDisplayName],
  );

  const memberPresenceRows = useMemo((): TripChatMemberPresence[] => {
    return tripMembers
      .filter((m) => !m.removed_at)
      .map((m) => ({
        userId: m.user_id,
        displayName: memberProfiles[m.user_id]?.display_name?.trim() || m.user_id.slice(0, 8),
        isOnline: onlineUserIds.has(m.user_id),
      }));
  }, [tripMembers, memberProfiles, onlineUserIds]);

  const onlineCount = onlineUserIds.size;

  const typingText = useMemo(() => {
    const names = [...typingByUserId.values()];
    if (names.length === 0) return null;
    if (names.length === 1) return t('chat.userTyping', { name: names[0] });
    return t('chat.usersTyping', { names: names.join(', ') });
  }, [typingByUserId, t]);

  return {
    onlineUserIds,
    onlineCount,
    memberPresenceRows,
    typingText,
    notifyTyping,
  };
}

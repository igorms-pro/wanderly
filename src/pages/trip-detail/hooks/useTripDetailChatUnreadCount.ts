import * as Sentry from '@sentry/react';
import { useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';

import { readChatLastReadIso, writeChatLastReadIso } from '../lib/chatLastReadStorage';

const UNREAD_CAP = 999;

type TripDetailTab = 'itinerary' | 'expenses' | 'chat' | 'weather' | 'explore';

export function useTripDetailChatUnreadCount(
  tripId: string | undefined,
  userId: string | undefined,
  activeTab: TripDetailTab,
): number {
  const [unreadCount, setUnreadCount] = useState(0);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  useEffect(() => {
    if (activeTab !== 'chat' || !tripId || !userId) return;
    setUnreadCount(0);
    writeChatLastReadIso(tripId, userId, new Date().toISOString());
  }, [activeTab, tripId, userId]);

  useEffect(() => {
    if (!tripId || !userId) {
      setUnreadCount(0);
      return;
    }
    if (activeTab === 'chat') return;

    let cancelled = false;
    const run = async (): Promise<void> => {
      const lastRead = readChatLastReadIso(tripId, userId) ?? '1970-01-01T00:00:00.000Z';
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('trip_id', tripId)
        .is('deleted_at', null)
        .gt('created_at', lastRead)
        .or(`user_id.is.null,user_id.neq.${userId}`);

      if (cancelled) return;
      if (error) {
        Sentry.captureException(error, {
          tags: { feature: 'trip-chat-unread' },
          extra: { tripId },
        });
        setUnreadCount(0);
        return;
      }
      setUnreadCount(Math.min(count ?? 0, UNREAD_CAP));
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [tripId, userId, activeTab]);

  useEffect(() => {
    if (!tripId || !userId) return;

    const channel = supabase
      .channel(`trip:${tripId}:chat-unread-tab`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const row = payload.new as { user_id?: string | null };
          if (activeTabRef.current === 'chat') return;
          if (row.user_id === userId) return;
          setUnreadCount((n) => Math.min(n + 1, UNREAD_CAP));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tripId, userId]);

  return unreadCount;
}

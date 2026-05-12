import * as Sentry from '@sentry/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export const CHAT_REACTION_EMOJIS = ['👍', '👎', '❤️', '😂'] as const;
export type ChatReactionEmoji = (typeof CHAT_REACTION_EMOJIS)[number];

export type MessageReactionRow = {
  id: string;
  trip_id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

export type ReactionSummary = {
  emoji: string;
  count: number;
  self: boolean;
};

function isAllowedEmoji(emoji: string): emoji is ChatReactionEmoji {
  return (CHAT_REACTION_EMOJIS as readonly string[]).includes(emoji);
}

export function useTripChatReactions(tripId: string, currentUserId: string | undefined) {
  const [rows, setRows] = useState<MessageReactionRow[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadReactions = useCallback(async (): Promise<void> => {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('id, trip_id, message_id, user_id, emoji, created_at')
      .eq('trip_id', tripId);

    if (error) {
      Sentry.captureException(error, { tags: { feature: 'chat-reactions' }, extra: { tripId } });
      setRows([]);
      return;
    }
    setRows((data as MessageReactionRow[]) ?? []);
  }, [tripId]);

  useEffect(() => {
    void loadReactions();
  }, [loadReactions]);

  const setupRealtime = useCallback(() => {
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current);
    }
    const channel = supabase
      .channel(`trip:${tripId}:message-reactions`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void loadReactions();
        },
      )
      .subscribe();
    channelRef.current = channel;
  }, [tripId, loadReactions]);

  useEffect(() => {
    setupRealtime();
    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setupRealtime]);

  const byMessageId = useMemo(() => {
    const map = new Map<string, Map<string, { count: number; self: boolean }>>();
    for (const r of rows) {
      let emojiMap = map.get(r.message_id);
      if (!emojiMap) {
        emojiMap = new Map();
        map.set(r.message_id, emojiMap);
      }
      const cur = emojiMap.get(r.emoji) ?? { count: 0, self: false };
      emojiMap.set(r.emoji, {
        count: cur.count + 1,
        self: cur.self || r.user_id === currentUserId,
      });
    }
    const out = new Map<string, ReactionSummary[]>();
    for (const [mid, emojiMap] of map) {
      const list: ReactionSummary[] = [...emojiMap.entries()].map(([emoji, v]) => ({
        emoji,
        count: v.count,
        self: v.self,
      }));
      list.sort((a, b) => a.emoji.localeCompare(b.emoji));
      out.set(mid, list);
    }
    return out;
  }, [rows, currentUserId]);

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string): Promise<void> => {
      if (!currentUserId || !isAllowedEmoji(emoji)) return;

      const { data: found, error: selErr } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('trip_id', tripId)
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .eq('emoji', emoji)
        .maybeSingle();

      if (selErr) {
        Sentry.captureException(selErr, { tags: { feature: 'chat-reactions' }, extra: { tripId } });
        return;
      }

      if (found && typeof (found as { id: string }).id === 'string') {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', (found as { id: string }).id);
        if (error) {
          Sentry.captureException(error, {
            tags: { feature: 'chat-reactions' },
            extra: { tripId },
          });
        }
        return;
      }

      const { error } = await supabase.from('message_reactions').insert({
        trip_id: tripId,
        message_id: messageId,
        user_id: currentUserId,
        emoji,
      } as any);

      if (error) {
        Sentry.captureException(error, { tags: { feature: 'chat-reactions' }, extra: { tripId } });
      }
    },
    [currentUserId, tripId],
  );

  return { reactionsByMessageId: byMessageId, toggleReaction };
}

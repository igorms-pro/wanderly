import { useCallback, useEffect, useState } from 'react';
import {
  acceptTripInvitation,
  buildInviteUrl,
  createTripInvitation,
  fetchTripInvitations,
  getInvitationPreview,
  revokeTripInvitation,
} from '../services/invitationApi';
import type { InvitationPreview, InviteRole, TripInvitation } from '../types';

export function useTripSharing(tripId: string | undefined, inviterId: string | undefined) {
  const [invitations, setInvitations] = useState<TripInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchTripInvitations(tripId);
      setInvitations(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createInvite = useCallback(
    async (options: { defaultRole?: InviteRole; maxUses?: number; expiresInDays?: number }) => {
      if (!tripId || !inviterId) throw new Error('Missing trip or user');
      setCreating(true);
      setError(null);
      try {
        const created = await createTripInvitation(tripId, inviterId, options);
        setInvitations((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create invite';
        setError(message);
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [tripId, inviterId],
  );

  const revokeInvite = useCallback(async (invitationId: string) => {
    setError(null);
    try {
      await revokeTripInvitation(invitationId);
      setInvitations((prev) => prev.filter((row) => row.id !== invitationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke invite');
      throw err;
    }
  }, []);

  return {
    invitations,
    loading,
    creating,
    error,
    reload,
    createInvite,
    revokeInvite,
    buildInviteUrl,
  };
}

export function useInvitationJoin(inviteCode: string | undefined) {
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteCode) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getInvitationPreview(inviteCode);
        if (!cancelled) setPreview(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load invitation');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  const join = useCallback(async () => {
    if (!inviteCode) throw new Error('Missing invite code');
    setJoining(true);
    setError(null);
    try {
      return await acceptTripInvitation(inviteCode);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join trip';
      setError(message);
      throw err;
    } finally {
      setJoining(false);
    }
  }, [inviteCode]);

  return { preview, loading, joining, error, join };
}

import { supabase } from '@/lib/supabase';
import type { InvitationPreview, InviteRole, TripInvitation } from '../types';

const INVITATION_COLUMNS =
  'id, trip_id, inviter_id, invite_code, default_role, expires_at, max_uses, used_count, created_at';

function mapInvitation(row: Record<string, unknown>): TripInvitation {
  return {
    id: String(row.id),
    trip_id: String(row.trip_id),
    inviter_id: String(row.inviter_id),
    invite_code: String(row.invite_code),
    default_role: row.default_role as InviteRole,
    expires_at: (row.expires_at as string | null) ?? null,
    max_uses: (row.max_uses as number | null) ?? null,
    used_count: Number(row.used_count ?? 0),
    created_at: String(row.created_at),
  };
}

function generateInviteCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function buildInviteUrl(inviteCode: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/invite/${inviteCode}`;
}

export async function fetchTripInvitations(tripId: string): Promise<TripInvitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select(INVITATION_COLUMNS)
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map(mapInvitation);
}

export async function createTripInvitation(
  tripId: string,
  inviterId: string,
  options: { defaultRole?: InviteRole; maxUses?: number; expiresInDays?: number },
): Promise<TripInvitation> {
  const expiresAt =
    options.expiresInDays != null
      ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      trip_id: tripId,
      inviter_id: inviterId,
      invite_code: generateInviteCode(),
      default_role: options.defaultRole ?? 'viewer',
      max_uses: options.maxUses ?? null,
      expires_at: expiresAt,
    } as never)
    .select(INVITATION_COLUMNS)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create invitation');
  return mapInvitation(data as Record<string, unknown>);
}

export async function revokeTripInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase.from('invitations').delete().eq('id', invitationId);
  if (error) throw error;
}

export async function getInvitationPreview(inviteCode: string): Promise<InvitationPreview> {
  const { data, error } = await supabase.rpc('get_invitation_preview', {
    p_invite_code: inviteCode,
  });

  if (error) throw error;
  return (data ?? { valid: false, reason: 'unknown' }) as InvitationPreview;
}

export async function acceptTripInvitation(
  inviteCode: string,
): Promise<{ tripId: string; alreadyMember: boolean }> {
  const { data, error } = await supabase.rpc('accept_trip_invitation', {
    p_invite_code: inviteCode,
  });

  if (error) throw error;

  const payload = data as { trip_id: string; already_member: boolean };
  return { tripId: payload.trip_id, alreadyMember: payload.already_member };
}

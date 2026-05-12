import type { TripMember } from '@/lib/types/database.types';

import type { MemberProfileLite } from '../hooks/useTripChatCollaboration';

export type MentionableMember = {
  userId: string;
  slug: string;
  label: string;
};

function baseSlugFromLabel(label: string, userId: string): string {
  const raw = label.trim().toLowerCase();
  const ascii = raw.replace(/[^a-z0-9]+/g, '');
  if (ascii.length > 0) return ascii.slice(0, 24);
  return `u${userId.replace(/-/g, '').slice(-8)}`;
}

export function buildMentionableMembers(
  tripMembers: TripMember[],
  memberProfiles: MemberProfileLite,
): MentionableMember[] {
  const active = tripMembers.filter((m) => !m.removed_at);
  const sorted = [...active].sort((a, b) => a.user_id.localeCompare(b.user_id));
  const used = new Set<string>();
  const out: MentionableMember[] = [];

  for (const m of sorted) {
    const profile = memberProfiles[m.user_id];
    const label = profile?.display_name?.trim() || `Member ${m.user_id.slice(0, 4)}`;
    const slug = baseSlugFromLabel(label, m.user_id);
    let candidate = slug;
    let n = 0;
    while (used.has(candidate)) {
      n += 1;
      candidate = `${slug}${n}`;
    }
    used.add(candidate);
    out.push({ userId: m.user_id, slug: candidate, label });
  }

  return out;
}

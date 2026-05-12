import { describe, expect, it } from 'vitest';

import type { TripMember } from '@/lib/types/database.types';

import { buildMentionableMembers } from './mentionSlugs';

const baseMember = (overrides: Partial<TripMember>): TripMember => ({
  id: 'mem-id',
  trip_id: 'trip-1',
  user_id: 'user-id',
  role: 'viewer',
  invited_by: null,
  joined_at: '2024-01-01T00:00:00Z',
  removed_at: null,
  ...overrides,
});

describe('buildMentionableMembers', () => {
  it('builds slugs from display names', () => {
    const members = [baseMember({ id: 'm1', user_id: 'a-1' })];
    const profiles = { 'a-1': { display_name: 'Jean Dupont', avatar_url: null } };
    const list = buildMentionableMembers(members, profiles);
    expect(list[0]?.slug).toBe('jeandupont');
    expect(list[0]?.label).toBe('Jean Dupont');
  });

  it('dedupes slug collisions', () => {
    const members = [
      baseMember({ id: 'm1', user_id: 'u-1' }),
      baseMember({ id: 'm2', user_id: 'u-2' }),
    ];
    const profiles = {
      'u-1': { display_name: 'Alex', avatar_url: null },
      'u-2': { display_name: 'alex', avatar_url: null },
    };
    const list = buildMentionableMembers(members, profiles);
    expect(list).toHaveLength(2);
    expect(list[0]?.slug).toBe('alex');
    expect(list[1]?.slug).toBe('alex1');
  });
});

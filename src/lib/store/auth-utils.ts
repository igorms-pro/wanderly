import type { User, Profile } from '../types/database.types';

export function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name || profile.email.split('@')[0],
    avatar_url:
      profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
    created_at: profile.created_at,
    ai_tier: profile.ai_tier === 'premium' ? 'premium' : 'free',
  };
}

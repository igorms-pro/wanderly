import { useCallback } from 'react';

import type { TripMember } from '@/lib/types/database.types';

interface UseTripDetailPermissionsArgs {
  user: { id: string } | null;
  tripMembers: TripMember[];
  currentTrip: { owner_id: string; status: 'planned' | 'locked' | 'archived' } | null;
}

export function useTripDetailPermissions({
  user,
  tripMembers,
  currentTrip,
}: UseTripDetailPermissionsArgs) {
  const getUserRole = useCallback((): 'owner' | 'editor' | 'viewer' | 'moderator' | null => {
    if (!user) return null;
    const member = tripMembers.find((m) => m.user_id === user.id);
    return member?.role || null;
  }, [tripMembers, user]);

  const canEdit = useCallback((): boolean => {
    if (!user || !currentTrip) return false;
    const role = getUserRole();
    return role === 'owner' || role === 'editor' || user.id === currentTrip.owner_id;
  }, [currentTrip, getUserRole, user]);

  const canDelete = useCallback((): boolean => {
    if (!user || !currentTrip) return false;
    return user.id === currentTrip.owner_id;
  }, [currentTrip, user]);

  const canCreateActivitiesAndScenarios = useCallback((): boolean => {
    if (!user || !currentTrip) return false;
    if (currentTrip.status === 'archived') return false;
    if (currentTrip.status === 'planned') return true;
    const role = getUserRole();
    return role === 'owner' || role === 'editor' || role === 'moderator';
  }, [currentTrip, getUserRole, user]);

  const canManageScenarios = useCallback((): boolean => {
    if (!user || !currentTrip) return false;
    const role = getUserRole();
    return role === 'owner' || role === 'editor' || role === 'moderator';
  }, [currentTrip, getUserRole, user]);

  return {
    getUserRole,
    canEdit,
    canDelete,
    canCreateActivitiesAndScenarios,
    canManageScenarios,
  };
}

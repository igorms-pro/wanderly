import { useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Activity, TripMember } from '@/lib/types/database.types';

interface UseTripDetailPageModalsParams {
  tripId: string | undefined;
  user: { id: string } | null | undefined;
  tripMembers: TripMember[];
  activityParticipantsMap: Record<string, string[]>;
  refreshActivityParticipants: () => Promise<void>;
}

export function useTripDetailPageModals({
  user,
  tripMembers,
  activityParticipantsMap,
  refreshActivityParticipants,
}: UseTripDetailPageModalsParams) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<{
    activity: Activity;
    date: string;
  } | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [lastEditedActivityId, setLastEditedActivityId] = useState<string | null>(null);

  const handleAddMeToActivity = async (activityId: string) => {
    if (!user?.id) return;
    const table = supabase.from('activity_participants') as unknown as {
      insert: (v: { activity_id: string; user_id: string }) => Promise<unknown>;
    };
    await table.insert({ activity_id: activityId, user_id: user.id });
    await refreshActivityParticipants();
  };

  const handleRemoveMeFromActivity = async (activityId: string) => {
    if (!user?.id) return;
    const hasExplicit =
      activityParticipantsMap[activityId] != null && activityParticipantsMap[activityId].length > 0;
    const table = supabase.from('activity_participants') as unknown as {
      delete: () => {
        eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<unknown> };
      };
      insert: (v: { activity_id: string; user_id: string }[]) => Promise<unknown>;
    };
    if (hasExplicit) {
      await table.delete().eq('activity_id', activityId).eq('user_id', user.id);
    } else {
      const otherIds = tripMembers.filter((m) => m.user_id !== user.id).map((m) => m.user_id);
      if (otherIds.length > 0) {
        await table.insert(otherIds.map((uid) => ({ activity_id: activityId, user_id: uid })));
      }
    }
    await refreshActivityParticipants();
  };

  const handleEditActivitySaveSuccess = (activityId: string) => {
    setLastEditedActivityId(activityId);
    setActivityToEdit(null);
    setTimeout(() => setLastEditedActivityId(null), 2500);
  };

  return {
    showDeleteModal,
    setShowDeleteModal,
    activityToEdit,
    setActivityToEdit,
    activityToDelete,
    setActivityToDelete,
    lastEditedActivityId,
    handleAddMeToActivity,
    handleRemoveMeFromActivity,
    handleEditActivitySaveSuccess,
  };
}

import {
  ActivityDeleteConfirmModal,
  CreateActivityModal,
  EditActivityModal,
} from '@/features/activities';
import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from '@/pages/trip-detail/ItineraryActivityTypes';

type Props = {
  tripId: string | undefined;
  userId: string | undefined;
  showAddActivityModal: boolean;
  onCloseAddActivity: () => void;
  activityToEdit: { activity: Activity; date: string } | null;
  onCloseEditActivity: () => void;
  onEditSaveSuccess: (activityId: string) => void;
  activityToDelete: Activity | null;
  onCloseDeleteActivity: () => void;
  onConfirmDeleteActivity: (activityId: string) => Promise<void>;
  activityParticipantsMap: Record<string, string[]>;
  tripMembers: TripMember[];
  memberProfiles: Record<string, MemberProfile>;
  onAddMe: (activityId: string) => Promise<void>;
  onRemoveMe: (activityId: string) => Promise<void>;
};

export function TripDetailPageActivityModals({
  tripId,
  userId,
  showAddActivityModal,
  onCloseAddActivity,
  activityToEdit,
  onCloseEditActivity,
  onEditSaveSuccess,
  activityToDelete,
  onCloseDeleteActivity,
  onConfirmDeleteActivity,
  activityParticipantsMap,
  tripMembers,
  memberProfiles,
  onAddMe,
  onRemoveMe,
}: Props) {
  return (
    <>
      {showAddActivityModal && tripId && (
        <CreateActivityModal tripId={tripId} onClose={onCloseAddActivity} />
      )}

      {activityToEdit && tripId && (
        <EditActivityModal
          tripId={tripId}
          activity={activityToEdit.activity}
          date={activityToEdit.date}
          onClose={onCloseEditActivity}
          onSaveSuccess={onEditSaveSuccess}
          currentUserId={userId ?? null}
          activityParticipantsMap={activityParticipantsMap}
          tripMembers={tripMembers}
          memberProfiles={memberProfiles}
          onAddMe={onAddMe}
          onRemoveMe={onRemoveMe}
        />
      )}

      <ActivityDeleteConfirmModal
        activity={activityToDelete}
        isOpen={!!activityToDelete}
        onClose={onCloseDeleteActivity}
        onConfirm={onConfirmDeleteActivity}
      />
    </>
  );
}

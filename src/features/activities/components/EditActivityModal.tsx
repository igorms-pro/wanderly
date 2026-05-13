import { useTranslation } from 'react-i18next';

import { useStore } from '@/lib/store';
import type { Activity, TripMember } from '@/lib/types/database.types';
import type { MemberProfile } from '@/pages/trip-detail/ItineraryActivityTypes';
import { ActivityModalShell } from './ActivityModalShell';
import { ActivityFormSections } from './ActivityFormSections';
import { ActivityEditParticipantsSection } from './ActivityEditParticipantsSection';
import { useEditActivityForm } from '../hooks/useCreateActivityForm';

interface EditActivityModalProps {
  tripId: string;
  activity: Activity;
  date?: string;
  onClose: () => void;
  /** Called after successful save with the edited activity id (e.g. to highlight the card). */
  onSaveSuccess?: (activityId: string) => void;
  currentUserId?: string | null;
  activityParticipantsMap?: Record<string, string[]>;
  tripMembers?: TripMember[];
  memberProfiles?: Record<string, MemberProfile>;
  onAddMe?: (activityId: string) => Promise<void>;
  onRemoveMe?: (activityId: string) => Promise<void>;
}

export function EditActivityModal({
  tripId,
  activity,
  date,
  onClose,
  onSaveSuccess,
  currentUserId = null,
  activityParticipantsMap = {},
  tripMembers = [],
  memberProfiles = {},
  onAddMe,
  onRemoveMe,
}: EditActivityModalProps) {
  const { t } = useTranslation();
  const tripDestination = useStore((s) =>
    s.currentTrip?.id === tripId ? (s.currentTrip.destination_text ?? '') : '',
  );

  const { formData, loading, error, handleChange, handleSubmit } = useEditActivityForm({
    tripId,
    activity,
    date,
    onSuccess: (activityId) => {
      if (activityId) onSaveSuccess?.(activityId);
      onClose();
    },
  });

  const hasExplicitParticipants =
    activityParticipantsMap[activity.id] != null && activityParticipantsMap[activity.id].length > 0;
  const participantIds = hasExplicitParticipants
    ? activityParticipantsMap[activity.id]
    : tripMembers.map((m) => m.user_id);
  const isAllMembers = !hasExplicitParticipants;

  return (
    <ActivityModalShell
      title={t('activityModal.editActivity')}
      error={error}
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
      mode="edit"
    >
      <ActivityFormSections
        tripId={tripId}
        tripDestination={tripDestination}
        formData={formData}
        onChange={handleChange}
        excludeActivityId={activity.id}
      />
      {onAddMe && onRemoveMe && tripMembers.length > 0 && (
        <ActivityEditParticipantsSection
          activityId={activity.id}
          participantIds={participantIds}
          isAllMembers={isAllMembers}
          tripMembersCount={tripMembers.length}
          currentUserId={currentUserId}
          memberProfiles={memberProfiles}
          t={t}
          onAddMe={onAddMe}
          onRemoveMe={onRemoveMe}
        />
      )}
    </ActivityModalShell>
  );
}

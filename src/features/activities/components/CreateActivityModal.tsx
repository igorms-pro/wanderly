import { useTranslation } from 'react-i18next';

import { useStore } from '@/lib/store';

import { useCreateActivityForm } from '../hooks/useCreateActivityForm';
import { ActivityModalShell } from './ActivityModalShell';
import { ActivityFormSections } from './ActivityFormSections';

interface CreateActivityModalProps {
  tripId: string;
  onClose: () => void;
}

export default function CreateActivityModal({ tripId, onClose }: CreateActivityModalProps) {
  const { t } = useTranslation();
  const tripDestination = useStore((s) =>
    s.currentTrip?.id === tripId ? (s.currentTrip.destination_text ?? '') : '',
  );
  const { formData, loading, error, handleChange, handleSubmit } = useCreateActivityForm({
    tripId,
    onSuccess: onClose,
  });

  return (
    <ActivityModalShell
      title={t('activityModal.addActivity')}
      error={error}
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <ActivityFormSections
        tripId={tripId}
        tripDestination={tripDestination}
        formData={formData}
        onChange={handleChange}
      />
    </ActivityModalShell>
  );
}

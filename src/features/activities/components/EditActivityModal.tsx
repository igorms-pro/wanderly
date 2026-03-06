import { useTranslation } from 'react-i18next';

import type { Activity } from '@/lib/types/database.types';
import { ActivityModalShell } from './ActivityModalShell';
import { ActivityFormSections } from './ActivityFormSections';
import { useEditActivityForm } from '../hooks/useCreateActivityForm';

interface EditActivityModalProps {
  tripId: string;
  activity: Activity;
  date?: string;
  onClose: () => void;
}

export function EditActivityModal({ tripId, activity, date, onClose }: EditActivityModalProps) {
  const { t } = useTranslation();

  const { formData, loading, error, handleChange, handleSubmit } = useEditActivityForm({
    tripId,
    activity,
    date,
    onSuccess: onClose,
  });

  return (
    <ActivityModalShell
      title={t('activityModal.editActivity')}
      error={error}
      loading={loading}
      onClose={onClose}
      onSubmit={handleSubmit}
      mode="edit"
    >
      <ActivityFormSections formData={formData} onChange={handleChange} />
    </ActivityModalShell>
  );
}

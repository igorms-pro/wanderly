import { useTranslation } from 'react-i18next';
import { useCreateActivityForm } from '../hooks/useCreateActivityForm';
import {
  ActivityBasicFields,
  ActivityPlanningFields,
  ActivityAdvancedFields,
  ActivityModalShell,
} from './ActivityFormSections';

interface CreateActivityModalProps {
  tripId: string;
  onClose: () => void;
}

export default function CreateActivityModal({ tripId, onClose }: CreateActivityModalProps) {
  const { t } = useTranslation();
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
      <ActivityBasicFields formData={formData} onChange={handleChange} />
      <ActivityPlanningFields formData={formData} onChange={handleChange} />
      <ActivityAdvancedFields formData={formData} onChange={handleChange} />
    </ActivityModalShell>
  );
}

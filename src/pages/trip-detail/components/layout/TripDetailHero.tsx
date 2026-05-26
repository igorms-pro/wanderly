import type { Trip } from '@/lib/types/database.types';
import type { TripMember } from '@/lib/types/database.types';
import { TripDetailHeroView } from './TripDetailHeroView';
import { TripDetailEditForm } from '@/pages/trip-detail/TripDetailEditForm';
import { TripDetailHeroActions } from './TripDetailHeroActions';

export type EditFormState = {
  title: string;
  destination_text: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'locked' | 'archived';
  pace: 'relaxed' | 'balanced' | 'packed';
  budget: string;
  currency: string;
  has_children: boolean;
  timezone: string;
};

interface TripDetailHeroProps {
  currentTrip: Trip;
  tripMembers: TripMember[];
  isEditing: boolean;
  editForm: EditFormState;
  setEditForm: (f: EditFormState | ((prev: EditFormState) => EditFormState)) => void;
  isDeleting: boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canShare: () => boolean;
  showFinalizeButton?: boolean;
  onFinalizeClick?: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => Promise<void>;
  onDelete: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onSaveTemplate: () => void;
  t: (key: string) => string;
}

export function TripDetailHero({
  currentTrip,
  tripMembers,
  isEditing,
  editForm,
  setEditForm,
  isDeleting,
  canEdit,
  canDelete,
  canShare,
  showFinalizeButton = false,
  onFinalizeClick,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onShare,
  onDuplicate,
  onSaveTemplate,
  t,
}: TripDetailHeroProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <TripDetailEditForm
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={onSave}
                onCancel={onCancelEdit}
                t={t}
              />
            ) : (
              <TripDetailHeroView currentTrip={currentTrip} tripMembers={tripMembers} t={t} />
            )}
          </div>
          {!isEditing ? (
            <TripDetailHeroActions
              canEdit={canEdit}
              canDelete={canDelete}
              canShare={canShare}
              showFinalizeButton={showFinalizeButton}
              isDeleting={isDeleting}
              onStartEdit={onStartEdit}
              onFinalizeClick={onFinalizeClick}
              onDelete={onDelete}
              onShare={onShare}
              onDuplicate={onDuplicate}
              onSaveTemplate={onSaveTemplate}
              t={t}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

import { Edit, Trash2 } from 'lucide-react';
import type { Trip } from '@/lib/mock-supabase';
import type { TripMember } from '@/lib/types/database.types';
import { TripDetailHeroView } from './TripDetailHeroView';
import { TripDetailEditForm } from './TripDetailEditForm';

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
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => Promise<void>;
  onDelete: () => void;
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
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
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
          {!isEditing && (
            <div className="flex flex-shrink-0 gap-2">
              {canEdit() && (
                <button
                  onClick={onStartEdit}
                  className="px-4 py-2.5 min-h-[44px] bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('tripDetail.edit')}
                </button>
              )}
              {canDelete() && (
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="px-4 py-2.5 min-h-[44px] bg-red-500/80 backdrop-blur-sm border border-red-400/30 rounded-lg text-white hover:bg-red-600/80 transition flex items-center disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? t('tripDetail.deleting') : t('tripDetail.delete')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

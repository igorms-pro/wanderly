import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Edit, Trash2, Save, X } from 'lucide-react';
import type { Trip } from '@/lib/mock-supabase';
import type { TripMember } from '@/lib/types/database.types';

export type EditFormState = {
  title: string;
  destination_text: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'locked' | 'archived';
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
  onDelete: () => Promise<void>;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder={t('tripDetail.tripTitlePlaceholder')}
                />
                <input
                  type="text"
                  value={editForm.destination_text}
                  onChange={(e) => setEditForm({ ...editForm, destination_text: e.target.value })}
                  className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder={t('tripDetail.destinationPlaceholder')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onSave}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('tripDetail.save')}
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('tripDetail.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-4">{currentTrip.title}</h1>
                <div className="flex flex-wrap gap-4 text-white/90">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {currentTrip.destination_text}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    {format(new Date(currentTrip.start_date), 'MMM d')} -{' '}
                    {format(new Date(currentTrip.end_date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    {tripMembers.length}{' '}
                    {tripMembers.length === 1 ? t('tripDetail.member') : t('tripDetail.members')}
                  </div>
                </div>
              </>
            )}
          </div>
          {!isEditing && (
            <div className="flex space-x-2">
              {canEdit() && (
                <button
                  onClick={onStartEdit}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('tripDetail.edit')}
                </button>
              )}
              {canDelete() && (
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500/80 backdrop-blur-sm border border-red-400/30 rounded-lg text-white hover:bg-red-600/80 transition flex items-center disabled:opacity-50"
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

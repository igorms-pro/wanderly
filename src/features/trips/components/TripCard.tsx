import { useTranslation } from 'react-i18next';
import { Trip } from '@/lib/mock-supabase';
import {
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Trash2,
  Archive,
  Baby,
  Zap,
  Coffee,
  Gauge,
  DollarSign,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { getGradient, getTripTimeLabel, formatBudget } from '../utils/trip-helpers';

interface TripCardProps {
  trip: Trip;
  memberCount: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onClick: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export default function TripCard({
  trip,
  memberCount,
  isMenuOpen,
  onToggleMenu,
  onClick,
  onArchive,
  onDelete,
}: TripCardProps) {
  const { t } = useTranslation();
  const gradient = getGradient(trip.destination_text);
  const timeLabel = getTripTimeLabel(trip.start_date, trip.end_date, t);
  const constraints = trip.constraints;

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50 hover:-translate-y-1"
    >
      {/* Gradient header */}
      <div className={`relative h-36 bg-gradient-to-br ${gradient} flex items-end p-5`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Quick actions */}
        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden z-10">
              <button
                onClick={onArchive}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition"
              >
                <Archive className="w-4 h-4" />
                {t('trip.archive')}
              </button>
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 className="w-4 h-4" />
                {t('trip.delete')}
              </button>
            </div>
          )}
        </div>

        {/* Time badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
            <Clock className="w-3 h-3" />
            {timeLabel.label}
          </span>
        </div>

        <h3 className="relative text-xl font-bold text-white leading-tight drop-shadow-sm">
          {trip.title}
        </h3>
      </div>

      {/* Card body */}
      <div className="p-5 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{trip.destination_text}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Calendar className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="text-sm">
              {format(new Date(trip.start_date), 'MMM d')} –{' '}
              {format(new Date(trip.end_date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Constraints chips */}
        {constraints && (
          <div className="flex flex-wrap gap-1.5">
            {constraints.pace && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400">
                {constraints.pace === 'relaxed' ? (
                  <Coffee className="w-3 h-3" />
                ) : constraints.pace === 'packed' ? (
                  <Zap className="w-3 h-3" />
                ) : (
                  <Gauge className="w-3 h-3" />
                )}
                {constraints.pace}
              </span>
            )}
            {constraints.budget_per_person_cents && trip.currency && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400">
                <DollarSign className="w-3 h-3" />
                {formatBudget(constraints.budget_per_person_cents, trip.currency)}
                {t('trip.perPerson')}
              </span>
            )}
            {constraints.has_children && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-xs font-medium text-amber-700 dark:text-amber-400">
                <Baby className="w-3 h-3" />
                {t('trip.withChildren')}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {memberCount} {memberCount === 1 ? t('trip.member') : t('trip.members')}
            </span>
          </div>
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
              trip.status === 'planned'
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                : trip.status === 'locked'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
            }`}
          >
            {t(`trip.${trip.status}`)}
          </span>
        </div>
      </div>
    </div>
  );
}

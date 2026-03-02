import { format } from 'date-fns';
import {
  MapPin,
  Calendar,
  Users,
  Coffee,
  Zap,
  Gauge,
  DollarSign,
  Baby,
  Archive,
  Lock,
  ClipboardList,
} from 'lucide-react';
import type { Trip, TripConstraints } from '@/lib/types/database.types';
import type { TripMember } from '@/lib/types/database.types';
import { formatBudget } from '@/features/trips/utils/trip-helpers';

interface TripDetailHeroViewProps {
  currentTrip: Trip;
  tripMembers: TripMember[];
  t: (key: string) => string;
}

export function TripDetailHeroView({ currentTrip, tripMembers, t }: TripDetailHeroViewProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
          {currentTrip.status === 'archived' ? (
            <Archive className="w-3.5 h-3.5" />
          ) : currentTrip.status === 'locked' ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <ClipboardList className="w-3.5 h-3.5" />
          )}
          {t(
            `tripDetail.status${currentTrip.status.charAt(0).toUpperCase() + currentTrip.status.slice(1)}`,
          )}
        </span>
        {currentTrip.constraints && (
          <>
            {(currentTrip.constraints as TripConstraints).pace && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium">
                {(currentTrip.constraints as TripConstraints).pace === 'relaxed' ? (
                  <Coffee className="w-3 h-3" />
                ) : (currentTrip.constraints as TripConstraints).pace === 'packed' ? (
                  <Zap className="w-3 h-3" />
                ) : (
                  <Gauge className="w-3 h-3" />
                )}
                {t(`tripModal.${(currentTrip.constraints as TripConstraints).pace}`)}
              </span>
            )}
            {(currentTrip.constraints as TripConstraints).budget_per_person_cents &&
              currentTrip.currency && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium">
                  <DollarSign className="w-3 h-3" />
                  {formatBudget(
                    (currentTrip.constraints as TripConstraints).budget_per_person_cents!,
                    currentTrip.currency,
                  )}{' '}
                  {t('tripDetail.perPerson')}
                </span>
              )}
            {(currentTrip.constraints as TripConstraints).has_children && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium">
                <Baby className="w-3 h-3" />
                {t('tripDetail.withChildren')}
              </span>
            )}
            {(currentTrip.constraints as TripConstraints).preferences && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium max-w-[180px] truncate"
                title={String((currentTrip.constraints as TripConstraints).preferences)}
              >
                {String((currentTrip.constraints as TripConstraints).preferences)}
              </span>
            )}
          </>
        )}
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{currentTrip.title}</h1>
      <div className="flex flex-wrap gap-4 text-white/90 text-sm sm:text-base">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-none">
            {currentTrip.destination_text}
          </span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          {format(new Date(currentTrip.start_date), 'MMM d')} –{' '}
          {format(new Date(currentTrip.end_date), 'MMM d, yyyy')}
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          {tripMembers.length}{' '}
          {tripMembers.length === 1 ? t('tripDetail.member') : t('tripDetail.members')}
        </div>
      </div>
      {tripMembers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {tripMembers.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-medium"
            >
              {t(`tripDetail.role${m.role.charAt(0).toUpperCase() + m.role.slice(1)}`)}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

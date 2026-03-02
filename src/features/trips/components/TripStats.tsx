import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Trip } from '@/lib/types/database.types';
import { Globe, CalendarCheck, Archive } from 'lucide-react';

interface TripStatsProps {
  trips: Trip[];
}

export default function TripStats({ trips }: TripStatsProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const planned = trips.filter((trip) => trip.status === 'planned').length;
    const archived = trips.filter((trip) => trip.status === 'archived').length;
    return { total: trips.length, planned, archived };
  }, [trips]);

  const items = [
    {
      icon: Globe,
      label: t('trip.totalTrips'),
      value: stats.total,
      gradient: 'from-violet-500 to-indigo-500',
    },
    {
      icon: CalendarCheck,
      label: t('trip.planned'),
      value: stats.planned,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Archive,
      label: t('trip.archived'),
      value: stats.archived,
      gradient: 'from-stone-500 to-stone-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-stone-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-stone-200/50 dark:border-stone-800/50 flex items-center gap-4 sm:block"
        >
          <div
            className={`w-10 h-10 sm:w-10 sm:h-10 flex-shrink-0 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center sm:mb-3`}
          >
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stat.value}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 sm:mt-0 truncate">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trip } from '@/lib/mock-supabase';
import { Globe, TrendingUp, ClipboardList } from 'lucide-react';

interface TripStatsProps {
  trips: Trip[];
}

export default function TripStats({ trips }: TripStatsProps) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = trips.filter((t) => new Date(t.start_date) > now).length;
    const planned = trips.filter((t) => t.status === 'planned').length;
    return { total: trips.length, upcoming, planned };
  }, [trips]);

  const items = [
    {
      icon: Globe,
      label: t('trip.totalTrips'),
      value: stats.total,
      gradient: 'from-violet-500 to-indigo-500',
    },
    {
      icon: TrendingUp,
      label: t('trip.upcomingTrips'),
      value: stats.upcoming,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: ClipboardList,
      label: t('trip.plannedTrips'),
      value: stats.planned,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200/50 dark:border-stone-800/50"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}
          >
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stat.value}</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

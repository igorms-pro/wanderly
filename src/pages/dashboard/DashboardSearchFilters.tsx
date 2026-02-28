import { useTranslation } from 'react-i18next';
import { Search, ArrowUpDown } from 'lucide-react';
import type { StatusFilter, SortOption } from './types';

interface DashboardSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

export function DashboardSearchFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
}: DashboardSearchFiltersProps) {
  const { t } = useTranslation();

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: t('trip.all') },
    { key: 'planned', label: t('trip.planned') },
    { key: 'archived', label: t('trip.archived') },
  ];

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('trip.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="pl-9 pr-4 py-2.5 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 appearance-none transition"
          >
            <option value="date-desc">{t('trip.newestFirst')}</option>
            <option value="date-asc">{t('trip.oldestFirst')}</option>
            <option value="title-asc">{t('trip.titleAZ')}</option>
            <option value="title-desc">{t('trip.titleZA')}</option>
          </select>
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>
      <div className="flex gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => onStatusFilterChange(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === f.key
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

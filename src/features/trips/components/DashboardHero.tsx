import { useTranslation } from 'react-i18next';
import { Sparkles, LayoutTemplate } from 'lucide-react';
import type { User } from '@/lib/types/database.types';

interface DashboardHeroProps {
  user: User;
  onCreateTrip: () => void;
  onUseTemplate: () => void;
}

export default function DashboardHero({ user, onCreateTrip, onUseTemplate }: DashboardHeroProps) {
  const { t } = useTranslation();

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 sm:p-10 text-white">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
      <div className="relative">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">
          {t('trip.welcomeBack', { name: user.display_name?.split(' ')[0] })}
        </h2>
        <p className="text-violet-200 text-lg mb-6">{t('trip.planAdventure')}</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCreateTrip}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition shadow-lg hover:shadow-xl min-h-[44px]"
          >
            <Sparkles className="w-5 h-5" />
            {t('trip.createTripWithAI')}
          </button>
          <button
            onClick={onUseTemplate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/25 transition min-h-[44px]"
          >
            <LayoutTemplate className="w-5 h-5" />
            {t('templates.createFromTemplate')}
          </button>
        </div>
      </div>
    </div>
  );
}

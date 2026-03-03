import { useTranslation } from 'react-i18next';
import { Plane } from 'lucide-react';

export function LandingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-400 dark:text-stone-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-500 dark:bg-orange-400 rounded-xl">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-white">{t('app.name')}</span>
        </div>
        <p className="mb-4">{t('landing.footerTagline')}</p>
        <p className="text-sm">{t('landing.footerRights')}</p>
      </div>
    </footer>
  );
}

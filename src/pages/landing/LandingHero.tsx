import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plane, Sparkles, ArrowRight } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingHero() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 dark:from-orange-600 dark:via-orange-500 dark:to-amber-500">
      <nav className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/95 dark:bg-stone-900/95 rounded-xl shadow-sm">
              <Plane className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="ml-3 text-xl font-bold text-white" data-testid="voyagely-brand">
              {t('app.name')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="dropdown" size="md" />
            <ThemeToggle />
            <Link
              to="/login"
              className="text-white/95 hover:text-white font-medium transition-colors"
              data-testid="landing-signin-link"
            >
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          data-testid="landing-hero-title"
        >
          {t('landing.heroTitle')}
          <br />
          <span className="text-amber-100">{t('landing.heroSubtitle')}</span>
        </h1>
        <p
          className="text-lg md:text-xl text-orange-50/95 mb-8 max-w-3xl mx-auto leading-relaxed"
          data-testid="landing-hero-description"
        >
          {t('landing.heroDescription')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg bg-white text-orange-600 hover:bg-orange-50 dark:bg-stone-900 dark:text-orange-400 dark:hover:bg-stone-800 shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-stone-900 transition"
            data-testid="hero-cta-link"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {t('auth.getStarted')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
        <p className="mt-4 text-sm text-amber-100/90">{t('landing.noCreditCard')}</p>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

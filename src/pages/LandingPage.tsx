import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Plane,
  Sparkles,
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  ThumbsUp,
  ArrowRight,
} from 'lucide-react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { Card } from '@/components/ui/Card';

const DEFAULT_OG_IMAGE = '/og-image.png';

export default function LandingPage() {
  const { t } = useTranslation();
  const title = t('landing.metaTitle');
  const description = t('landing.metaDescription');
  const appName = t('app.name');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content={appName} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      {/* Hero Section — design system: warm gradient (orange → amber) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 dark:from-orange-600 dark:via-orange-500 dark:to-amber-500">
        {/* Navigation */}
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

        {/* Hero Content — typography: display / H1, spacing lg */}
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

        {/* Decorative blurs — warm tones */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Features Section — design system: stone bg, Card components */}
      <section
        className="py-16 md:py-24 bg-stone-100 dark:bg-stone-900/50"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2
              id="features-heading"
              className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4"
              data-testid="landing-features-title"
            >
              {t('landing.featuresTitle')}
            </h2>
            <p
              className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
              data-testid="landing-features-subtitle"
            >
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card variant="interactive" className="p-6 md:p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl mb-4">
                <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.aiItineraries')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">{t('landing.aiItinerariesDesc')}</p>
            </Card>

            <Card variant="interactive" className="p-6 md:p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl mb-4">
                <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.collaborativePlanning')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                {t('landing.collaborativePlanningDesc')}
              </p>
            </Card>

            <Card variant="interactive" className="p-6 md:p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-xl mb-4">
                <MessageSquare className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.realtimeChat')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">{t('landing.realtimeChatDesc')}</p>
            </Card>

            <Card variant="interactive" className="p-6 md:p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl mb-4">
                <ThumbsUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.activityVoting')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                {t('landing.activityVotingDesc')}
              </p>
            </Card>

            <Card variant="interactive" className="p-6 md:p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl mb-4">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.smartScheduling')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                {t('landing.smartSchedulingDesc')}
              </p>
            </Card>

            <Card variant="interactive" className="p-6 md:p-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-xl mb-4">
                <MapPin className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.locationAware')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">{t('landing.locationAwareDesc')}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works — warm step badges */}
      <section
        className="py-16 md:py-24 bg-stone-50 dark:bg-stone-950"
        aria-labelledby="how-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2
              id="how-heading"
              className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4"
            >
              {t('landing.howItWorksTitle')}
            </h2>
            <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              {t('landing.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 dark:bg-orange-400 text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.step1Title')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">{t('landing.step1Desc')}</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 dark:bg-amber-400 text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.step2Title')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">{t('landing.step2Desc')}</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500 dark:bg-rose-400 text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('landing.step3Title')}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — design system: warm dark */}
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
    </div>
  );
}

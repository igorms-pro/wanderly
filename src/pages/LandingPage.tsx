import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        {/* Navigation */}
        <nav className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-xl">
                <Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="ml-3 text-xl font-bold text-white" data-testid="voyagely-brand">
                Voyagely
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher variant="dropdown" size="md" />
              <ThemeToggle />
              <Link
                to="/login"
                className="text-white hover:text-blue-100 font-medium transition"
                data-testid="landing-signin-link"
              >
                {t('auth.signIn')}
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            data-testid="landing-hero-title"
          >
            {t('landing.heroTitle')}
            <br />
            <span className="text-blue-200">{t('landing.heroSubtitle')}</span>
          </h1>
          <p
            className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto"
            data-testid="landing-hero-description"
          >
            {t('landing.heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition shadow-xl hover:shadow-2xl"
              data-testid="hero-cta-link"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              {t('auth.getStarted')}
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-200">{t('landing.noCreditCard')}</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              data-testid="landing-features-title"
            >
              {t('landing.featuresTitle')}
            </h2>
            <p
              className="text-xl text-gray-600 dark:text-gray-300"
              data-testid="landing-features-subtitle"
            >
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm dark:shadow-lg p-8 hover:shadow-md dark:hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.aiItineraries')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.aiItinerariesDesc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm dark:shadow-lg p-8 hover:shadow-md dark:hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.collaborativePlanning')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('landing.collaborativePlanningDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm dark:shadow-lg p-8 hover:shadow-md dark:hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl mb-4">
                <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.realtimeChat')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.realtimeChatDesc')}</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm dark:shadow-lg p-8 hover:shadow-md dark:hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl mb-4">
                <ThumbsUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.activityVoting')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.activityVotingDesc')}</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm dark:shadow-lg p-8 hover:shadow-md dark:hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl mb-4">
                <Calendar className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.smartScheduling')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.smartSchedulingDesc')}</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-sm dark:shadow-lg p-8 hover:shadow-md dark:hover:shadow-xl transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mb-4">
                <MapPin className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.locationAware')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.locationAwareDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('landing.howItWorksTitle')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('landing.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.step1Title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.step1Desc')}</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 dark:bg-purple-500 text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.step2Title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.step2Desc')}</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 dark:bg-green-500 text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('landing.step3Title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{t('landing.step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 dark:text-gray-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">Voyagely</span>
          </div>
          <p className="mb-4">{t('landing.footerTagline')}</p>
          <p className="text-sm">{t('landing.footerRights')}</p>
        </div>
      </footer>
    </div>
  );
}

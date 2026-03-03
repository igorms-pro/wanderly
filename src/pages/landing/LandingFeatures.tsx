import { useTranslation } from 'react-i18next';
import { Sparkles, Users, MessageSquare, ThumbsUp, Calendar, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function LandingFeatures() {
  const { t } = useTranslation();

  return (
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
            <p className="text-stone-600 dark:text-stone-400">{t('landing.activityVotingDesc')}</p>
          </Card>

          <Card variant="interactive" className="p-6 md:p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-xl mb-4">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
              {t('landing.smartScheduling')}
            </h3>
            <p className="text-stone-600 dark:text-stone-400">{t('landing.smartSchedulingDesc')}</p>
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
  );
}

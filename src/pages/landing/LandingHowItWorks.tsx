import { useTranslation } from 'react-i18next';

export function LandingHowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-stone-50 dark:bg-stone-950" aria-labelledby="how-heading">
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
  );
}

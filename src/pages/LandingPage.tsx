import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { LandingHero } from '@/pages/landing/LandingHero';
import { LandingFeatures } from '@/pages/landing/LandingFeatures';
import { LandingHowItWorks } from '@/pages/landing/LandingHowItWorks';
import { LandingFooter } from '@/pages/landing/LandingFooter';

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
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingFooter />
    </div>
  );
}

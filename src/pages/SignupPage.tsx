import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../lib/store';
import { Plane, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { GoogleIcon } from '@/features/auth/components/GoogleIcon';
// import { FacebookIcon } from '@/features/auth/components/FacebookIcon'; // TODO: réactiver quand app FB vérifiée

export default function SignupPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);

  const signInWithOAuth = useStore((state) => state.signInWithOAuth);
  const signInWithMagicLink = useStore((state) => state.signInWithMagicLink);
  const { addToast } = useToast();
  const hasSupabase =
    !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    if (!hasSupabase) {
      addToast({ message: t('auth.failedToSignIn'), variant: 'error' });
      return;
    }
    setEmailLoading(true);
    const res = await signInWithMagicLink(email.trim());
    setEmailLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    addToast({ message: t('auth.magicLinkSent'), variant: 'success' });
    setEmail('');
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    if (!hasSupabase) {
      addToast({ message: t('auth.failedToSignIn'), variant: 'error' });
      return;
    }
    setOauthLoading(provider);
    setError('');
    const res = await signInWithOAuth(provider);
    if (res.error) {
      setOauthLoading(null);
      const msg = res.error.toLowerCase();
      if (msg.includes('facebook')) {
        addToast({
          message: msg.includes('cancel')
            ? t('auth.oauthFacebookCancelled')
            : t('auth.oauthFacebookError'),
          variant: 'error',
        });
      } else {
        addToast({
          message: msg.includes('cancel') ? t('auth.oauthCancelled') : t('auth.oauthError'),
          variant: 'error',
        });
      }
    }
  };

  return (
    <Layout showLanguageTheme={true}>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 dark:bg-orange-400 rounded-2xl mb-4">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2"
              data-testid="signup-join-title"
            >
              {t('auth.joinTitle')}
            </h1>
            <p className="text-stone-600 dark:text-stone-400" data-testid="signup-join-subtitle">
              {t('auth.joinSubtitle')}
            </p>
          </div>

          <Card className="p-8" data-testid="signup-form">
            <h2
              className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-6"
              data-testid="signup-form-title"
            >
              {t('auth.createAccount')}
            </h2>

            {error && (
              <div
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-start gap-2"
                data-testid="signup-error-message"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleMagicLink}
              className="space-y-4 mb-6"
              data-testid="signup-email-form"
            >
              <Input
                id="signup-email"
                type="email"
                label={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={emailLoading}
                placeholder={t('auth.emailPlaceholder')}
                data-testid="signup-email-input"
              />
              <Button
                type="submit"
                disabled={emailLoading}
                className="w-full"
                loading={emailLoading}
                data-testid="signup-send-magic-link"
              >
                {emailLoading ? t('auth.magicLinkSending') : t('auth.sendMagicLink')}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                  {t('auth.or')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"
                disabled={emailLoading || oauthLoading !== null}
                onClick={() => handleOAuth('google')}
                loading={oauthLoading === 'google'}
                leftIcon={<GoogleIcon className="w-5 h-5" />}
              >
                {oauthLoading === 'google' ? t('auth.oauthLoading') : t('auth.continueWithGoogle')}
              </Button>
              {/* TODO: réactiver quand app Facebook vérifiée
              <Button
                type="button"
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-0 focus:ring-[#1877F2]"
                disabled={emailLoading || oauthLoading !== null}
                onClick={() => handleOAuth('facebook')}
                loading={oauthLoading === 'facebook'}
                leftIcon={<FacebookIcon className="w-5 h-5 text-white" />}
              >
                {oauthLoading === 'facebook'
                  ? t('auth.oauthLoading')
                  : t('auth.continueWithFacebook')}
              </Button>
              */}
            </div>

            <p className="mt-6 text-center text-stone-600 dark:text-stone-400 text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                data-testid="signup-login-link"
                className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
              >
                {t('auth.signIn')}
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../lib/store';
import { Plane, CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/contexts/ToastContext';
import { GoogleIcon } from '@/features/auth/components/GoogleIcon';
// import { FacebookIcon } from '@/features/auth/components/FacebookIcon'; // TODO: réactiver quand app FB vérifiée

export default function LoginPage() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const signInWithOAuth = useStore((s) => s.signInWithOAuth);
  const signInWithMagicLink = useStore((s) => s.signInWithMagicLink);
  const user = useStore((s) => s.user);
  const authInitialized = useStore((s) => s.authInitialized);
  const navigate = useNavigate();

  const hasSupabase =
    !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (authInitialized && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authInitialized, user, navigate]);

  // Success message from signup redirect
  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setSuccessMessage(state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  // OAuth errors in URL (e.g. callback ?error=access_denied)
  useEffect(() => {
    const oauthError = searchParams.get('error');
    const oauthErrorDescription = searchParams.get('error_description');
    if (!oauthError) return;

    let message = t('auth.oauthError');
    if (oauthError === 'access_denied' || oauthError === 'user_cancelled') {
      message = t('auth.oauthCancelled');
    } else if (oauthErrorDescription?.toLowerCase().includes('facebook')) {
      message = t('auth.oauthFacebookCancelled');
    } else if (oauthErrorDescription) {
      message = oauthErrorDescription;
    }
    addToast({ message, variant: 'error' });

    const next = new URLSearchParams(searchParams);
    next.delete('error');
    next.delete('error_description');
    next.delete('error_code');
    navigate({ pathname: '/login', search: next.toString() }, { replace: true });
  }, [searchParams, navigate, t, addToast]);

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
      return;
    }
    // OAuth redirects away; no need to set oauthLoading to null
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
              data-testid="login-welcome-title"
            >
              {t('auth.welcomeTitle')}
            </h1>
            <p className="text-stone-600 dark:text-stone-400" data-testid="login-welcome-subtitle">
              {t('auth.welcomeSubtitle')}
            </p>
          </div>

          <Card className="p-8" data-testid="login-form">
            <h2
              className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-6"
              data-testid="login-form-title"
            >
              {t('auth.signIn')}
            </h2>

            {successMessage && (
              <div
                className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-start gap-2"
                data-testid="login-success-message"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
                data-testid="login-error-message"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleMagicLink}
              className="space-y-4 mb-6"
              data-testid="login-email-form"
            >
              <Input
                id="login-email"
                type="email"
                label={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={emailLoading}
                placeholder={t('auth.emailPlaceholder')}
                data-testid="login-email-input"
              />
              <Button
                type="submit"
                disabled={emailLoading}
                className="w-full"
                loading={emailLoading}
                data-testid="login-send-magic-link"
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
              {t('auth.dontHaveAccount')}{' '}
              <Link
                to="/signup"
                data-testid="login-signup-link"
                className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
              >
                {t('auth.signUp')}
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

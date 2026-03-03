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
import { LoginForm } from '@/pages/login/LoginForm';
import { SocialLoginButtons } from '@/pages/login/SocialLoginButtons';
import { LoginHeader } from '@/pages/login/LoginHeader';

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
          <LoginHeader successMessage={successMessage} />

          <Card className="p-8" data-testid="login-form">
            <h2
              className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-6"
              data-testid="login-form-title"
            >
              {t('auth.signIn')}
            </h2>

            <LoginForm
              email={email}
              error={error}
              loading={emailLoading}
              onEmailChange={setEmail}
              onSubmit={handleMagicLink}
            />

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

            <SocialLoginButtons
              disabled={emailLoading || oauthLoading !== null}
              loadingProvider={oauthLoading}
              onLogin={handleOAuth}
            />

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

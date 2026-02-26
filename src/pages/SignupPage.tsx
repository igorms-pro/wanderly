import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Plane, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const refreshUser = useStore((state) => state.refreshUser);
  const signInWithOAuth = useStore((state) => state.signInWithOAuth);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null);
  const hasSupabase =
    !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 6) {
      return { valid: false, message: t('auth.passwordMinLength') };
    }
    if (password.length > 72) {
      return { valid: false, message: t('auth.passwordMaxLength') };
    }
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    setLoadingStep('');

    // Validate display name
    if (!displayName.trim()) {
      setError(t('auth.displayNameRequired'));
      setLoading(false);
      return;
    }

    if (displayName.trim().length < 2) {
      setError(t('auth.displayNameMinLength'));
      setLoading(false);
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      setError(t('auth.emailRequired'));
      setLoading(false);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    try {
      setLoadingStep(t('auth.creatingYourAccount'));

      // Sign up with Supabase (profile will be created by trigger)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) {
        // Handle specific Supabase errors
        if (authError.message.includes('already registered')) {
          throw new Error(t('auth.accountExists'));
        }
        if (authError.message.includes('Invalid email')) {
          throw new Error(t('auth.invalidEmail'));
        }
        if (authError.message.includes('Password')) {
          throw new Error(t('auth.passwordRequirements'));
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error(t('auth.noUserReturned'));
      }

      // Check if email confirmation is required
      if (authData.user && !authData.session) {
        // Email confirmation is required
        setSuccess(true);
        setLoadingStep(t('auth.checkEmail'));
        setLoading(false);

        // Show success message and redirect to login after a delay
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: t('auth.accountCreatedMessage'),
            },
          });
        }, 3000);
        return;
      }

      // If we have a session, proceed with profile creation check
      setLoadingStep(t('auth.settingUpProfile'));

      // Get profile from profiles table (created by trigger)
      // The trigger should execute immediately, but we'll retry with exponential backoff
      let profile = null;
      let retries = 0;
      const maxRetries = 10;
      const baseDelay = 100; // Start with 100ms

      while (!profile && retries < maxRetries) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (!profileError && data) {
          profile = data;
          break;
        }

        // Log profile error for debugging (but don't fail immediately)
        if (profileError && retries === 0) {
          console.warn('Profile not immediately available, retrying...', profileError);
        }

        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
        const delay = baseDelay * Math.pow(2, retries);
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries++;
      }

      if (!profile) {
        // Profile creation failed - this should not happen if trigger is working
        console.error('Profile not created after retries');

        // Try to refresh user from store (which will check profile)
        setLoadingStep(t('auth.finalizingSetup'));
        await refreshUser();

        // Check if user is now set
        const { user } = useStore.getState();
        if (!user) {
          throw new Error(t('auth.profileCreationDelayed'));
        }

        // User is set, proceed to dashboard
        setSuccess(true);
        setLoadingStep(t('auth.welcomeRedirecting'));
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
        return;
      }

      // Profile exists, refresh user from store to ensure consistency
      setLoadingStep(t('auth.finalizingSetup'));
      await refreshUser();

      // Verify user is set
      const { user } = useStore.getState();
      if (!user) {
        throw new Error(t('auth.failedToLoadProfile'));
      }

      setSuccess(true);
      setLoadingStep(t('auth.welcomeRedirecting'));

      // Navigate to dashboard after a brief delay to show success
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Signup error:', err);

      // Provide user-friendly error messages
      let errorMessage = t('errors.failedToCreateAccount');

      if (err.message) {
        errorMessage = err.message;
      } else if (err.error_description) {
        errorMessage = err.error_description;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
      setLoadingStep('');
    } finally {
      setLoading(false);
    }
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

            {success && (
              <div
                className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-start gap-2"
                data-testid="signup-success-message"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{loadingStep || t('auth.accountCreated')}</span>
              </div>
            )}

            {loading && loadingStep && (
              <div
                className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2"
                data-testid="signup-loading-message"
              >
                <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                <span>{loadingStep}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form-element">
              <Input
                id="signup-displayName"
                label={t('auth.displayName')}
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setError('');
                }}
                required
                disabled={loading || success}
                minLength={2}
                placeholder={t('auth.displayNamePlaceholder')}
                data-testid="signup-display-name-input"
              />
              <Input
                id="signup-email"
                type="email"
                label={t('auth.email')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                disabled={loading || success}
                placeholder={t('auth.emailPlaceholder')}
                data-testid="signup-email-input"
              />
              <Input
                id="signup-password"
                type="password"
                label={t('auth.password')}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                required
                disabled={loading || success}
                minLength={6}
                maxLength={72}
                placeholder={t('auth.passwordMinLength')}
                hint={
                  password
                    ? password.length < 6
                      ? t('auth.passwordMoreChars', { count: 6 - password.length })
                      : password.length > 72
                        ? t('auth.passwordTooLong')
                        : t('auth.passwordLooksGood')
                    : undefined
                }
                data-testid="signup-password-input"
              />
              <Button
                type="submit"
                disabled={loading || success}
                className="w-full"
                loading={loading && !success}
                leftIcon={success ? <CheckCircle2 className="w-5 h-5" /> : undefined}
                data-testid="signup-submit-button"
              >
                {loading && !success
                  ? t('auth.creatingAccount')
                  : success
                    ? t('auth.accountCreated')
                    : t('auth.createAccount')}
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
                disabled={loading || success || oauthLoading !== null}
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
                disabled={loading || success || oauthLoading !== null}
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

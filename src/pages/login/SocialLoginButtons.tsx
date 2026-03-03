import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/features/auth/components/GoogleIcon';
// import { FacebookIcon } from '@/features/auth/components/FacebookIcon'; // TODO: réactiver quand app FB vérifiée

export interface SocialLoginButtonsProps {
  disabled: boolean;
  loadingProvider: 'google' | 'facebook' | null;
  onLogin: (provider: 'google' | 'facebook') => void;
}

export function SocialLoginButtons({
  disabled,
  loadingProvider,
  onLogin,
}: SocialLoginButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700"
        disabled={disabled}
        onClick={() => onLogin('google')}
        loading={loadingProvider === 'google'}
        leftIcon={<GoogleIcon className="w-5 h-5" />}
      >
        {loadingProvider === 'google' ? t('auth.oauthLoading') : t('auth.continueWithGoogle')}
      </Button>
      {/* TODO: réactiver quand app Facebook vérifiée
      <Button
        type="button"
        className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white border-0 focus:ring-[#1877F2]"
        disabled={disabled}
        onClick={() => onLogin('facebook')}
        loading={loadingProvider === 'facebook'}
        leftIcon={<FacebookIcon className="w-5 h-5 text-white" />}
      >
        {loadingProvider === 'facebook'
          ? t('auth.oauthLoading')
          : t('auth.continueWithFacebook')}
      </Button>
      */}
    </div>
  );
}

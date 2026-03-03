import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Plane, CheckCircle2 } from 'lucide-react';

export interface LoginHeaderProps {
  successMessage: string | null;
  children?: ReactNode;
}

export function LoginHeader({ successMessage, children }: LoginHeaderProps) {
  const { t } = useTranslation();

  return (
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
      {successMessage && (
        <div
          className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-start gap-2"
          data-testid="login-success-message"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}
      {children}
    </div>
  );
}

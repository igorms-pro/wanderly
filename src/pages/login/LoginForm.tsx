import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface LoginFormProps {
  email: string;
  error: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function LoginForm({ email, error, loading, onEmailChange, onSubmit }: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-6" data-testid="login-email-form">
      <Input
        id="login-email"
        type="email"
        label={t('auth.email')}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
        disabled={loading}
        placeholder={t('auth.emailPlaceholder')}
        data-testid="login-email-input"
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        loading={loading}
        data-testid="login-send-magic-link"
      >
        {loading ? t('auth.magicLinkSending') : t('auth.sendMagicLink')}
      </Button>
      {error && (
        <div
          className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
          data-testid="login-error-message"
        >
          {error}
        </div>
      )}
    </form>
  );
}

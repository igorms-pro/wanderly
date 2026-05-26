import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link2, Loader2, LogIn, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { useInvitationJoin } from '@/features/trip-sharing';

export default function InviteJoinPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const authInitialized = useStore((s) => s.authInitialized);
  const { inviteCode = '' } = useParams<{ inviteCode: string }>();
  const { preview, loading, joining, error, join } = useInvitationJoin(inviteCode);

  const handleJoin = async () => {
    const result = await join();
    navigate(`/trip/${result.tripId}`);
  };

  const loginHref = `/login?redirect=${encodeURIComponent(`/invite/${inviteCode}`)}`;

  if (!authInitialized || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      </Layout>
    );
  }

  const invalid = !preview?.valid;

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Link2 className="w-6 h-6 text-violet-500" aria-hidden />
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {t('sharing.joinTrip')}
            </h1>
          </div>

          {invalid ? (
            <p className="text-stone-600 dark:text-stone-400">
              {t(`sharing.invalidInvite.${preview?.reason ?? 'unknown'}`)}
            </p>
          ) : (
            <>
              <p className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                {preview.trip_title}
              </p>
              <p className="flex items-center gap-2 text-stone-500 mt-2">
                <MapPin className="w-4 h-4" aria-hidden />
                {preview.destination_text}
              </p>
              <p className="text-sm text-stone-500 mt-4">
                {t('sharing.joinAsRole', {
                  role: t(`sharing.roles.${preview.default_role ?? 'viewer'}`),
                })}
              </p>
            </>
          )}

          {error ? <p className="text-sm text-rose-600 mt-4">{error}</p> : null}

          {!invalid ? (
            <div className="mt-8">
              {user ? (
                <Button onClick={() => void handleJoin()} disabled={joining} className="w-full">
                  {joining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t('sharing.joinTripCta')}
                </Button>
              ) : (
                <Button onClick={() => navigate(loginHref)} className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('sharing.signInToJoin')}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

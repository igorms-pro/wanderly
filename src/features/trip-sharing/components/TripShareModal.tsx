import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Link2, Loader2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTripSharing } from '../hooks/useTripSharing';
import type { InviteRole } from '../types';

type TripShareModalProps = {
  tripId: string;
  inviterId: string;
  onClose: () => void;
};

const ROLE_OPTIONS: InviteRole[] = ['viewer', 'editor', 'moderator'];

export function TripShareModal({ tripId, inviterId, onClose }: TripShareModalProps) {
  const { t } = useTranslation();
  const { invitations, loading, creating, error, createInvite, revokeInvite, buildInviteUrl } =
    useTripSharing(tripId, inviterId);
  const [defaultRole, setDefaultRole] = useState<InviteRole>('viewer');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreate = async () => {
    await createInvite({ defaultRole, expiresInDays: 14, maxUses: 50 });
  };

  const handleCopy = async (code: string) => {
    const url = buildInviteUrl(code);
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-labelledby="share-trip-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-violet-500" aria-hidden />
            <h2
              id="share-trip-title"
              className="text-lg font-bold text-stone-900 dark:text-stone-100"
            >
              {t('sharing.shareTrip')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[44px] min-w-[44px]"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t('sharing.shareDescription')}
          </p>

          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            {t('sharing.defaultRole')}
            <select
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value as InviteRole)}
              className="mt-1 w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 min-h-[44px]"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {t(`sharing.roles.${role}`)}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={() => void handleCreate()} disabled={creating} className="w-full">
            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t('sharing.createLink')}
          </Button>

          {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-4">
              {t('sharing.noLinksYet')}
            </p>
          ) : (
            <ul className="space-y-3">
              {invitations.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono truncate text-stone-600 dark:text-stone-300">
                      {buildInviteUrl(invite.invite_code)}
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      {t('sharing.linkMeta', {
                        role: t(`sharing.roles.${invite.default_role}`),
                        uses: invite.used_count,
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopy(invite.invite_code)}
                    className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 min-h-[44px] min-w-[44px]"
                    aria-label={t('sharing.copyLink')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void revokeInvite(invite.id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 min-h-[44px] min-w-[44px]"
                    aria-label={t('sharing.revokeLink')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {copiedCode === invite.invite_code ? (
                    <span className="sr-only">{t('sharing.copied')}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

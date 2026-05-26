import { Copy, Link2, Bookmark } from 'lucide-react';

type TripDetailHeroActionsProps = {
  canEdit: () => boolean;
  canDelete: () => boolean;
  canShare: () => boolean;
  showFinalizeButton?: boolean;
  isDeleting: boolean;
  onStartEdit: () => void;
  onFinalizeClick?: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onSaveTemplate: () => void;
  t: (key: string) => string;
};

const actionClass =
  'px-4 py-2.5 min-h-[44px] bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition flex items-center';

export function TripDetailHeroActions({
  canEdit,
  canDelete,
  canShare,
  showFinalizeButton,
  isDeleting,
  onStartEdit,
  onFinalizeClick,
  onDelete,
  onShare,
  onDuplicate,
  onSaveTemplate,
  t,
}: TripDetailHeroActionsProps) {
  return (
    <div className="flex flex-shrink-0 flex-wrap gap-2">
      {canShare() ? (
        <button
          type="button"
          onClick={onShare}
          className={actionClass}
          aria-label={t('sharing.shareTrip')}
        >
          <Link2 className="w-4 h-4 mr-2" aria-hidden />
          {t('sharing.shareTrip')}
        </button>
      ) : null}
      {canEdit() ? (
        <>
          <button
            type="button"
            onClick={onDuplicate}
            className={actionClass}
            aria-label={t('sharing.duplicateTrip')}
          >
            <Copy className="w-4 h-4 mr-2" aria-hidden />
            {t('sharing.duplicateTrip')}
          </button>
          <button
            type="button"
            onClick={onSaveTemplate}
            className={actionClass}
            aria-label={t('templates.saveAsTemplate')}
          >
            <Bookmark className="w-4 h-4 mr-2" aria-hidden />
            {t('templates.saveAsTemplate')}
          </button>
          <button type="button" onClick={onStartEdit} className={actionClass}>
            {t('tripDetail.edit')}
          </button>
        </>
      ) : null}
      {showFinalizeButton && onFinalizeClick ? (
        <button type="button" onClick={onFinalizeClick} className={actionClass}>
          {t('tripDetail.finalizeItinerary')}
        </button>
      ) : null}
      {canDelete() ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="px-4 py-2.5 min-h-[44px] bg-red-500/80 backdrop-blur-sm border border-red-400/30 rounded-lg text-white hover:bg-red-600/80 transition flex items-center disabled:opacity-50"
        >
          {isDeleting ? t('tripDetail.deleting') : t('tripDetail.delete')}
        </button>
      ) : null}
    </div>
  );
}

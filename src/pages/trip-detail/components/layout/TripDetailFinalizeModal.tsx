import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface TripDetailFinalizeModalProps {
  isOpen: boolean;
  isFinalizing: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  t: (key: string) => string;
}

export function TripDetailFinalizeModal({
  isOpen,
  isFinalizing,
  onClose,
  onConfirm,
  t,
}: TripDetailFinalizeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('tripDetail.finalizeModalTitle')}
      closeOnBackdrop={!isFinalizing}
      showCloseButton={!isFinalizing}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isFinalizing}>
            {t('tripDetail.cancel')}
          </Button>
          <Button variant="primary" onClick={() => void onConfirm()} disabled={isFinalizing}>
            {isFinalizing ? t('tripDetail.finalizing') : t('tripDetail.finalizeConfirm')}
          </Button>
        </>
      }
    >
      <p className="text-stone-600 dark:text-stone-300">{t('tripDetail.finalizeModalBody')}</p>
    </Modal>
  );
}

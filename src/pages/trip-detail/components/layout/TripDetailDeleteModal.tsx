import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface TripDetailDeleteModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  t: (key: string) => string;
}

export function TripDetailDeleteModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
  t,
}: TripDetailDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('tripDetail.delete')}
      closeOnBackdrop
      showCloseButton
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('tripDetail.cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? t('tripDetail.deleting') : t('tripDetail.delete')}
          </Button>
        </>
      }
    >
      <p className="text-stone-600 dark:text-stone-300">{t('tripDetail.confirmDelete')}</p>
    </Modal>
  );
}

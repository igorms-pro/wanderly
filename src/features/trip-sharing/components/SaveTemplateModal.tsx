import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Trip } from '@/lib/types/database.types';
import { useTripTemplates } from '../hooks/useTripTemplates';

type SaveTemplateModalProps = {
  trip: Trip;
  userId: string;
  onClose: () => void;
  onSaved?: () => void;
};

export function SaveTemplateModal({ trip, userId, onClose, onSaved }: SaveTemplateModalProps) {
  const { t } = useTranslation();
  const { saveTemplate } = useTripTemplates(userId);
  const [title, setTitle] = useState(trip.title);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('templates.titleRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveTemplate(trip, {
        title: title.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('templates.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full"
        role="dialog"
        aria-labelledby="save-template-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-violet-500" aria-hidden />
            <h2 id="save-template-title" className="text-lg font-bold">
              {t('templates.saveAsTemplate')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px]"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <label className="block text-sm font-medium">
            {t('templates.templateTitle')}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[44px] dark:bg-stone-800 dark:border-stone-600"
            />
          </label>
          <label className="block text-sm font-medium">
            {t('templates.templateDescription')}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-stone-800 dark:border-stone-600"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            {t('templates.makePublic')}
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t('templates.saveTemplate')}
          </Button>
        </div>
      </form>
    </div>
  );
}

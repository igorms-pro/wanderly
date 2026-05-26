import { FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutTemplate, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTripTemplates } from '../hooks/useTripTemplates';
import type { TripTemplate } from '../types';

type TemplatePickerModalProps = {
  userId: string;
  onClose: () => void;
  onCreated: (tripId: string) => void;
};

export function TemplatePickerModal({ userId, onClose, onCreated }: TemplatePickerModalProps) {
  const { t } = useTranslation();
  const { myTemplates, publicTemplates, loading, createFromTemplate } = useTripTemplates(userId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = useMemo(() => {
    const seen = new Set<string>();
    return [...myTemplates, ...publicTemplates].filter((tpl) => {
      if (seen.has(tpl.id)) return false;
      seen.add(tpl.id);
      return true;
    });
  }, [myTemplates, publicTemplates]);

  const selected = templates.find((tpl) => tpl.id === selectedId) ?? null;

  const handleSelect = (template: TripTemplate) => {
    setSelectedId(template.id);
    setTitle(template.title);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !title.trim() || !startDate) {
      setError(t('templates.createFieldsRequired'));
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const trip = await createFromTemplate(selected, title.trim(), startDate);
      onCreated(trip.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('templates.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col"
        role="dialog"
        aria-labelledby="template-picker-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-violet-500" aria-hidden />
            <h2 id="template-picker-title" className="text-lg font-bold">
              {t('templates.createFromTemplate')}
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

        <div className="p-6 space-y-4 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-6">{t('templates.empty')}</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(template)}
                    className={`w-full text-left p-3 rounded-xl border min-h-[44px] ${
                      selectedId === template.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <p className="font-medium">{template.title}</p>
                    <p className="text-xs text-stone-500">{template.destination_text}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selected ? (
            <>
              <label className="block text-sm font-medium">
                {t('templates.tripTitle')}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[44px] dark:bg-stone-800 dark:border-stone-600"
                />
              </label>
              <label className="block text-sm font-medium">
                {t('sharing.startDate')}
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[44px] dark:bg-stone-800 dark:border-stone-600"
                />
              </label>
            </>
          ) : null}

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={creating || !selected} className="w-full">
            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t('templates.createTrip')}
          </Button>
        </div>
      </form>
    </div>
  );
}

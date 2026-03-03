import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  AlertCircle,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORY_OPTIONS = [
  'Restaurant',
  'Attraction',
  'Hotel',
  'Transport',
  'Activity',
  'Shopping',
  'Entertainment',
  'Nightlife',
  'Culture',
  'Nature',
  'Other',
] as const;

export interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  cost: string;
  currency: string;
  lat: string;
  lon: string;
  status: 'proposed' | 'confirmed' | 'rejected';
}

interface ActivityBasicFieldsProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityBasicFields({ formData, onChange }: ActivityBasicFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('activityModal.title')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={t('activityModal.titlePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('activityModal.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder={t('activityModal.descriptionPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          {t('activityModal.category')}
        </label>
        <select
          value={formData.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="">{t('activityModal.selectCategory')}</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

interface ActivityPlanningFieldsProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityPlanningFields({ formData, onChange }: ActivityPlanningFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            {t('activityModal.date')}
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            {t('activityModal.startTime')}
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('activityModal.endTime')}
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            min={formData.startTime || undefined}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          {t('activityModal.costPerPerson')}
        </label>
        <div className="flex space-x-2">
          <select
            value={formData.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => onChange({ cost: e.target.value })}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="0.00"
          />
        </div>
      </div>
    </>
  );
}

interface ActivityAdvancedFieldsProps {
  formData: ActivityFormData;
  onChange: (updates: Partial<ActivityFormData>) => void;
}

export function ActivityAdvancedFields({ formData, onChange }: ActivityAdvancedFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('activityModal.latitude')}
          </label>
          <input
            type="number"
            step="any"
            value={formData.lat}
            onChange={(e) => onChange({ lat: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder={t('activityModal.latitudePlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('activityModal.longitude')}
          </label>
          <input
            type="number"
            step="any"
            value={formData.lon}
            onChange={(e) => onChange({ lon: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder={t('activityModal.longitudePlaceholder')}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('activityModal.status')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['proposed', 'confirmed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ status })}
              className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                formData.status === status
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              {t(`activityModal.${status}`)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

interface ActivityModalShellProps {
  title: string;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export function ActivityModalShell({
  title,
  error,
  loading,
  onClose,
  onSubmit,
  children,
}: ActivityModalShellProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {children}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('activityModal.creating')}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  {t('activityModal.createActivity')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

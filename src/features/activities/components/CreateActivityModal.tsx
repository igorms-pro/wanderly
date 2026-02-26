import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import {
  X,
  Plus,
  Loader2,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  AlertCircle,
} from 'lucide-react';

interface CreateActivityModalProps {
  tripId: string;
  onClose: () => void;
}

export default function CreateActivityModal({ tripId, onClose }: CreateActivityModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createActivity = useStore((state) => state.createActivity);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    cost: '',
    currency: 'USD',
    lat: '',
    lon: '',
    status: 'proposed' as 'proposed' | 'confirmed' | 'rejected',
  });

  const categoryOptions = [
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
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setError(t('activityModal.titleRequired') || 'Title is required');
      return;
    }

    // Validate time range
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) {
        setError(t('activityModal.endTimeAfterStart') || 'End time must be after start time');
        return;
      }
    }

    // Validate cost if provided
    if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) {
      setError(t('activityModal.invalidCost') || 'Cost must be a positive number');
      return;
    }

    // Validate coordinates if provided
    if (
      formData.lat &&
      (isNaN(parseFloat(formData.lat)) ||
        parseFloat(formData.lat) < -90 ||
        parseFloat(formData.lat) > 90)
    ) {
      setError(t('activityModal.invalidLatitude') || 'Latitude must be between -90 and 90');
      return;
    }
    if (
      formData.lon &&
      (isNaN(parseFloat(formData.lon)) ||
        parseFloat(formData.lon) < -180 ||
        parseFloat(formData.lon) > 180)
    ) {
      setError(t('activityModal.invalidLongitude') || 'Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);

    try {
      // Database schema uses TIME (not TIMESTAMP), so we send just the time portion
      // Format: HH:MM:SS (TIME format for database)
      let start_time: string | undefined;
      let end_time: string | undefined;

      if (formData.startTime) {
        const timeParts = formData.startTime.split(':');
        if (timeParts.length === 2) {
          start_time = `${formData.startTime}:00`;
        } else {
          start_time = formData.startTime;
        }
      }
      if (formData.endTime) {
        const timeParts = formData.endTime.split(':');
        if (timeParts.length === 2) {
          end_time = `${formData.endTime}:00`;
        } else {
          end_time = formData.endTime;
        }
      }

      // Create activity using store function
      await createActivity({
        trip_id: tripId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category || undefined,
        start_time: start_time,
        end_time: end_time,
        cost_cents: formData.cost ? Math.round(parseFloat(formData.cost) * 100) : undefined,
        currency: formData.currency,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lon: formData.lon ? parseFloat(formData.lon) : undefined,
        status: formData.status,
        source: 'manual',
      });

      // Reset form after successful creation
      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        startTime: '',
        endTime: '',
        cost: '',
        currency: 'USD',
        lat: '',
        lon: '',
        status: 'proposed',
      });

      // Close modal - activities will refresh via real-time subscription
      onClose();
    } catch (err: any) {
      console.error('Error creating activity:', err);
      let errorMessage = t('errors.failedToCreateActivity') || 'Failed to create activity';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.code === '23505') {
        errorMessage = t('errors.duplicateActivity') || 'An activity with this name already exists';
      } else if (err.code === '23503') {
        errorMessage = t('errors.invalidTrip') || 'Invalid trip reference';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('activityModal.addActivity')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('activityModal.title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder={t('activityModal.titlePlaceholder')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('activityModal.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder={t('activityModal.descriptionPlaceholder')}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              {t('activityModal.category')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">{t('activityModal.selectCategory')}</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('activityModal.date')}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                min={formData.startTime || undefined}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('activityModal.costPerPerson')}
            </label>
            <div className="flex space-x-2">
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Location (Optional) */}
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
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={t('activityModal.longitudePlaceholder')}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('activityModal.status')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['proposed', 'confirmed', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
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

          {/* Submit Button */}
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

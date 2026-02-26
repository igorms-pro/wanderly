import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { generateItinerary, ItineraryRequest } from '@/lib/openai-service';
import {
  X,
  Sparkles,
  Loader2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface CreateTripModalProps {
  onClose: () => void;
}

export default function CreateTripModal({ onClose }: CreateTripModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const user = useStore((state) => state.user);
  const createTrip = useStore((state) => state.createTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);
  const setActivities = useStore((state) => state.setActivities);

  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    groupSize: 2,
    pace: 'balanced' as 'relaxed' | 'balanced' | 'packed',
    budget: '',
    currency: 'USD',
    interests: [] as string[],
  });

  const interestOptions = [
    'cultureMuseums',
    'foodDining',
    'natureOutdoors',
    'adventure',
    'shopping',
    'nightlife',
    'history',
    'relaxation',
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Create trip using Supabase
      const trip = await createTrip({
        title: `${formData.destination} Adventure`,
        destination_text: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: 'planned',
        budget_cents: formData.budget ? parseInt(formData.budget) * 100 : undefined,
        currency: formData.currency,
      });

      setCurrentTrip(trip);

      // Generate itinerary with AI
      const request: ItineraryRequest = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        groupSize: formData.groupSize,
        pace: formData.pace,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        currency: formData.currency,
        interests: formData.interests.map((i) => {
          // Map back to original format for API
          const mapping: Record<string, string> = {
            cultureMuseums: 'Culture & Museums',
            foodDining: 'Food & Dining',
            natureOutdoors: 'Nature & Outdoors',
            adventure: 'Adventure',
            shopping: 'Shopping',
            nightlife: 'Nightlife',
            history: 'History',
            relaxation: 'Relaxation',
          };
          return mapping[i] || i;
        }),
      };

      // Note: Activities creation will be handled in a future agent
      // For now, just generate the itinerary (can be saved later)
      await generateItinerary(request);

      // Navigate to trip page
      navigate(`/trip/${trip.id}`);
      onClose();
    } catch (err: any) {
      console.error('Error creating trip:', err);
      setError(err.message || t('errors.failedToCreateAccount'));
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
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('tripModal.createTripWithAI')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
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
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              {t('tripModal.destination')}
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder={t('tripModal.destinationPlaceholder')}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('tripModal.startDate')}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tripModal.endDate')}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                min={formData.startDate}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              {t('tripModal.groupSize')}
            </label>
            <input
              type="number"
              value={formData.groupSize}
              onChange={(e) => setFormData({ ...formData, groupSize: parseInt(e.target.value) })}
              required
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Travel Pace */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tripModal.travelPace')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['relaxed', 'balanced', 'packed'] as const).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setFormData({ ...formData, pace })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                    formData.pace === pace
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {t(`tripModal.${pace}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('tripModal.budgetPerPerson')}
            </label>
            <div className="flex space-x-2">
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={t('tripModal.budgetPlaceholder')}
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('tripModal.interests')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition ${
                    formData.interests.includes(interest)
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {t(`tripModal.${interest}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
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
                  {t('tripModal.generatingItinerary')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('tripModal.createTrip')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

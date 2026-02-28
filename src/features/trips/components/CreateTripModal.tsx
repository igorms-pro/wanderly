import { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { generateItinerary, ItineraryRequest } from '@/lib/openai-service';
import { X, Sparkles, Loader2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import {
  TripFormData,
  StepDestination,
  StepTravelers,
  StepStyle,
  StepInterests,
} from './CreateTripSteps';

interface CreateTripModalProps {
  onClose: () => void;
}

const TOTAL_STEPS = 4;

const INTEREST_LABELS: Record<string, string> = {
  cultureMuseums: 'Culture & Museums',
  foodDining: 'Food & Dining',
  natureOutdoors: 'Nature & Outdoors',
  adventure: 'Adventure',
  shopping: 'Shopping',
  nightlife: 'Nightlife',
  history: 'History',
  relaxation: 'Relaxation',
};

export default function CreateTripModal({ onClose }: CreateTripModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const user = useStore((state) => state.user);
  const createTrip = useStore((state) => state.createTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);

  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    groupSize: 2,
    hasChildren: false,
    pace: 'balanced',
    budget: '',
    currency: 'USD',
    interests: [],
  });

  const updateForm = (updates: Partial<TripFormData>) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const clearError = (field: string) => setFieldErrors((prev) => ({ ...prev, [field]: '' }));

  const validateStep = useCallback(
    (s: number): boolean => {
      const errors: Record<string, string> = {};
      if (s === 1) {
        if (!formData.destination.trim()) errors.destination = t('tripModal.destinationRequired');
        if (!formData.startDate || !formData.endDate) errors.dates = t('tripModal.datesRequired');
        else if (formData.endDate < formData.startDate) errors.dates = t('tripModal.dateError');
      }
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    },
    [formData, t],
  );

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const constraints = {
        budget_per_person_cents: formData.budget ? parseInt(formData.budget) * 100 : null,
        has_children: formData.hasChildren,
        pace: formData.pace,
        preferences: formData.interests,
        group_size: formData.groupSize,
      };

      const trip = await createTrip({
        title: `${formData.destination} Adventure`,
        destination_text: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: 'planned',
        budget_cents: formData.budget ? parseInt(formData.budget) * 100 : undefined,
        currency: formData.currency,
        constraints,
      });

      setCurrentTrip(trip);

      const request: ItineraryRequest = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        groupSize: formData.groupSize,
        pace: formData.pace,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        currency: formData.currency,
        interests: formData.interests.map((i) => INTEREST_LABELS[i] || i),
      };

      await generateItinerary(request);
      navigate(`/trip/${trip.id}`);
      onClose();
    } catch (err: any) {
      console.error('Error creating trip:', err);
      setError(err.message || t('errors.failedToCreateAccount'));
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    t('tripModal.stepDestination'),
    t('tripModal.stepTravelers'),
    t('tripModal.stepStyle'),
    t('tripModal.stepInterests'),
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                {t('tripModal.createTripWithAI')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('tripModal.stepOf', { current: step, total: TOTAL_STEPS })}
              </p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    i + 1 <= step
                      ? 'bg-gradient-to-r from-violet-500 to-indigo-500'
                      : 'bg-stone-200 dark:bg-stone-700'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    i + 1 <= step
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form body — each step is a pure component */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-2">
          {step === 1 && (
            <StepDestination
              formData={formData}
              onChange={updateForm}
              fieldErrors={fieldErrors}
              onClearError={clearError}
            />
          )}
          {step === 2 && <StepTravelers formData={formData} onChange={updateForm} />}
          {step === 3 && <StepStyle formData={formData} onChange={updateForm} />}
          {step === 4 && <StepInterests formData={formData} onChange={updateForm} />}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-5 py-3 border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('tripModal.back')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition"
            >
              {t('common.cancel')}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition shadow-md hover:shadow-lg"
            >
              {t('tripModal.next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('tripModal.generatingItinerary')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {t('tripModal.createTrip')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

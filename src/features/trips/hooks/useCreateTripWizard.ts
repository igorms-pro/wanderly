import { FormEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';
import { generateItinerary, ItineraryRequest } from '@/lib/openai-service';
import type { TripFormData } from '../components/CreateTripSteps';

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

export function useCreateTripWizard(onClose: () => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const user = useStore((state) => state.user);
  const createTrip = useStore((state) => state.createTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  const handlePrevious = () => {
    setStep((s) => Math.max(1, s - 1));
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

  return {
    step,
    TOTAL_STEPS,
    loading,
    error,
    fieldErrors,
    formData,
    stepLabels,
    updateForm,
    clearError,
    handleNext,
    handlePrevious,
    handleSubmit,
  };
}

import type { EditFormState } from '@/pages/trip-detail/components/layout/TripDetailHero';

export interface UpdateTripParams {
  tripId: string | undefined;
  currentTrip: { id: string } | null;
  editForm: EditFormState;
  addToast: (o: { variant: 'success' | 'error'; message: string }) => void;
  t: (key: string) => string;
  updateTrip: (id: string, u: any) => Promise<void>;
  setIsEditing: (v: boolean) => void;
  loadTripData: () => Promise<void>;
}

export async function updateTripHandler(params: UpdateTripParams): Promise<void> {
  const { tripId, currentTrip, editForm, addToast, t, updateTrip, setIsEditing, loadTripData } =
    params;
  if (!tripId || !currentTrip) return;
  const title = editForm.title.trim();
  if (!title) {
    addToast({ variant: 'error', message: t('tripDetail.titleRequired') });
    return;
  }
  if (editForm.end_date < editForm.start_date) {
    addToast({ variant: 'error', message: t('errors.invalidDates') });
    return;
  }
  const budgetCents = editForm.budget ? Math.round(parseFloat(editForm.budget) * 100) : null;
  const constraints = {
    pace: editForm.pace,
    budget_per_person_cents: budgetCents,
    has_children: editForm.has_children,
  };
  try {
    await updateTrip(tripId, {
      title,
      destination_text: editForm.destination_text.trim(),
      start_date: editForm.start_date,
      end_date: editForm.end_date,
      status: editForm.status,
      currency: editForm.currency || undefined,
      budget_cents: budgetCents ?? undefined,
      constraints,
    });
    setIsEditing(false);
    await loadTripData();
    addToast({ variant: 'success', message: t('tripDetail.savedSuccess') });
  } catch (err: any) {
    console.error('Error updating trip:', err);
    addToast({
      variant: 'error',
      message: err.message || t('errors.failedToUpdateTrip'),
    });
  }
}

export interface DeleteTripParams {
  tripId: string | undefined;
  currentTrip: { id: string } | null;
  addToast: (o: { variant: 'success' | 'error'; message: string }) => void;
  t: (key: string) => string;
  deleteTrip: (id: string) => Promise<void>;
  navigate: (path: string) => void;
  setIsDeleting: (v: boolean) => void;
}

export async function deleteTripHandler(params: DeleteTripParams): Promise<void> {
  const { tripId, currentTrip, addToast, t, deleteTrip, navigate, setIsDeleting } = params;
  if (!tripId || !currentTrip) return;
  setIsDeleting(true);
  try {
    await deleteTrip(tripId);
    addToast({ variant: 'success', message: t('tripDetail.deleteSuccess') });
    navigate('/dashboard');
  } catch (err: any) {
    console.error('Error deleting trip:', err);
    addToast({
      variant: 'error',
      message: err.message || t('errors.failedToDeleteTrip'),
    });
    setIsDeleting(false);
  }
}

import type { Database } from '../types/database.types';
import { supabase } from '../supabase';
import type { AppState, SetState, GetState } from './types';

type ItineraryDayRow = Database['public']['Tables']['itinerary_days']['Row'];

export function createTripDetailItineraryDaysSlice(
  set: SetState,
  get: GetState,
): Pick<
  AppState,
  | 'activeItineraryDays'
  | 'setActiveItineraryDays'
  | 'loadActiveItineraryDays'
  | 'getActiveItineraryDayIdByDate'
> {
  return {
    activeItineraryDays: [],

    setActiveItineraryDays: (days) => set({ activeItineraryDays: days }),

    loadActiveItineraryDays: async (itineraryId) => {
      try {
        const { data: days, error } = await supabase
          .from('itinerary_days')
          .select('*')
          .eq('itinerary_id', itineraryId)
          .is('deleted_at', null)
          .order('day_index', { ascending: true });

        if (error) {
          console.error('Error loading active itinerary days:', error);
          throw error;
        }

        set({ activeItineraryDays: (days || []) as ItineraryDayRow[] });
      } catch (err) {
        console.error('Error loading active itinerary days:', err);
        throw err;
      }
    },

    getActiveItineraryDayIdByDate: (date) => {
      const { activeItineraryDays } = get();
      const day = activeItineraryDays.find((d) => d.date === date && !d.deleted_at);
      return day?.id ?? null;
    },
  };
}

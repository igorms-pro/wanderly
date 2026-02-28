import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState } from './types';
import { createAuthSlice } from './auth-slice';
import { createTripsSlice } from './trips-slice';
import { createTripDetailSlice } from './trip-detail-slice';
import { createUiSlice } from './ui-slice';

const STORAGE_KEY = 'voyagely-auth';

export const useStore = create<AppState>()(
  persist(
    (set, get) =>
      ({
        ...createAuthSlice(set, get),
        ...createTripsSlice(set, get),
        ...createTripDetailSlice(set, get),
        ...createUiSlice(set),
      }) as AppState,
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({}),
    },
  ),
);

export type { AppState, CreateTripData, CreateActivityData } from './types';
export { profileToUser } from './auth-slice';

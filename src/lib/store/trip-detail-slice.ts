import type { AppState, SetState, GetState } from './types';
import { createTripDetailActivitiesSlice } from './tripDetailSlice.activities';
import { createTripDetailVotesSlice } from './tripDetailSlice.votes';
import { createTripDetailScenariosSlice } from './tripDetailSlice.scenarios';
import { createTripDetailItineraryDaysSlice } from './tripDetailSlice.itineraryDays';
import { createTripDetailActiveItinerarySlice } from './tripDetailSlice.activeItinerary';
import { createTripDetailAiScenarioOpsSlice } from './tripDetailSlice.aiScenarioOps';

export function createTripDetailSlice(set: SetState, get: GetState): Partial<AppState> {
  return {
    ...createTripDetailActivitiesSlice(set, get),
    ...createTripDetailVotesSlice(set, get),
    ...createTripDetailScenariosSlice(set, get),
    ...createTripDetailItineraryDaysSlice(set, get),
    ...createTripDetailActiveItinerarySlice(set, get),
    ...createTripDetailAiScenarioOpsSlice(set, get),
    messages: [],
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  };
}

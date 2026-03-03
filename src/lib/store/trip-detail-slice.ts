import type { AppState, SetState, GetState } from './types';
import { createTripDetailActivitiesSlice } from './tripDetailSlice.activities';
import { createTripDetailVotesSlice } from './tripDetailSlice.votes';

export function createTripDetailSlice(set: SetState, get: GetState): Partial<AppState> {
  return {
    ...createTripDetailActivitiesSlice(set, get),
    ...createTripDetailVotesSlice(set, get),
    messages: [],
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  };
}

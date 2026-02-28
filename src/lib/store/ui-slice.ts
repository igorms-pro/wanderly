import type { AppState, SetState } from './types';

export function createUiSlice(set: SetState): Partial<AppState> {
  return {
    isGeneratingItinerary: false,
    setIsGeneratingItinerary: (isGenerating) => set({ isGeneratingItinerary: isGenerating }),

    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    showCreateTripModal: false,
    setShowCreateTripModal: (show) => set({ showCreateTripModal: show }),

    showAddActivityModal: false,
    setShowAddActivityModal: (show) => set({ showAddActivityModal: show }),
  };
}

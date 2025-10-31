// Global state management using Zustand
import { create } from 'zustand';
import { User, Trip, Activity, Message } from './mock-supabase';

interface AppState {
  // Auth state
  user: User | null;
  setUser: (user: User | null) => void;

  // Trips state
  trips: Trip[];
  currentTrip: Trip | null;
  setTrips: (trips: Trip[]) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;
  updateTripInState: (tripId: string, updates: Partial<Trip>) => void;

  // Activities state
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivityInState: (activityId: string, updates: Partial<Activity>) => void;

  // Messages state
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // UI state
  isGeneratingItinerary: boolean;
  setIsGeneratingItinerary: (isGenerating: boolean) => void;
  
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Modal state
  showCreateTripModal: boolean;
  setShowCreateTripModal: (show: boolean) => void;
  
  showAddActivityModal: boolean;
  setShowAddActivityModal: (show: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Auth state
  user: null,
  setUser: (user) => set({ user }),

  // Trips state
  trips: [],
  currentTrip: null,
  setTrips: (trips) => set({ trips }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  addTrip: (trip) => set((state) => ({ trips: [...state.trips, trip] })),
  updateTripInState: (tripId, updates) => 
    set((state) => ({
      trips: state.trips.map((t) => (t.id === tripId ? { ...t, ...updates } : t)),
      currentTrip: state.currentTrip?.id === tripId 
        ? { ...state.currentTrip, ...updates } 
        : state.currentTrip,
    })),

  // Activities state
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => 
    set((state) => ({ activities: [...state.activities, activity] })),
  updateActivityInState: (activityId, updates) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, ...updates } : a
      ),
    })),

  // Messages state
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),

  // UI state
  isGeneratingItinerary: false,
  setIsGeneratingItinerary: (isGenerating) => set({ isGeneratingItinerary: isGenerating }),
  
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Modal state
  showCreateTripModal: false,
  setShowCreateTripModal: (show) => set({ showCreateTripModal: show }),
  
  showAddActivityModal: false,
  setShowAddActivityModal: (show) => set({ showAddActivityModal: show }),
}));

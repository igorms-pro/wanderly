import type { User, Trip, Activity, Message, Vote } from '../types/database.types';
import type { TripScenario } from './tripDetailSlice.scenarios';

/** Full app state and actions – composed from slices in store/*.ts */
export interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  authInitialized: boolean;
  setAuthInitialized: (v: boolean) => void;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;

  // Trips
  trips: Trip[];
  currentTrip: Trip | null;
  setTrips: (trips: Trip[]) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;
  updateTripInState: (tripId: string, updates: Partial<Trip>) => void;
  loadTrips: () => Promise<void>;
  createTrip: (tripData: CreateTripData) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  ensureActiveItinerary: (trip: Trip) => Promise<string>;
  setActiveItinerary: (tripId: string, itineraryId: string) => Promise<void>;

  // Activities
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivityInState: (activityId: string, updates: Partial<Activity>) => void;
  loadActivities: (tripId: string) => Promise<void>;
  createActivity: (activityData: CreateActivityData) => Promise<Activity>;
  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;

  // Scenarios
  scenarios: TripScenario[];
  setScenarios: (scenarios: TripScenario[]) => void;
  addScenario: (scenario: TripScenario) => void;
  removeScenario: (scenarioId: string) => void;
  loadScenarios: (tripId: string) => Promise<void>;
  createScenario: (
    tripId: string,
    payload: { title: string | null; days: { date: string; dayIndex?: number }[] },
  ) => Promise<TripScenario>;
  deleteScenario: (scenarioId: string) => Promise<void>;

  // Votes
  votes: Record<string, Vote[]>;
  setVotes: (votes: Record<string, Vote[]>) => void;
  loadVotes: (activityIds: string[]) => Promise<void>;
  createOrUpdateVote: (activityId: string, choice: 'up' | 'down') => Promise<void>;

  // Messages
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;

  // UI
  isGeneratingItinerary: boolean;
  setIsGeneratingItinerary: (isGenerating: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showCreateTripModal: boolean;
  setShowCreateTripModal: (show: boolean) => void;
  showAddActivityModal: boolean;
  setShowAddActivityModal: (show: boolean) => void;
}

export interface CreateTripData {
  title: string;
  destination_text: string;
  start_date: string;
  end_date: string;
  status?: 'planned' | 'locked' | 'archived';
  budget_cents?: number;
  currency?: string;
  constraints?: Record<string, unknown>;
}

export interface CreateActivityData {
  trip_id: string;
  itinerary_day_id?: string;
  title: string;
  description?: string;
  category?: string;
  start_time?: string;
  end_time?: string;
  cost_cents?: number;
  currency?: string;
  lat?: number;
  lon?: number;
  status?: 'proposed' | 'confirmed' | 'rejected';
  source?: 'manual' | 'ai' | 'import';
}

export type SetState = (
  partial: Partial<AppState> | ((state: AppState) => Partial<AppState>),
) => void;
export type GetState = () => AppState;

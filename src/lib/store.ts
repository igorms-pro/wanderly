// Global state management using Zustand
import { create } from 'zustand';
import { User, Trip, Activity, Message, Vote } from './mock-supabase';
import { supabase } from './supabase';
import { Profile } from './types/database.types';
import { setSentryUser, clearSentryUser } from './sentry';
import { Analytics } from './analytics';

// Helper function to map Profile to User format
function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    email: profile.email,
    display_name: profile.display_name || profile.email.split('@')[0],
    avatar_url:
      profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
    created_at: profile.created_at,
  };
}

interface AppState {
  // Auth state
  user: User | null;
  setUser: (user: User | null) => void;
  authInitialized: boolean;

  // Auth functions
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>;

  // Trips state
  trips: Trip[];
  currentTrip: Trip | null;
  setTrips: (trips: Trip[]) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;
  updateTripInState: (tripId: string, updates: Partial<Trip>) => void;

  // Trip CRUD operations
  loadTrips: () => Promise<void>;
  createTrip: (tripData: {
    title: string;
    destination_text: string;
    start_date: string;
    end_date: string;
    status?: 'planned' | 'locked' | 'archived';
    budget_cents?: number;
    currency?: string;
    constraints?: Record<string, any>;
  }) => Promise<Trip>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;

  // Activities state
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivityInState: (activityId: string, updates: Partial<Activity>) => void;

  // Activity CRUD operations
  loadActivities: (tripId: string) => Promise<void>;
  createActivity: (activityData: {
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
  }) => Promise<Activity>;
  updateActivity: (activityId: string, updates: Partial<Activity>) => Promise<void>;

  // Votes state
  votes: Record<string, Vote[]>;
  setVotes: (votes: Record<string, Vote[]>) => void;

  // Votes CRUD operations
  loadVotes: (activityIds: string[]) => Promise<void>;
  createOrUpdateVote: (activityId: string, choice: 'up' | 'down') => Promise<void>;

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

export const useStore = create<AppState>((set, get) => ({
  // Auth state
  user: null,
  setUser: (user) => set({ user }),
  authInitialized: false,

  // Auth functions
  initializeAuth: async () => {
    try {
      // Skip if Supabase is not configured (e.g., in CI/test environments)
      const hasSupabaseConfig =
        import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!hasSupabaseConfig) {
        set({ user: null });
        return;
      }

      // Check for existing session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return;
      }

      if (!session?.user) {
        // No session, clear user state
        set({ user: null });
        clearSentryUser();
        return;
      }

      // Get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        set({ user: null });
        clearSentryUser();
        return;
      }

      if (!profile) {
        set({ user: null });
        clearSentryUser();
        return;
      }

      // Map profile to User format and update state
      const user = profileToUser(profile);
      set({ user });

      // Set user context for Sentry and PostHog
      setSentryUser({
        id: user.id,
        email: user.email,
        username: user.display_name,
      });

      Analytics.identify(user.id, {
        email: user.email,
        displayName: user.display_name,
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null });
      clearSentryUser();
    } finally {
      set({ authInitialized: true });
    }
  },

  signInWithOAuth: async (provider: 'google' | 'facebook') => {
    try {
      const hasSupabaseConfig =
        import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!hasSupabaseConfig) {
        return { error: 'Auth is not configured.' };
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
        },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('cancelled') || msg.includes('denied')) {
          return { error: 'Sign in was cancelled.' };
        }
        return { error: error.message };
      }
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      return { error: message };
    }
  },

  signInWithMagicLink: async (email: string) => {
    try {
      const hasSupabaseConfig =
        import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!hasSupabaseConfig) {
        return { error: 'Auth is not configured.' };
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/dashboard`,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send link.';
      return { error: message };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }

      // Clear user state
      set({ user: null });

      // Clear analytics tracking
      clearSentryUser();

      // Clear trips, activities, votes, messages state
      set({
        trips: [],
        currentTrip: null,
        activities: [],
        votes: {},
        messages: [],
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  },

  refreshUser: async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        // No authenticated user, clear state
        set({ user: null });
        clearSentryUser();
        return;
      }

      // Get profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        set({ user: null });
        clearSentryUser();
        return;
      }

      if (!profile) {
        set({ user: null });
        clearSentryUser();
        return;
      }

      // Map profile to User format and update state
      const user = profileToUser(profile);
      set({ user });

      // Update user context for Sentry and PostHog
      setSentryUser({
        id: user.id,
        email: user.email,
        username: user.display_name,
      });

      Analytics.identify(user.id, {
        email: user.email,
        displayName: user.display_name,
      });
    } catch (error) {
      console.error('Error refreshing user:', error);
      set({ user: null });
      clearSentryUser();
    }
  },

  // Trips state
  trips: [],
  currentTrip: null,
  setTrips: (trips) => set({ trips }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  addTrip: (trip) => set((state) => ({ trips: [...state.trips, trip] })),
  updateTripInState: (tripId, updates) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === tripId ? { ...t, ...updates } : t)),
      currentTrip:
        state.currentTrip?.id === tripId ? { ...state.currentTrip, ...updates } : state.currentTrip,
    })),

  // Trip CRUD operations
  loadTrips: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ trips: [] });
        return;
      }

      // Get trips where user is a member (via trip_members table)
      const { data: memberships, error: membershipsError } = await supabase
        .from('trip_members')
        .select('trip_id')
        .eq('user_id', user.id)
        .is('removed_at', null);

      if (membershipsError) {
        console.error('Error loading trip memberships:', membershipsError);
        throw membershipsError;
      }

      if (!memberships || memberships.length === 0) {
        set({ trips: [] });
        return;
      }

      const tripIds = (memberships as any[]).map((m: any) => m.trip_id);

      // Fetch trips that are not deleted
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .in('id', tripIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (tripsError) {
        console.error('Error loading trips:', tripsError);
        throw tripsError;
      }

      // Map database Trip to mock Trip format
      const mappedTrips: Trip[] = ((trips || []) as any[]).map((trip: any) => ({
        id: trip.id,
        owner_id: trip.owner_id,
        title: trip.title,
        destination_text: trip.destination_text,
        start_date: trip.start_date,
        end_date: trip.end_date,
        status: trip.status,
        budget_cents: trip.budget_cents ?? undefined,
        currency: trip.currency ?? undefined,
        constraints: trip.constraints ?? undefined,
        created_at: trip.created_at,
        updated_at: trip.updated_at,
      }));

      set({ trips: mappedTrips });
    } catch (error) {
      console.error('Error loading trips:', error);
      throw error;
    }
  },

  createTrip: async (tripData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          owner_id: user.id,
          title: tripData.title,
          destination_text: tripData.destination_text,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          status: tripData.status || 'planned',
          budget_cents: tripData.budget_cents ?? null,
          currency: tripData.currency ?? null,
          constraints: tripData.constraints ?? null,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating trip:', error);
        throw error;
      }

      if (!trip) {
        throw new Error('Failed to create trip');
      }

      // Map database Trip to mock Trip format
      const tripFromDb = trip as any;
      const mappedTrip: Trip = {
        id: tripFromDb.id,
        owner_id: tripFromDb.owner_id,
        title: tripFromDb.title,
        destination_text: tripFromDb.destination_text,
        start_date: tripFromDb.start_date,
        end_date: tripFromDb.end_date,
        status: tripFromDb.status,
        budget_cents: tripFromDb.budget_cents ?? undefined,
        currency: tripFromDb.currency ?? undefined,
        constraints: tripFromDb.constraints ?? undefined,
        created_at: tripFromDb.created_at,
        updated_at: tripFromDb.updated_at,
      };

      // Add to state (owner is automatically added as member via trigger)
      set((state) => ({ trips: [mappedTrip, ...state.trips] }));

      return mappedTrip;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  },

  updateTrip: async (tripId, updates) => {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.destination_text !== undefined)
        updateData.destination_text = updates.destination_text;
      if (updates.start_date !== undefined) updateData.start_date = updates.start_date;
      if (updates.end_date !== undefined) updateData.end_date = updates.end_date;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.budget_cents !== undefined)
        updateData.budget_cents = updates.budget_cents ?? null;
      if (updates.currency !== undefined) updateData.currency = updates.currency ?? null;
      if (updates.constraints !== undefined) updateData.constraints = updates.constraints ?? null;

      const { data: trip, error } = await supabase
        .from('trips')
        // @ts-expect-error - Supabase type inference issue
        .update(updateData as any)
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        console.error('Error updating trip:', error);
        throw error;
      }

      if (!trip) {
        throw new Error('Trip not found');
      }

      // Map database Trip to mock Trip format
      const tripData = trip as any;
      const mappedTrip: Trip = {
        id: tripData.id,
        owner_id: tripData.owner_id,
        title: tripData.title,
        destination_text: tripData.destination_text,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        status: tripData.status,
        budget_cents: tripData.budget_cents ?? undefined,
        currency: tripData.currency ?? undefined,
        constraints: tripData.constraints ?? undefined,
        created_at: tripData.created_at,
        updated_at: tripData.updated_at,
      };

      // Update state
      get().updateTripInState(tripId, mappedTrip);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  },

  deleteTrip: async (tripId) => {
    try {
      // Soft delete by setting deleted_at
      const { error } = await supabase
        .from('trips')
        // @ts-expect-error - Supabase type inference issue
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', tripId);

      if (error) {
        console.error('Error deleting trip:', error);
        throw error;
      }

      // Remove from state
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
      }));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  },

  // Activities state
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => set((state) => ({ activities: [...state.activities, activity] })),
  updateActivityInState: (activityId, updates) =>
    set((state) => ({
      activities: state.activities.map((a) => (a.id === activityId ? { ...a, ...updates } : a)),
    })),

  // Activity CRUD operations
  loadActivities: async (tripId) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ activities: [] });
        return;
      }

      // Load activities for this trip that are not deleted
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('trip_id', tripId)
        .is('deleted_at', null)
        .order('start_time', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading activities:', error);
        throw error;
      }

      // Map database Activity to mock Activity format
      const mappedActivities: Activity[] = ((activities || []) as any[]).map((activity: any) => ({
        id: activity.id,
        trip_id: activity.trip_id,
        itinerary_day_id: activity.itinerary_day_id || undefined,
        title: activity.title,
        description: activity.description || '',
        category: activity.category || '',
        start_time: activity.start_time || undefined,
        end_time: activity.end_time || undefined,
        cost_cents: activity.cost_cents ?? undefined,
        lat: activity.lat ?? undefined,
        lon: activity.lon ?? undefined,
        status: activity.status,
        source: activity.source,
        created_at: activity.created_at,
      }));

      set({ activities: mappedActivities });
    } catch (error) {
      console.error('Error loading activities:', error);
      throw error;
    }
  },

  createActivity: async (activityData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          trip_id: activityData.trip_id,
          itinerary_day_id: activityData.itinerary_day_id || null,
          title: activityData.title,
          description: activityData.description || null,
          category: activityData.category || null,
          start_time: activityData.start_time || null,
          end_time: activityData.end_time || null,
          cost_cents: activityData.cost_cents ?? null,
          currency: activityData.currency || 'USD',
          lat: activityData.lat ?? null,
          lon: activityData.lon ?? null,
          status: activityData.status || 'proposed',
          source: activityData.source || 'manual',
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        throw error;
      }

      if (!activity) {
        throw new Error('Failed to create activity');
      }

      // Map database Activity to mock Activity format
      const activityDataFromDb = activity as any;
      const mappedActivity: Activity = {
        id: activityDataFromDb.id,
        trip_id: activityDataFromDb.trip_id,
        itinerary_day_id: activityDataFromDb.itinerary_day_id || undefined,
        title: activityDataFromDb.title,
        description: activityDataFromDb.description || '',
        category: activityDataFromDb.category || '',
        start_time: activityDataFromDb.start_time || undefined,
        end_time: activityDataFromDb.end_time || undefined,
        cost_cents: activityDataFromDb.cost_cents ?? undefined,
        lat: activityDataFromDb.lat ?? undefined,
        lon: activityDataFromDb.lon ?? undefined,
        status: activityDataFromDb.status,
        source: activityDataFromDb.source,
        created_at: activityDataFromDb.created_at,
      };

      // Add to state
      set((state) => ({ activities: [...state.activities, mappedActivity] }));

      return mappedActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  updateActivity: async (activityId, updates) => {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.category !== undefined) updateData.category = updates.category || null;
      if (updates.itinerary_day_id !== undefined)
        updateData.itinerary_day_id = updates.itinerary_day_id || null;
      if (updates.start_time !== undefined) updateData.start_time = updates.start_time || null;
      if (updates.end_time !== undefined) updateData.end_time = updates.end_time || null;
      if (updates.cost_cents !== undefined) updateData.cost_cents = updates.cost_cents ?? null;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.lat !== undefined) updateData.lat = updates.lat ?? null;
      if (updates.lon !== undefined) updateData.lon = updates.lon ?? null;

      const { data: activity, error } = await supabase
        .from('activities')
        // @ts-expect-error - Supabase type inference issue
        .update(updateData as any)
        .eq('id', activityId)
        .select()
        .single();

      if (error) {
        console.error('Error updating activity:', error);
        throw error;
      }

      if (!activity) {
        throw new Error('Activity not found');
      }

      // Map database Activity to mock Activity format
      const activityData = activity as any;
      const mappedActivity: Activity = {
        id: activityData.id,
        trip_id: activityData.trip_id,
        itinerary_day_id: activityData.itinerary_day_id || undefined,
        title: activityData.title,
        description: activityData.description || '',
        category: activityData.category || '',
        start_time: activityData.start_time || undefined,
        end_time: activityData.end_time || undefined,
        cost_cents: activityData.cost_cents ?? undefined,
        lat: activityData.lat ?? undefined,
        lon: activityData.lon ?? undefined,
        status: activityData.status,
        source: activityData.source,
        created_at: activityData.created_at,
      };

      // Update state
      get().updateActivityInState(activityId, mappedActivity);
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  // Votes state
  votes: {},
  setVotes: (votes) => set({ votes }),

  // Votes CRUD operations
  loadVotes: async (activityIds) => {
    try {
      if (activityIds.length === 0) {
        set({ votes: {} });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        set({ votes: {} });
        return;
      }

      // Load votes for the specified activities
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .in('activity_id', activityIds);

      if (votesError) {
        console.error('Error loading votes:', votesError);
        throw votesError;
      }

      // Group votes by activity_id
      const votesByActivity: Record<string, Vote[]> = {};
      ((votesData || []) as any[]).forEach((vote: any) => {
        if (!votesByActivity[vote.activity_id]) {
          votesByActivity[vote.activity_id] = [];
        }
        // Map database Vote to app Vote format
        const mappedVote: Vote = {
          id: vote.id,
          activity_id: vote.activity_id,
          user_id: vote.user_id,
          choice: vote.choice,
          created_at: vote.created_at,
        };
        votesByActivity[vote.activity_id].push(mappedVote);
      });

      // Merge with existing votes (don't overwrite, merge)
      set((state) => ({
        votes: { ...state.votes, ...votesByActivity },
      }));
    } catch (error) {
      console.error('Error loading votes:', error);
      throw error;
    }
  },

  createOrUpdateVote: async (activityId, choice) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use upsert to handle UNIQUE constraint on (activity_id, user_id)
      // This is more efficient and atomic than check-then-update
      const { data: vote, error } = await supabase
        .from('votes')
        .upsert(
          {
            activity_id: activityId,
            user_id: user.id,
            choice: choice,
          } as any,
          {
            onConflict: 'activity_id,user_id',
          },
        )
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating vote:', error);
        throw error;
      }

      if (!vote) {
        throw new Error('Failed to create/update vote');
      }

      // Map database Vote to app Vote format
      const voteData = vote as any;
      const mappedVote: Vote = {
        id: voteData.id,
        activity_id: voteData.activity_id,
        user_id: voteData.user_id,
        choice: voteData.choice,
        created_at: voteData.created_at,
      };

      // Update state
      set((state) => {
        const activityVotes = state.votes[activityId] || [];
        // Remove existing vote from this user for this activity
        const filteredVotes = activityVotes.filter((v) => v.user_id !== user.id);
        // Add the new/updated vote
        return {
          votes: {
            ...state.votes,
            [activityId]: [...filteredVotes, mappedVote],
          },
        };
      });
    } catch (error) {
      console.error('Error creating/updating vote:', error);
      throw error;
    }
  },

  // Messages state
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

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

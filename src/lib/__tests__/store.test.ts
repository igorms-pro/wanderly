import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStore } from '../store';
import { supabase } from '../supabase';
import type { Activity, Vote } from '../types/database.types';

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock Sentry and Analytics
vi.mock('../sentry', () => ({
  setSentryUser: vi.fn(),
  clearSentryUser: vi.fn(),
}));

vi.mock('../analytics', () => ({
  Analytics: {
    identify: vi.fn(),
  },
}));

// Helper function to create chainable Supabase query mocks
// All methods return 'this' for chaining, and the final method resolves with finalValue
const createMockQuery = (finalValue: any, resolveOnMethod: string = 'order') => {
  const chain: any = {};
  const methods = [
    'select',
    'eq',
    'is',
    'in',
    'order',
    'insert',
    'update',
    'upsert',
    'delete',
    'single',
  ];

  methods.forEach((method) => {
    if (method === resolveOnMethod) {
      // This method resolves with finalValue (can be called multiple times, last call resolves)
      let callCount = 0;
      chain[method] = vi.fn().mockImplementation((...args: any[]) => {
        callCount++;
        // For 'order', the second call resolves (loadActivities calls order twice)
        // For other methods, first call resolves
        const shouldResolve = resolveOnMethod === 'order' ? callCount >= 2 : callCount >= 1;
        if (shouldResolve) {
          return Promise.resolve(finalValue);
        }
        return chain;
      });
    } else {
      chain[method] = vi.fn().mockReturnThis();
    }
  });

  return chain;
};

describe('Store - Activities', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockTripId = 'trip-1';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useStore.setState({
      activities: [],
      votes: {},
      user: null,
    });
    // Mock auth user
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadActivities', () => {
    it('should load activities for a trip', async () => {
      const mockActivities = [
        {
          id: 'activity-1',
          trip_id: mockTripId,
          title: 'Visit Museum',
          description: 'Explore the art museum',
          category: 'culture',
          start_time: '10:00:00',
          end_time: '12:00:00',
          cost_cents: 2000,
          lat: 40.7128,
          lon: -74.006,
          status: 'proposed',
          source: 'manual',
          created_at: '2024-01-01T10:00:00Z',
          deleted_at: null,
          itinerary_day_id: null,
          currency: 'USD',
        },
      ];

      const mockQuery = createMockQuery(
        {
          data: mockActivities,
          error: null,
        },
        'order',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().loadActivities(mockTripId);

      expect(supabase.from).toHaveBeenCalledWith('activities');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('trip_id', mockTripId);
      expect(mockQuery.is).toHaveBeenCalledWith('deleted_at', null);
      expect(useStore.getState().activities).toHaveLength(1);
      expect(useStore.getState().activities[0].id).toBe('activity-1');
      expect(useStore.getState().activities[0].title).toBe('Visit Museum');
    });

    it('should handle empty result', async () => {
      const mockQuery = createMockQuery(
        {
          data: [],
          error: null,
        },
        'order',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().loadActivities(mockTripId);

      expect(useStore.getState().activities).toHaveLength(0);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      const mockQuery = createMockQuery(
        {
          data: null,
          error: mockError,
        },
        'order',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(useStore.getState().loadActivities(mockTripId)).rejects.toThrow(
        'Database error',
      );
    });

    it('should map database types to app types correctly', async () => {
      const mockActivities = [
        {
          id: 'activity-1',
          trip_id: mockTripId,
          title: 'Test Activity',
          description: null,
          category: null,
          start_time: null,
          end_time: null,
          cost_cents: null,
          lat: null,
          lon: null,
          status: 'proposed',
          source: 'manual',
          created_at: '2024-01-01T10:00:00Z',
          deleted_at: null,
          itinerary_day_id: null,
          currency: 'USD',
        },
      ];

      const mockQuery = createMockQuery(
        {
          data: mockActivities,
          error: null,
        },
        'order',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().loadActivities(mockTripId);

      const activity = useStore.getState().activities[0];
      expect(activity.description).toBe('');
      expect(activity.category).toBe('');
      expect(activity.start_time).toBeUndefined();
      expect(activity.end_time).toBeUndefined();
      expect(activity.cost_cents).toBeUndefined();
    });

    it('should set empty activities if user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await useStore.getState().loadActivities(mockTripId);

      expect(useStore.getState().activities).toHaveLength(0);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('createActivity', () => {
    it('should create activity with all fields', async () => {
      const activityData = {
        trip_id: mockTripId,
        title: 'New Activity',
        description: 'Activity description',
        category: 'sightseeing',
        start_time: '10:00:00',
        end_time: '12:00:00',
        cost_cents: 5000,
        lat: 40.7128,
        lon: -74.006,
        status: 'proposed' as const,
        source: 'manual' as const,
      };

      const mockCreatedActivity = {
        id: 'activity-new',
        ...activityData,
        created_at: '2024-01-01T10:00:00Z',
        currency: 'USD',
        itinerary_day_id: null,
        deleted_at: null,
      };

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockCreatedActivity,
          error: null,
        }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await useStore.getState().createActivity(activityData);

      expect(mockQuery.insert).toHaveBeenCalled();
      expect(result.id).toBe('activity-new');
      expect(useStore.getState().activities).toContainEqual(
        expect.objectContaining({ id: 'activity-new' }),
      );
    });

    it('should create activity with minimal fields', async () => {
      const activityData = {
        trip_id: mockTripId,
        title: 'Minimal Activity',
      };

      const mockCreatedActivity = {
        id: 'activity-minimal',
        trip_id: mockTripId,
        title: 'Minimal Activity',
        description: null,
        category: null,
        start_time: null,
        end_time: null,
        cost_cents: null,
        lat: null,
        lon: null,
        status: 'proposed',
        source: 'manual',
        created_at: '2024-01-01T10:00:00Z',
        currency: 'USD',
        itinerary_day_id: null,
        deleted_at: null,
      };

      const mockQuery = createMockQuery(
        {
          data: mockCreatedActivity,
          error: null,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await useStore.getState().createActivity(activityData);

      expect(result.title).toBe('Minimal Activity');
      expect(result.status).toBe('proposed');
      expect(result.source).toBe('manual');
    });

    it('should handle errors', async () => {
      const activityData = {
        trip_id: mockTripId,
        title: 'New Activity',
      };

      const mockError = new Error('Insert failed');
      const mockQuery = createMockQuery(
        {
          data: null,
          error: mockError,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(useStore.getState().createActivity(activityData)).rejects.toThrow(
        'Insert failed',
      );
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const activityData = {
        trip_id: mockTripId,
        title: 'New Activity',
      };

      await expect(useStore.getState().createActivity(activityData)).rejects.toThrow(
        'User not authenticated',
      );
    });
  });

  describe('updateActivity', () => {
    it('should update activity partially', async () => {
      // First, add an activity to state
      const existingActivity: Activity = {
        id: 'activity-1',
        trip_id: mockTripId,
        title: 'Original Title',
        description: 'Original description',
        category: 'original',
        status: 'proposed',
        source: 'manual',
        created_at: '2024-01-01T10:00:00Z',
      };
      useStore.setState({ activities: [existingActivity] });

      const updates = {
        title: 'Updated Title',
        status: 'confirmed' as const,
      };

      const mockUpdatedActivity = {
        ...existingActivity,
        ...updates,
        description: 'Original description',
        category: 'original',
        start_time: null,
        end_time: null,
        cost_cents: null,
        lat: null,
        lon: null,
        currency: 'USD',
        itinerary_day_id: null,
        deleted_at: null,
      };

      const mockQuery = createMockQuery(
        {
          data: mockUpdatedActivity,
          error: null,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().updateActivity('activity-1', updates);

      expect(mockQuery.update).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'activity-1');
      const updated = useStore.getState().activities.find((a) => a.id === 'activity-1');
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.status).toBe('confirmed');
    });

    it('should handle errors', async () => {
      const mockError = new Error('Update failed');
      const mockQuery = createMockQuery(
        {
          data: null,
          error: mockError,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(
        useStore.getState().updateActivity('activity-1', { title: 'New' }),
      ).rejects.toThrow('Update failed');
    });
  });
});

describe('Store - Votes', () => {
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockActivityIds = ['activity-1', 'activity-2'];

  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({
      votes: {},
      user: null,
    });
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadVotes', () => {
    it('should load votes for multiple activities', async () => {
      const mockVotes = [
        {
          id: 'vote-1',
          activity_id: 'activity-1',
          user_id: 'user-1',
          choice: 'up',
          created_at: '2024-01-01T10:00:00Z',
        },
        {
          id: 'vote-2',
          activity_id: 'activity-1',
          user_id: 'user-2',
          choice: 'down',
          created_at: '2024-01-01T11:00:00Z',
        },
        {
          id: 'vote-3',
          activity_id: 'activity-2',
          user_id: 'user-1',
          choice: 'up',
          created_at: '2024-01-01T12:00:00Z',
        },
      ];

      const mockQuery = createMockQuery(
        {
          data: mockVotes,
          error: null,
        },
        'in',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().loadVotes(mockActivityIds);

      expect(supabase.from).toHaveBeenCalledWith('votes');
      expect(mockQuery.in).toHaveBeenCalledWith('activity_id', mockActivityIds);
      expect(useStore.getState().votes['activity-1']).toHaveLength(2);
      expect(useStore.getState().votes['activity-2']).toHaveLength(1);
    });

    it('should handle empty array', async () => {
      await useStore.getState().loadVotes([]);

      expect(useStore.getState().votes).toEqual({});
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      const mockQuery = createMockQuery(
        {
          data: null,
          error: mockError,
        },
        'in',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(useStore.getState().loadVotes(mockActivityIds)).rejects.toThrow(
        'Database error',
      );
    });

    it('should replace existing votes for activities', async () => {
      // Set existing votes
      const existingVote: Vote = {
        id: 'vote-existing',
        activity_id: 'activity-1',
        user_id: 'user-3',
        choice: 'up',
        created_at: '2024-01-01T09:00:00Z',
      };
      useStore.setState({
        votes: {
          'activity-1': [existingVote],
        },
      });

      const mockVotes = [
        {
          id: 'vote-new',
          activity_id: 'activity-1',
          user_id: 'user-4',
          choice: 'down',
          created_at: '2024-01-01T10:00:00Z',
        },
      ];

      const mockQuery = createMockQuery(
        {
          data: mockVotes,
          error: null,
        },
        'in',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().loadVotes(['activity-1']);

      // loadVotes replaces votes for activities, doesn't merge
      const votes = useStore.getState().votes['activity-1'];
      expect(votes).toHaveLength(1);
      expect(votes[0].id).toBe('vote-new');
      expect(votes.some((v) => v.id === 'vote-existing')).toBe(false);
    });

    it('should set empty votes if user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await useStore.getState().loadVotes(mockActivityIds);

      expect(useStore.getState().votes).toEqual({});
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('createOrUpdateVote', () => {
    it('should create new vote', async () => {
      const mockVote = {
        id: 'vote-new',
        activity_id: 'activity-1',
        user_id: mockUser.id,
        choice: 'up',
        created_at: '2024-01-01T10:00:00Z',
      };

      const mockQuery = createMockQuery(
        {
          data: mockVote,
          error: null,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().createOrUpdateVote('activity-1', 'up');

      expect(mockQuery.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          activity_id: 'activity-1',
          user_id: mockUser.id,
          choice: 'up',
        }),
        expect.objectContaining({
          onConflict: 'activity_id,user_id',
        }),
      );
      expect(useStore.getState().votes['activity-1']).toHaveLength(1);
      expect(useStore.getState().votes['activity-1'][0].choice).toBe('up');
    });

    it('should update existing vote', async () => {
      // Set existing vote
      const existingVote: Vote = {
        id: 'vote-existing',
        activity_id: 'activity-1',
        user_id: mockUser.id,
        choice: 'up',
        created_at: '2024-01-01T09:00:00Z',
      };
      useStore.setState({
        votes: {
          'activity-1': [existingVote],
        },
      });

      const mockUpdatedVote = {
        id: 'vote-existing',
        activity_id: 'activity-1',
        user_id: mockUser.id,
        choice: 'down',
        created_at: '2024-01-01T09:00:00Z',
      };

      const mockQuery = createMockQuery(
        {
          data: mockUpdatedVote,
          error: null,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().createOrUpdateVote('activity-1', 'down');

      const votes = useStore.getState().votes['activity-1'];
      expect(votes).toHaveLength(1);
      expect(votes[0].choice).toBe('down');
      expect(votes[0].id).toBe('vote-existing');
    });

    it('should change vote from up to down', async () => {
      const existingVote: Vote = {
        id: 'vote-1',
        activity_id: 'activity-1',
        user_id: mockUser.id,
        choice: 'up',
        created_at: '2024-01-01T09:00:00Z',
      };
      useStore.setState({
        votes: {
          'activity-1': [existingVote],
        },
      });

      const mockUpdatedVote = {
        ...existingVote,
        choice: 'down',
      };

      const mockQuery = createMockQuery(
        {
          data: mockUpdatedVote,
          error: null,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await useStore.getState().createOrUpdateVote('activity-1', 'down');

      const votes = useStore.getState().votes['activity-1'];
      expect(votes[0].choice).toBe('down');
    });

    it('should handle errors', async () => {
      const mockError = new Error('Vote failed');
      const mockQuery = createMockQuery(
        {
          data: null,
          error: mockError,
        },
        'single',
      );

      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(useStore.getState().createOrUpdateVote('activity-1', 'up')).rejects.toThrow(
        'Vote failed',
      );
    });

    it('should throw error if user is not authenticated', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(useStore.getState().createOrUpdateVote('activity-1', 'up')).rejects.toThrow(
        'User not authenticated',
      );
    });
  });
});

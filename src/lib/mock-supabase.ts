// Mock Supabase implementation using localStorage
// This simulates Supabase functionality for demo purposes

import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
}

export interface Trip {
  id: string;
  owner_id: string;
  title: string;
  destination_text: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'locked' | 'archived';
  budget_cents?: number;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer' | 'moderator';
  joined_at: string;
}

export interface Activity {
  id: string;
  trip_id: string;
  itinerary_day_id?: string;
  title: string;
  description: string;
  category: string;
  start_time?: string;
  end_time?: string;
  cost_cents?: number;
  lat?: number;
  lon?: number;
  status: 'proposed' | 'confirmed' | 'rejected';
  source: 'manual' | 'ai' | 'import';
  created_at: string;
}

export interface Vote {
  id: string;
  activity_id: string;
  user_id: string;
  choice: 'up' | 'down';
  created_at: string;
}

export interface Message {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'system';
  created_at: string;
}

class MockSupabase {
  private getStorage<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  private setStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Auth methods
  getCurrentUser(): User | null {
    return this.getStorage<User | null>('wanderly_user', null);
  }

  async signUp(email: string, password: string, displayName: string): Promise<User> {
    const user: User = {
      id: uuidv4(),
      email,
      display_name: displayName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      created_at: new Date().toISOString(),
    };
    
    // Store user credentials
    const users = this.getStorage<any[]>('wanderly_users', []);
    users.push({ ...user, password });
    this.setStorage('wanderly_users', users);
    
    // Set current user
    this.setStorage('wanderly_user', user);
    
    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const users = this.getStorage<any[]>('wanderly_users', []);
    const userRecord = users.find(u => u.email === email && u.password === password);
    
    if (!userRecord) {
      throw new Error('Invalid email or password');
    }
    
    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      display_name: userRecord.display_name,
      avatar_url: userRecord.avatar_url,
      created_at: userRecord.created_at,
    };
    
    this.setStorage('wanderly_user', user);
    return user;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('wanderly_user');
  }

  // Trip methods
  async createTrip(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Promise<Trip> {
    const newTrip: Trip = {
      ...trip,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const trips = this.getStorage<Trip[]>('wanderly_trips', []);
    trips.push(newTrip);
    this.setStorage('wanderly_trips', trips);
    
    // Add owner as member
    const member: TripMember = {
      id: uuidv4(),
      trip_id: newTrip.id,
      user_id: trip.owner_id,
      role: 'owner',
      joined_at: new Date().toISOString(),
    };
    
    const members = this.getStorage<TripMember[]>('wanderly_members', []);
    members.push(member);
    this.setStorage('wanderly_members', members);
    
    return newTrip;
  }

  async getTrips(userId: string): Promise<Trip[]> {
    const trips = this.getStorage<Trip[]>('wanderly_trips', []);
    const members = this.getStorage<TripMember[]>('wanderly_members', []);
    
    const userTripIds = members
      .filter(m => m.user_id === userId)
      .map(m => m.trip_id);
    
    return trips.filter(t => userTripIds.includes(t.id));
  }

  async getTrip(tripId: string): Promise<Trip | null> {
    const trips = this.getStorage<Trip[]>('wanderly_trips', []);
    return trips.find(t => t.id === tripId) || null;
  }

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    const trips = this.getStorage<Trip[]>('wanderly_trips', []);
    const index = trips.findIndex(t => t.id === tripId);
    
    if (index === -1) {
      throw new Error('Trip not found');
    }
    
    trips[index] = {
      ...trips[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    this.setStorage('wanderly_trips', trips);
    return trips[index];
  }

  // Activity methods
  async createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    const newActivity: Activity = {
      ...activity,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    
    const activities = this.getStorage<Activity[]>('wanderly_activities', []);
    activities.push(newActivity);
    this.setStorage('wanderly_activities', activities);
    
    return newActivity;
  }

  async getActivities(tripId: string): Promise<Activity[]> {
    const activities = this.getStorage<Activity[]>('wanderly_activities', []);
    return activities.filter(a => a.trip_id === tripId);
  }

  async updateActivity(activityId: string, updates: Partial<Activity>): Promise<Activity> {
    const activities = this.getStorage<Activity[]>('wanderly_activities', []);
    const index = activities.findIndex(a => a.id === activityId);
    
    if (index === -1) {
      throw new Error('Activity not found');
    }
    
    activities[index] = { ...activities[index], ...updates };
    this.setStorage('wanderly_activities', activities);
    
    return activities[index];
  }

  // Vote methods
  async vote(activityId: string, userId: string, choice: 'up' | 'down'): Promise<Vote> {
    const votes = this.getStorage<Vote[]>('wanderly_votes', []);
    
    // Remove existing vote from this user for this activity
    const filteredVotes = votes.filter(
      v => !(v.activity_id === activityId && v.user_id === userId)
    );
    
    const newVote: Vote = {
      id: uuidv4(),
      activity_id: activityId,
      user_id: userId,
      choice,
      created_at: new Date().toISOString(),
    };
    
    filteredVotes.push(newVote);
    this.setStorage('wanderly_votes', filteredVotes);
    
    return newVote;
  }

  async getVotes(activityId: string): Promise<Vote[]> {
    const votes = this.getStorage<Vote[]>('wanderly_votes', []);
    return votes.filter(v => v.activity_id === activityId);
  }

  // Message methods
  async sendMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    
    const messages = this.getStorage<Message[]>('wanderly_messages', []);
    messages.push(newMessage);
    this.setStorage('wanderly_messages', messages);
    
    return newMessage;
  }

  async getMessages(tripId: string): Promise<Message[]> {
    const messages = this.getStorage<Message[]>('wanderly_messages', []);
    return messages.filter(m => m.trip_id === tripId).sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  // Member methods
  async getTripMembers(tripId: string): Promise<TripMember[]> {
    const members = this.getStorage<TripMember[]>('wanderly_members', []);
    return members.filter(m => m.trip_id === tripId);
  }
}

// Export singleton instance
export const mockSupabase = new MockSupabase();

/**
 * TypeScript types matching the Supabase database schema
 * Generated for Agent-2: Supabase Client Setup
 *
 * These types correspond to the tables created in migration 001_initial_schema.sql
 * Reference: docs/TASKS/AGENT-1-DATABASE-SCHEMA.md
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  __InternalSupabase?: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // UUID, references auth.users(id)
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          locale: string | null;
          timezone: string | null;
          /** AI quota tier: free (default) or premium (higher caps). */
          ai_tier: 'free' | 'premium';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string; // TIMESTAMPTZ
          updated_at: string; // TIMESTAMPTZ
          deleted_at: string | null; // TIMESTAMPTZ
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string | null;
          timezone?: string | null;
          ai_tier?: 'free' | 'premium';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string | null;
          timezone?: string | null;
          ai_tier?: 'free' | 'premium';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      stripe_webhook_events: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      trips: {
        Row: {
          id: string; // UUID
          owner_id: string; // UUID, references auth.users(id)
          title: string;
          destination_text: string;
          start_date: string; // DATE
          end_date: string; // DATE
          status: 'planned' | 'locked' | 'archived';
          budget_cents: number | null; // INTEGER
          currency: string | null;
          constraints: Json | null; // JSONB - use TripConstraints for typed access
          active_itinerary_id?: string | null; // UUID, references itineraries(id)
          timezone: string;
          created_at: string; // TIMESTAMPTZ
          updated_at?: string; // TIMESTAMPTZ (optional: API may omit)
          deleted_at?: string | null; // TIMESTAMPTZ (optional: API may omit)
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          destination_text: string;
          start_date: string;
          end_date: string;
          status: 'planned' | 'locked' | 'archived';
          budget_cents?: number | null;
          currency?: string | null;
          constraints?: Json | null;
          active_itinerary_id?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          destination_text?: string;
          start_date?: string;
          end_date?: string;
          status?: 'planned' | 'locked' | 'archived';
          budget_cents?: number | null;
          currency?: string | null;
          constraints?: Json | null;
          active_itinerary_id?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      trip_members: {
        Row: {
          id: string; // UUID
          trip_id: string; // UUID, references trips(id)
          user_id: string; // UUID, references auth.users(id)
          role: 'owner' | 'editor' | 'viewer' | 'moderator';
          invited_by: string | null; // UUID, references auth.users(id)
          joined_at: string; // TIMESTAMPTZ
          removed_at: string | null; // TIMESTAMPTZ
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          role: 'owner' | 'editor' | 'viewer' | 'moderator';
          invited_by?: string | null;
          joined_at?: string;
          removed_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          role?: 'owner' | 'editor' | 'viewer' | 'moderator';
          invited_by?: string | null;
          joined_at?: string;
          removed_at?: string | null;
        };
        Relationships: [];
      };
      itineraries: {
        Row: {
          id: string; // UUID
          trip_id: string; // UUID, references trips(id)
          version: number; // INTEGER
          title: string | null;
          generated_by_ai: boolean;
          created_at: string; // TIMESTAMPTZ
          updated_at: string; // TIMESTAMPTZ
          deleted_at: string | null; // TIMESTAMPTZ
        };
        Insert: {
          id?: string;
          trip_id: string;
          version?: number;
          title?: string | null;
          generated_by_ai?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          version?: number;
          title?: string | null;
          generated_by_ai?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      itinerary_days: {
        Row: {
          id: string; // UUID
          itinerary_id: string; // UUID, references itineraries(id)
          day_index: number; // INTEGER
          date: string; // DATE
          created_at: string; // TIMESTAMPTZ
          updated_at: string; // TIMESTAMPTZ
          deleted_at: string | null; // TIMESTAMPTZ
        };
        Insert: {
          id?: string;
          itinerary_id: string;
          day_index: number;
          date: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          itinerary_id?: string;
          day_index?: number;
          date?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string; // UUID
          itinerary_day_id?: string | null; // UUID (optional: API may omit)
          trip_id: string; // UUID, references trips(id)
          place_id?: string | null;
          place_name?: string | null; // migration 010: display name / address for Google Maps
          title: string;
          description: string | null;
          category: string | null;
          start_time?: string | null; // TIME
          end_time?: string | null; // TIME
          cost_cents?: number | null; // INTEGER
          cost_min_cents?: number | null; // migration 009
          cost_max_cents?: number | null; // migration 009
          currency?: string | null;
          transport_type?: string | null; // migration 009
          transport_notes?: string | null; // migration 009
          transport_duration_minutes?: number | null; // migration 009
          transport_cost_cents?: number | null; // migration 009
          organizer_notes?: string | null; // migration 010: e.g. "N'oubliez pas vos tongs"
          packing_checklist?: Json | null; // migration 011: array of items to bring
          lat?: number | null; // DECIMAL(10, 8)
          lon?: number | null; // DECIMAL(11, 8)
          status: 'proposed' | 'confirmed' | 'rejected';
          source: 'manual' | 'ai' | 'import';
          created_at: string; // TIMESTAMPTZ
          updated_at?: string; // TIMESTAMPTZ (optional: API may omit)
          deleted_at?: string | null; // TIMESTAMPTZ (optional: API may omit)
          order_index?: number | null; // migration 015: display order within itinerary day (0 = first)
        };
        Insert: {
          id?: string;
          itinerary_day_id?: string | null;
          trip_id: string;
          order_index?: number | null;
          place_id?: string | null;
          place_name?: string | null;
          title: string;
          description?: string | null;
          category?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          cost_cents?: number | null;
          cost_min_cents?: number | null;
          cost_max_cents?: number | null;
          currency?: string | null;
          transport_type?: string | null;
          transport_notes?: string | null;
          transport_duration_minutes?: number | null;
          transport_cost_cents?: number | null;
          organizer_notes?: string | null;
          packing_checklist?: Json | null;
          lat?: number | null;
          lon?: number | null;
          status?: 'proposed' | 'confirmed' | 'rejected';
          source?: 'manual' | 'ai' | 'import';
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          itinerary_day_id?: string | null;
          trip_id?: string;
          order_index?: number | null;
          place_id?: string | null;
          place_name?: string | null;
          title?: string;
          description?: string | null;
          category?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          cost_cents?: number | null;
          cost_min_cents?: number | null;
          cost_max_cents?: number | null;
          currency?: string | null;
          transport_type?: string | null;
          transport_notes?: string | null;
          transport_duration_minutes?: number | null;
          transport_cost_cents?: number | null;
          organizer_notes?: string | null;
          packing_checklist?: Json | null;
          lat?: number | null;
          lon?: number | null;
          status?: 'proposed' | 'confirmed' | 'rejected';
          source?: 'manual' | 'ai' | 'import';
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      activity_participants: {
        Row: {
          id: string;
          activity_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string; // UUID
          activity_id: string; // UUID, references activities(id)
          user_id: string; // UUID, references auth.users(id)
          choice: 'up' | 'down';
          idempotency_key?: string | null; // optional: API may omit
          created_at: string; // TIMESTAMPTZ
        };
        Insert: {
          id?: string;
          activity_id: string;
          user_id: string;
          choice: 'up' | 'down';
          idempotency_key?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          activity_id?: string;
          user_id?: string;
          choice?: 'up' | 'down';
          idempotency_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      itinerary_votes: {
        Row: {
          id: string;
          trip_id: string;
          itinerary_id: string;
          user_id: string;
          choice: 'up' | 'down';
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          itinerary_id: string;
          user_id: string;
          choice: 'up' | 'down';
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          itinerary_id?: string;
          user_id?: string;
          choice?: 'up' | 'down';
          created_at?: string;
        };
        Relationships: [];
      };
      message_reactions: {
        Row: {
          id: string;
          trip_id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          message_id?: string;
          user_id?: string;
          emoji?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string; // UUID
          trip_id: string; // UUID, references trips(id)
          user_id?: string | null; // UUID, references auth.users(id)
          content: string;
          message_type?: 'text' | 'system' | 'attachment';
          client_msg_id?: string | null;
          reply_to?: string | null; // UUID, references messages(id)
          created_at: string; // TIMESTAMPTZ
          updated_at?: string; // TIMESTAMPTZ (optional: API may omit)
          deleted_at?: string | null; // TIMESTAMPTZ (optional: API may omit)
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id?: string | null;
          content: string;
          message_type?: 'text' | 'system' | 'attachment';
          client_msg_id?: string | null;
          reply_to?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string | null;
          content?: string;
          message_type?: 'text' | 'system' | 'attachment';
          client_msg_id?: string | null;
          reply_to?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_os: string | null;
          device_browser: string | null;
          ip_address: string | null;
          city: string | null;
          country: string | null;
          last_activity: string;
          created_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_os?: string | null;
          device_browser?: string | null;
          ip_address?: string | null;
          city?: string | null;
          country?: string | null;
          last_activity?: string;
          created_at?: string;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_os?: string | null;
          device_browser?: string | null;
          ip_address?: string | null;
          city?: string | null;
          country?: string | null;
          last_activity?: string;
          created_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      login_history: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          status: string;
          ip_address: string | null;
          device_info: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          status: string;
          ip_address?: string | null;
          device_info?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          status?: string;
          ip_address?: string | null;
          device_info?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string; // UUID
          trip_id: string; // UUID, references trips(id)
          inviter_id: string; // UUID, references auth.users(id)
          invite_code: string;
          default_role: 'editor' | 'viewer' | 'moderator';
          expires_at: string | null; // TIMESTAMPTZ
          max_uses: number | null; // INTEGER
          used_count: number; // INTEGER
          created_at: string; // TIMESTAMPTZ
        };
        Insert: {
          id?: string;
          trip_id: string;
          inviter_id: string;
          invite_code: string;
          default_role?: 'editor' | 'viewer' | 'moderator';
          expires_at?: string | null;
          max_uses?: number | null;
          used_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          inviter_id?: string;
          invite_code?: string;
          default_role?: 'editor' | 'viewer' | 'moderator';
          expires_at?: string | null;
          max_uses?: number | null;
          used_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      trip_templates: {
        Row: {
          id: string;
          owner_id: string;
          source_trip_id: string | null;
          title: string;
          description: string | null;
          destination_text: string;
          template_data: Json;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          source_trip_id?: string | null;
          title: string;
          description?: string | null;
          destination_text: string;
          template_data?: Json;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          source_trip_id?: string | null;
          title?: string;
          description?: string | null;
          destination_text?: string;
          template_data?: Json;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string; // UUID
          actor_id: string | null; // UUID, references auth.users(id)
          target_type: string;
          target_id: string; // UUID
          action: string;
          metadata: Json | null; // JSONB
          created_at: string; // TIMESTAMPTZ
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          target_type: string;
          target_id: string;
          action: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          target_type?: string;
          target_id?: string;
          action?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string;
          activity_id: string | null;
          title: string;
          amount_cents: number;
          currency: string;
          paid_by_user_id: string;
          split_mode: 'equal' | 'custom';
          expense_date: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          trip_id: string;
          activity_id?: string | null;
          title: string;
          amount_cents: number;
          currency?: string;
          paid_by_user_id: string;
          split_mode?: 'equal' | 'custom';
          expense_date?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          trip_id?: string;
          activity_id?: string | null;
          title?: string;
          amount_cents?: number;
          currency?: string;
          paid_by_user_id?: string;
          split_mode?: 'equal' | 'custom';
          expense_date?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      expense_participants: {
        Row: {
          id: string;
          expense_id: string;
          trip_id: string;
          user_id: string;
          amount_cents: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          trip_id: string;
          user_id: string;
          amount_cents?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_id?: string;
          trip_id?: string;
          user_id?: string;
          amount_cents?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_invitation_preview: {
        Args: { p_invite_code: string };
        Returns: Json;
      };
      accept_trip_invitation: {
        Args: { p_invite_code: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper type aliases from Supabase schema
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Trip = Database['public']['Tables']['trips']['Row'];
export type TripMember = Database['public']['Tables']['trip_members']['Row'];
export type Itinerary = Database['public']['Tables']['itineraries']['Row'];
export type ItineraryDay = Database['public']['Tables']['itinerary_days']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type Vote = Database['public']['Tables']['votes']['Row'];
export type ItineraryVote = Database['public']['Tables']['itinerary_votes']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageReaction = Database['public']['Tables']['message_reactions']['Row'];
export type Invitation = Database['public']['Tables']['invitations']['Row'];
export type TripTemplateRow = Database['public']['Tables']['trip_templates']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseParticipant = Database['public']['Tables']['expense_participants']['Row'];

/** Shape of trip.constraints JSONB (for type-safe access in UI). */
export type TripConstraints = {
  pace?: 'relaxed' | 'balanced' | 'packed';
  budget_per_person_cents?: number;
  budget_total_cents?: number;
  has_children?: boolean;
  preferences?: string;
  must_dos?: string[];
  no_gos?: string[];
};

/** App-level user (from Profile + auth). Used in store and UI. */
export type User = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  ai_tier: 'free' | 'premium';
};

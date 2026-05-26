import type { Json, TripConstraints } from '@/lib/types/database.types';

export type InviteRole = 'editor' | 'viewer' | 'moderator';

export type TemplateActivitySnapshot = {
  title: string;
  description?: string | null;
  category?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  cost_cents?: number | null;
  cost_min_cents?: number | null;
  cost_max_cents?: number | null;
  currency?: string | null;
  place_id?: string | null;
  place_name?: string | null;
  lat?: number | null;
  lon?: number | null;
  transport_type?: string | null;
  transport_notes?: string | null;
  transport_duration_minutes?: number | null;
  transport_cost_cents?: number | null;
  organizer_notes?: string | null;
  packing_checklist?: Json | null;
  status?: string;
  source?: string;
};

export type TemplateDaySnapshot = {
  day_offset: number;
  activities: TemplateActivitySnapshot[];
};

export type TripTemplateData = {
  constraints?: TripConstraints | null;
  budget_cents?: number | null;
  currency?: string | null;
  timezone?: string;
  duration_days: number;
  days: TemplateDaySnapshot[];
};

export type TripTemplate = {
  id: string;
  owner_id: string;
  source_trip_id: string | null;
  title: string;
  description: string | null;
  destination_text: string;
  template_data: TripTemplateData;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type InvitationPreview = {
  valid: boolean;
  reason?: string;
  trip_id?: string;
  trip_title?: string;
  destination_text?: string;
  default_role?: InviteRole;
  expires_at?: string | null;
};

export type TripInvitation = {
  id: string;
  trip_id: string;
  inviter_id: string;
  invite_code: string;
  default_role: InviteRole;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
  created_at: string;
};

export type DuplicateTripInput = {
  sourceTripId: string;
  title: string;
  start_date: string;
  end_date: string;
};

export type CreateFromTemplateInput = {
  templateId: string;
  title: string;
  start_date: string;
};

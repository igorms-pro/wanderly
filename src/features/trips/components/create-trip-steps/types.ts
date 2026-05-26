import { Coffee, Gauge, Zap } from 'lucide-react';

export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  hasChildren: boolean;
  pace: 'relaxed' | 'balanced' | 'packed';
  budget: string;
  currency: string;
  interests: string[];
}

export interface StepProps {
  formData: TripFormData;
  onChange: (updates: Partial<TripFormData>) => void;
  fieldErrors?: Record<string, string>;
  onClearError?: (field: string) => void;
}

export const INTEREST_OPTIONS = [
  { key: 'cultureMuseums', emoji: '🏛️' },
  { key: 'foodDining', emoji: '🍽️' },
  { key: 'natureOutdoors', emoji: '🌿' },
  { key: 'adventure', emoji: '🧗' },
  { key: 'shopping', emoji: '🛍️' },
  { key: 'nightlife', emoji: '🌙' },
  { key: 'history', emoji: '📜' },
  { key: 'relaxation', emoji: '🧘' },
];

export const PACE_ICONS = { relaxed: Coffee, balanced: Gauge, packed: Zap };

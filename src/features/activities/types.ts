export interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  cost: string;
  costMin: string;
  costMax: string;
  currency: string;
  lat: string;
  lon: string;
  placeName: string;
  transportType: string;
  transportNotes: string;
  transportDurationMinutes: string;
  status: 'proposed' | 'confirmed' | 'rejected';
  organizerNotes: string;
}

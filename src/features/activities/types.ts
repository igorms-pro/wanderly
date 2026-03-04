export interface ActivityFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  cost: string;
  currency: string;
  lat: string;
  lon: string;
  status: 'proposed' | 'confirmed' | 'rejected';
}

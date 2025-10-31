import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { mockSupabase } from '../lib/mock-supabase';
import { generateItinerary, ItineraryRequest } from '../lib/openai-service';
import { X, Sparkles, Loader2, Calendar, MapPin, Users, DollarSign } from 'lucide-react';

interface CreateTripModalProps {
  onClose: () => void;
}

export default function CreateTripModal({ onClose }: CreateTripModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = useStore((state) => state.user);
  const addTrip = useStore((state) => state.addTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);
  const setActivities = useStore((state) => state.setActivities);

  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    groupSize: 2,
    pace: 'balanced' as 'relaxed' | 'balanced' | 'packed',
    budget: '',
    currency: 'USD',
    interests: [] as string[],
  });

  const interestOptions = [
    'Culture & Museums',
    'Food & Dining',
    'Nature & Outdoors',
    'Adventure',
    'Shopping',
    'Nightlife',
    'History',
    'Relaxation',
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Create trip
      const trip = await mockSupabase.createTrip({
        owner_id: user.id,
        title: `${formData.destination} Adventure`,
        destination_text: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: 'planned',
        budget_cents: formData.budget ? parseInt(formData.budget) * 100 : undefined,
        currency: formData.currency,
      });

      addTrip(trip);
      setCurrentTrip(trip);

      // Generate itinerary with AI
      const request: ItineraryRequest = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        groupSize: formData.groupSize,
        pace: formData.pace,
        budget: formData.budget ? parseInt(formData.budget) : undefined,
        currency: formData.currency,
        interests: formData.interests,
      };

      const itinerary = await generateItinerary(request);

      // Create activities from itinerary
      const activityPromises = itinerary.days.flatMap((day) =>
        day.activities.map((activity) =>
          mockSupabase.createActivity({
            trip_id: trip.id,
            title: activity.title,
            description: activity.description,
            category: activity.category,
            start_time: `${day.date}T${activity.startTime}:00`,
            end_time: `${day.date}T${activity.endTime}:00`,
            cost_cents: activity.estimatedCost * 100,
            status: 'proposed',
            source: 'ai',
          })
        )
      );

      const activities = await Promise.all(activityPromises);
      setActivities(activities);

      // Navigate to trip page
      navigate(`/trip/${trip.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Create Trip with AI</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g., Paris, Tokyo, New York"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                min={formData.startDate}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Group Size
            </label>
            <input
              type="number"
              value={formData.groupSize}
              onChange={(e) => setFormData({ ...formData, groupSize: parseInt(e.target.value) })}
              required
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Travel Pace */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Pace</label>
            <div className="grid grid-cols-3 gap-3">
              {(['relaxed', 'balanced', 'packed'] as const).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setFormData({ ...formData, pace })}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                    formData.pace === pace
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {pace.charAt(0).toUpperCase() + pace.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget per Person (Optional)
            </label>
            <div className="flex space-x-2">
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="1000"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="grid grid-cols-2 gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-lg border font-medium text-sm transition ${
                    formData.interests.includes(interest)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Itinerary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Trip
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

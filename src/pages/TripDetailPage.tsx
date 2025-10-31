import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { mockSupabase, Activity, Vote } from '../lib/mock-supabase';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Clock,
  DollarSign,
  Sparkles,
  Cloud,
  Navigation as NavigationIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import TripChat from '../components/TripChat';
import WeatherWidget from '../components/WeatherWidget';
import NearbyPlaces from '../components/NearbyPlaces';

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'chat' | 'weather' | 'explore'>('itinerary');
  const [votes, setVotes] = useState<Record<string, Vote[]>>({});

  const user = useStore((state) => state.user);
  const currentTrip = useStore((state) => state.currentTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);
  const activities = useStore((state) => state.activities);
  const setActivities = useStore((state) => state.setActivities);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!tripId) {
      navigate('/dashboard');
      return;
    }

    loadTripData();
  }, [tripId, user, navigate]);

  const loadTripData = async () => {
    if (!tripId) return;

    try {
      const trip = await mockSupabase.getTrip(tripId);
      if (!trip) {
        navigate('/dashboard');
        return;
      }

      setCurrentTrip(trip);

      const tripActivities = await mockSupabase.getActivities(tripId);
      setActivities(tripActivities);

      // Load votes for all activities
      const votesMap: Record<string, Vote[]> = {};
      await Promise.all(
        tripActivities.map(async (activity) => {
          const activityVotes = await mockSupabase.getVotes(activity.id);
          votesMap[activity.id] = activityVotes;
        })
      );
      setVotes(votesMap);
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (activityId: string, choice: 'up' | 'down') => {
    if (!user) return;

    try {
      await mockSupabase.vote(activityId, user.id, choice);
      const activityVotes = await mockSupabase.getVotes(activityId);
      setVotes((prev) => ({ ...prev, [activityId]: activityVotes }));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const getVoteCounts = (activityId: string) => {
    const activityVotes = votes[activityId] || [];
    const upvotes = activityVotes.filter((v) => v.choice === 'up').length;
    const downvotes = activityVotes.filter((v) => v.choice === 'down').length;
    return { upvotes, downvotes };
  };

  const getUserVote = (activityId: string): 'up' | 'down' | null => {
    if (!user) return null;
    const activityVotes = votes[activityId] || [];
    const userVote = activityVotes.find((v) => v.user_id === user.id);
    return userVote ? userVote.choice : null;
  };

  // Group activities by date
  const activitiesByDate = activities.reduce((acc, activity) => {
    if (!activity.start_time) return acc;
    const date = activity.start_time.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const sortedDates = Object.keys(activitiesByDate).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!currentTrip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Trip Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{currentTrip.title}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {currentTrip.destination_text}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {format(new Date(currentTrip.start_date), 'MMM d')} -{' '}
                  {format(new Date(currentTrip.end_date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI-Generated Itinerary
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'itinerary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Itinerary
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'weather'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Cloud className="w-4 h-4 inline mr-2" />
              Weather
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'explore'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <NavigationIcon className="w-4 h-4 inline mr-2" />
              Explore
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-2 border-b-2 font-medium transition whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'weather' ? (
          <WeatherWidget
            destination={currentTrip.destination_text}
            startDate={currentTrip.start_date}
            endDate={currentTrip.end_date}
          />
        ) : activeTab === 'explore' ? (
          <NearbyPlaces destination={currentTrip.destination_text} />
        ) : activeTab === 'itinerary' ? (
          <div className="space-y-8">
            {sortedDates.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <p className="text-gray-600">No activities in this itinerary yet.</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {activitiesByDate[date].length} activities
                    </p>
                  </div>

                  {/* Activities */}
                  <div className="divide-y divide-gray-100">
                    {activitiesByDate[date]
                      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                      .map((activity) => {
                        const { upvotes, downvotes } = getVoteCounts(activity.id);
                        const userVote = getUserVote(activity.id);

                        return (
                          <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                      {activity.title}
                                    </h4>
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                      {activity.category}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-gray-600 mb-3">{activity.description}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                  {activity.start_time && activity.end_time && (
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {format(new Date(activity.start_time), 'h:mm a')} -{' '}
                                      {format(new Date(activity.end_time), 'h:mm a')}
                                    </div>
                                  )}
                                  {activity.cost_cents !== undefined && (
                                    <div className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-1" />
                                      ${(activity.cost_cents / 100).toFixed(2)} per person
                                    </div>
                                  )}
                                  {activity.source === 'ai' && (
                                    <div className="flex items-center text-purple-600">
                                      <Sparkles className="w-4 h-4 mr-1" />
                                      AI Suggested
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Voting */}
                              <div className="ml-6 flex flex-col items-center space-y-2">
                                <button
                                  onClick={() => handleVote(activity.id, 'up')}
                                  className={`p-2 rounded-lg transition ${
                                    userVote === 'up'
                                      ? 'bg-green-100 text-green-600'
                                      : 'text-gray-400 hover:bg-gray-100 hover:text-green-600'
                                  }`}
                                >
                                  <ThumbsUp className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-medium text-gray-700">
                                  {upvotes - downvotes}
                                </span>
                                <button
                                  onClick={() => handleVote(activity.id, 'down')}
                                  className={`p-2 rounded-lg transition ${
                                    userVote === 'down'
                                      ? 'bg-red-100 text-red-600'
                                      : 'text-gray-400 hover:bg-gray-100 hover:text-red-600'
                                  }`}
                                >
                                  <ThumbsDown className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <TripChat tripId={tripId!} />
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { mockSupabase, Trip } from '../lib/mock-supabase';
import {
  Plus,
  Plane,
  Calendar,
  MapPin,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import CreateTripModal from '../components/CreateTripModal';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const user = useStore((state) => state.user);
  const trips = useStore((state) => state.trips);
  const setTrips = useStore((state) => state.setTrips);
  const setUser = useStore((state) => state.setUser);
  const showCreateTripModal = useStore((state) => state.showCreateTripModal);
  const setShowCreateTripModal = useStore((state) => state.setShowCreateTripModal);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadTrips();
  }, [user, navigate]);

  const loadTrips = async () => {
    if (!user) return;
    
    try {
      const userTrips = await mockSupabase.getTrips(user.id);
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await mockSupabase.signOut();
    setUser(null);
    navigate('/login');
  };

  const handleTripClick = (trip: Trip) => {
    navigate(`/trip/${trip.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Wanderly</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar_url}
                  alt={user?.display_name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user?.display_name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.display_name}!
          </h2>
          <p className="text-gray-600">
            Plan your next adventure or continue working on your existing trips.
          </p>
        </div>

        {/* Create Trip Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateTripModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Trip with AI
          </button>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Plane className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first trip with AI-powered itinerary generation!
            </p>
            <button
              onClick={() => setShowCreateTripModal(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => handleTripClick(trip)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
              >
                {/* Trip Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white opacity-50" />
                </div>

                {/* Trip Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{trip.destination_text}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {format(new Date(trip.start_date), 'MMM d')} -{' '}
                      {format(new Date(trip.end_date), 'MMM d, yyyy')}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      trip.status === 'planned'
                        ? 'bg-blue-100 text-blue-700'
                        : trip.status === 'locked'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Trip Modal */}
      {showCreateTripModal && <CreateTripModal onClose={() => setShowCreateTripModal(false)} />}
    </div>
  );
}

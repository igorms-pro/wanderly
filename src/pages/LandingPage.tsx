import { Link } from 'react-router-dom';
import {
  Plane,
  Sparkles,
  Users,
  MessageSquare,
  Calendar,
  MapPin,
  ThumbsUp,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">Wanderly</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-blue-100 font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Plan Your Perfect Trip
            <br />
            <span className="text-blue-200">with AI-Powered Itineraries</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Create personalized travel itineraries in seconds, collaborate with friends, and make
            decisions together. Your dream vacation starts here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-xl hover:shadow-2xl"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              Start Planning for Free
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-200">No credit card required</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">
              Powerful features to make travel planning effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Itineraries</h3>
              <p className="text-gray-600">
                Generate detailed day-by-day travel plans instantly using advanced AI technology
                tailored to your preferences.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Collaborative Planning</h3>
              <p className="text-gray-600">
                Invite friends and family to plan together. Everyone can suggest activities and vote
                on the best options.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Chat</h3>
              <p className="text-gray-600">
                Discuss plans with your travel group in real-time. Make decisions faster and keep
                everyone in the loop.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mb-4">
                <ThumbsUp className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Activity Voting</h3>
              <p className="text-gray-600">
                Vote on activities to reach group consensus. Resolve conflicts democratically and
                ensure everyone has a great time.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">
                AI considers travel time, opening hours, and optimal routing to create realistic
                schedules that work.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-4">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Location-Aware</h3>
              <p className="text-gray-600">
                Get suggestions based on your destination with local insights, popular attractions,
                and hidden gems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">
              Three simple steps to your perfect itinerary
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tell Us Your Preferences</h3>
              <p className="text-gray-600">
                Share your destination, dates, group size, interests, and budget. The more we know,
                the better your itinerary.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Generates Your Plan</h3>
              <p className="text-gray-600">
                Our AI creates a personalized day-by-day itinerary with activities, timing, and cost
                estimates in seconds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Collaborate & Refine</h3>
              <p className="text-gray-600">
                Invite your travel companions, discuss options, vote on activities, and finalize
                your perfect trip together.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of travelers planning amazing trips with Wanderly
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-xl hover:shadow-2xl"
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Get Started Free
            <ArrowRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">Wanderly</span>
          </div>
          <p className="mb-4">AI-powered travel planning made simple</p>
          <p className="text-sm">2025 Wanderly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

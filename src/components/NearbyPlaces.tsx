import { useEffect, useState } from 'react';
import { getNearbyPlaces, NearbyPlace, getMockNearbyPlaces, geocodeAddress } from '../lib/places-service';
import { MapPin, Star, Loader2, Navigation } from 'lucide-react';

interface NearbyPlacesProps {
  destination: string;
}

export default function NearbyPlaces({ destination }: NearbyPlacesProps) {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('tourist_attraction');

  const placeTypes = [
    { value: 'tourist_attraction', label: 'Attractions' },
    { value: 'restaurant', label: 'Restaurants' },
    { value: 'museum', label: 'Museums' },
    { value: 'park', label: 'Parks' },
    { value: 'shopping_mall', label: 'Shopping' },
  ];

  useEffect(() => {
    loadNearbyPlaces();
  }, [destination, selectedType]);

  const loadNearbyPlaces = async () => {
    setLoading(true);
    try {
      // First, geocode the destination
      const location = await geocodeAddress(destination);
      
      if (location) {
        const nearbyPlaces = await getNearbyPlaces(
          location.lat,
          location.lng,
          selectedType,
          5000
        );
        
        if (nearbyPlaces.length > 0) {
          setPlaces(nearbyPlaces);
        } else {
          // Fallback to mock data
          setPlaces(getMockNearbyPlaces(destination));
        }
      } else {
        // Fallback to mock data
        setPlaces(getMockNearbyPlaces(destination));
      }
    } catch (error) {
      console.error('Error loading nearby places:', error);
      setPlaces(getMockNearbyPlaces(destination));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 text-white">
        <h3 className="text-lg font-bold flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Nearby Places
        </h3>
        <p className="text-sm text-purple-100 mt-1">Popular spots near {destination}</p>
      </div>

      {/* Category Filter */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {placeTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedType === type.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : places.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No places found in this category
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map((place) => (
              <div
                key={place.place_id}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex-1">{place.name}</h4>
                  {place.rating && (
                    <div className="flex items-center ml-2 bg-white rounded-full px-2 py-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">
                        {place.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-start text-sm text-gray-600 mb-3">
                  <Navigation className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{place.vicinity}</span>
                </div>

                {place.types && place.types.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {place.types.slice(0, 3).map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white rounded-full text-xs text-gray-600"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

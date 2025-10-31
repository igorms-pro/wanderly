import { useEffect, useState } from 'react';
import { getWeatherForecast, WeatherData, getWeatherIconUrl } from '../lib/weather-service';
import { Cloud, Droplets, Wind, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface WeatherWidgetProps {
  destination: string;
  startDate: string;
  endDate: string;
}

export default function WeatherWidget({ destination, startDate, endDate }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, [destination, startDate, endDate]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const forecast = await getWeatherForecast(destination, startDate, endDate);
      setWeather(forecast.daily);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
        <h3 className="text-lg font-bold flex items-center">
          <Cloud className="w-5 h-5 mr-2" />
          Weather Forecast
        </h3>
        <p className="text-sm text-blue-100 mt-1">Plan activities around the weather</p>
      </div>

      <div className="p-6">
        {weather.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Weather data not available for this destination
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weather.map((day, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {format(new Date(day.date), 'EEE, MMM d')}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <img
                      src={getWeatherIconUrl(day.icon)}
                      alt={day.description}
                      className="w-12 h-12"
                    />
                    <span className="text-3xl font-bold text-gray-900">{day.temp}°</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3 capitalize">{day.description}</div>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Droplets className="w-3 h-3 mr-1" />
                      Humidity
                    </span>
                    <span className="font-medium">{day.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Wind className="w-3 h-3 mr-1" />
                      Wind
                    </span>
                    <span className="font-medium">{day.windSpeed.toFixed(1)} m/s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

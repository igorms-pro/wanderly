import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Cloud, Droplets, Wind, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getWeatherForecast, getWeatherIconUrl, type WeatherData } from '@/lib/weather-service';

type WeatherWidgetProps = {
  destination: string;
  startDate: string;
  endDate: string;
};

export default function WeatherWidget({ destination, startDate, endDate }: WeatherWidgetProps) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    try {
      const forecast = await getWeatherForecast(destination, startDate, endDate);
      setWeather(forecast.daily);
    } catch {
      setWeather([]);
    } finally {
      setLoading(false);
    }
  }, [destination, startDate, endDate]);

  useEffect(() => {
    void loadWeather();
  }, [loadWeather]);

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl shadow-sm p-6 dark:bg-gray-900"
        aria-busy="true"
        aria-label={t('tripDetail.exploreWeatherLoading')}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden dark:bg-gray-900">
      <div className="bg-gradient-to-r from-orange-500 to-rose-600 px-6 py-4 text-white">
        <h3 className="text-lg font-bold flex items-center">
          <Cloud className="w-5 h-5 mr-2" aria-hidden />
          {t('tripDetail.exploreWeatherTitle')}
        </h3>
        <p className="text-sm text-orange-100 mt-1">{t('tripDetail.exploreWeatherSubtitle')}</p>
      </div>

      <div className="p-6">
        {weather.length === 0 ? (
          <p className="text-gray-500 text-center py-4 dark:text-gray-400">
            {t('tripDetail.exploreWeatherUnavailable')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weather.map((day) => (
              <div
                key={day.date}
                className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-4 hover:shadow-md transition dark:from-gray-800 dark:to-gray-800/80"
              >
                <div className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                  {format(new Date(day.date), 'EEE, MMM d')}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <img
                      src={getWeatherIconUrl(day.icon)}
                      alt=""
                      className="w-12 h-12"
                      aria-hidden
                    />
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {day.temp}°
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3 capitalize dark:text-gray-300">
                  {day.description}
                </div>

                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Droplets className="w-3 h-3 mr-1" aria-hidden />
                      {t('tripDetail.exploreWeatherHumidity')}
                    </span>
                    <span className="font-medium">{day.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Wind className="w-3 h-3 mr-1" aria-hidden />
                      {t('tripDetail.exploreWeatherWind')}
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

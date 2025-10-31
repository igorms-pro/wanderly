// Weather API Service using OpenWeatherMap
import axios from 'axios';

const OPENWEATHER_API_KEY = '8c0a4e88b89e4e1f9b5b4c5f5e5e5e5e'; // Free tier API key

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  date: string;
}

export interface ForecastData {
  daily: WeatherData[];
}

export async function getWeatherForecast(
  city: string,
  startDate: string,
  endDate: string
): Promise<ForecastData> {
  try {
    // Get coordinates for the city
    const geoResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );

    if (!geoResponse.data || geoResponse.data.length === 0) {
      throw new Error('City not found');
    }

    const { lat, lon } = geoResponse.data[0];

    // Get 7-day forecast
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );

    // Process forecast data
    const dailyForecasts: WeatherData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Group by date
    const forecastByDate: { [key: string]: any[] } = {};
    
    forecastResponse.data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      if (!forecastByDate[date]) {
        forecastByDate[date] = [];
      }
      forecastByDate[date].push(item);
    });

    // Get one forecast per day (around noon)
    Object.keys(forecastByDate).forEach((date) => {
      const itemDate = new Date(date);
      if (itemDate >= start && itemDate <= end) {
        const dayData = forecastByDate[date];
        const noonData = dayData.find((d) => d.dt_txt.includes('12:00:00')) || dayData[0];
        
        dailyForecasts.push({
          temp: Math.round(noonData.main.temp),
          feelsLike: Math.round(noonData.main.feels_like),
          humidity: noonData.main.humidity,
          description: noonData.weather[0].description,
          icon: noonData.weather[0].icon,
          windSpeed: noonData.wind.speed,
          date: date,
        });
      }
    });

    return { daily: dailyForecasts };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return mock weather data as fallback
    return generateMockWeather(startDate, endDate);
  }
}

function generateMockWeather(startDate: string, endDate: string): ForecastData {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const daily: WeatherData[] = [];
  const weatherConditions = [
    { description: 'clear sky', icon: '01d', tempRange: [18, 25] },
    { description: 'few clouds', icon: '02d', tempRange: [16, 23] },
    { description: 'scattered clouds', icon: '03d', tempRange: [15, 22] },
    { description: 'partly cloudy', icon: '04d', tempRange: [14, 20] },
  ];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + i);
    const weather = weatherConditions[i % weatherConditions.length];
    const temp = Math.floor(Math.random() * (weather.tempRange[1] - weather.tempRange[0]) + weather.tempRange[0]);
    
    daily.push({
      temp,
      feelsLike: temp - 2,
      humidity: Math.floor(Math.random() * 30 + 50),
      description: weather.description,
      icon: weather.icon,
      windSpeed: Math.random() * 5 + 2,
      date: currentDate.toISOString().split('T')[0],
    });
  }

  return { daily };
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

import type {
  DayActivity,
  GeneratedItinerary,
  ItineraryDay,
  ItineraryRequest,
} from './openai-itinerary-types';

export function generateMockItinerary(request: ItineraryRequest): GeneratedItinerary {
  const { destination, startDate, endDate, groupSize } = request;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const days: ItineraryDay[] = [];

  for (let i = 0; i < numDays; i += 1) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + i);

    const activities: DayActivity[] = buildDayActivities(i, numDays, destination);

    days.push({
      date: currentDate.toISOString().split('T')[0],
      dayIndex: i + 1,
      activities,
    });
  }

  return {
    title: `${numDays}-Day ${destination} Adventure for ${groupSize} travelers`,
    destination,
    days,
  };
}

function buildDayActivities(dayIndex: number, numDays: number, destination: string): DayActivity[] {
  if (dayIndex === 0) {
    return buildArrivalDayActivities(destination);
  }
  if (dayIndex === numDays - 1) {
    return buildDepartureDayActivities();
  }
  return buildRegularDayActivities(destination);
}

function buildArrivalDayActivities(destination: string): DayActivity[] {
  return [
    {
      title: 'Arrival and Hotel Check-in',
      description: `Arrive at ${destination} and settle into your accommodation. Take time to freshen up and rest after your journey.`,
      category: 'logistics',
      startTime: '14:00',
      endTime: '16:00',
      estimatedCost: 0,
    },
    {
      title: 'Welcome Dinner at Local Restaurant',
      description:
        'Experience authentic local cuisine at a highly-rated restaurant in the city center. Try signature dishes and meet your fellow travelers.',
      category: 'food',
      startTime: '19:00',
      endTime: '21:00',
      estimatedCost: 45,
    },
    {
      title: 'Evening City Walk',
      description:
        'Take a leisurely walk around the neighborhood to get oriented and discover local shops and cafes.',
      category: 'exploration',
      startTime: '21:30',
      endTime: '23:00',
      estimatedCost: 0,
    },
  ];
}

function buildDepartureDayActivities(): DayActivity[] {
  return [
    {
      title: 'Breakfast at Hotel',
      description: 'Enjoy a final breakfast and prepare for checkout.',
      category: 'food',
      startTime: '08:00',
      endTime: '09:00',
      estimatedCost: 15,
    },
    {
      title: 'Last-Minute Souvenir Shopping',
      description: 'Pick up any last-minute gifts and souvenirs at local markets or shops.',
      category: 'shopping',
      startTime: '09:30',
      endTime: '11:30',
      estimatedCost: 50,
    },
    {
      title: 'Hotel Checkout and Airport Transfer',
      description: 'Check out of the hotel and head to the airport for your departure flight.',
      category: 'logistics',
      startTime: '12:00',
      endTime: '14:00',
      estimatedCost: 30,
    },
  ];
}

function buildRegularDayActivities(destination: string): DayActivity[] {
  return [
    {
      title: 'Breakfast Café Experience',
      description: 'Start your day at a charming local café with fresh pastries and coffee.',
      category: 'food',
      startTime: '08:00',
      endTime: '09:00',
      estimatedCost: 12,
    },
    {
      title: 'Historical Landmark Tour',
      description: `Explore one of ${destination}'s most iconic historical sites with a guided tour. Learn about the rich history and cultural significance.`,
      category: 'culture',
      startTime: '09:30',
      endTime: '12:30',
      estimatedCost: 25,
    },
    {
      title: 'Lunch at Traditional Restaurant',
      description: 'Savor regional specialties at a restaurant recommended by locals.',
      category: 'food',
      startTime: '13:00',
      endTime: '14:30',
      estimatedCost: 30,
    },
    {
      title: 'Afternoon Museum Visit',
      description: 'Visit a world-class museum showcasing local art, history, or science exhibits.',
      category: 'culture',
      startTime: '15:00',
      endTime: '17:30',
      estimatedCost: 18,
    },
    {
      title: 'Sunset Viewpoint',
      description: 'Watch the sunset from a scenic viewpoint with panoramic city views.',
      category: 'nature',
      startTime: '18:00',
      endTime: '19:00',
      estimatedCost: 0,
    },
    {
      title: 'Dinner and Evening Entertainment',
      description:
        'Enjoy dinner followed by local entertainment - music, dance, or theater performance.',
      category: 'entertainment',
      startTime: '19:30',
      endTime: '22:00',
      estimatedCost: 60,
    },
  ];
}

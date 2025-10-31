// OpenAI service for AI-powered itinerary generation
import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'dsdsadas';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // For demo purposes only
});

export interface ItineraryRequest {
  destination: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  pace?: 'relaxed' | 'balanced' | 'packed';
  budget?: number;
  currency?: string;
  interests?: string[];
  dietaryRestrictions?: string[];
  accessibility?: string[];
}

export interface DayActivity {
  title: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  estimatedCost: number;
  location?: {
    lat?: number;
    lon?: number;
    address?: string;
  };
}

export interface ItineraryDay {
  date: string;
  dayIndex: number;
  activities: DayActivity[];
}

export interface GeneratedItinerary {
  title: string;
  destination: string;
  days: ItineraryDay[];
}

export async function generateItinerary(
  request: ItineraryRequest
): Promise<GeneratedItinerary> {
  const { destination, startDate, endDate, groupSize, pace = 'balanced', budget, interests = [] } = request;
  
  // Calculate number of days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Build prompt
  const prompt = `Create a detailed ${days}-day travel itinerary for ${destination}.

Trip Details:
- Dates: ${startDate} to ${endDate} (${days} days)
- Group size: ${groupSize} people
- Pace: ${pace}
${budget ? `- Budget: ${budget} ${request.currency || 'USD'}` : ''}
${interests.length > 0 ? `- Interests: ${interests.join(', ')}` : ''}

Please provide a day-by-day itinerary with 3-5 activities per day. For each activity include:
- Activity title
- Brief description (1-2 sentences)
- Category (culture, food, nature, adventure, relaxation, shopping, etc.)
- Start time (HH:MM format)
- End time (HH:MM format)
- Estimated cost per person in ${request.currency || 'USD'}

Format your response as JSON with this structure:
{
  "title": "Trip title",
  "destination": "${destination}",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayIndex": 1,
      "activities": [
        {
          "title": "Activity name",
          "description": "Description",
          "category": "Category",
          "startTime": "09:00",
          "endTime": "11:00",
          "estimatedCost": 20
        }
      ]
    }
  ]
}

Ensure activities are scheduled logically (breakfast in morning, dinner in evening, etc.) and allow travel time between locations.`;

  try {
    // Check if API key is valid
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'dsdsadas') {
      // Return mock itinerary for demo
      return generateMockItinerary(request);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional travel planner. Provide detailed, realistic, and well-structured travel itineraries in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const itinerary = JSON.parse(content) as GeneratedItinerary;
    return itinerary;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    // Fallback to mock itinerary
    return generateMockItinerary(request);
  }
}

// Generate mock itinerary for demo purposes
function generateMockItinerary(request: ItineraryRequest): GeneratedItinerary {
  const { destination, startDate, endDate, groupSize } = request;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const numDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const days: ItineraryDay[] = [];
  
  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + i);
    
    const activities: DayActivity[] = [];
    
    if (i === 0) {
      // Arrival day - lighter schedule
      activities.push({
        title: 'Arrival and Hotel Check-in',
        description: `Arrive at ${destination} and settle into your accommodation. Take time to freshen up and rest after your journey.`,
        category: 'logistics',
        startTime: '14:00',
        endTime: '16:00',
        estimatedCost: 0,
      });
      activities.push({
        title: 'Welcome Dinner at Local Restaurant',
        description: 'Experience authentic local cuisine at a highly-rated restaurant in the city center. Try signature dishes and meet your fellow travelers.',
        category: 'food',
        startTime: '19:00',
        endTime: '21:00',
        estimatedCost: 45,
      });
      activities.push({
        title: 'Evening City Walk',
        description: 'Take a leisurely walk around the neighborhood to get oriented and discover local shops and cafes.',
        category: 'exploration',
        startTime: '21:30',
        endTime: '23:00',
        estimatedCost: 0,
      });
    } else if (i === numDays - 1) {
      // Departure day
      activities.push({
        title: 'Breakfast at Hotel',
        description: 'Enjoy a final breakfast and prepare for checkout.',
        category: 'food',
        startTime: '08:00',
        endTime: '09:00',
        estimatedCost: 15,
      });
      activities.push({
        title: 'Last-Minute Souvenir Shopping',
        description: 'Pick up any last-minute gifts and souvenirs at local markets or shops.',
        category: 'shopping',
        startTime: '09:30',
        endTime: '11:30',
        estimatedCost: 50,
      });
      activities.push({
        title: 'Hotel Checkout and Airport Transfer',
        description: 'Check out of the hotel and head to the airport for your departure flight.',
        category: 'logistics',
        startTime: '12:00',
        endTime: '14:00',
        estimatedCost: 30,
      });
    } else {
      // Full day of activities
      activities.push({
        title: 'Breakfast Café Experience',
        description: 'Start your day at a charming local café with fresh pastries and coffee.',
        category: 'food',
        startTime: '08:00',
        endTime: '09:00',
        estimatedCost: 12,
      });
      activities.push({
        title: 'Historical Landmark Tour',
        description: `Explore one of ${destination}'s most iconic historical sites with a guided tour. Learn about the rich history and cultural significance.`,
        category: 'culture',
        startTime: '09:30',
        endTime: '12:30',
        estimatedCost: 25,
      });
      activities.push({
        title: 'Lunch at Traditional Restaurant',
        description: 'Savor regional specialties at a restaurant recommended by locals.',
        category: 'food',
        startTime: '13:00',
        endTime: '14:30',
        estimatedCost: 30,
      });
      activities.push({
        title: 'Afternoon Museum Visit',
        description: 'Visit a world-class museum showcasing local art, history, or science exhibits.',
        category: 'culture',
        startTime: '15:00',
        endTime: '17:30',
        estimatedCost: 18,
      });
      activities.push({
        title: 'Sunset Viewpoint',
        description: 'Watch the sunset from a scenic viewpoint with panoramic city views.',
        category: 'nature',
        startTime: '18:00',
        endTime: '19:00',
        estimatedCost: 0,
      });
      activities.push({
        title: 'Dinner and Evening Entertainment',
        description: 'Enjoy dinner followed by local entertainment - music, dance, or theater performance.',
        category: 'entertainment',
        startTime: '19:30',
        endTime: '22:00',
        estimatedCost: 60,
      });
    }
    
    days.push({
      date: currentDate.toISOString().split('T')[0],
      dayIndex: i + 1,
      activities,
    });
  }

  return {
    title: `${numDays}-Day ${destination} Adventure`,
    destination,
    days,
  };
}

export default { generateItinerary };

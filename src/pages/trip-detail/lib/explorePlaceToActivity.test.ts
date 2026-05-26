import { describe, expect, it } from 'vitest';

import type { NearbyPlace } from '@/lib/places-service';

import { mapExplorePlaceToActivityImport } from './explorePlaceToActivity';

const samplePlace: NearbyPlace = {
  place_id: 'mock_eiffel',
  name: 'Eiffel Tower',
  vicinity: 'Champ de Mars',
  rating: 4.7,
  types: ['tourist_attraction', 'point_of_interest'],
  geometry: { location: { lat: 48.8584, lng: 2.2945 } },
};

describe('mapExplorePlaceToActivityImport', () => {
  it('maps nearby place fields for itinerary import', () => {
    const payload = mapExplorePlaceToActivityImport(samplePlace);

    expect(payload.title).toBe('Eiffel Tower');
    expect(payload.place_id).toBe('mock_eiffel');
    expect(payload.lat).toBe(48.8584);
    expect(payload.lon).toBe(2.2945);
    expect(payload.source).toBe('import');
    expect(payload.status).toBe('proposed');
    expect(payload.category).toBe('tourist attraction');
  });

  it('prefers formatted address from place details', () => {
    const payload = mapExplorePlaceToActivityImport(samplePlace, {
      place_id: 'mock_eiffel',
      name: 'Tour Eiffel',
      formatted_address: '5 Av. Anatole France, Paris',
      types: ['tourist_attraction'],
      geometry: { location: { lat: 48.8584, lng: 2.2945 } },
    });

    expect(payload.title).toBe('Tour Eiffel');
    expect(payload.description).toBe('5 Av. Anatole France, Paris');
  });
});

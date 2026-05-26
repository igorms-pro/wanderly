import { useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';

import 'leaflet/dist/leaflet.css';

import type { ItineraryMapModel } from '../../lib/itineraryMapModel';
import { computeMapCenter } from '../../lib/itineraryMapModel';

const ROUTE_COLOR = '#ea580c';
const MAP_ZOOM = 13;

type TripItineraryMapViewProps = {
  mapModel: Extract<ItineraryMapModel, { kind: 'ready' }>;
  ariaLabel: string;
};

export function TripItineraryMapView({ mapModel, ariaLabel }: TripItineraryMapViewProps) {
  const center = useMemo(() => computeMapCenter(mapModel.route), [mapModel.route]);

  const bounds = useMemo((): LatLngBoundsExpression | undefined => {
    if (mapModel.route.length < 2) {
      return undefined;
    }
    return mapModel.route.map(([lat, lon]) => [lat, lon] as [number, number]);
  }, [mapModel.route]);

  const containerProps =
    bounds != null
      ? { bounds, boundsOptions: { padding: [32, 32] as [number, number] } }
      : { center, zoom: MAP_ZOOM };

  return (
    <div
      className="h-[min(50vh,28rem)] w-full overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700"
      role="region"
      aria-label={ariaLabel}
    >
      <MapContainer {...containerProps} scrollWheelZoom={false} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={mapModel.route} pathOptions={{ color: ROUTE_COLOR, weight: 4 }} />
        {mapModel.stops.map((stop) => (
          <CircleMarker
            key={stop.activityId}
            center={[stop.lat, stop.lon]}
            radius={14}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: ROUTE_COLOR,
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <span className="font-semibold tabular-nums">
                {stop.order}. {stop.title}
              </span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

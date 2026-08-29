import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect } from 'react';
import L from 'leaflet';
import MapPopupCard from './MapPopupCard.jsx';
import { defaultMarkerIcon } from '../../utils/browse.utils.js';

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

function FitBounds({ requests, selectedLocation }) {
  const map = useMap();

  useEffect(() => {
    if (requests.length === 0) {
      if (selectedLocation) {
        map.setView([selectedLocation.lat, selectedLocation.lon], 12);
      }
      return;
    }

    const bounds = L.latLngBounds(
      requests.map((r) => [r.latitude, r.longitude])
    );
    if (selectedLocation) {
      bounds.extend([selectedLocation.lat, selectedLocation.lon]);
    }
    map.fitBounds(bounds.pad(0.15));
  }, [requests, selectedLocation, map]);

  return null;
}

export default function MapView({
  requests,
  selectedLocation,
  onSelectRequest,
}) {
  return (
    <MapContainer
      center={[37.1662, -119.4494]}
      zoom={4}
      style={{ height: '100%', width: '100%', borderRadius: 8 }}
    >
      <TileLayer
        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
        attribution="© OpenMapTiles © OpenStreetMap contributors"
      />
      <FitBounds requests={requests} selectedLocation={selectedLocation} />

      <MarkerClusterGroup
        spiderfyOnMaxZoom
        spiderfyDistanceMultiplier={1.5}
        showCoverageOnHover={false}
        maxClusterRadius={40}
      >
        {requests.map((request) => (
          <Marker
            key={request.id}
            position={[request.latitude, request.longitude]}
            icon={defaultMarkerIcon()}
            eventHandlers={{ click: () => onSelectRequest(request) }}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1}>
              <MapPopupCard request={request} />
            </Tooltip>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

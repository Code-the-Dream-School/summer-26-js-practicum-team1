import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { defaultMarkerIcon } from '../../utils/browse.utils.js';

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const SINGLE_POINT_ZOOM = 16;

export default function LocationMap({ latitude, longitude, height = 220 }) {
  if (latitude == null || longitude == null) return null;

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={SINGLE_POINT_ZOOM}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ height, width: '100%', borderRadius: 8 }}
    >
      <TileLayer
        url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
      />
      <Marker position={[latitude, longitude]} icon={defaultMarkerIcon()} />
    </MapContainer>
  );
}

const GEOAPIFY_BASE = 'https://api.geoapify.com/v1/geocode';

function getApiKey() {
  return import.meta.env.VITE_GEOAPIFY_API_KEY || '';
}

export function hasGeoapifyKey() {
  return Boolean(getApiKey());
}

/**
 * Search places for volunteer service area.
 * Returns stable labeled results with coordinates (not free-text).
 */
export async function searchServiceAreas(query) {
  const apiKey = getApiKey();
  const text = query?.trim();

  if (!apiKey || !text || text.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    text,
    limit: '6',
    format: 'json',
    apiKey,
  });

  const response = await fetch(
    `${GEOAPIFY_BASE}/autocomplete?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Location search failed');
  }

  const data = await response.json();
  const results = data.results || data.features || [];

  return results
    .map((item) => {
      // autocomplete JSON format uses flat results[]; geojson uses features[]
      const props = item.properties || item;
      const lat = props.lat ?? props.latitude;
      const lon = props.lon ?? props.longitude ?? props.lng;
      const label =
        props.formatted ||
        props.address_line1 ||
        [props.city, props.state, props.country].filter(Boolean).join(', ');

      if (lat == null || lon == null || !label) {
        return null;
      }

      return {
        label,
        latitude: Number(lat),
        longitude: Number(lon),
        placeId: props.place_id || props.placeId || null,
      };
    })
    .filter(Boolean);
}

const GEOAPIFY_BASE = 'https://api.geoapify.com/v1/geocode';

function getApiKey() {
  return import.meta.env.VITE_GEOAPIFY_API_KEY || '';
}

export function hasGeoapifyKey() {
  return Boolean(getApiKey());
}

/**
 * Shared Geoapify autocomplete helper (profile service area, help-request address, etc.).
 * Returns stable labeled results with coordinates (not free-text).
 */
export async function searchPlaces(query) {
  const apiKey = getApiKey();
  const text = query?.trim();

  if (!apiKey || !text || text.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    text,
    limit: '6',
    apiKey,
  });

  const response = await fetch(
    `${GEOAPIFY_BASE}/autocomplete?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Location search failed');
  }

  const data = await response.json();
  const results = data.features || [];

  return results
    .map((feature) => {
      const props = feature.properties || {};
      const lat = props.lat;
      const lon = props.lon;
      const label =
        props.formatted ||
        [props.city, props.state, props.country].filter(Boolean).join(', ');

      if (lat == null || lon == null || !label) {
        return null;
      }

      return {
        label,
        latitude: Number(lat),
        longitude: Number(lon),
        placeId: props.place_id || null,
      };
    })
    .filter(Boolean);
}
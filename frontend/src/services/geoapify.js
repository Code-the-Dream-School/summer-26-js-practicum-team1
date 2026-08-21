const GEOAPIFY_BASE = 'https://api.geoapify.com/v1/geocode';

function getApiKey() {
  return import.meta.env.VITE_GEOAPIFY_API_KEY || '';
}

export function hasGeoapifyKey() {
  return Boolean(getApiKey());
}

function getCity(props) {
  return (
    props.city ||
    props.town ||
    props.village ||
    props.municipality ||
    props.suburb ||
    props.district ||
    ''
  );
}

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

  return (data.features || [])
    .map((feature) => {
      const props = feature.properties || {};

      const city = getCity(props);

      const label =
        props.formatted ||
        [
          props.address_line1,
          props.address_line2,
          props.city,
          props.state,
          props.country,
        ]
          .filter(Boolean)
          .join(', ');

      if (props.lat == null || props.lon == null || !label) {
        return null;
      }

      return {
        label,
        city,
        state: props.state || '',
        postcode: props.postcode || '',
        country: props.country || '',
        latitude: Number(props.lat),
        longitude: Number(props.lon),
        placeId: props.place_id || null,
      };
    })
    .filter(Boolean);
}

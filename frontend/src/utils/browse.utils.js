import { ERROR_MESSAGES, CATEGORIES, DAYS_OF_WEEK } from './browse.constants';
import { COLORS } from './constants';
import L from 'leaflet';

export function toggleInArray(arr, val) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export function friendlyErrorMessage(error) {
  if (!error) return null;
  return ERROR_MESSAGES[error.message] || error.message;
}

export function viewToggleSx(active) {
  return {
    textTransform: 'none',
    backgroundColor: active ? COLORS.primary : '#fff',
    color: active ? '#fff' : 'text.primary',
    borderColor: COLORS.border,
    '&:hover': {
      backgroundColor: active ? COLORS.primaryHover : COLORS.bgSubtle,
    },
  };
}

export function mapInterestsToCategoryKeys(interests = []) {
  if (!Array.isArray(interests)) return [];
  const interestNames = new Set(
    interests
      .map((interest) =>
        typeof interest === 'string' ? interest : interest?.name
      )
      .filter(Boolean)
      .map((name) => name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  return CATEGORIES.filter((c) => {
    const apiValNormalized = c.apiValue.toLowerCase().replace(/[^a-z0-9]/g, '');
    const labelNormalized = c.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    const keyNormalized = c.key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      interestNames.has(apiValNormalized) ||
      interestNames.has(labelNormalized) ||
      interestNames.has(keyNormalized)
    );
  }).map((c) => c.key);
}

export function mapSlotsToDays(slots = []) {
  if (!Array.isArray(slots)) return [];
  const days = slots
    .map((slot) => {
      const rawDay = slot?.dayOfWeek;
      if (!rawDay) return undefined;
      const normalizedDay = String(rawDay).toUpperCase();
      const match = DAYS_OF_WEEK.find(
        (d) =>
          d.full.toUpperCase() === normalizedDay ||
          normalizedDay.startsWith(d.full.toUpperCase()) ||
          d.short.toUpperCase() === normalizedDay
      );
      return match?.day;
    })
    .filter((day) => day !== undefined);
  return [...new Set(days)];
}

export function buildLocationOptionFromProfile(volunteer) {
  if (
    !volunteer?.serviceArea ||
    volunteer.serviceLatitude == null ||
    volunteer.serviceLongitude == null
  ) {
    return null;
  }
  return {
    place_id: `profile-service-area-${volunteer.serviceArea}`,
    formatted: volunteer.serviceArea,
    lat: volunteer.serviceLatitude,
    lon: volunteer.serviceLongitude,
  };
}

export function formatScheduledLabel(scheduledAt) {
  if (!scheduledAt) return 'Flexible anytime';
  const d = new Date(scheduledAt);
  const datePart = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

const DEFAULT_ICON = L.divIcon({
  className: 'category-marker',
  html: `
    <div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#3F6B4E" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});

export function categoryIcon() {
  return DEFAULT_ICON;
}

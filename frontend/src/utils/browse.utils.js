import { ERROR_MESSAGES, CATEGORIES, DAYS_OF_WEEK } from './browse.constants';
import { COLORS } from './constants';

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
    interests.map((interest) => interest?.name).filter(Boolean)
  );
  return CATEGORIES.filter((c) => interestNames.has(c.apiValue)).map(
    (c) => c.key
  );
}

export function mapSlotsToDays(slots = []) {
  if (!Array.isArray(slots)) return [];
  const days = slots
    .map((slot) => {
      const match = DAYS_OF_WEEK.find(
        (d) => d.full.toUpperCase() === slot?.dayOfWeek
      );
      return match?.day;
    })
    .filter((day) => day !== undefined);
  return [...new Set(days)];
}

export function buildLocationOptionFromProfile(volunteer) {
  if (!volunteer?.serviceArea || volunteer.serviceLatitude == null) {
    return null;
  }
  return {
    place_id: `profile-service-area-${volunteer.serviceArea}`,
    formatted: volunteer.serviceArea,
    lat: volunteer.serviceLatitude,
    lon: volunteer.serviceLongitude,
  };
}

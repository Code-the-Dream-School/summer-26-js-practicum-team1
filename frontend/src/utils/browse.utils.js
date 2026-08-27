import {
  ERROR_MESSAGES,
  COLORS,
  CATEGORIES,
  DAYS_OF_WEEK,
} from './browse.constants';

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

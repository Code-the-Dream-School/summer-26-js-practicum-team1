export const URGENCY_STYLES = {
  HIGH: {
    border: '#B33F32',
    bg: '#B33F32',
    text: '#FFF1F0',
  },

  MEDIUM: {
    border: '#C1791E',
    bg: '#C1791E',
    text: '#FFF8E1',
  },

  LOW: {
    border: '#3F6B4E',
    bg: '#3F6B4E',
    text: '#FFF8E1',
  },
};

export const STATUS_STYLES = {
  PENDING: {
    label: 'Pending',
    bg: '#FEF3C7',
    text: '#92400E',
  },

  ACCEPTED: {
    label: 'Accepted',
    bg: '#DCFCE7',
    text: '#166534',
  },

  COMPLETED: {
    label: 'Completed',
    bg: '#E0E7FF',
    text: '#3730A3',
  },

  CANCELLED: {
    label: 'Cancelled',
    bg: '#FEE2E2',
    text: '#991B1B',
  },
};

export const CATEGORY = [
  'GROCERY',
  'TRANSPORTATION',
  'HOUSEHOLD_CHORES',
  'YARD_WORK',
  'PET_CARE',
  'TECH_SUPPORT',
  'COMPANIONSHIP',
  'MEAL_PREP',
  'MEDICAL_ERRAND',
  'OTHER',
];

export const URGENCY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export const URGENCY_RANK = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function getUrgencyStyle(urgency) {
  return URGENCY_STYLES[urgency] || URGENCY_STYLES.LOW;
}

export function getStatusStyle(status) {
  return STATUS_STYLES[status] || STATUS_STYLES.PENDING;
}

export function formatDateTimeLocal(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');

  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const COLORS = {
  bgSubtle: '#F6F6F4',
  border: '#E5E5E2',
  borderHover: '#B2B2AE',
  textMuted: '#6B6B68',
  textFaint: '#9C9C98',
  primary: '#3F6B4E',
  primaryHover: '#345A41',
};

export const DEFAULT_DISTANCE_MI = 5;

export const CATEGORIES = [
  { key: 'groceries', apiValue: 'GROCERIES', label: 'Groceries' },
  {
    key: 'transportation',
    apiValue: 'TRANSPORTATION',
    label: 'Transportation',
  },
  {
    key: 'household-chores',
    apiValue: 'HOUSEHOLD_CHORES',
    label: 'Household Chores',
  },
  { key: 'yard-work', apiValue: 'YARD_WORK', label: 'Yard Work' },
  { key: 'pet-care', apiValue: 'PET_CARE', label: 'Pet Care' },
  { key: 'tech-support', apiValue: 'TECH_SUPPORT', label: 'Tech Support' },
  { key: 'companionship', apiValue: 'COMPANIONSHIP', label: 'Companionship' },
  { key: 'meal-prep', apiValue: 'MEAL_PREP', label: 'Meal Prep' },
  {
    key: 'medical-errand',
    apiValue: 'MEDICAL_ERRAND',
    label: 'Medical Errand',
  },
  { key: 'other', apiValue: 'OTHER', label: 'Other' },
];

export const CATEGORY_BY_API_VALUE = Object.fromEntries(
  CATEGORIES.map((c) => [c.apiValue, c])
);

export const DAYS_OF_WEEK = [
  { short: 'S', full: 'Sun', day: 0 },
  { short: 'M', full: 'Mon', day: 1 },
  { short: 'T', full: 'Tue', day: 2 },
  { short: 'W', full: 'Wed', day: 3 },
  { short: 'T', full: 'Thu', day: 4 },
  { short: 'F', full: 'Fri', day: 5 },
  { short: 'S', full: 'Sat', day: 6 },
];

export const URGENCY_LEVELS = [
  { key: 'low', apiValue: 'LOW', label: 'Low', color: '#3F6B4E' },
  { key: 'medium', apiValue: 'MEDIUM', label: 'Medium', color: '#C1791E' },
  { key: 'high', apiValue: 'HIGH', label: 'High', color: '#B33F32' },
];

export const URGENCY_BY_API_VALUE = Object.fromEntries(
  URGENCY_LEVELS.map((u) => [u.apiValue, u])
);

export const SORT_FIELDS = [
  { key: 'createdAt', label: 'Date created', defaultDir: 'desc' },
  { key: 'scheduledAt', label: 'Scheduled date', defaultDir: 'asc' },
  { key: 'urgency', label: 'Urgency', defaultDir: 'desc' },
  {
    key: 'distance',
    label: 'Distance',
    defaultDir: 'asc',
    requires: 'location',
  },
];

export const DIR_LABELS = {
  createdAt: { asc: 'Oldest first', desc: 'Newest first' },
  scheduledAt: { asc: 'Soonest first', desc: 'Latest first' },
  urgency: { asc: 'Low to High', desc: 'High to Low' },
  distance: { asc: 'Closest first', desc: 'Farthest first' },
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Couldn't reach the server. Check your connection and try again.",
  FETCH_HELP_REQUESTS_FAILED: 'Something went wrong loading help requests.',
};

export const fieldSx = {
  backgroundColor: COLORS.bgSubtle,
  '& fieldset': { borderColor: COLORS.border },
  '&:hover fieldset': { borderColor: COLORS.borderHover },
  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
};

export const inputLabelSx = {
  '& .MuiInputLabel-root': { color: COLORS.textFaint },
  '& .MuiInputLabel-root.Mui-focused': { color: 'primary.main' },
};

// Temporary until we expose support categories from the API.
// IDs must match rows created by backend `npm run db:seed` (#39).
export const SUPPORT_CATEGORIES = [
  { id: 1, name: 'Groceries' },
  { id: 2, name: 'Errands' },
  { id: 3, name: 'Transport' },
  { id: 4, name: 'Tech help' },
  { id: 5, name: 'Companionship' },
  { id: 6, name: 'Home help' },
  { id: 7, name: 'Other' },
];

export const DAYS_OF_WEEK = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
  { value: 'SAT', label: 'Saturday' },
  { value: 'SUN', label: 'Sunday' },
];

import { ERROR_MESSAGES, COLORS } from './browse.constants';

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

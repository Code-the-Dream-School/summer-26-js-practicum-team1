// In dev, Vite proxies /api to the backend (see vite.config.ts).
// In production, set VITE_API_URL to your backend URL.
export const API_URL = import.meta.env.VITE_API_URL || '';

import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getVolunteerPreferences() {
  const { data } = await api.get('/api/profile/preferences');
  return data.data;
}

export async function updateVolunteerPreferences(payload, csrfToken) {
  const { data } = await api.put('/api/profile/preferences', payload, {
    headers: { 'X-CSRF-TOKEN': csrfToken },
  });
  return data.data;
}

export async function getSupportCategories() {
  const { data } = await api.get('/api/profile/support-categories');
  return data.data;
}

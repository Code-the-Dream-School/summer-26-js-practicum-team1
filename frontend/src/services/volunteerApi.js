import api from './api';

export async function getVolunteerPreferences() {
  const { data } = await api.get('/api/volunteers/me/preferences');
  return data;
}

export async function updateVolunteerPreferences(payload, csrfToken) {
  const { data } = await api.put('/api/volunteers/me/preferences', payload, {
    headers: { 'X-CSRF-TOKEN': csrfToken },
  });
  return data;
}

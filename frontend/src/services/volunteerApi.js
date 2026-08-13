import api from './api';

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

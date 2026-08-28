import axios from 'axios';
import { API_URL } from '../utils/constants';

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getDashboardStats = async () => {
  const { data } = await adminApi.get('/api/admin/dashboard');
  return data.data;
};

export const getPendingVolunteers = async () => {
  const { data } = await adminApi.get('/api/admin/volunteers/pending');
  return data.data;
};

export const approveVolunteer = async (userId, csrfToken) => {
  const { data } = await adminApi.put(
    `/api/admin/volunteers/${userId}/approve`,
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
    }
  );

  return data;
};

export const rejectVolunteer = async (userId, csrfToken) => {
  const { data } = await adminApi.put(
    `/api/admin/volunteers/${userId}/reject`,
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
    }
  );

  return data;
};

export const getUsers = async () => {
  const { data } = await adminApi.get('/api/admin/users');
  return data.data;
};

export const getUserById = async (userId) => {
  const { data } = await adminApi.get(`/api/admin/users/${userId}`);
  return data.data;
};

export const updateUserVolunteerById = async (userId, payload, csrfToken) => {
  const { data } = await adminApi.put(
    `/api/admin/users/${userId}/volunteer`,
    payload,
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
    }
  );
  return data.data;
};

export const getUserProfileImage = async (userId) => {
  const { data } = await adminApi.get(
    `/api/admin/users/${userId}/profile/image`,
    {
      responseType: 'blob',
    }
  );
  return data;
};

export default adminApi;

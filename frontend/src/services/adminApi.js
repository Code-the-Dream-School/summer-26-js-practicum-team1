import axios from 'axios';
import { API_URL } from '../utils/constants';
//import { users } from '../mock/adminMockData';

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

export const approveVolunteer = async (userId) => {
  const { data } = await adminApi.put(
    `/api/admin/volunteers/${userId}/approve`
  );
  return data;
};

export const rejectVolunteer = async (userId) => {
  const { data } = await adminApi.put(`/api/admin/volunteers/${userId}/reject`);
  return data;
};

// TODO: Replace with GET /api/admin/users once backend endpoint is available.
export const getUsers = async () => {
  const { data } = await adminApi.get('/api/admin/users');
  return data.data;
  //return Promise.resolve(users);
};

export default adminApi;

import axios from 'axios';
import { API_URL } from '../utils/constants';
import { pendingVolunteers, dashboardStats } from '../mock/adminMockData';

//remove after backend implementation
let pendingVolunteersData = [...pendingVolunteers];

const adminApi = axios.create({
  baseURL: API_URL,
});

export const getDashboardStats = async () => {
  //const { data } = await adminApi.get('/admin/dashboard/stats');
  //return data;

  //mock data replace with Api call once backend is ready
  return Promise.resolve(dashboardStats);
};

export const getPendingVolunteers = async () => {
  //const { data } = await adminApi.get('/admin/volunteers/pending');
  //return data;

  //mock data replace with Api call once backend is ready
  return Promise.resolve(pendingVolunteersData);
};

export const approveVolunteer = async (id) => {
  //const { data } = await adminApi.patch(`/admin/volunteers/${id}/approve`);
  //return data;

  console.log('Approve volunteer:', id);
  //mock data replace with Api call once backend is ready
  pendingVolunteersData = pendingVolunteersData.filter(
    (volunteer) => volunteer.id !== id
  );
  return Promise.resolve({
    success: true,
    message: 'Volunteer approved',
  });
};

export const rejectVolunteer = async (id) => {
  //const { data } = await adminApi.patch(`/admin/volunteers/${id}/reject`);
  //return data;

  console.log('Reject volunteer:', id);
  pendingVolunteersData = pendingVolunteersData.filter(
    (volunteer) => volunteer.id !== id
  );
  return Promise.resolve({
    success: true,
    message: 'Volunteer rejected',
  });
};

export default adminApi;

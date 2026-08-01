import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getHello() {
  const { data } = await api.get('/api/hello');
  return data.message;
}

export async function getUser() {
  /*const { data } = await api.get(`/auth/me`, {
   return data; 
  });

  */
  //mockdata
  return {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'ADMIN',
  };
}

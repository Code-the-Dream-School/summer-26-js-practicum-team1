import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getHello = async () => {
  const { data } = await api.get('/api/hello');
  return data.data.message;
};

export default api;

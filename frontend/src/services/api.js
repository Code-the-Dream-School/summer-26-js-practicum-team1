import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
});

export async function getHello() {
  const { data } = await api.get('/api/hello');
  return data.message;
}

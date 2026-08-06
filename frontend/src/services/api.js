import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
});

export async function getHello() {
  const { data } = await api.get('/api/hello');
  return data.message;
}

export async function login(email, password) {
  try {
    const { data } = await api.post(
      '/api/auth/logon',
      { email, password },
      { withCredentials: true }
    );
    return data;
  } catch (err) {
    if (!err.response) {
      throw new Error('NETWORK_ERROR');
    }
    if (err.response.status === 423) {
      throw new Error('ACCOUNT_LOCKED');
    }
    throw new Error('INVALID_CREDENTIALS');
  }
}
export async function registerUser(userData) {
  try {
    const { data } = await api.post('/api/auth/register', userData);

    return data;
  } catch (err) {
    if (!err.response) {
      throw new Error('NETWORK_ERROR');
    }

    if (err.response.status === 400) {
      const validationError = new Error('VALIDATION_FAILED');
      validationError.details = err.response.data.details;
      throw validationError;
    }

    throw new Error('REGISTER_FAILED');
  }
}

export async function logout(csrfToken) {
  try {
    await api.post(
      '/api/auth/logoff',
      {},
      {
        headers: { 'X-CSRF-TOKEN': csrfToken },
        withCredentials: true,
      }
    );
  } catch (err) {
    if (err.response?.status === 401) return;
    if (err.response?.status === 403) {
      console.warn('Logout CSRF check failed, session may still be active');
      return;
    }
    throw new Error('Logoff failed');
  }
}

export async function getMe() {
  try {
    const { data } = await api.get('/api/auth/me', { withCredentials: true });
    return data;
  } catch {
    return null;
  }
}

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
  //uncomment once registration is ready
  try {
    const { data } = await api.get('/api/auth/me', { withCredentials: true });
    return data;
  } catch {
    return null;
  }
}

function buildHelpRequestParams(filters = {}) {
  const params = {};

  if (filters.category?.length) params.category = filters.category.join(',');
  if (filters.urgency?.length) params.urgency = filters.urgency.join(',');
  if (filters.status?.length) params.status = filters.status.join(',');
  if (filters.q) params.q = filters.q;

  if (filters.scheduledAfter) params.scheduledAfter = filters.scheduledAfter;
  if (filters.scheduledBefore) params.scheduledBefore = filters.scheduledBefore;
  if (filters.createdAfter) params.createdAfter = filters.createdAfter;
  if (filters.createdBefore) params.createdBefore = filters.createdBefore;

  const hasGeo =
    filters.lat != null && filters.lng != null && filters.radiusMi != null;
  if (hasGeo) {
    params.lat = filters.lat;
    params.lng = filters.lng;
    params.radiusMi = filters.radiusMi;
  }

  if (filters.sortField) {
    params.sort = `${filters.sortField}:${filters.sortDir || 'desc'}`;
  }

  return params;
}

export async function getHelpRequests(filters) {
  try {
    const { data } = await api.get('/api/requests', {
      params: buildHelpRequestParams(filters),
      withCredentials: true,
    });
    return data.data;
  } catch (err) {
    if (!err.response) {
      throw new Error('NETWORK_ERROR');
    }
    if (err.response.status === 400) {
      throw new Error(err.response.data?.message || 'INVALID_REQUEST');
    }
    throw new Error('FETCH_HELP_REQUESTS_FAILED');
  }
}

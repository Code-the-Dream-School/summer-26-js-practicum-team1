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
    const { data } = await api.post('/api/auth/register', userData, {
      withCredentials: true,
    });

    return data;
  } catch (err) {
    if (!err.response) {
      throw new Error('NETWORK_ERROR');
    }

    if (err.response?.status === 400 && err.response?.data?.details) {
      const validationError = new Error('VALIDATION_FAILED');
      validationError.details = err.response.data.details;
      throw validationError;
    }

    throw new Error('REGISTRATION_FAILED');
  }
}

export async function createHelpRequest(data, csrfToken) {
  try {
    const { data: responseData } = await api.post('/api/requests', data, {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
      withCredentials: true,
    });

    return responseData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}
export async function getHelpRequests() {
  try {
    const { data } = await api.get('/api/requests/mine', {
      withCredentials: true,
    });

    return data;
  } catch (err) {
    console.error('Error getting help requests:', err);
    throw err;
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

function buildFilterParams(filters = {}) {
  const params = {};

  if (filters.category?.length) params.category = filters.category.join(',');
  if (filters.urgency?.length) params.urgency = filters.urgency.join(',');
  if (filters.status?.length) params.status = filters.status.join(',');
  if (filters.daysOfWeek?.length)
    params.daysOfWeek = filters.daysOfWeek.join(',');
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

  return params;
}

function buildHelpRequestParams(filters = {}) {
  const params = buildFilterParams(filters);

  if (filters.sortField) {
    params.sort = `${filters.sortField}:${filters.sortDir || 'desc'}`;
  }

  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.pageSize = filters.pageSize;

  return params;
}

function buildFacetsParams(filters = {}) {
  // eslint-disable-next-line no-unused-vars
  const { category, ...rest } = filters;
  return buildFilterParams(rest);
}

export async function getBrowseHelpRequests(filters) {
  try {
    const { data } = await api.get('/api/requests', {
      params: buildHelpRequestParams(filters),
      withCredentials: true,
    });
    return { data: data.data, meta: data.meta };
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

export async function acceptHelpRequest(requestId, csrfToken) {
  const { data } = await api.post(
    `/api/requests/${requestId}/accept`,
    {},
    {
      headers: { 'X-CSRF-TOKEN': csrfToken },
      withCredentials: true,
    }
  );
  return data;
}

export async function declineHelpRequest(requestId, csrfToken) {
  const { data } = await api.post(
    `/api/requests/${requestId}/decline`,
    {},
    {
      headers: { 'X-CSRF-TOKEN': csrfToken },
      withCredentials: true,
    }
  );
  return data;
}

export async function getNotifications({ unreadOnly = false, page = 1, pageSize = 20 } = {}) {
  const { data } = await api.get('/api/notifications', {
    params: { unreadOnly, page, pageSize },
    withCredentials: true,
  });
  return data;
}

export async function markNotificationRead(notificationId, csrfToken) {
  const { data } = await api.patch(
    `/api/notifications/${notificationId}/read`,
    {},
    {
      headers: { 'X-CSRF-TOKEN': csrfToken },
      withCredentials: true,
    }
  );
  return data;
}

export async function getCategoryFacets(filters) {
  try {
    const { data } = await api.get('/api/requests/facets', {
      params: buildFacetsParams(filters),
      withCredentials: true,
    });
    return data.categoryCounts;
  } catch (err) {
    if (!err.response) {
      throw new Error('NETWORK_ERROR');
    }
    if (err.response.status === 400) {
      throw new Error(err.response.data?.message || 'INVALID_REQUEST');
    }
    throw new Error('FETCH_CATEGORY_FACETS_FAILED');
  }
}

export async function getProfile() {
  const { data } = await api.get('/api/profile', { withCredentials: true });
  return data.data;
}

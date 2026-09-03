import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * Build common filter parameters for browse help requests.
 */
function buildFilterParams(filters = {}) {
  const params = {};

  if (filters.category) {
    params.category = filters.category;
  }

  if (filters.urgency) {
    params.urgency = filters.urgency;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.latitude !== undefined && filters.latitude !== null) {
    params.latitude = filters.latitude;
  }

  if (filters.longitude !== undefined && filters.longitude !== null) {
    params.longitude = filters.longitude;
  }

  if (filters.radius !== undefined && filters.radius !== null) {
    params.radius = filters.radius;
  }

  if (filters.startDate) {
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    params.endDate = filters.endDate;
  }

  return params;
}

/**
 * Build parameters for browse help requests.
 */
function buildHelpRequestParams(filters = {}) {
  const params = buildFilterParams(filters);

  if (filters.sortField) {
    params.sort = `${filters.sortField}:${filters.sortDir || 'desc'}`;
  }

  if (filters.page) {
    params.page = filters.page;
  }

  if (filters.pageSize) {
    params.pageSize = filters.pageSize;
  }

  return params;
}

/**
 * Build parameters for category facets.
 *
 * Category itself is excluded because the facet endpoint
 * should return category counts for the other active filters.
 */
function buildFacetsParams(filters = {}) {
  const { category: _category, ...rest } = filters;

  return buildFilterParams(rest);
}

/**
 * Get hello message.
 */
export async function getHello() {
  const { data } = await api.get('/api/hello');

  return data.message;
}

/**
 * Login.
 */
export async function login(email, password) {
  try {
    const { data } = await api.post(
      '/api/auth/logon',
      { email, password },
      {
        withCredentials: true,
      }
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
/**
 * Register a new user.
 */
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

    if (err.response.status === 400 && err.response.data?.details) {
      const validationError = new Error('VALIDATION_FAILED');

      validationError.details = err.response.data.details;

      throw validationError;
    }

    if (err.response.status === 409) throw new Error('EMAIL_TAKEN');

    throw new Error('REGISTRATION_FAILED');
  }
}

/**
 * Accept a help request.
 */
export async function acceptHelpRequest(requestId, csrfToken) {
  const { data } = await api.post(
    `/api/requests/${requestId}/accept`,
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
      withCredentials: true,
    }
  );

  return data;
}

/**
 * Decline a help request.
 */
export async function declineHelpRequest(requestId, csrfToken) {
  const { data } = await api.post(
    `/api/requests/${requestId}/decline`,
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
      withCredentials: true,
    }
  );

  return data;
}

/**
 * Create a new help request.
 */
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
    console.error('Error creating help request:', err);

    throw err;
  }
}

/**
 * Get help requests belonging to the current user.
 */
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

/**
 * Get help requests for Browse page.
 */
export async function getBrowseHelpRequests(filters = {}) {
  try {
    const { data } = await api.get('/api/requests', {
      params: buildHelpRequestParams(filters),
      withCredentials: true,
    });

    return {
      data: data.data,
      meta: data.meta,
    };
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

/**
 * Get category facet counts for Browse page.
 */
export async function getCategoryFacets(filters = {}) {
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

/** Get accepted help requests for the current volunteer.*/
export async function getVolunteerAcceptedRequests() {
  try {
    const { data } = await api.get('/api/requests/volunteer/accepted', {
      withCredentials: true,
    });

    return data.data || [];
  } catch (err) {
    console.error('Error getting volunteer accepted requests:', err);

    throw err;
  }
}

export async function getAcceptedVolunteerProfile(requestId) {
  try {
    const { data } = await api.get(`/api/requests/${requestId}/volunteer`, {
      withCredentials: true,
    });

    return data.data;
  } catch (err) {
    console.error('Error getting accepted volunteer profile:', err);

    throw err;
  }
}
/**
 * Get one help request by ID.
 */
export async function getHelpRequestById(id, csrfToken) {
  try {
    const { data } = await api.get(`/api/requests/${id}`, {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
      withCredentials: true,
    });

    return data.data;
  } catch (err) {
    console.error('Error getting help request:', err);

    throw err;
  }
}

/**
 * Update an existing help request.
 */
export async function updateHelpRequest(id, data, csrfToken) {
  try {
    const { data: responseData } = await api.patch(
      `/api/requests/${id}`,
      data,
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
        withCredentials: true,
      }
    );

    return responseData;
  } catch (err) {
    console.error('Error updating help request:', err);

    throw err;
  }
}

/**
 * Cancel a help request.
 */
export async function cancelHelpRequest(id, csrfToken) {
  try {
    const { data: responseData } = await api.patch(
      `/api/requests/${id}/cancel`,
      {},
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
        withCredentials: true,
      }
    );

    return responseData;
  } catch (err) {
    console.error('Error cancelling help request:', err);

    throw err;
  }
}

/**
 * Logout.
 */
export async function logout(csrfToken) {
  try {
    await api.post(
      '/api/auth/logoff',
      {},
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
        withCredentials: true,
      }
    );
  } catch (err) {
    if (err.response?.status === 401) {
      return;
    }

    if (err.response?.status === 403) {
      console.warn('Logout CSRF check failed, session may still be active');

      return;
    }

    throw new Error('Logoff failed');
  }
}

/**
 * Get current logged-in user.
 */
export async function getMe() {
  try {
    const { data } = await api.get('/api/auth/me', {
      withCredentials: true,
    });

    return data;
  } catch {
    return null;
  }
}

/**
 * Get current user's profile.
 */
export async function getProfile() {
  const { data } = await api.get('/api/profile', {
    withCredentials: true,
  });

  return data.data;
}

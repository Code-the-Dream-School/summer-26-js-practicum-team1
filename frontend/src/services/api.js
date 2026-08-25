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

    if (
      err.response.status === 400 &&
      err.response.data?.details
    ) {
      const validationError = new Error('VALIDATION_FAILED');
      validationError.details = err.response.data.details;
      throw validationError;
    }

    throw new Error('REGISTRATION_FAILED');
  }
}

/* Create a new help request */
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

/*Get help requests*/
export async function getHelpRequests() {
  try {
    const { data } = await api.get(
      '/api/requests/mine',
      {
        withCredentials: true,
      }
    );

    return data;
  } catch (err) {
    console.error(
      'Error getting help requests:',
      err
    );
    throw err;
  }
}
/* Get one help request by ID */
export async function getHelpRequestById(
  id,
  csrfToken
) {
  try {
    const { data } = await api.get(
      `/api/requests/${id}`,
      {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
        },
        withCredentials: true,
      }
    );

    return data;
  } catch (err) {
    console.error(
      'Error getting help request:',
      err
    );
    throw err;
  }
}
/* Get volunteer profile for an accepted help request */
export async function getAcceptedVolunteerProfile(requestId) {
  try {
    const { data } = await api.get(
      `/api/requests/${requestId}/volunteer`,
      {
        withCredentials: true,
      }
    );

    return data;
  } catch (err) {
    console.error(
      'Error getting accepted volunteer profile:',
      err
    );
    throw err;
  }
}
/* Update an existing help request */
export async function updateHelpRequest(
  id,
  data,
  csrfToken
) {
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
    console.error(
      'Error updating help request:',
      err
    );
    throw err;
  }
}

/* Cancel a help request */
export async function cancelHelpRequest(
  id,
  csrfToken
) {
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
    console.error(
      'Error cancelling help request:',
      err
    );
    throw err;
  }
}

/**
 * Logout
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
      console.warn(
        'Logout CSRF check failed, session may still be active'
      );
      return;
    }

    throw new Error('Logoff failed');
  }
}

/**
 * Get current logged-in user
 */
export async function getMe() {
  try {
    const { data } = await api.get(
      '/api/auth/me',
      {
        withCredentials: true,
      }
    );

    return data;
  } catch {
    return null;
  }
}

/**
 * Get current user's profile
 */
export async function getProfile() {
  const { data } = await api.get(
    '/api/profile',
    {
      withCredentials: true,
    }
  );

  return data.data;
}
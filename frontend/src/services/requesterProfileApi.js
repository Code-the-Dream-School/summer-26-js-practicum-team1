import axios from 'axios';
import { API_URL } from '../utils/constants';

const requesterProfileApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getRequesterProfile = async () => {
  const { data } = await requesterProfileApi.get('/api/profile');
  return data;
};

export const getRequesterProfileImage = async () => {
  const { data } = await requesterProfileApi.get('/api/profile/image', {
    responseType: 'blob',
  });
  return data;
};

export const updateRequesterProfile = async (profileData, csrfToken) => {
  const { data } = await requesterProfileApi.patch(
    '/api/profile',
    profileData,
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
    }
  );
  return data;
};

export const updateRequesterProfileImage = async (imageFile, csrfToken) => {
  const formData = new FormData();

  formData.append('profileImage', imageFile);

  const { data } = await requesterProfileApi.patch(
    '/api/profile/image',
    formData,
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
    }
  );

  return data;
};

export default requesterProfileApi;

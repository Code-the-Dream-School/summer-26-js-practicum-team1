import axios from 'axios';
import { API_URL } from '../utils/constants';

const profileApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const getProfile = async () => {
  const { data } = await profileApi.get('/api/profile');
  return data;
};

export const getProfileImage = async () => {
  const { data } = await profileApi.get('/api/profile/image', {
    responseType: 'blob',
  });
  return data;
};

export const updateProfileImage = async (imageFile, csrfToken) => {
  const formData = new FormData();

  formData.append('profileImage', imageFile);

  const { data } = await profileApi.patch('/api/profile/image', formData, {
    headers: {
      'X-CSRF-TOKEN': csrfToken,
    },
  });

  return data;
};

export default profileApi;

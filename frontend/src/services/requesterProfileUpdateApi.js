import axios from 'axios';
import { API_URL } from '../utils/constants';

const requesterProfileApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

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

export default requesterProfileApi;

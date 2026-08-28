import axios from 'axios';
import { API_URL } from '../utils/constants';

const chatApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getMessages(requestId) {
  const { data } = await chatApi.get(
    `/api/chat/requests/${requestId}/messages`
  );

  return data.data;
}

export async function sendMessage(requestId, content, csrfToken) {
  const { data } = await chatApi.post(
    `/api/chat/requests/${requestId}/messages`,
    { content },
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
    }
  );

  return data.data;
}

export async function markMessagesRead(requestId, csrfToken) {
  const { data } = await chatApi.patch(
    `/api/chat/requests/${requestId}/messages/read`,
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      },
    }
  );

  return data.data;
}

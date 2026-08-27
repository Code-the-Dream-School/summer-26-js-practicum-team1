import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getMessages,
  sendMessage,
  markMessagesRead,
} from '../services/chatApi';

export function useChatMessages(requestId) {
  return useQuery({
    queryKey: ['chatMessages', requestId],
    queryFn: () => getMessages(requestId),
    enabled: Boolean(requestId),
    refetchInterval: 5000,
  });
}

export function useSendMessage(requestId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content) => {
      const me = queryClient.getQueryData(['me']);

      return sendMessage(requestId, content, me?.csrfToken);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chatMessages', requestId],
      });
    },
  });
}

export function useMarkMessagesRead(requestId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const me = queryClient.getQueryData(['me']);

      return markMessagesRead(requestId, me?.csrfToken);
    },
  });
}

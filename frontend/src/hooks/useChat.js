import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getMessages,
  sendMessage,
  markMessagesRead,
  getConversations,
  getUnreadMessageCount,
} from '../services/chatApi';

export function useGetUnreadCount() {
  return useQuery({
    queryKey: ['chat', 'unread-count'],
    queryFn: getUnreadMessageCount,
    refetchInterval: 15000,
  });
}

export function useChatMessages(requestId) {
  return useQuery({
    queryKey: ['chatMessages', requestId],
    queryFn: () => getMessages(requestId),
    enabled: Boolean(requestId),
    refetchInterval: 15000,
  });
}

export function useGetConversation() {
  return useQuery({
    queryKey: ['chatConversations'],
    queryFn: () => getConversations(),
    refetchInterval: 15000,
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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'unread-count'],
      });
    },
  });
}

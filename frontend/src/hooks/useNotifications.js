import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../services/api';
import { useAuth } from './useAuth';

const POLL_INTERVAL_MS = 30000;

export function useNotifications({ enabled = true, unreadOnly = false } = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isRequester = user?.role === 'requester';

  const query = useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: () => getNotifications({ unreadOnly }),
    enabled: enabled && isRequester,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId) =>
      markNotificationRead(notificationId, user?.csrfToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: query.data?.data ?? [],
    unreadCount: query.data?.meta?.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    markRead: markReadMutation.mutateAsync,
  };
}

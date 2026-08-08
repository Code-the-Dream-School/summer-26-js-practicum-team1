import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectVolunteer } from '../../services/adminApi';

export function useRejectVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => {
      const me = queryClient.getQueryData(['me']);

      return rejectVolunteer(userId, me?.csrfToken);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pendingVolunteers'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboardStats'],
      });
    },
  });
}

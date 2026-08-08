import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveVolunteer } from '../../services/adminApi';

export function useApproveVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => {
      const me = queryClient.getQueryData(['me']);

      return approveVolunteer(userId, me?.csrfToken);
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

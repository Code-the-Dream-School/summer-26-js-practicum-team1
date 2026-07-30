import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveVolunteer } from '../../services/adminApi';

export function useApproveVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveVolunteer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pendingVolunteers'],
      });
    },
  });
}

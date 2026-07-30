import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectVolunteer } from '../../services/adminApi';

export function useRejectVolunteer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectVolunteer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['pendingVolunteers'],
      });
    },
  });
}

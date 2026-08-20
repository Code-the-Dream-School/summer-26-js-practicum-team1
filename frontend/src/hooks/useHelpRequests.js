import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHelpRequest } from '../services/api';

export function useHelpRequests() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ data, csrfToken }) =>
      createHelpRequest(data, csrfToken),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['helpRequests'],
      });
    },
  });

  return {
    createHelpRequest: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}
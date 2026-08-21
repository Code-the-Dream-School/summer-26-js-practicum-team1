import { useQuery } from '@tanstack/react-query';
import { getBrowseHelpRequests } from '../services/api';

export function useBrowseHelpRequests(filters) {
  const {
    data: helpRequests,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['help-requests', filters],
    queryFn: () => getBrowseHelpRequests(filters),
    placeholderData: (previousData) => previousData,
  });

  return {
    helpRequests: helpRequests || [],
    isLoading,
    isFetching,
    isError,
    error,
  }
}

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
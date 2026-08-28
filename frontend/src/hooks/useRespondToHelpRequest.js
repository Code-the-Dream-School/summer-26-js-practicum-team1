import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptHelpRequest, declineHelpRequest } from '../services/api';
import { useAuth } from './useAuth';

export function useRespondToHelpRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidateBrowse = () => {
    queryClient.invalidateQueries({ queryKey: ['help-requests'] });
    queryClient.invalidateQueries({ queryKey: ['help-requests-facets'] });
  };

  const acceptMutation = useMutation({
    mutationFn: (requestId) => acceptHelpRequest(requestId, user?.csrfToken),
    onSuccess: invalidateBrowse,
  });

  const declineMutation = useMutation({
    mutationFn: (requestId) => declineHelpRequest(requestId, user?.csrfToken),
  });

  return {
    acceptRequest: acceptMutation.mutateAsync,
    declineRequest: declineMutation.mutateAsync,
    respondingRequestId:
      acceptMutation.isPending
        ? acceptMutation.variables
        : declineMutation.isPending
          ? declineMutation.variables
          : null,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  acceptHelpRequest,
  declineHelpRequest,
  completeHelpRequest,
} from '../services/api';
import { useAuth } from './useAuth';

export function useRespondToHelpRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidateBrowse = () => {
    queryClient.invalidateQueries({ queryKey: ['help-requests'] });
    queryClient.invalidateQueries({ queryKey: ['help-requests-facets'] });
  };

  const invalidateDetail = (id) => {
    queryClient.invalidateQueries({ queryKey: ['help-request', String(id)] });
  };

  const acceptMutation = useMutation({
    mutationFn: (requestId) => acceptHelpRequest(requestId, user?.csrfToken),
    onSuccess: (_, requestId) => {
      invalidateBrowse();
      invalidateDetail(requestId);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (requestId) => declineHelpRequest(requestId, user?.csrfToken),
    onSuccess: (_, requestId) => {
      invalidateDetail(requestId);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (requestId) => completeHelpRequest(requestId, user?.csrfToken),
    onSuccess: (_, requestId) => {
      invalidateDetail(requestId);
    },
  });

  return {
    acceptRequest: acceptMutation.mutateAsync,
    declineRequest: declineMutation.mutateAsync,
    completeRequest: completeMutation.mutateAsync,
    respondingRequestId: acceptMutation.isPending
      ? acceptMutation.variables
      : declineMutation.isPending
        ? declineMutation.variables
        : completeMutation.isPending
          ? completeMutation.variables
          : null,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}

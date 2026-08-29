import { useQuery } from '@tanstack/react-query';
import { getAcceptedVolunteerProfile } from '../services/api';

export function useAcceptedVolunteerProfile(requestId, enabled = true) {
  const query = useQuery({
    queryKey: ['acceptedVolunteerProfile', requestId],
    queryFn: () => getAcceptedVolunteerProfile(requestId),
    enabled: enabled && Boolean(requestId),
    retry: false,
  });

  return {
    volunteer: query.data?.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

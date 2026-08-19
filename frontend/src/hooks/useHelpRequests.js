import { useQuery } from '@tanstack/react-query';
import { getHelpRequests } from '../services/api';

export function useHelpRequests(filters) {
  const {
    data: helpRequests,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['help-requests', filters],
    queryFn: () => getHelpRequests(filters),
    placeholderData: (previousData) => previousData,
  });

  return {
    helpRequests: helpRequests || [],
    isLoading,
    isFetching,
    isError,
    error,
  };
}
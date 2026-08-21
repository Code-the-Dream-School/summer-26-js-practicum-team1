import { useQuery } from '@tanstack/react-query';

import { useAuth } from './useAuth';
import { getProfile } from '../services/api';

export function useProfile() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: getProfile,
    enabled: Boolean(user),
    retry: false,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

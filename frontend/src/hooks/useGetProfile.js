import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../services/profileApi';

export function useGetProfile(options = {}) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    ...options,
  });
}

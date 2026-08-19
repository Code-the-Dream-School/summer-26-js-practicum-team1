import { useQuery } from '@tanstack/react-query';
import { getSupportCategories } from '../services/volunteerApi';

export function useSupportCategories({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['supportCategories'],
    queryFn: getSupportCategories,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

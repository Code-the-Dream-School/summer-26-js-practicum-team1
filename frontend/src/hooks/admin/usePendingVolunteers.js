import { useQuery } from '@tanstack/react-query';
import { getPendingVolunteers } from '../../services/adminApi';

export function usePendingVolunteers() {
  return useQuery({
    queryKey: ['pendingVolunteers'],
    queryFn: getPendingVolunteers,
  });
}

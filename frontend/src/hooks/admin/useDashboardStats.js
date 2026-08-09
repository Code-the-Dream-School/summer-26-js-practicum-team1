import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/adminApi';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });
}

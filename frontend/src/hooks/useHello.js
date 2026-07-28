import { useQuery } from '@tanstack/react-query';
import { getHello } from '../services/api';

export function useHello() {
  return useQuery({
    queryKey: ['hello'],
    queryFn: getHello,
  });
}

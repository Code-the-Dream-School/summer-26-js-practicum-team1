import { useQuery } from '@tanstack/react-query';
import { getHello } from '../services/api';

export const useHello = () =>
  useQuery({
    queryKey: ['hello'],
    queryFn: getHello,
  });

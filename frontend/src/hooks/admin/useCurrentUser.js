import { useQuery } from '@tanstack/react-query';
import { API_URL } from '../../utils/constants';
import { getUser } from '../../services/api';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],

    queryFn: getUser,

    retry: false,
  });
}

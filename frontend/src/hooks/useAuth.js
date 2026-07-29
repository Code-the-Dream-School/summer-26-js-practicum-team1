import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout, getMe } from '../services/api';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isCheckingSession } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    initialData: null,
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      const me = queryClient.getQueryData(['me']);
      return logout(me?.csrfToken);
    },
    onSuccess: () => queryClient.setQueryData(['me'], null),
  });

  return {
    user,
    isCheckingSession,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
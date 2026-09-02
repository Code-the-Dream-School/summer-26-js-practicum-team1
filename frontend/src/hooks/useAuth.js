import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  login,
  googleLogin,
  logout,
  getMe,
  registerUser,
} from '../services/api';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isCheckingSession } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  });

  const googleLoginMutation = useMutation({
    mutationFn: googleLogin,
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
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
    googleLogin: googleLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginError: loginMutation.error,
    googleLoginError: googleLoginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isGoogleLoggingIn: googleLoginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}

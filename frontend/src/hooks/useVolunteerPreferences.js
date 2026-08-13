import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getVolunteerPreferences,
  updateVolunteerPreferences,
} from '../services/volunteerApi';

export function useVolunteerPreferences({ enabled = true } = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['volunteerPreferences'],
    queryFn: getVolunteerPreferences,
    enabled: enabled && Boolean(user),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (payload) =>
      updateVolunteerPreferences(payload, user?.csrfToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['volunteerPreferences'], data);
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    savePreferences: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}

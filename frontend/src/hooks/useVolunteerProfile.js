import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getProfile } from '../services/api';
import { updateVolunteerProfile } from '../services/volunteerApi';

export function useVolunteerProfile({ enabled = true } = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const profileKey = ['profile', user?.id];

  const query = useQuery({
    queryKey: profileKey,
    queryFn: getProfile,
    enabled: enabled && Boolean(user),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (payload) => updateVolunteerProfile(payload, user?.csrfToken),
    onSuccess: (volunteer) => {
      queryClient.setQueryData(profileKey, (current) =>
        current ? { ...current, volunteer } : current
      );
    },
  });

  return {
    profile: query.data,
    volunteer: query.data?.volunteer ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    saveVolunteer: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}

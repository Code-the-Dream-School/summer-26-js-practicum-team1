import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfileImage } from '../services/profileApi';

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageFile) => {
      const me = queryClient.getQueryData(['me']);

      return updateProfileImage(imageFile, me?.csrfToken);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['profileImage'],
      });
    },
  });
}

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfileImage } from '../../services/adminApi';

export function useAdminUserProfileImage(userId) {
  const { data: blob, ...query } = useQuery({
    queryKey: ['adminUserProfileImage', userId],
    queryFn: () => getUserProfileImage(userId),
    enabled: Boolean(userId),
    retry: false,
  });

  const imageUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    [blob]
  );

  useEffect(() => {
    if (!imageUrl) {
      return undefined;
    }

    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  return {
    ...query,
    data: imageUrl,
  };
}

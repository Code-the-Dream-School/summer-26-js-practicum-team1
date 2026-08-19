import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfileImage } from '../../services/adminApi';

export function useAdminUserProfileImage(userId) {
  const { data: blob, ...query } = useQuery({
    queryKey: ['adminUserProfileImage', userId],
    queryFn: () => getUserProfileImage(userId),
    enabled: Boolean(userId),
    retry: false,
  });

  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!blob) {
      setImageUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(blob);
    setImageUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return {
    ...query,
    data: imageUrl,
  };
}

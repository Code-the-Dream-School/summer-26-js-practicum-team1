import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfileImage } from '../services/profileApi';

export function useGetProfileImage(options = {}) {
  const { data: blob, ...query } = useQuery({
    queryKey: ['profileImage'],
    queryFn: getProfileImage,
    retry: false,
    ...options,
  });

  const imageUrl = useMemo(() => {
    if (blob instanceof Blob && blob.size > 0) {
      return URL.createObjectURL(blob);
    }
    return null;
  }, [blob]);

  useEffect(() => {
    if (!imageUrl) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return {
    ...query,
    data: imageUrl,
  };
}

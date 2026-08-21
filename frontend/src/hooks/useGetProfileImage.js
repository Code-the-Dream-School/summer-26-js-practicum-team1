import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfileImage } from '../services/profileApi';

export function useGetProfileImage() {
  const { data: blob, ...query } = useQuery({
    queryKey: ['profileImage'],
    queryFn: getProfileImage,
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

    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return {
    ...query,
    data: imageUrl,
  };
}

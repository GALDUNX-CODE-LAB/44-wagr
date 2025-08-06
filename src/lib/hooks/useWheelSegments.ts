import { useQuery } from '@tanstack/react-query';
import { fetchSegments } from '../api/wheel-api';

export const useWheelSegments = () => {
  return useQuery({
    queryKey: ['wheelSegments'],
    queryFn: fetchSegments,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
};

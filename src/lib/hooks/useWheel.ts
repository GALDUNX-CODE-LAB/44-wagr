import { useMutation } from '@tanstack/react-query';
import { placeWheelBet } from '../api/wheel-api';

export const useWheelBet = () => {
  return useMutation({
    mutationFn: placeWheelBet,
  });
};
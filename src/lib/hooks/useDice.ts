// hooks/useDiceBet.ts
import { useMutation } from '@tanstack/react-query';
import { placeDiceBet } from '../api/dice-api';

export const useDiceBet = () => {
  return useMutation({
    mutationFn: placeDiceBet,
  });
};
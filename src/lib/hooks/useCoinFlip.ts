import { useMutation } from '@tanstack/react-query'
import { placeCoinflipBet } from '../api/coin-api'

export const useCoinflipBet = () => {
  return useMutation({
    mutationFn: placeCoinflipBet,
  })
}

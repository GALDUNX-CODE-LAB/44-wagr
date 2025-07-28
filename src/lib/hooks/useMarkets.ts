import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchMarkets, fetchMarketById, placeMarketBet } from '../api/markets-api';
import { Market } from '../../interfaces/interface';

// 1. Hook for fetching all markets (unchanged)
export const useMarkets = () => {
  return useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    select: (data) => data.markets,
  });
};

// 2. Hook for fetching single market (unchanged)
export const useMarket = (id: string) => {
  return useQuery({
    queryKey: ['market', id],
    queryFn: () => fetchMarketById(id),
    enabled: !!id,
  });
};

// 3. Simplified betting hook without QueryClient
export const usePlaceBet = () => {
  return useMutation({
    mutationFn: ({
      marketId,
      side,
      stake
    }: {
      marketId: string;
      side: 'YES' | 'NO';
      stake: number;
    }) => placeMarketBet(marketId, side, stake),
    
    // Optional: Manually refetch data after success
    onSuccess: (data, variables) => {
      // You would need to pass queryClient from your component if you want to invalidate
      console.log('Bet placed successfully!', data);
      // In a real app, you might want to update the UI here
    },
  });
};
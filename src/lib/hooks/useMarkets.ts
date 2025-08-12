import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMarkets, fetchMarketById, placeMarketBet } from "../api/markets-api";
import { Market } from "../../interfaces/interface";

// 1. Hook for fetching all markets
export const useMarkets = () => {
  return useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    // Since fetchMarkets always returns { markets: [...] },
    // we can safely select it here
    select: (data) => data.markets,
  });
};

// 2. Hook for fetching a single market
export const useMarket = (id: string) => {
  return useQuery({
    queryKey: ["market", id],
    queryFn: () => fetchMarketById(id),
    enabled: !!id, // only fetch if id exists
  });
};

// 3. Hook for placing a market bet
export const usePlaceBet = () => {
  return useMutation({
    mutationFn: ({
      marketId,
      side,
      stake,
    }: {
      marketId: string;
      side: "YES" | "NO";
      stake: number;
    }) => placeMarketBet(marketId, side, stake),
    onSuccess: (data) => {
      console.log("✅ Bet placed successfully!", data);
      // Here you could invalidate queries like:
      // queryClient.invalidateQueries(["markets"]);
      // queryClient.invalidateQueries(["market", variables.marketId]);
    },
  });
};

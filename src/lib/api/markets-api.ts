import apiHandler from "../api-handler"; // adjust the path if needed
import { Market } from "../../interfaces/interface";

// ✅ Fetch all markets
export const fetchMarkets = async () => {
  const data = await apiHandler<any>(process.env.NEXT_PUBLIC_META_MARKET_ENDPOINT || "", {
    method: "GET",
  });

  // Normalize: if API returns array, wrap in { markets: [] }
  return Array.isArray(data) ? { success: true, markets: data } : data;
};

// ✅ Fetch single market by ID
export const fetchMarketById = async (id: string): Promise<Market> => {
  const data = await apiHandler<{ market: Market }>(`/meta-market/${id}`, {
    method: "GET",
  });

  if (!data.market) {
    throw new Error("Market data not found in response");
  }
  return data.market;
};

// ✅ Place a market bet
export const placeMarketBet = async (
  marketId: string,
  side: "YES" | "NO",
  stake: number
) => {
  return await apiHandler(`/meta-market/${marketId}/bet`, {
    method: "POST",
    body: JSON.stringify({ side, stake }),
  });
};

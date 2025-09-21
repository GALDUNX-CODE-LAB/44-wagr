import { Market, CrashBetPayload, MarketPrice, UserPortfolio, ExecuteMarketPayload } from "../../interfaces/interface";
import apiHandler from "../api-handler";

export const fetchLiveWins = async () => {
  const response = await apiHandler("/live-wins", { method: "GET" });
  return response;
};

export const fetchCoinflipWins = async () => {
  const response = await apiHandler("/live-wins/coinflip", { method: "GET" });
  return response;
};

export const fetchDiceWins = async () => {
  const response = await apiHandler("/live-wins/dice", { method: "GET" });
  return response;
};

export const fetchCrashWins = async () => {
  const response = await apiHandler("/live-wins/crash", { method: "GET" });
  return response;
};

export const fetchWheelsWins = async () => {
  const response = await apiHandler("/live-wins/wheels", { method: "GET" });
  return response;
};

export const placeCrashBet = async (payload: CrashBetPayload) => {
  const response = await apiHandler("/crash/bet", {
    method: "POST",
    data: payload,
  });
  return response;
};

export const addMetaMarketComment = async (marketId: string, comment: string) => {
  const response = await apiHandler(`/meta-market/${marketId}/comment`, {
    method: "POST",
    data: { comment },
  });
  return response;
};

export const fetchComments = async (marketId: string, page = 1, limit = 10) => {
  const response = await apiHandler(`/meta-market/${marketId}/comments?page=${page}&limit=${limit}`, {
    method: "GET",
  });

  return response;
};

export const claimDailyStreak = async () => {
  const response = await apiHandler("/streak/claim", {
    method: "POST",
  });
  return response;
};

export const fetchUserPoints = async () => {
  const response = await apiHandler("/user/points", {
    method: "GET",
  });
  return response;
};

export const fetchUserBets = async (page = 1, game = "all") => {
  const response = await apiHandler(`/user/my-bets?page=${page}&game=${game}`, {
    method: "GET",
  });
  return response;
};

export const fetchCoinflipGameHistory = async (page = 1) => {
  const response = await apiHandler(`/user/my-bets?game=coinflip&page=${page}`, {
    method: "GET",
  });
  return response;
};

export const fetchDiceGameHistory = async (page = 1) => {
  const response = await apiHandler(`/user/my-bets?game=dice&page=${page}`, {
    method: "GET",
  });
  return response;
};

export const fetchWheelGameHistory = async (page = 1) => {
  const response = await apiHandler(`/user/my-bets?game=wheel&page=${page}`, {
    method: "GET",
  });
  return response;
};

export const fetchCrashGameHistory = async (page = 1) => {
  const response = await apiHandler(`/user/my-bets?game=crash&page=${page}`, {
    method: "GET",
  });
  return response;
};

export const fetchMetaMarketGameHistory = async (page = 1) => {
  const response = await apiHandler(`/user/my-bets?game=metamarket&page=${page}`, {
    method: "GET",
  });
  return response;
};

export const likeComment = async (commentId: string) => {
  const response = await apiHandler(`/meta-market/comment/${commentId}/like`, {
    method: "POST",
  });
  return response;
};

export const fetchCommentLikes = async (commentId: string) => {
  const response = await apiHandler(`/meta-market/comment/${commentId}/likes`, {
    method: "GET",
  });
  return response;
};

export const fetchReferralStats = async () => {
  const response = await apiHandler("/referral/stats", {
    method: "GET",
  });
  return response;
};

export const fetchUserTransactions = async () => {
  const response = await apiHandler("/transactions/user/transactions", {
    method: "GET",
  });
  return response;
};

export const placeCoinflipBet = async ({ betAmount, choice }: { betAmount: number; choice: "heads" | "tails" }) => {
  const normalizedChoice = choice.toLowerCase();

  const response = await apiHandler("/coinflip/bet", {
    method: "POST",
    data: { betAmount, choice: normalizedChoice },
  });

  return response;
};

export const placeDiceBet = async ({
  betAmount,
  target,
  betType,
}: {
  betAmount: number;
  target: number;
  betType: "over" | "under";
}) => {
  const response = await apiHandler("/dice/bet", {
    method: "POST",
    data: { betAmount, target, betType },
  });

  return response;
};

export const fetchMarkets = async () => {
  const data = await apiHandler<any>("/meta-market", {
    method: "GET",
  });

  // Normalize: if API returns array, wrap in { markets: [] }
  return Array.isArray(data) ? { success: true, markets: data } : data;
};

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
export const placeMarketBet = async (marketId: string, side: "YES" | "NO", stake: number) => {
  return await apiHandler(`/meta-market/${marketId}/bet`, {
    method: "POST",
    data: JSON.stringify({ side, stake }),
  });
};

export const getUserWallets = async () => {
  const response = await apiHandler("/user/my-wallets", {
    method: "GET",
  });
  return response?.wallets;
};

export const getGoogleLink = async () => {
  const response = await apiHandler("/auth/google", { method: "GET" });
  return response;
};

export const getGoogleCallback = async (code: string) => {
  const response = await apiHandler(`/auth/google/callback?code=${code}`, {
    method: "POST",
    body: {},
  });
  return response;
};

export const requestNonce = async (walletAddress: string) => {
  console.log(walletAddress, "ddoee03030");
  return await apiHandler("/auth/nonce", {
    method: "POST",
    data: { walletAddress },
  });
};

export const verifySignature = async (walletAddress: string, signature: string) => {
  return await apiHandler("/auth/verify", {
    method: "POST",
    data: { walletAddress, signature },
  });
};

export const getUserData = async () => {
  const response = await apiHandler("/user", { method: "GET" });
  return response.message;
};

export const getCrashHistory = async () => {
  const response = await apiHandler("/crash/history", { method: "GET" });
  return response.results;
};

export const fetchLotteries = async () => {
  const response = await apiHandler("/lottery", {
    method: "GET",
  });
  return response;
};

export const fetchLotteryWinners = async () => {
  const response = await apiHandler("/lottery/winners", {
    method: "GET",
  });
  return response;
};

export const fetchLotteryNumbers = async (roundId: string) => {
  const response = await apiHandler(`/lottery/${roundId}/numbers`, {
    method: "GET",
  });
  return response;
};

export const placeLotteryBet = async (
  roundId: string,
  betData: {
    pickedNumbers: number[];
  }
) => {
  const requestData = {
    roundId: roundId,
    pickedNumbers: betData.pickedNumbers,
  };

  console.log("Actual request data being sent:", requestData);

  const response = await apiHandler(`/lottery/bet`, {
    method: "POST",
    data: requestData,
  });
  return response;
};

export const fetchMarketPrices = async (id: string): Promise<MarketPrice> => {
  const response = await apiHandler(`/meta-market/price/${id}`, {
    method: "GET",
  });
  return response.data;
};

export const fetchUserPorfolio = async (id: string): Promise<UserPortfolio> => {
  const response = await apiHandler(`/meta-market/portfolio/${id}`, {
    method: "GET",
  });
  return response.data;
};

export const executeMarketTrade = async (payload: ExecuteMarketPayload) => {
  const response = await apiHandler(`/meta-market/execute/trade`, {
    method: "POST",
    data: payload,
  });
  return response.data;
};

export const createUserWithdrawal = async (amount: number, walletAddress: string) => {
  const requestData = {
    amount: amount,
    walletAddress: walletAddress,
  };
  const response = await apiHandler(`/user/withdrawals`, {
    method: "POST",
    data: requestData,
  });

  return response;
};

export const getUserWithdrawals = async () => {
  const response = await apiHandler(`/user/withdrawals`, {
    method: "GET",
  });

  return response;
};

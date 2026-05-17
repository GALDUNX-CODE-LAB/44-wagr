import {
  Market,
  MetaMarketCategory,
  CrashBetPayload,
  MarketPrice,
  UserPortfolio,
  ExecuteMarketPayload,
  INotification,
} from "../../interfaces/interface";
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

export const fetchPlinkoWins = async () => {
  const response = await apiHandler("/live-wins/plinko", { method: "GET" });
  return response;
};

export const placePlinkoBet = async ({
  betAmount,
  rows,
  difficulty,
}: {
  betAmount: number;
  rows: number;
  difficulty: "low" | "medium" | "high";
}) => {
  const response = await apiHandler("/plinko/bet", {
    method: "POST",
    data: { betAmount, rows, difficulty },
  });
  return response;
};

export const fetchPlinkoHistory = async (page = 1) => {
  const response = await apiHandler(`/user/my-bets?game=plinko&page=${page}`, { method: "GET" });
  return response;
};

export const fetchMinesWins = async () => {
  const response = await apiHandler("/live-wins/mines", { method: "GET" });
  return response;
};

export const startMinesGame = async ({ betAmount, mineCount }: { betAmount: number; mineCount: number }) => {
  const response = await apiHandler("/mines/start", { method: "POST", data: { betAmount, mineCount } });
  return response;
};

export const revealMinesCell = async ({ gameId, cellIndex }: { gameId: string; cellIndex: number }) => {
  const response = await apiHandler("/mines/reveal", { method: "POST", data: { gameId, cellIndex } });
  return response;
};

export const cashoutMinesGame = async ({ gameId }: { gameId: string }) => {
  const response = await apiHandler("/mines/cashout", { method: "POST", data: { gameId } });
  return response;
};

export const fetchMinesHistory = async (page = 1) => {
  const response = await apiHandler(`/user/my-bets?game=mines&page=${page}`, { method: "GET" });
  return response;
};

export type OriginalsPlayerCounts = { crash: number; dice: number; coin: number; wheel: number };

export const fetchOriginalsPlayerCounts = async (): Promise<OriginalsPlayerCounts> => {
  const response = await apiHandler<OriginalsPlayerCounts>("/originals/player-counts", { method: "GET" });
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

export const getCurrentStreak = async () => {
  const response = await apiHandler("/streak/current", {
    method: "GET",
  });
  return response;
};

export const fetchUserPoints = async () => {
  const response = await apiHandler("/user/points", {
    method: "GET",
  });
  return response;
};

// Social tasks (points modal)
export interface SocialTaskItem {
  _id: string;
  title: string;
  description?: string;
  points: number;
  platform?: string;
  actionUrl?: string;
  order?: number;
}

export const fetchActiveSocialTasks = async (): Promise<SocialTaskItem[]> => {
  const res = await apiHandler<{ data?: SocialTaskItem[]; success?: boolean; message?: string }>(
    "/social-tasks",
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
};

export const completeSocialTask = async (taskId: string) => {
  const res = await apiHandler<{ data?: { pointsAwarded: number }; success?: boolean; message?: string }>(
    `/social-tasks/${taskId}/complete`,
    { method: "POST" },
  );
  return res;
};

export const fetchMySocialTaskCompletions = async (): Promise<{ socialTaskId: string; completedAt: string }[]> => {
  const res = await apiHandler<{ data?: { socialTaskId: string; completedAt: string }[] }>(
    "/social-tasks/my-completions",
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res?.data ?? [];
}

export const fetchUserBets = async (page = 1, game = "all", outcome?: "win" | "loss", limit = 12) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (game && game !== "all") params.set("game", game);
  if (outcome) params.set("outcome", outcome);
  const response = await apiHandler(`/user/my-bets?${params.toString()}`, {
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

export const fetchReferralHistory = async () => {
  const response = await apiHandler<{
    success?: boolean;
    referrals?: Array<{
      username: string;
      date: string;
      totalBets: number;
      totalEarnings: number;
    }>;
  }>("/referral/history", { method: "GET" });
  return response;
};

export const getReferralLink = async () => {
  const response = await apiHandler<{ success: boolean; referralCode: string; referralUrl: string }>(
    "/user/referral-link",
    { method: "GET" },
  );
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

export type BannerPlacement = "home" | "game" | "lottery";

export interface BannerRecord {
  _id: string;
  imageUrl: string;
  type: BannerPlacement;
  size: "desktop" | "mobile";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const fetchBanners = async (type: BannerPlacement) => {
  const response = await apiHandler(`/banner/public?type=${type}`, {
    method: "GET",
  });
  return (response?.data ?? response ?? []) as BannerRecord[];
};

export const fetchMarkets = async () => {
  const data = await apiHandler<any>("/meta-market", {
    method: "GET",
  });

  // Normalize: if API returns array, wrap in { markets: [] }
  return Array.isArray(data) ? { success: true, markets: data } : data;
};

/** Fetch all meta market categories (public). */
export const fetchMetaMarketCategories = async (): Promise<MetaMarketCategory[]> => {
  const res = await apiHandler<{ data?: MetaMarketCategory[]; message?: MetaMarketCategory[] }>(
    "/meta-market/categories",
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res?.data ?? res?.message ?? [];
};

/** Create a meta market category (admin). */
export const createMetaMarketCategory = async (payload: {
  name: string;
  slug?: string;
  order?: number;
}): Promise<MetaMarketCategory> => {
  const res = await apiHandler<{ data: MetaMarketCategory }>("/meta-market/categories", {
    method: "POST",
    data: payload,
  });
  return (res as any)?.data ?? res;
};

/** Update a meta market category (admin). */
export const updateMetaMarketCategory = async (
  categoryId: string,
  payload: { name?: string; slug?: string; order?: number },
): Promise<MetaMarketCategory> => {
  const res = await apiHandler<{ data: MetaMarketCategory }>(`/meta-market/categories/${categoryId}`, {
    method: "PATCH",
    data: payload,
  });
  return (res as any)?.data ?? res;
};

/** Delete a meta market category (admin). */
export const deleteMetaMarketCategory = async (categoryId: string): Promise<void> => {
  await apiHandler(`/meta-market/categories/${categoryId}`, { method: "DELETE" });
};

/** Create a meta market (admin). Pass categories as array of category IDs. */
export const createMetaMarket = async (formData: {
  question: string;
  summary: string;
  image: File;
  b?: number;
  feePercent?: number;
  categories?: string[];
}): Promise<{ market: Market }> => {
  const body = new FormData();
  body.append("question", formData.question);
  body.append("summary", formData.summary);
  body.append("image", formData.image);
  if (formData.b != null) body.append("b", String(formData.b));
  if (formData.feePercent != null) body.append("feePercent", String(formData.feePercent));
  if (formData.categories?.length) {
    body.append("categories", JSON.stringify(formData.categories));
  }
  const res = await apiHandler<{ market: Market }>("/meta-market/create", {
    method: "POST",
    data: body,
  });
  return res as { market: Market };
};

export const fetchMarketById = async (
  id: string,
): Promise<{ market: Market; commentCount?: number }> => {
  const data = await apiHandler<{ market: Market; commentCount?: number }>(`/meta-market/${id}`, {
    method: "GET",
  });

  if (!data.market) {
    throw new Error("Market data not found in response");
  }
  return { market: data.market, commentCount: data.commentCount };
};

// Place a market bet
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

export const requestNonce = async (walletAddress: string, refCode?: string | null, walletType?: "evm" | "solana") => {
  const url = refCode ? `/auth/nonce?ref=${encodeURIComponent(refCode)}` : "/auth/nonce";
  return await apiHandler(url, {
    method: "POST",
    data: { walletAddress, ...(walletType && { walletType }) },
  });
};

export const verifySignature = async (walletAddress: string, signature: string, walletType?: "evm" | "solana") => {
  return await apiHandler("/auth/verify", {
    method: "POST",
    data: { walletAddress, signature, ...(walletType && { walletType }) },
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

export const fetchTopWinningLotteries = async (limit: number = 5) => {
  const response = await apiHandler(`/lottery/winners?limit=${limit}`, {
    method: "GET",
  });
  return response;
};

export const fetchRecentLotteryWinners = async (limit: number = 10) => {
  const response = await apiHandler(`/lottery/stats/recent-winners?limit=${limit}`, {
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

export const fetchLotteryById = async (roundId: string) => {
  const response = await apiHandler(`/lottery/rounds/${roundId}`, {
    method: "GET",
  });
  // Backend returns { data: lottery, success: true, message: "..." }
  // Return the data directly or the response if data doesn't exist
  return response.data || response;
};

export const fetchMyLotteryBet = async (
  roundId: string,
): Promise<{ pickedNumbers: number[] } | null> => {
  try {
    const response = await apiHandler<{ data?: { pickedNumbers?: number[] } | null }>(
      `/lottery/${roundId}/my-bet`,
      { method: "GET" },
    );
    const bet = response?.data ?? null;
    if (!bet || !Array.isArray(bet.pickedNumbers)) return null;
    return { pickedNumbers: bet.pickedNumbers };
  } catch {
    return null;
  }
};

export const placeLotteryBet = async (
  roundId: string,
  betData: {
    pickedNumbers: number[];
  },
) => {
  const requestData = {
    roundId: roundId,
    pickedNumbers: betData.pickedNumbers,
  };

  console.log("Actual request data being sent:", requestData);

  try {
    const response = await apiHandler(`/lottery/bet`, {
      method: "POST",
      data: requestData,
    });
    return response;
  } catch (error: any) {
    const data = error?.response?.data;
    const errorMessage =
      (data && (data.message ?? data.error)) || error?.message || "Failed to place bet. Please try again.";
    throw new Error(errorMessage);
  }
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

export const createUserWithdrawal = async (
  amount: number,
  walletAddress: string,
  chain: "ETH" | "BSC" | "SOL",
  passcode: string | null,
) => {
  const requestData = {
    amount: amount,
    walletAddress: walletAddress,
    chain: chain,
    passcode,
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

export const setupProfile = async (payload: { username: string; referralCode: string }) => {
  const response = await apiHandler(`/user/setup-profile`, {
    method: "PATCH",
    data: payload,
  });

  return response;
};

export const redeemPoints = async (points: number) => {
  const response = await apiHandler(`/user/convert-points`, {
    method: "POST",
    data: { points },
  });
  return response;
};

export const fetchRedemptionHistory = async () => {
  const response = await apiHandler(`/user/transactions?type=Conversion`, {
    method: "GET",
  });
  return response;
};

export const setUserPasscode = async (passcode: number) => {
  const response = await apiHandler(`/user/set-passcode`, {
    method: "POST",
    data: { passcode },
  });
  return response;
};

export const getMarketsByIds = async (ids: string[]) => {
  const response = await apiHandler(`/meta-market/markets/ids`, {
    method: "POST",
    data: { ids },
  });
  return response;
};

export const getUserPortfolios = async () => {
  const response = await apiHandler(`/meta-market/user/portfolios`, {
    method: "GET",
  });
  return response;
};

export const getPortfolioDetails = async (portfolioId: string) => {
  const response = await apiHandler(`/meta-market/user/portfolio/${portfolioId}`, {
    method: "GET",
  });
  return response;
};

export interface CoinflipHistoryResponseItem {
  id: string;
  game: string;
  createdAt: string;
  betAmount: number;
  multiplier: number;
  payout: number;
}

export interface CoinflipHistoryResponse {
  items: CoinflipHistoryResponseItem[];
  total: number;
  page: number;
  pages: number;
}

export async function getCoinflipHistory(page = 1, limit = 20) {
  const res = await apiHandler("/coinflip/bet/history", { method: "GET", params: { page, limit } });
  return res;
}

export async function getUserSeeds() {
  const res = await apiHandler("/fairness/seeds", { method: "GET" });
  return res as {
    clientSeed: string;
    serverSeedHash: string;
    nextServerSeedHash?: string;
    nonce: number;
  };
}

export async function verifyFairness(body: any) {
  const res = await apiHandler("/fairness/verify", { method: "POST", data: body });
  return res;
}

export async function getNotifications(): Promise<INotification[]> {
  const res = await apiHandler(`/notifications`, { method: "GET" });
  return res;
}

export async function markNotificationRead(id: string): Promise<INotification> {
  const res = await apiHandler(`/notifications/${id}/read`, { method: "PATCH" });
  return res;
}

// Ticket API functions
export interface Ticket {
  _id: string;
  user: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "responded" | "closed" | "unread";
  responses: Array<{
    sender: "user" | "admin";
    message: string;
    date: Date | string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  subject: string;
  message: string;
  email: string;
}

export async function getUserTickets(): Promise<Ticket[]> {
  const res = await apiHandler<Ticket[]>(`/ticket`, { method: "GET" });
  return res;
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const res = await apiHandler<Ticket>(`/ticket`, {
    method: "POST",
    data: payload,
  });
  return res;
}

export interface UpdateProfilePayload {
  username?: string;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const res = await apiHandler(`/user/profile`, {
    method: "PATCH",
    data: payload,
  });
  return res;
}

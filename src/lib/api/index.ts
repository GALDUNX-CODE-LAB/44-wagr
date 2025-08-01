import { CrashBetPayload } from "../../interfaces/interface";
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
  const response = await apiHandler("/crash/bet", { method: "POST", data: payload });
  return response;
};

export const addMetaMarketComment = async (marketId: string, comment: string) => {
  const response = await apiHandler(`/meta-market/${marketId}/comment`, { 
    method: "POST", 
    data: { comment } 
    
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
  const response = await apiHandler('/streak/claim', {
    method: "POST",
  });
  return response;
};

export const fetchUserPoints = async () => {
  const response = await apiHandler('/user/points', {
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
  })
  return response
}

export const fetchCommentLikes = async (commentId: string) => {
  const response = await apiHandler(`/meta-market/comment/${commentId}/likes`, {
    method: "GET",
  })
  return response
} 

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


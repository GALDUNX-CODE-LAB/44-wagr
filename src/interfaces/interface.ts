import { number } from "framer-motion";

export interface Comment {
  name: string;
  avatar: string;
  text: string;
}

export interface TrendPoint {
  time: string;
  yes: number;
  no: number;
}

export interface Market {
  id: number;
  question: string;
  volume: string;
  change: string;
  positive: boolean;
  comments: Comment[];
  trend: TrendPoint[];
}

export interface WalletCoin {
  name: string;
  symbol: string;
  icon: string;
}

export interface CoinflipBetPayload {
  betAmount: number;
  choice: "Heads" | "Tails" | "heads" | "tails";
}

export interface CoinflipBetResponse {
  data: {
    user: string;
    betAmount: number;
    choice: string;
    result: "Heads" | "Tails" | "heads" | "tails";
    isWin: boolean;
    multiplier: number;
    payout: number;
    clientSeed: string;
    nonce: number;
    serverSeedHash: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  success: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    walletAddress: string;
    balance: number;
  };
}

export interface Market {
  _id: string;
  question: string;
  b: number;
  qYes: number;
  qNo: number;
  feePercent: number;
  isResolved: boolean;
  result?: "YES" | "NO";
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;

  plays?: Array<{
    user: string;
    time: string;
    choice: "Yes" | "No";
  }>;
}

export interface MarketsResponse {
  success: boolean;
  markets: Market[];
}

export interface MarketResponse {
  success: boolean;
  market: Market;
}

export enum GameType {
  Coinflip = "Coinflip",
  Dice = "Dice",
  Crash = "Crash",
  Wheels = "Wheels",
}

export interface CrashBetPayload {
  stake: number;
  autoCashout: number;
}

export interface CoinflipBetHistory {
  _id: string;
  user: string;
  game: "coinflip";
  amount: number;
  selectedSide: "heads" | "tails";
  result: {
    win: boolean;
    payout: number;
    rolledSide: "heads" | "tails";
  };
  createdAt: string;
  updatedAt: string;
}

export type Chain = "eth" | "sol";
export interface WalletRecord {
  address: string;
  chain: Chain;
  createdAt: string;
  privateKey: string;
  updatedAt: string;
  userId: string;
}

export interface Comment {
  _id: string;
  market: string;
  user: {
    _id: string;
    username?: string;
    avatar?: string;
  };
  comment: string;
  createdAt: string;
  likes?: number;
}

// types/lottery.ts
export interface LotteryCard {
  id: number;
  amount: string;
  exclusive: string;
  image: string;
}

export interface Winner {
  username: string;
  price: string;
  avatar: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

export interface LotteryItem {
  rank: number;
  name: string;
  image: string;
  price: string;
  nextDraw: string;
}

export interface LotteryNumbersResponse {
  roundId: string;
  availableNumbers: number[];
  totalAvailable: number;
}

export interface LotteryBetResponse {
  data: {
    userId: string;
    roundId: string;
    pickedNumbers: number[];
    amount: number;
    isWinner: boolean;
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  success: boolean;
  message: string;
}

export interface Lottery {
  _id: string;
  name: string;
  imgUrl: string;
  ticketPrice: number;
  totalBets: number;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  winningNumbers?: number[];
  pickCount?: number;
}
export interface BetData {
  pickedNumbers: number[];
  amount: number;
}
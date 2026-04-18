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
  summary?: string;
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

export interface MetaMarketCategory {
  _id: string;
  name: string;
  slug: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Market {
  _id: string;
  question: string;
  summary?: string;
  image?: string;
  b: number;
  qYes: number;
  qNo: number;
  feePercent: number;
  isResolved: boolean;
  result?: "YES" | "NO";
  commentCount: number;
  categories?: MetaMarketCategory[];
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

export interface LotteryWinner {
  user:
    | string
    | {
        _id: string;
        username?: string;
        imageUrl?: string;
      };
  amountWon: number;
  rank?: number;
  correctCount?: number;
  percentage?: number;
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
  isEnded?: boolean;
  winningNumbers?: number[];
  pickCount?: number;
  prizePool?: number;
  winners?: LotteryWinner[];
}
export interface BetData {
  pickedNumbers: number[];
  amount: number;
}

export interface MarketPrice {
  yesPrice: number;
  noPrice: number;
}

export interface UserPortfolio {
  user: string;
  market: string;
  yesShares: number;
  noShares: number;
  avgYesPrice: number;
  avgNoPrice: number;
}

export interface ExecuteMarketPayload {
  marketId: string;
  side: "YES" | "NO";
  shares: number;
  action: "BUY" | "SELL";
}

export interface VerifyRequestBase {
  game: FairnessGame;
  clientSeed: string;
  serverSeed: string;
  nonce: number;
}
export type FairnessGame = "coinflip" | "dice" | "crash" | "wheels";

export interface INotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type Difficulty = "low" | "medium" | "high";

export type GameMode = "manual" | "auto";

export interface PlinkoConfig {
  rows: number;
  difficulty: Difficulty;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  trail: { x: number; y: number }[];
  color: string;
  landed: boolean;
  bucketIndex?: number;
  _onLand?: (bucketIndex: number, multiplier: number) => void;
  _difficulty?: Difficulty;
}

export interface Peg {
  x: number;
  y: number;
  radius: number;
  lit: boolean;
  litTimer: number;
}

export interface Bucket {
  x: number;
  width: number;
  multiplier: number;
  color: string;
}

export interface BetResult {
  id: string;
  bucketIndex: number;
  multiplier: number;
  betAmount: number;
  payout: number;
  timestamp: number;
}

// Multiplier tables per difficulty and row count
export const MULTIPLIERS: Record<Difficulty, Record<number, number[]>> = {
  low: {
    8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
    10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
    12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    13: [8.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 8.1],
    14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
    16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
  },
  medium: {
    8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    9: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
    10: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    11: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
    12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    13: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
    14: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    15: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
    16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
  },
  high: {
    8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    9: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
    10: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
    11: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
    12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
    13: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
    14: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
    15: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
    16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

export const DIFFICULTY_BIAS: Record<Difficulty, number> = {
  low: 0.05,
  medium: 0.12,
  high: 0.22,
};

export const ROW_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export type CellState = "hidden" | "gem" | "mine" | "revealed-gem";

export type MineCount =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;

export interface Cell {
  index: number;
  state: CellState;
  isMine: boolean;
  isRevealed: boolean;
  animating: boolean;
}

export interface MinesGameState {
  phase: "idle" | "playing" | "won" | "lost";
  cells: Cell[];
  mineCount: MineCount;
  gemsFound: number;
  totalSafe: number; // 25 - mineCount
  currentMultiplier: number;
  betAmount: number;
  profit: number;
}

// Calculate multiplier based on gems found and mines count
// Uses the same formula as Stake: expected value based on combinatorics
export function calcMultiplier(minesCount: number, gemsFound: number): number {
  if (gemsFound === 0) return 1;
  const totalCells = 25;
  const safeCells = totalCells - minesCount;

  let mult = 1;
  for (let i = 0; i < gemsFound; i++) {
    mult *= (totalCells - i) / (safeCells - i);
  }
  // Apply house edge (~1%)
  mult = mult * 0.99;
  return Math.round(mult * 100) / 100;
}

export const MINE_OPTIONS: MineCount[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
];

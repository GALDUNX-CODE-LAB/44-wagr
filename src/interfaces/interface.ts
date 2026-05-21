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
  Plinko = "Plinko",
  Coinflip = "Coinflip",
  Dice = "Dice",
  Crash = "Crash",
  Wheels = "Wheels",
  Mines = "Mines",
  Pump = "Pump",
  RedLight = "RedLight",
  RPS = "RPS",
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
export type FairnessGame = "coinflip" | "dice" | "crash" | "wheels" | "plinko" | "mines" | "pump" | "redlight" | "rps";

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
  _targetBucketIndex?: number;
  _path?: boolean[];
  _lastRow?: number;
}

export interface Peg {
  x: number;
  y: number;
  radius: number;
  lit: boolean;
  litTimer: number;
  row: number;
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

export type PumpDifficulty = "easy" | "medium" | "hard" | "extreme";

export interface PumpGameState {
  phase: "idle" | "playing" | "busted" | "cashedout";
  currentStep: number;
  currentMultiplier: number;
  betAmount: number;
  profit: number;
  bustedAtStep: number | null;
}

export interface BetResult {
  id: string;
  multiplier: number;
  payout: number;
  betAmount: number;
  won: boolean;
}

export const MULTIPLIER_LADDERS: Record<PumpDifficulty, number[]> = {
  easy: [
    1.0, 1.1, 1.22, 1.35, 1.5, 1.68, 1.88, 2.12, 2.4, 2.73, 3.12, 3.58, 4.14, 4.82, 5.65, 6.68, 7.96, 9.59, 11.65,
    14.28, 17.65, 22.05, 27.8, 35.4, 45.6,
  ],

  medium: [
    1.0, 1.23, 1.55, 1.98, 2.56, 3.36, 4.48, 6.04, 8.24, 11.35, 15.8, 22.2, 31.5, 45.2, 65.5, 96.0, 142.0, 212.0, 320.0,
    488.0, 750.0, 1160.0, 1810.0, 2850.0, 4500.0,
  ],

  hard: [
    1.0, 1.5, 2.3, 3.6, 5.6, 8.8, 14.0, 22.5, 36.5, 59.5, 97.5, 161.0, 267.0, 446.0, 750.0, 1270.0, 2160.0, 3700.0,
    6380.0, 11000.0, 19200.0, 33700.0, 59500.0, 106000.0, 190000.0,
  ],

  extreme: [
    1.0, 2.0, 4.1, 8.4, 17.5, 36.5, 76.5, 161.0, 341.0, 726.0, 1550.0, 3320.0, 7140.0, 15400.0, 33300.0, 72200.0,
    157000.0, 342000.0, 747000.0, 1630000.0, 3570000.0, 7820000.0, 17200000.0, 37800000.0, 83300000.0,
  ],
};

export interface PumpBetResult {
  id: string;
  multiplier: number;
  payout: number;
  betAmount: number;
  won: boolean;
}

export const BUST_PROBABILITY: Record<PumpDifficulty, number[]> = {
  easy: Array(25)
    .fill(0)
    .map((_, i) => 0.04 + i * 0.008),
  medium: Array(25)
    .fill(0)
    .map((_, i) => 0.08 + i * 0.016),
  hard: Array(25)
    .fill(0)
    .map((_, i) => 0.14 + i * 0.025),
  extreme: Array(25)
    .fill(0)
    .map((_, i) => 0.22 + i * 0.032),
};

export const DIFFICULTY_OPTIONS: { value: PumpDifficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "#22c55e" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "hard", label: "Hard", color: "#ef4444" },
  { value: "extreme", label: "Extreme", color: "#a855f7" },
];

export const DIFFICULTY_COLORS: Record<PumpDifficulty, { body: string; shine: string; neck: string; glow: string }> = {
  easy: { body: "#22c55e", shine: "#86efac", neck: "#15803d", glow: "rgba(34,197,94,0.4)" },
  medium: { body: "#f59e0b", shine: "#fcd34d", neck: "#b45309", glow: "rgba(245,158,11,0.4)" },
  hard: { body: "#ef4444", shine: "#fca5a5", neck: "#b91c1c", glow: "rgba(239,68,68,0.4)" },
  extreme: { body: "#a855f7", shine: "#d8b4fe", neck: "#7e22ce", glow: "rgba(168,85,247,0.4)" },
};

export type RedlightDifficulty = "easy" | "medium" | "hard" | "professional";

export interface RLGLGameState {
  phase: "idle" | "green" | "red" | "frozen" | "frozen-red" | "eliminated" | "cashedout";
  progress: number; // 0–100
  currentMultiplier: number;
  betAmount: number;
  profit: number;
  elapsedMs: number;
  redLightAt: number | null; // ms timestamp when red light fires
  frozenAt: number | null; // ms when player froze
  round: number;
}

export interface RedlightBetResult {
  id: string;
  multiplier: number;
  payout: number;
  betAmount: number;
  won: boolean;
  round: number;
}

// How fast progress moves per second (% per second)
export const PROGRESS_SPEED: Record<RedlightDifficulty, number> = {
  easy: 8,
  medium: 13,
  hard: 18,
  professional: 24,
};

// Multiplier increment every 2 seconds
export const MULT_INCREMENT: Record<RedlightDifficulty, number> = {
  easy: 0.07,
  medium: 0.13,
  hard: 0.22,
  professional: 0.38,
};

// Starting multiplier
export const BASE_MULT = 1.0;

// Red light fires randomly between these ms windows (after green starts)
// Shorter window = harder (less time to react)
export const RED_LIGHT_WINDOW: Record<RedlightDifficulty, [number, number]> = {
  easy: [1200, 5000],
  medium: [700, 3200],
  hard: [400, 2200],
  professional: [200, 1400],
};

// Player has this many ms to freeze after red light fires
export const FREEZE_GRACE_MS: Record<RedlightDifficulty, number> = {
  easy: 700,
  medium: 500,
  hard: 350,
  professional: 200,
};

// Total game duration — player must cashout or finish before this expires
export const GAME_DURATION_MS: Record<RedlightDifficulty, number> = {
  easy: 120000,
  medium: 90000,
  hard: 60000,
  professional: 40000,
};

export const REDLIGHT_DIFFICULTY_OPTIONS: { value: RedlightDifficulty; label: string; color: string; tag: string }[] = [
  { value: "easy", label: "Easy", color: "#22c55e", tag: "chill" },
  { value: "medium", label: "Medium", color: "#f59e0b", tag: "risky" },
  { value: "hard", label: "Hard", color: "#ef4444", tag: "dangerous" },
  { value: "professional", label: "Professional", color: "#a855f7", tag: "insane" },
];

export const REDLIGHT_DIFFICULTY_COLORS: Record<RedlightDifficulty, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
  professional: "#a855f7",
};

export type RPSGameMode = "manual" | "auto";
export type RPSChoice = "rock" | "paper" | "scissors";
export type RoundResult = "win" | "lose" | "draw";

export interface RPSRound {
  roundIndex: number; // 0-based, how many wins achieved
  playerChoice: RPSChoice | null;
  houseChoice: RPSChoice | null;
  result: RoundResult | null;
}

export interface RPSGameState {
  phase: "idle" | "playing" | "won" | "lost" | "draw";
  currentRound: number; // 0 = not started, 1–5 = active round
  maxRounds: number; // fixed at 5
  rounds: RPSRound[];
  currentMultiplier: number;
  betAmount: number;
  profit: number;
  animating: boolean;
}

export interface RPSBetResult {
  id: string;
  roundsWon: number;
  multiplier: number;
  payout: number;
  betAmount: number;
  won: boolean;
}

// Multipliers for each level (winning N rounds)
// Round 1 win → 1.00x (just moved to level 1)
// Each win roughly doubles: 1x → 1.96x → 3.92x → 7.84x → 15.68x
export const ROUND_MULTIPLIERS = [1.0, 1.96, 3.92, 7.84, 15.68];

// House choice is random BUT with difficulty bias (chance house picks winning move)
// 0 = pure random (33% each), higher = more likely house wins
export type RPSDifficulty = "easy" | "medium" | "hard";

export const HOUSE_WIN_BIAS: Record<RPSDifficulty, number> = {
  easy: 0.28, // house wins 28% of non-draw games
  medium: 0.38,
  hard: 0.5,
};

export const BEATS: Record<RPSChoice, RPSChoice> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export const LOSES_TO: Record<RPSChoice, RPSChoice> = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock",
};

export function getResult(player: RPSChoice, house: RPSChoice): RoundResult {
  if (player === house) return "draw";
  if (BEATS[player] === house) return "win";
  return "lose";
}

export function generateHouseChoice(playerChoice: RPSChoice, difficulty: RPSDifficulty): RPSChoice {
  const r = Math.random();
  const winBias = HOUSE_WIN_BIAS[difficulty];

  // Bias: house picks winning move with winBias probability,
  // losing move with (1 - winBias) * 0.5, draw with (1 - winBias) * 0.5
  if (r < winBias) {
    // House wins
    return LOSES_TO[playerChoice];
  } else if (r < winBias + (1 - winBias) * 0.5) {
    // Draw
    return playerChoice;
  } else {
    // Player wins
    return BEATS[playerChoice];
  }
}

export const CHOICE_LABELS: Record<RPSChoice, string> = {
  rock: "Rock",
  paper: "Paper",
  scissors: "Scissors",
};

export const RPS_DIFFICULTY_OPTIONS: { value: RPSDifficulty; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "#22c55e" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "hard", label: "Hard", color: "#ef4444" },
];

export type GlassDifficulty = "easy" | "medium" | "hard";
export type TileState = "hidden" | "safe" | "broken" | "active" | "skipped";

export interface Tile {
  id: string; // e.g. "row-0-tile-1"
  rowIndex: number;
  tileIndex: number;
  isSafe: boolean;
  state: TileState;
}

export interface BridgeRow {
  rowIndex: number;
  tiles: Tile[];
  safeIndex: number; // which tile is safe (0-based)
  revealed: boolean;
}

export interface GlassGameState {
  phase: "idle" | "playing" | "won" | "lost";
  rows: BridgeRow[];
  currentRow: number; // 0-based, which row player is choosing
  currentMultiplier: number;
  betAmount: number;
  profit: number;
  totalRows: number;
}

export interface GlassBetResult {
  id: string;
  rowsCleared: number;
  multiplier: number;
  payout: number;
  betAmount: number;
  won: boolean;
}

// Tiles per row per difficulty
export const TILES_PER_ROW: Record<GlassDifficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

export const TOTAL_ROWS = 6;

// Multiplier at each step (cumulative — what you get if you cash out here)
// Step 0 = first jump, step 5 = sixth jump (full clear)
export const STEP_MULTIPLIERS: Record<GlassDifficulty, number[]> = {
  easy: [1.1, 1.22, 1.35, 1.5, 1.68, 1.9],
  medium: [1.2, 1.44, 1.73, 2.1, 2.55, 3.15],
  hard: [1.4, 1.96, 2.74, 3.84, 5.38, 7.55],
};

export const GLASS_DIFFICULTY_OPTIONS: { value: GlassDifficulty; label: string; color: string; tag: string }[] = [
  { value: "easy", label: "Easy", color: "#22c55e", tag: "2 tiles · low risk" },
  { value: "medium", label: "Medium", color: "#f59e0b", tag: "3 tiles · med risk" },
  { value: "hard", label: "Hard", color: "#ef4444", tag: "4 tiles · high risk" },
];

export const GLASS_DIFFICULTY_COLORS: Record<GlassDifficulty, string> = {
  easy: "#22c55e",
  medium: "#f59e0b",
  hard: "#ef4444",
};

// Win probability per jump
export const WIN_PROB: Record<GlassDifficulty, number> = {
  easy: 0.5, // 1 in 2
  medium: 0.333, // 1 in 3
  hard: 0.25, // 1 in 4
};

export function buildBridge(difficulty: GlassDifficulty): BridgeRow[] {
  const tilesPerRow = TILES_PER_ROW[difficulty];
  return Array.from({ length: TOTAL_ROWS }, (_, rowIdx) => {
    const safeIndex = Math.floor(Math.random() * tilesPerRow);
    return {
      rowIndex: rowIdx,
      safeIndex,
      revealed: false,
      tiles: Array.from({ length: tilesPerRow }, (__, tileIdx) => ({
        id: `row-${rowIdx}-tile-${tileIdx}`,
        rowIndex: rowIdx,
        tileIndex: tileIdx,
        isSafe: tileIdx === safeIndex,
        state: "hidden" as TileState,
      })),
    };
  });
}

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
  name: string
  symbol: string
  icon: string
}

export interface CoinflipBetPayload {
  betAmount: number;
  choice: 'Heads' | 'Tails' | 'heads' | 'tails';
}

export interface CoinflipBetResponse {
  data: {
    user: string;
    betAmount: number;
    choice: string;
    result: 'Heads' | 'Tails' | 'heads' | 'tails';
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
  accessToken: string
  refreshToken?: string
  user: {
    walletAddress: string
    balance: number
  }
}


export interface Market {
  _id: string;
  question: string;
  b: number;
  qYes: number;
  qNo: number;
  feePercent: number;
  isResolved: boolean;
  result?: 'YES' | 'NO';
  createdAt: string;
  updatedAt: string;
  __v: number;

    plays?: Array<{
    user: string;
    time: string;
    choice: 'Yes' | 'No';
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
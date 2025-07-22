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

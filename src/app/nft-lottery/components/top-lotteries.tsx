"use client"

import Image from "next/image"
import { LotteryItem } from "../../../interfaces/interface"

interface TopWinningLotteriesProps {
  lotteries?: LotteryItem[];
  onBetNow?: (rank: number) => void;
}

const defaultLotteries: LotteryItem[] = [
  { rank: 1, name: "Premium NFT #1", image: "/assets/nft4.png", price: "$500,000", nextDraw: "00h-00m-00s" },
  { rank: 2, name: "Premium NFT #2", image: "/assets/nft4.png", price: "$500,000", nextDraw: "00h-00m-00s" },
  { rank: 3, name: "Premium NFT #3", image: "/assets/nft4.png", price: "$500,000", nextDraw: "00h-00m-00s" },
  { rank: 4, name: "Premium NFT #4", image: "/assets/nft4.png", price: "$500,000", nextDraw: "00h-00m-00s" },
  { rank: 5, name: "Premium NFT #5", image: "/assets/nft4.png", price: "$500,000", nextDraw: "00h-00m-00s" },
]

export default function TopWinningLotteries({ 
  lotteries = defaultLotteries,
  onBetNow 
}: TopWinningLotteriesProps) {
  return (
    <div className="w-full max-w-[600px] max-h-[500px] bg-[#212121] border border-white/[0.1] rounded-[20px] p-6 mx-auto flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Top Winning Lotteries</h2>
      </div>

      <div className="space-y-4 flex-grow overflow-y-auto">
        {lotteries.map((lottery) => (
          <div
            key={lottery.rank}
            className="flex items-center justify-between py-4 rounded-lg"
          >
            {/* Left: Rank */}
            <span className="text-3xl md:text-[45px] font-bold text-white w-10 md:w-12 text-left">
              {lottery.rank}
            </span>

            {/* Middle: Image + Info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-6 h-6 rounded-full mt-1 overflow-hidden flex-shrink-0">
                <Image
                  src={lottery.image}
                  width={24}
                  height={24}
                  className="object-cover"
                  alt={lottery.name}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{lottery.name}</p>
                {/* Mobile next draw */}
                <p className="text-[10px] md:hidden text-white/65 whitespace-nowrap">
                  Next Draw: {lottery.nextDraw}
                </p>
                <p className="font-bold text-base md:text-lg text-white mt-1">
                  {lottery.price}
                </p>
              </div>
            </div>

            {/* Right: Next Draw + Button */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
              <p className="text-xs hidden md:block text-white whitespace-nowrap">
                Next Draw: {lottery.nextDraw}
              </p>
              <button 
                onClick={() => onBetNow?.(lottery.rank)}
                className="px-3 py-1.5 text-sm font-medium bg-[#C8A2FF] text-black rounded-[8px] hover:bg-[#B891FF] transition-colors"
              >
                Bet Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
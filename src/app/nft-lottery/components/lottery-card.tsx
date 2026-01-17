"use client";

import Image from "next/image";
import { Users } from "lucide-react";

interface LotteryCardProps {
  card: {
    _id: string;
    name: string;
    imgUrl: string;
    ticketPrice: number;
    totalBets: number;
    startTime: string;
    endTime: string;
    isCompleted: boolean;
  };
  onClick: (cardId: string) => void;
  onBetNow?: (cardId: string) => void;
}

export default function LotteryCard({
  card,
  onClick,
  onBetNow,
}: LotteryCardProps) {
  const handleBetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBetNow?.(card._id);
  };

  return (
    <div
      onClick={() => onClick(card._id)}
      className="cursor-pointer bg-[#212121] rounded-[20px] border border-white/6 p-4 flex flex-col gap-3 transition hover:border-[#C8A2FF]/30 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8A2FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-center justify-between">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10">
          <Image
            src={card.imgUrl || "/assets/user.png"}
            fill
            className="object-cover"
            alt={card.name}
            unoptimized
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/user.png";
            }}
          />
        </div>
        {!card.isCompleted && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">Live</span>
          </div>
        )}
      </div>

      <div className="relative flex-grow">
        <h2 className="text-sm lg:text-base font-medium text-white/90 line-clamp-2 mb-2">
          {card.name}
        </h2>
      </div>

      <div className="relative flex justify-between items-center text-xs lg:text-sm">
        <div className="flex flex-col">
          <span className="text-white/50 text-[10px]">Ticket Price</span>
          <span className="text-white font-semibold">${card.ticketPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/70">
          <Users className="w-4 h-4" />
          <span className="font-medium">{card.totalBets}</span>
        </div>
      </div>

      {!card.isCompleted && (
        <button
          onClick={handleBetClick}
          className="relative w-full h-10 bg-[#C8A2FF] text-black font-semibold rounded-xl hover:bg-[#B891FF] active:scale-[0.98] transition-all duration-200 mt-2"
        >
          Bet Now
        </button>
      )}
    </div>
  );
}

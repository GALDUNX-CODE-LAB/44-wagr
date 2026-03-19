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
      className="cursor-pointer bg-[#212121] rounded-xl border border-white/6 p-2.5 sm:p-3 flex flex-col gap-2 transition hover:border-[#C8A2FF]/30 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#C8A2FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative flex items-center justify-between gap-1">
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-white/10 shrink-0">
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
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full shrink-0">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">Live</span>
          </div>
        )}
      </div>
      <div className="relative flex-grow min-h-0">
        <h2 className="text-xs font-medium text-white/90 line-clamp-2 leading-tight">
          {card.name}
        </h2>
      </div>
      <div className="relative flex justify-between items-center text-[10px] sm:text-xs">
        <div className="flex flex-col min-w-0">
          <span className="text-white/50 text-[10px]">Ticket</span>
          <span className="text-white font-medium truncate">${card.ticketPrice.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-white/70 shrink-0">
          <Users className="w-3 h-3" />
          <span className="font-medium">{card.totalBets}</span>
        </div>
      </div>
      {!card.isCompleted && (
        <button
          onClick={handleBetClick}
          className="relative w-full h-7 sm:h-8 bg-[#C8A2FF] text-black text-xs font-medium rounded-lg hover:bg-[#B891FF] active:scale-[0.98] transition-all duration-200 mt-1"
        >
          Bet Now
        </button>
      )}
    </div>
  );
}

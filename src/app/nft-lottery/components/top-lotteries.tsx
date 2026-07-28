"use client"

import Image from "next/image"
import { Trophy, Medal } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchTopWinningLotteries } from "../../../lib/api"

interface TopWinner {
  payout: number;
  username: string;
  userImage: string;
}

export default function TopWinningLotteries() {
  const { data: winners = [], isLoading: loading, isError } = useQuery({
    queryKey: ["lottery", "top-winners", 5],
    queryFn: async () => {
      const response = await fetchTopWinningLotteries(5);
      return Array.isArray(response) ? response : [];
    },
    refetchOnWindowFocus: false,
  });

  const errorMessage = isError ? "Failed to load top winners" : null;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#c8a2ff] fill-[#c8a2ff]" />;
    if (rank === 2) return <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 fill-gray-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 fill-amber-600" />;
    return null;
  };

  const formatPayout = (payout: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(payout);
  };

  return (
    <div className="w-full bg-[#212121] border border-white/10 rounded-xl p-3 sm:p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#c8a2ff] fill-[#c8a2ff]" />
        <h2 className="text-xs sm:text-sm font-semibold text-white">Top Winners</h2>
      </div>
      <div className="space-y-2 flex-grow overflow-y-auto max-h-[320px] sm:max-h-[380px]">
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C8A2FF]" />
          </div>
        ) : errorMessage ? (
          <div className="text-center py-3 text-red-400 text-xs">{errorMessage}</div>
        ) : winners.length === 0 ? (
          <div className="text-center py-6 text-white/50 text-xs">No winners yet</div>
        ) : (
          winners.map((winner, index) => {
            const rank = index + 1;
            return (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1C1C1C]/50 rounded-lg border border-white/5 hover:border-[#C8A2FF]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                  {getRankIcon(rank) || (
                    <span className="text-xs font-semibold text-white/60">#{rank}</span>
                  )}
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0 group-hover:border-[#C8A2FF]/50 transition-colors">
                  <Image
                    src={winner.userImage || "/assets/user.png"}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                    alt={winner.username}
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/user.png";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{winner.username}</p>
                  <p className="text-[10px] text-white/50">#{rank}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-[#C8A2FF]">
                    {formatPayout(winner.payout)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}
"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentLotteryWinners } from "../../../lib/api";

interface LotteryWinner {
  username: string;
  payout: string;
  userImage: string;
}

export default function RecentWinners() {
  const { data: winners = [], isLoading: loading, isError } = useQuery({
    queryKey: ["lottery", "recent-winners", 10],
    queryFn: async () => {
      const response = await fetchRecentLotteryWinners(10);
      const winnersData = Array.isArray(response) ? response : [];
      return winnersData.map((winner: any) => ({
        username: winner.userId?.username || "Unknown User",
        payout: winner.payout ? `$${winner.payout.toLocaleString()}` : "$0",
        userImage: winner.userId?.imageUrl || "/assets/user.png",
      }));
    },
    refetchOnWindowFocus: false,
  });

  const error = isError ? "Failed to load recent winners" : null;

  return (
    <div className="w-full bg-[#212121] border border-white/10 rounded-xl p-3 sm:p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/15 border border-amber-400/25 flex items-center justify-center">
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" strokeWidth={2} />
        </div>
        <h2 className="text-xs sm:text-sm font-semibold text-white">Recent Winners</h2>
      </div>
      <div className="space-y-2 flex-grow overflow-y-auto max-h-[320px] sm:max-h-[380px]">
        {loading && (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C8A2FF]" />
          </div>
        )}
        {error && (
          <div className="text-center py-3 text-red-400 text-xs">{error}</div>
        )}
        {!loading &&
          !error &&
          winners.length > 0 &&
          winners.map((winner, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 sm:p-3 bg-[#1C1C1C]/50 rounded-lg border border-white/5 hover:border-[#C8A2FF]/30 transition-all group"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/10 group-hover:border-[#C8A2FF]/50 transition-colors flex-shrink-0">
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
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{winner.username}</p>
                  <p className="text-[10px] text-white/50">Winner</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-1.5 flex-shrink-0">
                <p className="text-xs font-semibold text-[#C8A2FF]">{winner.payout}</p>
                <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
                  <Trophy className="w-2.5 h-2.5 text-amber-400" strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        {!loading && !error && winners.length === 0 && (
          <div className="text-center py-6 text-white/50 text-xs">No recent winners</div>
        )}
      </div>
    </div>
  );
}

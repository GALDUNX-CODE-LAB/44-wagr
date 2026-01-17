"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bitcoin } from "lucide-react";
import { fetchRecentLotteryWinners } from "../../../lib/api";

interface LotteryWinner {
  username: string;
  payout: string;
  userImage: string;
}

export default function RecentWinners() {
  const [winners, setWinners] = useState<LotteryWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWinners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchRecentLotteryWinners(10);
        const winnersData = Array.isArray(response) ? response : [];
        const formatted = winnersData.map((winner: any) => ({
          username: winner.userId?.username || "Unknown User",
          payout: winner.payout ? `$${winner.payout.toLocaleString()}` : "$0",
          userImage: winner.userId?.imageUrl || "/assets/user.png",
        }));
        setWinners(formatted);
      } catch (err) {
        console.error("Error fetching lottery winners:", err);
        setError("Failed to load recent winners");
        setWinners([]);
      } finally {
        setLoading(false);
      }
    };

    loadWinners();
  }, []);

  return (
    <div className="w-full bg-[#212121] border border-white/10 rounded-[20px] p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Bitcoin className="w-4 h-4 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Recent Winners</h2>
      </div>

      <div className="space-y-3 flex-grow overflow-y-auto max-h-[450px]">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A2FF]"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-4 text-red-400 text-sm">{error}</div>
        )}

        {/* Winners List */}
        {!loading &&
          !error &&
          winners.length > 0 &&
          winners.map((winner, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-[#1C1C1C]/50 rounded-xl border border-white/5 hover:border-[#C8A2FF]/30 transition-all group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#C8A2FF]/50 transition-colors flex-shrink-0">
                  <Image
                    src={winner.userImage || "/assets/user.png"}
                    width={40}
                    height={40}
                    className="object-cover"
                    alt={winner.username}
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/user.png";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{winner.username}</p>
                  <p className="text-xs text-white/50 mt-0.5">Winner</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-2 flex-shrink-0">
                <p className="font-bold text-base text-[#C8A2FF]">{winner.payout}</p>
                <div className="w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Bitcoin className="w-3 h-3 text-green-400" />
                </div>
              </div>
            </div>
          ))}

        {/* Empty State */}
        {!loading && !error && winners.length === 0 && (
          <div className="text-center py-8 text-white/50">
            No recent winners found
          </div>
        )}
      </div>
    </div>
  );
}

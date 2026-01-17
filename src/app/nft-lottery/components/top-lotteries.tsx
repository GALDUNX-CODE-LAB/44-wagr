"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Trophy, Medal } from "lucide-react"
import { fetchTopWinningLotteries } from "../../../lib/api"

interface TopWinner {
  payout: number;
  username: string;
  userImage: string;
}

export default function TopWinningLotteries() {
  const router = useRouter();
  const [winners, setWinners] = useState<TopWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopWinners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTopWinningLotteries(5);
        setWinners(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error("Error fetching top winners:", err);
        setError("Failed to load top winners");
        setWinners([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopWinners();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300 fill-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
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
    <div className="w-full bg-[#212121] border border-white/10 rounded-[20px] p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        <h2 className="text-xl font-bold text-white">Top Winners</h2>
      </div>

      <div className="space-y-3 flex-grow overflow-y-auto max-h-[450px]">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8A2FF]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-400 text-sm">{error}</div>
        ) : winners.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm">No winners yet</div>
        ) : (
          winners.map((winner, index) => {
            const rank = index + 1;
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-[#1C1C1C]/50 rounded-xl border border-white/5 hover:border-[#C8A2FF]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-center w-10 h-10 flex-shrink-0">
                  {getRankIcon(rank) || (
                    <span className="text-lg font-bold text-white/60">#{rank}</span>
                  )}
                </div>

                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0 group-hover:border-[#C8A2FF]/50 transition-colors">
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

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{winner.username}</p>
                  <p className="text-xs text-white/50 mt-0.5">Winner #{rank}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-base text-[#C8A2FF]">
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
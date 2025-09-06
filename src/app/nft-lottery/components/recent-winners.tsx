"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bitcoin } from "lucide-react";
import { fetchLotteryWinners } from "../../../lib/api";

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
        const response = await fetchLotteryWinners();
        setWinners(response);
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
    <div className="w-full max-w-[600px] max-h-[500px] bg-[#212121] border border-white/[0.1] rounded-[20px] p-6 mx-auto flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold">Recent Winners</h2>
      </div>

      <div className="bg-[#c8a2ff]/50 rounded-[5px] h-[40px] w-full mb-5" />

      <div className="space-y-4 flex-grow overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-medium text-white/65">Player</span>
          <span className="text-sm font-medium text-white/65">Price</span>
        </div>

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
              className="flex items-center justify-between p-2 bg-[#1C1C1C]/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={winner.userImage || "/assets/user.png"}
                    width={32}
                    height={32}
                    className="object-cover"
                    alt={winner.username}
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/user.png";
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium">{winner.username}</p>
                </div>
              </div>

              <div className="text-right flex gap-2">
                <p className="font-bold text-white">{winner.payout}</p>
                <div className="bg-yellow-400 rounded-full w-5 h-5 flex mt-0.5 items-center justify-center">
                  <Bitcoin className="w-3 h-3 text-white" />
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

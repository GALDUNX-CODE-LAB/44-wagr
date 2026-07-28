"use client";

import { Trophy, Medal, Award, Users, DollarSign } from "lucide-react";
import Image from "next/image";
import { Lottery, LotteryWinner } from "../../../interfaces/interface";

interface EndedLotteryDisplayProps {
  lottery: Lottery;
}

export default function EndedLotteryDisplay({ lottery }: EndedLotteryDisplayProps) {
  const top3Winners = lottery.winners
    ?.slice(0, 3)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0)) || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[#c8a2ff] fill-[#c8a2ff]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300 fill-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600 fill-amber-600" />;
    return <span className="text-lg font-bold text-white/60">#{rank}</span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getUserDisplay = (winner: LotteryWinner) => {
    if (typeof winner.user === 'string') {
      return { username: 'Unknown User', imageUrl: '/assets/user.png' };
    }
    return {
      username: winner.user.username || 'Unknown User',
      imageUrl: winner.user.imageUrl || '/assets/user.png',
    };
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-400">Lottery Ended</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {lottery.name}
        </h2>
        {lottery.winningNumbers && lottery.winningNumbers.length > 0 && (
          <div className="mt-4">
            <p className="text-white/60 mb-3 text-sm">Winning Numbers</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {lottery.winningNumbers.map((number) => (
                <div
                  key={number}
                  className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#C8A2FF] to-[#B891FF] text-black rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-lg"
                >
                  {number}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prize Pool Section */}
      <div className="bg-gradient-to-br from-[#212121] to-[#1C1C1C] border border-white/10 rounded-[20px] p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-[#C8A2FF]" />
          <h3 className="text-xl font-bold text-white">Prize Pool</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-white/70">Total Pool</span>
            <span className="text-2xl font-bold text-[#C8A2FF]">
              {formatCurrency(lottery.prizePool || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-white/70">Total Participants</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/50" />
              <span className="text-lg font-semibold text-white">
                {lottery.totalBets || 0}
              </span>
            </div>
          </div>
          {lottery.prizePool && lottery.ticketPrice && (
            <div className="flex justify-between items-center py-3">
              <span className="text-white/70">Average Ticket Price</span>
              <span className="text-lg font-semibold text-white">
                {formatCurrency(lottery.ticketPrice)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Winners Section */}
      {top3Winners.length > 0 && (
        <div className="bg-gradient-to-br from-[#212121] to-[#1C1C1C] border border-white/10 rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-[#c8a2ff] fill-[#c8a2ff]" />
            <h3 className="text-xl font-bold text-white">Top 3 Winners</h3>
          </div>
          <div className="space-y-4">
            {top3Winners.map((winner, index) => {
              const rank = winner.rank || index + 1;
              const userDisplay = getUserDisplay(winner);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    rank === 1
                      ? "bg-gradient-to-r from-[#c8a2ff]/10 to-[#c8a2ff]/5 border-[#c8a2ff]/30"
                      : rank === 2
                      ? "bg-gradient-to-r from-gray-400/10 to-gray-400/5 border-gray-400/30"
                      : rank === 3
                      ? "bg-gradient-to-r from-amber-600/10 to-amber-600/5 border-amber-600/30"
                      : "bg-[#1C1C1C]/50 border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>

                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                    <Image
                      src={userDisplay.imageUrl}
                      width={48}
                      height={48}
                      className="object-cover"
                      alt={userDisplay.username}
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/user.png";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{userDisplay.username}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {winner.correctCount !== undefined && (
                        <span className="text-xs text-white/50">
                          {winner.correctCount} correct
                        </span>
                      )}
                      {winner.percentage !== undefined && (
                        <span className="text-xs text-white/50">
                          {winner.percentage.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-[#C8A2FF]">
                      {formatCurrency(winner.amountWon)}
                    </p>
                    <p className="text-xs text-white/50 mt-1">Rank #{rank}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Winners Section (if more than 3) */}
      {lottery.winners && lottery.winners.length > 3 && (
        <div className="bg-[#212121] border border-white/10 rounded-[20px] p-6">
          <h3 className="text-lg font-bold text-white mb-4">All Winners</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {lottery.winners.slice(3).map((winner, index) => {
              const rank = winner.rank || index + 4;
              const userDisplay = getUserDisplay(winner);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[#1C1C1C]/50 rounded-lg border border-white/5"
                >
                  <span className="text-sm font-medium text-white/60 w-8">#{rank}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                    <Image
                      src={userDisplay.imageUrl}
                      width={32}
                      height={32}
                      className="object-cover"
                      alt={userDisplay.username}
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/user.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{userDisplay.username}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#C8A2FF]">
                    {formatCurrency(winner.amountWon)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Winners Message */}
      {(!lottery.winners || lottery.winners.length === 0) && (
        <div className="bg-[#212121] border border-white/10 rounded-[20px] p-8 text-center">
          <Trophy className="w-12 h-12 text-white/30 mx-auto mb-3" />
          <p className="text-white/60">No winners for this draw</p>
        </div>
      )}
    </div>
  );
}

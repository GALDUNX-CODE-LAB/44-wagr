"use client";

import { useState, useEffect } from "react";
import { Search, Dices, ArrowRightLeft, RefreshCcw, Star, TrendingUp, BarChart3 } from "lucide-react";
import {
  fetchCoinflipGameHistory,
  fetchDiceGameHistory,
  fetchWheelGameHistory,
  fetchCrashGameHistory,
  fetchMetaMarketGameHistory,
} from "../../lib/api";

const categories = ["All", "Dice", "Meta Market", "Flip", "Wheel", "Crash"];

const colorMap: Record<string, string> = {
  purple: "#C8A2FF",
  red: "#EF4444",
  green: "#22C55E",
  yellow: "#FACC15",
  gray: "#6B7280",
  lightgray: "#9CA3AF",
};

export default function BetHistoryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const mapBetToDisplay = (bet: any, gameType: string) => {
    switch (gameType) {
      case "dice":
        return {
          id: bet._id,
          type: "Dice",
          icon: <Dices className="w-4 h-4 text-white" />,
          amount: bet.betAmount,
          outcome: bet.isWin ? "win" : "lose",
          payout: bet.payout,
          createdAt: bet.createdAt,
          meta: {
            Multiplier: `${bet.multiplier}x`,
            "Bet Type": bet.betType === "over" ? `Over ${bet.target}` : `Under ${bet.target}`,
            Roll: bet.roll.toFixed(2),
          },
        };
      case "coinflip":
        return {
          id: bet._id,
          type: "Flip",
          icon: <ArrowRightLeft className="w-4 h-4 text-white" />,
          amount: bet.betAmount,
          outcome: bet.isWin ? "win" : "lose",
          payout: bet.payout,
          createdAt: bet.createdAt,
          meta: {
            Multiplier: `${bet.multiplier}x`,
            Result: bet.result,
            Choice: bet.choice,
          },
        };
      case "wheel":
        return {
          id: bet._id,
          type: "Wheel",
          icon: <RefreshCcw className="w-4 h-4 text-white" />,
          amount: bet.stake,
          outcome: bet.payout > 0 ? "win" : "lose",
          payout: bet.payout,
          createdAt: bet.createdAt,
          meta: {
            Multiplier: `${bet.multiplier}x`,
            Chosen: bet.chosenColor,
            Result: bet.resultColor,
          },
        };
      case "crash":
        return {
          id: bet._id,
          type: "Crash",
          icon: <TrendingUp className="w-4 h-4 text-white" />,
          amount: bet.stake,
          outcome: bet.isWin ? "win" : "lose",
          payout: bet.payout,
          profit: bet.profit,
          createdAt: bet.createdAt,
          meta: {
            "Auto Cashout": `${bet.autoCashout}x`,
            Profit: `${bet.profit >= 0 ? "+" : ""}${bet.profit} BTC`,
            Round: bet.round.slice(-8),
          },
        };
      case "metamarket":
        return {
          id: bet._id,
          type: "Meta Market",
          icon: <BarChart3 className="w-4 h-4 text-white" />,
          amount: bet.stake,
          outcome: bet.isWin ? "win" : "lose",
          payout: bet.payout,
          profit: bet.profit,
          createdAt: bet.createdAt,
          meta: {
            Side: bet.side,
            Shares: bet.shares.toFixed(2),
            "Avg Price": `$${bet.avgPrice.toFixed(3)}`,
          },
        };
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      try {
        const [diceResponse, coinflipResponse, wheelResponse, crashResponse, metaMarketResponse] = await Promise.all([
          fetchDiceGameHistory(),
          fetchCoinflipGameHistory(),
          fetchWheelGameHistory(),
          fetchCrashGameHistory(),
          fetchMetaMarketGameHistory(),
        ]);

        const formatted = [
          ...(diceResponse?.data || []).map((bet: any) => mapBetToDisplay(bet, "dice")),
          ...(coinflipResponse?.data || []).map((bet: any) => mapBetToDisplay(bet, "coinflip")),
          ...(wheelResponse?.data || []).map((bet: any) => mapBetToDisplay(bet, "wheel")),
          ...(crashResponse?.data || []).map((bet: any) => mapBetToDisplay(bet, "crash")),
          ...(metaMarketResponse?.data || []).map((bet: any) => mapBetToDisplay(bet, "metamarket")),
        ].filter(Boolean);

        formatted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        setBets(formatted);
      } catch (err) {
        console.error("Failed to fetch bet history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, []);

  const filteredBets = bets.filter((bet) => {
    const matchesCategory = activeCategory === "All" || bet.type === activeCategory;
    const matchesSearch =
      bet.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(bet.meta).join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 🔹 Pagination logic
  const totalPages = Math.ceil(filteredBets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBets = filteredBets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen">
      <h1 className="text-[30px] font-medium mb-1">Bet History</h1>
      <p className="text-base font-normal text-white/70 mb-6 max-w-xl">
        View your past bets across all games and platforms.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
        <input
          type="text"
          placeholder="Search bets"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 bg-[#212121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setCurrentPage(1); // reset pagination when switching
            }}
            className={`text-sm font-medium relative pb-1 transition-colors ${
              activeCategory === cat ? "text-[#C8A2FF]" : "text-white/70 hover:text-white"
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C8A2FF] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p className="text-white/70 mb-4">Loading bet history...</p>}

      {/* No bets message */}
      {!loading && filteredBets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg mb-2">No bets found</p>
          <p className="text-white/50">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Bet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* {paginatedBets.map((bet) => {
          // ... keep your bet card rendering code here (unchanged)
        })} */}

        {paginatedBets.map((bet) => {
          const isWin = bet.outcome === "win";
          const cardBg = isWin ? "bg-green-400/10" : "bg-red-400/10";
          const badgeColor = isWin ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400";
          const amountColor = isWin ? "text-green-400" : "text-red-400";

          return (
            <div
              key={bet.id}
              className={`w-full h-[186px] ${cardBg} border border-white/10 rounded-[20px] p-4 flex flex-col justify-between`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center text-base gap-2 text-white/60 font-medium">
                  {bet.icon}
                  {bet.type}
                </div>
                <div className={`text-xs px-3 py-1 rounded-full font-semibold ${badgeColor}`}>
                  {isWin ? "Win" : "Lose"}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className={`text-[20px] font-medium ${amountColor}`}>
                  {bet.type === "Crash" || bet.type === "Meta Market"
                    ? // For crash and meta market, show profit instead of stake
                      `${bet.profit >= 0 ? "+" : ""}${bet.profit} BTC`
                    : `${isWin ? "+" : "-"} ${bet.amount} BTC`}
                </div>
                {isWin && bet.payout > 0 && bet.type !== "Crash" && bet.type !== "Meta Market" && (
                  <div className="text-sm text-green-400/70">Payout: {bet.payout} BTC</div>
                )}
                {(bet.type === "Crash" || bet.type === "Meta Market") && (
                  <div className="text-sm text-white/70">Stake: {bet.amount} BTC</div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {Object.entries(bet.meta).map(([label, value]) => (
                  <div key={label} className="flex flex-col items-start flex-1 min-w-[80px]">
                    <span className="text-[12px] text-white/60 mb-1">{label}</span>
                    <div className="w-full bg-[#1C1C1C] rounded-md p-2 text-center text-sm font-semibold">
                      {(() => {
                        const isWheelColor = bet.type === "Wheel" && (label === "Chosen" || label === "Result");
                        const isCoinflipSide = bet.type === "Flip" && (label === "Choice" || label === "Result");
                        const isCrashProfit = bet.type === "Crash" && label === "Profit";
                        const isMetaMarketSide = bet.type === "Meta Market" && label === "Side";

                        if (isCoinflipSide && (value === "heads" || value === "tails")) {
                          return (
                            <div className="flex items-center justify-center gap-2">
                              <span className="capitalize">{value}</span>
                              {value === "heads" ? (
                                <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-[#C8A2FF] flex items-center justify-center">
                                  <Star className="w-2.5 h-2.5 text-black fill-black" />
                                </div>
                              )}
                            </div>
                          );
                        } else if (isWheelColor && typeof value === "string") {
                          const colorKey = value.toLowerCase();
                          return (
                            <div className="flex items-center gap-2 justify-center">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: colorMap[colorKey] || "#ccc" }}
                              />
                              <span className="capitalize">{value}</span>
                            </div>
                          );
                        } else if (isCrashProfit) {
                          const profitValue = Number.parseFloat(String(value).replace(/[^\d.-]/g, ""));
                          const profitColor = profitValue >= 0 ? "text-green-400" : "text-red-400";
                          return <span className={`text-xs ${profitColor}`}>{String(value)}</span>;
                        } else if (isMetaMarketSide) {
                          const sideColor = value === "YES" ? "text-green-400" : "text-red-400";
                          const sideBg = value === "YES" ? "bg-green-400/10" : "bg-red-400/10";
                          return (
                            <div className={`px-2 py-1 rounded ${sideBg}`}>
                              <span className={`text-xs font-bold ${sideColor}`}>{String(value)}</span>
                            </div>
                          );
                        } else {
                          return <span className="text-xs">{String(value)}</span>;
                        }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8 lg:mb-0 mb-16">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-primary text-black/70 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-white/70 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-primary text-black/70 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Search, Dices, ArrowRightLeft, RefreshCcw, TrendingUp, BarChart3 } from "lucide-react";
import { fetchUserBets } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";

const GAME_OPTIONS = [
  { value: "all", label: "All" },
  { value: "dice", label: "Dice" },
  { value: "metamarket", label: "Meta Market" },
  { value: "coinflip", label: "Flip" },
  { value: "wheel", label: "Wheel" },
  { value: "crash", label: "Crash" },
];

const OUTCOME_OPTIONS = [
  { value: "", label: "All" },
  { value: "win", label: "Win" },
  { value: "loss", label: "Loss" },
];

const LIMIT = 12;

function mapBetToDisplay(bet: any, gameType: string) {
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
        profit: bet.payout - (bet.betAmount || 0),
        meta: {
          Multiplier: `${bet.multiplier}x`,
          "Bet Type": bet.betType === "over" ? `Over ${bet.target}` : `Under ${bet.target}`,
          Roll: bet.roll?.toFixed?.(2) ?? "—",
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
        profit: bet.payout - (bet.betAmount || 0),
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
        profit: bet.payout - (bet.stake || 0),
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
          Round: bet.round?.slice?.(-8) ?? "—",
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
          Shares: bet.shares?.toFixed?.(2) ?? "—",
          "Avg Price": `$${bet.avgPrice?.toFixed?.(3) ?? "—"}`,
        },
      };
    default:
      return null;
  }
}

export default function BetHistoryPage() {
  const [page, setPage] = useState(1);
  const [gameFilter, setGameFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const outcomeParam = outcomeFilter === "win" || outcomeFilter === "loss" ? outcomeFilter : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["my-bets", page, gameFilter, outcomeParam],
    queryFn: async () => {
      const res = await fetchUserBets(page, gameFilter, outcomeParam, LIMIT);
      return res;
    },
  });

  const rawBets = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;

  const displayBets = useMemo(() => {
    const mapped = rawBets
      .map((bet: any) => {
        const gameKey = bet.game || gameFilter;
        const key = gameKey === "all" ? "dice" : gameKey;
        return mapBetToDisplay(bet, key);
      })
      .filter(Boolean);
    if (!searchQuery.trim()) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter(
      (b: any) =>
        b.type.toLowerCase().includes(q) ||
        Object.values(b.meta || {}).join(" ").toLowerCase().includes(q)
    );
  }, [rawBets, gameFilter, searchQuery]);

  return (
    <div className="p-4 sm:p-6 text-white min-h-screen">
      <h1 className="text-[30px] font-medium mb-1">Bet History</h1>
      <p className="text-base font-normal text-white/70 mb-6 max-w-xl">
        View your past bets with pagination and filters.
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
        <input
          type="text"
          placeholder="Search in current list..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 bg-[#212121] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#C8A2FF]/50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-white/50 mr-1">Game:</span>
          {GAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setGameFilter(opt.value);
                setPage(1);
              }}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                gameFilter === opt.value
                  ? "bg-[#C8A2FF] text-black"
                  : "bg-[#212121] text-white/70 hover:text-white border border-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-white/50 mr-1">Outcome:</span>
          {OUTCOME_OPTIONS.map((opt) => (
            <button
              key={opt.value || "all"}
              onClick={() => {
                setOutcomeFilter(opt.value);
                setPage(1);
              }}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                outcomeFilter === opt.value
                  ? "bg-[#C8A2FF] text-black"
                  : "bg-[#212121] text-white/70 hover:text-white border border-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-2 border-[#C8A2FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && displayBets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-lg mb-2">No bets found</p>
          <p className="text-white/50">Try changing the game or outcome filter</p>
        </div>
      )}

      {!isLoading && displayBets.length > 0 && (
        <>
          <div className="rounded-xl border border-white/10 bg-[#212121] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#1C1C1C] text-white/60 font-medium">
                    <th className="px-4 py-3">Game</th>
                    <th className="px-4 py-3">Outcome</th>
                    <th className="px-4 py-3">Stake</th>
                    <th className="px-4 py-3">Payout / Profit</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {displayBets.map((bet: any) => {
                    const isWin = bet.outcome === "win";
                    const badgeColor = isWin ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400";
                    const amountColor = isWin ? "text-green-400" : "text-red-400";
                    const profitDisplay =
                      bet.type === "Crash" || bet.type === "Meta Market"
                        ? `${(bet.profit ?? 0) >= 0 ? "+" : ""}${bet.profit ?? 0} BTC`
                        : bet.payout != null ? `${bet.payout} BTC` : "—";
                    const dateStr = bet.createdAt
                      ? new Date(bet.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—";
                    const detailsStr = bet.meta ? Object.entries(bet.meta).map(([k, v]) => `${k}: ${v}`).join(" · ") : "—";

                    return (
                      <tr
                        key={bet.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-white font-medium">
                            {bet.icon}
                            {bet.type}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badgeColor}`}>
                            {isWin ? "Win" : "Lose"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/90">{bet.amount ?? "—"} BTC</td>
                        <td className={`px-4 py-3 font-medium ${amountColor}`}>{profitDisplay}</td>
                        <td className="px-4 py-3 text-white/60 text-xs">{dateStr}</td>
                        <td className="px-4 py-3 text-white/50 text-xs max-w-[200px] truncate" title={detailsStr}>
                          {detailsStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8 lg:mb-0 mb-16">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded bg-[#C8A2FF] text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-white/70 text-sm">
                Page {page} of {totalPages} ({total} total)
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded bg-[#C8A2FF] text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

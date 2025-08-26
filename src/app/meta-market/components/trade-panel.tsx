"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { placeMarketBet } from "../../../lib/api";
import type { Market } from "../../../interfaces/interface";
import useIsLoggedIn from "../../../hooks/useIsLoggedIn";

interface Props {
  market: Market;
  betAmount: number;
  setBetAmount: (n: number) => void;
  selectedOption: "Yes" | "No" | "";
  setSelectedOption: (opt: "Yes" | "No" | "") => void;
}

export default function TradePanel({ market, betAmount, setBetAmount, selectedOption, setSelectedOption }: Props) {
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = useIsLoggedIn();

  const totalShares = (market.qYes ?? 0) + (market.qNo ?? 0);
  const yesProbability = totalShares > 0 ? (market.qYes! / totalShares) * 100 : 50;
  const noProbability = 100 - yesProbability;

  const calculatePayout = (opt: "Yes" | "No") => {
    if (opt === "Yes")
      return market.qYes! > 0 ? (betAmount / (market.qYes! / totalShares)).toFixed(2) : betAmount.toFixed(2);
    return market.qNo! > 0 ? (betAmount / (market.qNo! / totalShares)).toFixed(2) : betAmount.toFixed(2);
  };

  const handlePlaceBet = async () => {
    if (!selectedOption || market.isResolved || !isLoggedIn) return;
    setIsPlacingBet(true);
    setError(null);

    try {
      await placeMarketBet(market._id, selectedOption.toUpperCase() as "YES" | "NO", betAmount);
      setSelectedOption("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bet");
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className="w-full lg:max-w-[347px] bg-[#1C1C1C] rounded-xl border border-white/10 p-4 sm:p-6">
      <h2 className="text-base font-medium mb-2 border-b border-white/6 pb-2">
        {market.isResolved ? "Market Resolved" : "Trade"}
      </h2>

      {/* If resolved */}
      {market.isResolved ? (
        <div className="text-center py-4">
          <p className="text-white/60 mb-2">This market has been resolved</p>
          <p className="text-xl font-semibold text-green-500">{market.result}</p>
        </div>
      ) : (
        <>
          {/* Buttons */}
          <div className="flex gap-4 mb-4">
            {(["Yes", "No"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                disabled={isPlacingBet || !isLoggedIn}
                className={`flex-1 py-2 rounded-[10px] text-sm font-medium ${
                  selectedOption === opt
                    ? opt === "Yes"
                      ? "bg-[#C8A2FF] text-black"
                      : "bg-red-500 text-black"
                    : "bg-[#212121] text-white border border-white/10 hover:border-white/20"
                } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {opt} {opt === "Yes" ? yesProbability.toFixed(1) : noProbability.toFixed(1)}%
              </button>
            ))}
          </div>

          {/* Bet Amount */}
          <div className="mb-4">
            <p className="text-xs lg:text-sm text-white/60 mb-1">Bet Amount</p>
            <div className="flex bg-[#212121] rounded-lg px-3 py-2 items-center gap-2">
              <span className="text-white text-lg font-semibold">$</span>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={isPlacingBet || !isLoggedIn}
                className="bg-transparent text-white text-sm lg:text-lg w-full focus:outline-none"
              />
              <div className="flex flex-col gap-1">
                <button onClick={() => setBetAmount(betAmount + 1)} disabled={!isLoggedIn}>
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => setBetAmount(Math.max(betAmount - 1, 0))} disabled={!isLoggedIn}>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Potential payout */}
          {selectedOption && isLoggedIn && (
            <div className="mb-4 p-3 bg-[#212121] rounded-lg">
              <p className="text-xs lg:text-sm text-white/60">Potential Payout</p>
              <p className="text-sm lg:text-lg font-semibold text-white">${calculatePayout(selectedOption)}</p>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handlePlaceBet}
            disabled={isPlacingBet || !selectedOption || !isLoggedIn}
            className="w-full mt-5 rounded-[10px] p-1 text-sm lg:py-3 font-semibold bg-[#C8A2FF] text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoggedIn ? "Login to Trade" : isPlacingBet ? "Placing Bet..." : "Trade"}
          </button>
        </>
      )}
    </div>
  );
}

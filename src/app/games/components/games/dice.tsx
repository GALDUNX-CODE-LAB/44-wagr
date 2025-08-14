"use client";

import { Bitcoin } from "lucide-react";
import DiceRoller from "../dice-roller";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import LiveWinsSection from "../../../../components/live-wins";
import LiveDiceWins from "../../../../components/live-wins-dice";
import { placeDiceBet } from "../../../../lib/api";

export default function DiceGame() {
  const [activeOdds, setActiveOdds] = useState(60.57);
  const [betAmount, setBetAmount] = useState(0.025);
  const [target, setTarget] = useState(50);
  const [betType, setBetType] = useState<"over" | "under">("over");
  const [lastResult, setLastResult] = useState<any>(null);
  const [isBetting, setIsBetting] = useState(false);
  const oddsOptions = [60.57, 30.57, 70.57, 60.7];
  const diceRef = useRef<any>(null);

  const queryClient = useQueryClient();

  const winnableAmount = betAmount * activeOdds;

  const handlePlaceBet = async () => {
    if (betAmount < 0) {
      alert("Please enter a valid bet amount");
      return;
    }

    // Start the rolling animation
    if (diceRef.current) {
      diceRef.current.rollDice();
    }

    try {
      const response = await placeDiceBet({ betAmount, target, betType });
      console.log("🎲 Full API Response:", response);

      // Extract inner data object
      const data = response.data;

      setLastResult(data);

      if (diceRef.current) {
        diceRef.current.rollToValue(data.roll, data.isWin);
      }
      if (diceRef.current) {
        diceRef.current.rollToValue(data.roll, data.isWin);
      }
    } catch (error: any) {
      console.error("🎲 Bet Error:", error);
      alert(`Bet failed: ${error.message || error}`);

      if (diceRef.current) {
        diceRef.current.resetDice();
      }
    }

    queryClient.invalidateQueries();
  };

  // Update UI when bet type changes
  useEffect(() => {
    if (diceRef.current) {
      diceRef.current.resetDice();
    }
  }, [betType]);

  return (
    <div className="p-4">
      <div className="bg-[#212121] rounded-[20px] text-white flex flex-col lg:flex-row justify-between gap-8 p-4 min-h-[400px]">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Bet Settings */}
          <div className="w-full flex flex-wrap font-medium gap-4 bg-[#1c1c1c]">
            <div className="flex-1 min-w-[200px] p-4 rounded-[20px]">
              <span className="text-sm text-white/60">Multiplier</span>
              <p className="mt-1 bg-[#212121] border border-white/10 rounded-lg px-3 py-2 text-lg font-semibold">
                {lastResult?.multiplier?.toFixed(5) || "2.65000"}
              </p>
            </div>
            <div className="flex-1 min-w-[200px] p-4 rounded-[20px]">
              <span className="text-sm text-white/60">Roll {betType === "over" ? "Over" : "Under"}</span>
              <div className="mt-1 bg-[#212121] border border-white/10 rounded-[12px] px-3 py-2">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-full bg-transparent text-lg font-semibold outline-none"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px] p-4 rounded-[20px]">
              <span className="text-sm text-white/60">Win Chance</span>
              <p className="mt-1 bg-[#212121] border border-white/10 rounded-[12px] px-3 py-2 text-lg font-semibold">
                {betType === "over" ? (100 - target).toFixed(2) : target.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Dice Animation */}
          <div className="flex-grow flex flex-col justify-center items-center mt-5">
            <DiceRoller ref={diceRef} />
            {lastResult && (
              <div className={`mt-4 text-lg font-semibold ${lastResult.isWin ? "text-green-400" : "text-red-400"}`}>
                {lastResult.isWin ? "You Won!" : "You Lost"} (Roll: {lastResult.roll.toFixed(2)})
              </div>
            )}
          </div>

          {/* Bet Type Toggle */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              className={`px-6 py-2 rounded-full font-medium ${
                betType === "over"
                  ? "bg-[#C8A2FF] text-black"
                  : "bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]"
              }`}
              onClick={() => setBetType("over")}
            >
              Roll Over
            </button>
            <button
              className={`px-6 py-2 rounded-full font-medium ${
                betType === "under"
                  ? "bg-[#C8A2FF] text-black"
                  : "bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]"
              }`}
              onClick={() => setBetType("under")}
            >
              Roll Under
            </button>
          </div>
        </div>

        {/* Right Section (Bet Summary) */}
        <div className="w-full lg:w-[375px] flex flex-col p-4 gap-8 bg-[#1c1c1c] border border-white/10 rounded-[20px]">
          {/* Bet Amount Input */}
          <div>
            <p className="text-sm text-white/60">Bet Amount</p>
            <div className="flex items-center justify-between bg-[#212121] rounded-lg p-4 mt-1">
              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full bg-transparent outline-none text-white"
              />
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-[1000px] p-1">
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-sm">BTC</span>
              </div>
            </div>
          </div>

          {/* Amount to Win */}
          <div>
            <p className="text-sm text-white/60">Profit On Win</p>
            <div className="bg-[#212121] rounded-lg p-4 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white">
                  {(betAmount * (betType === "over" ? 99 / (100 - target) : 99 / target)).toFixed(6)} BTC
                </span>
                <div className="bg-white rounded-[1000px] p-1">
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={isBetting}
            className={`mt-auto font-semibold rounded-[12px] py-3 transition ${
              isBetting ? "bg-gray-500 cursor-not-allowed" : "bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black"
            }`}
          >
            {isBetting ? "Processing..." : "Place Bet"}
          </button>
        </div>
      </div>

      {/* Live Wins Section */}
      <div className="mt-12 bg-[#212121] rounded-[20px] p-6">
        <LiveDiceWins />
      </div>
    </div>
  );
}

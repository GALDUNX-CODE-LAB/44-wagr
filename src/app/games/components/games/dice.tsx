"use client";

import { Bitcoin } from "lucide-react";
import DiceRoller from "../dice-roller";
import { useState, useRef, useEffect } from "react";
import LiveDiceWins from "../../../../components/live-wins-dice";
import { placeDiceBet } from "../../../../lib/api";
import useIsLoggedIn from "../../../../hooks/useIsLoggedIn";

export default function DiceGame() {
  const [activeOdds, setActiveOdds] = useState(60.57);
  const [betAmount, setBetAmount] = useState(0);
  const [target, setTarget] = useState(50);
  const [betType, setBetType] = useState<"over" | "under">("over");
  const [betHistory, setBetHistory] = useState([]);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isBetting, setIsBetting] = useState(false);
  const oddsOptions = [60.57, 30.57, 70.57, 60.7];
  const diceRef = useRef<any>(null);

  const winnableAmount = betAmount * activeOdds;
  useEffect(() => {
    handleHistory();
  }, []);

  const handlePlaceBet = async () => {
    if (betAmount < 0) {
      alert("Please enter a valid bet amount");
      return;
    }

    if (diceRef.current) {
      diceRef.current.rollDice();
    }

    try {
      const response = await placeDiceBet({ betAmount, target, betType });
      console.log("🎲 Full API Response:", response);

      const data = response.data;
      setLastResult(data);

      if (diceRef.current) {
        diceRef.current.rollToValue(data.roll, data.isWin);
      }

      // ✅ Save result in sessionStorage
      const stored = JSON.parse(sessionStorage.getItem("dice-history") || "[]");
      // keep max 3 results (you can change 3 → N)
      const updatedHistory = [...stored, data].slice(-7);

      sessionStorage.setItem("dice-history", JSON.stringify(updatedHistory));
    } catch (error: any) {
      console.error("🎲 Bet Error:", error);
      alert(`Bet failed: ${error.message || error}`);

      if (diceRef.current) {
        diceRef.current.resetDice();
      }
    }
  };

  // Update UI when bet type changes
  useEffect(() => {
    if (diceRef.current) {
      diceRef.current.resetDice();
    }
  }, [betType]);

  const isLoggedIn = useIsLoggedIn();

  const handleHistory = () => {
    const stored = JSON.parse(sessionStorage.getItem("dice-history") || "[]");
    setBetHistory(stored);
  };

  return (
    <div className="p-4">
      <div className="lg:bg-[#212121] rounded-[20px] text-white flex flex-col lg:flex-row justify-between gap-8 lg:p-4 min-h-[400px]">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Dice Animation */}
          <div className="flex-grow flex flex-col justify-center items-center mt-5 pt-10">
            <DiceRoller ref={diceRef} onClick={() => handleHistory()} />
            {/* {lastResult && (
              <div className={`mt-4 text-lg font-semibold ${lastResult.isWin ? "text-green-400" : "text-red-400"}`}>
                {lastResult.isWin ? "You Won!" : "You Lost"} (Roll: {lastResult.roll.toFixed(2)})
              </div>
            )} */}

            {/* Bet Type Toggle */}
            <div className="flex justify-center gap-4 mt-2">
              <button
                className={`px-6 py-2 rounded-lg text-xs font-medium ${
                  betType === "over"
                    ? "bg-[#C8A2FF] text-black"
                    : "bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]"
                }`}
                onClick={() => setBetType("over")}
              >
                Roll Over
              </button>
              <button
                className={`px-6 py-2 rounded-lg text-xs  font-medium ${
                  betType === "under"
                    ? "bg-[#C8A2FF] text-black"
                    : "bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]"
                }`}
                onClick={() => setBetType("under")}
              >
                Roll Under
              </button>
            </div>

            <div className="wrap mt-16">
              <div className="flex flex-wrap gap-3 items-center w-full ">
                {betHistory.map((i, index) => (
                  <span
                    className={` ${
                      i.isWin ? "bg-primary text-secondary " : "bg-black/70 text-white/90"
                    } text-xs px-3 p-1 rounded-full`}
                    key={index}
                  >
                    {i.roll.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
            {/* Bet Settings */}
            <div className="w-full grid grid-cols-3 bg-white/10 rounded-lg mt-3">
              {/* Multiplier */}
              <div className="p-4 rounded-lg text-center">
                <span className="text-xs text-white/60 text-center justify-center">Multiplier</span>
                <p className="bg-[#212121] h-10 flex items-center justify-center border border-white/10 rounded-lg px-3 py-2 lg:text-base text-xs font-semibold">
                  {(0.99 / ((betType === "over" ? 100 - target : target) / 100)) // 0.99 = house edge (1%)
                    .toFixed(3)}
                </p>
              </div>

              {/* Roll Over / Under */}
              <div className="p-4 rounded-lg text-center">
                <span className="text-xs text-white/60 text-center">Roll {betType === "over" ? "Over" : "Under"}</span>
                <div className="bg-[#212121] h-10 flex items-center border border-white/10 rounded-lg px-3 py-1.5">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value) > 100 ? 0 : Number(e.target.value))}
                    className="w-full bg-transparent lg:text-base text-xs font-semibold text-center outline-none"
                  />
                </div>
              </div>

              {/* Win Chance */}
              <div className="p-4 rounded-lg text-center">
                <span className="text-xs text-white/60 text-center">Win Chance</span>
                <p className="bg-[#212121] h-10 flex items-center justify-center border border-white/10 rounded-lg px-3 py-2 lg:text-base text-xs font-semibold">
                  {(betType === "over" ? 100 - target : target).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (Bet Summary) */}
        <div className="w-full lg:w-[375px]  p-4 gap-6 bg-[#1c1c1c] border border-white/10 rounded-lg">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Bet Amount Input */}
            <div className="flex flex-col">
              <p className="text-sm text-white/60 mb-1">Bet Amount</p>
              <div className="flex items-center bg-[#212121] rounded-lg p-3">
                <input
                  type="number"
                  min="0"
                  step="0"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full bg-transparent outline-none text-white text-sm"
                />
              </div>
            </div>

            {/* Amount to Win */}
            <div className="flex flex-col">
              <p className="text-sm text-white/60 mb-1">Profit On Win</p>
              <div className="bg-[#212121] rounded-lg p-3 flex items-center justify-start">
                <span className="text-sm text-white font-medium">
                  {betAmount > 0
                    ? (betAmount * (betType === "over" ? 99 / (100 - target) : 99 / target)).toFixed(3)
                    : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Bet Button */}
          <button
            onClick={handlePlaceBet}
            disabled={isBetting || !isLoggedIn}
            className="w-full mt-5 rounded-[10px] p-2 text-sm lg:py-3 font-semibold bg-[#C8A2FF] text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoggedIn ? "Login to Play" : isBetting ? "Placing Bet..." : "Play"}
          </button>
        </div>
      </div>

      {/* Live Wins Section */}
      <div className="mt-12 lg:bg-[#212121] rounded-[20px] lg:p-6">
        <LiveDiceWins />
      </div>
    </div>
  );
}

"use client";

import { Bitcoin, Star } from "lucide-react";
import { useState } from "react";
import LiveWinsSection from "../../../../components/live-wins";
import { useQueryClient } from "@tanstack/react-query";
import { placeCoinflipBet } from "../../../../lib/api";
import LiveCoinWins from "../../../../components/live-wins-coin";

export default function CoinTossGame() {
  const [betAmount, setBetAmount] = useState(0);
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails" | "">("");
  const [activeOdds, setActiveOdds] = useState(2);
  const [coinSide, setCoinSide] = useState<"heads" | "tails">("heads");
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [coinRotation, setCoinRotation] = useState(0);

  const oddsOptions = [2, 4, 6, 8];
  const winnableAmount = betAmount * activeOdds;

  const queryClient = useQueryClient();

  const handleRandomPick = () => {
    const sides = ["Heads", "Tails"];
    const randomSide = sides[Math.floor(Math.random() * sides.length)];
    setSelectedSide(randomSide as "heads" | "tails");
  };

  const handlePlaceBet = async () => {
    if (!selectedSide) {
      setResultText("Please select a side before betting!");
      setShowResult(true);
      return;
    }

    if (betAmount < 0) {
      setResultText("Bet amount must be greater than 0");
      setShowResult(true);
      return;
    }

    setIsFlipping(true);
    setShowResult(false);

    try {
      const response = await placeCoinflipBet({
        betAmount,
        choice: selectedSide,
      });

      console.log("🔁 Full Server Response:", response);

      const data = response.data || response;

      if (!data || !data.result) {
        setIsFlipping(false);
        setResultText("Something went wrong: Missing result.");
        setShowResult(true);
        return;
      }

      const result = data.result.toLowerCase() === "heads" ? "heads" : "tails";
      const baseRotation = 1080;
      const targetRotation = result === "heads" ? baseRotation : baseRotation + 180;

      setCoinRotation((prev) => prev + targetRotation);
      setCoinSide(result);

      setTimeout(() => {
        setIsFlipping(false);
        setResultText(
          data.isWin
            ? `🎉 You WON! Coin landed on ${result} — You earned ${data.payout || winnableAmount}`
            : `❌ You LOST! Coin landed on ${result}`
        );
        setShowResult(true);
      }, 2000);

      queryClient.invalidateQueries();
    } catch (error: any) {
      setIsFlipping(false);
      setResultText(error.message || "Something went wrong");
      setShowResult(true);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-[#212121] text-white rounded-xl p-4 md:p-6 flex flex-col lg:flex-row justify-between gap-6">
        {/* Coin Animation and Odds */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="w-full flex justify-center">
            <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
              <div
                className="w-full h-full transition-transform duration-[2s] ease-in-out"
                style={{
                  transform: `rotateY(${coinRotation}deg)`,
                  transformStyle: "preserve-3d",
                  position: "relative",
                }}
              >
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-red-500 backface-hidden">
                  <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full bg-black" />
                </div>
                <div className="absolute inset-0 rounded-full flex items-center justify-center rotate-y-180 bg-[#C8A2FF] backface-hidden">
                  <Star className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] text-black fill-black" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-6">
            {oddsOptions.map((odds) => (
              <button
                key={odds}
                onClick={() => setActiveOdds(odds)}
                className={`w-[72px] h-[30px] rounded-full text-sm font-medium transition ${
                  activeOdds === odds
                    ? "bg-[#C8A2FF] text-black"
                    : "bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]"
                }`}
              >
                {odds}x
              </button>
            ))}
          </div>
        </div>

        {/* Bet Card */}
        <div className="w-full lg:w-[347px] flex-shrink-0 bg-[#1C1C1C] border border-white/10 p-4 rounded-[16px] flex flex-col gap-4">
          <div>
            <p className="text-sm text-white/60">Bet Amount</p>
            <div className="flex justify-between bg-[#212121] rounded-lg mt-2 px-3 py-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min="0.000001"
                  step="0.000001"
                  className="bg-transparent text-sm text-white w-24 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center">
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="bg-black px-3 py-1 rounded-lg">
                  <p className="text-white font-medium leading-none">{activeOdds}x</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRandomPick}
            className="text-white text-sm font-medium rounded-[10px] bg-[#212121] p-3 transition hover:bg-[#2A2A2A]"
          >
            Pick Random Side
          </button>

          <div className="flex gap-4">
            {["Heads", "Tails"].map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side as "heads" | "tails")}
                disabled={isFlipping}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border flex items-center justify-center gap-2 ${
                  selectedSide === side
                    ? "bg-[#C8A2FF] text-black"
                    : "bg-[#212121] border-white/10 text-white hover:bg-[#2A2A2A]"
                } ${isFlipping ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {side}
                {side === "Heads" ? (
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#C8A2FF] flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-black fill-black" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div>
            <p className="text-sm text-white/60">Profit On Win</p>
            <div className="bg-[#212121] rounded-lg p-3 mt-1">
              <div className="flex justify-between">
                <span className="text-sm text-white">{winnableAmount.toFixed(6)}</span>
                <div className="bg-white rounded-[1000px] p-1">
                  <Bitcoin className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={isFlipping || !selectedSide}
            className={`bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-[12px] py-2 transition ${
              isFlipping ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isFlipping ? "Flipping..." : "Bet"}
          </button>
        </div>
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl text-white text-center max-w-xs w-full">
            <p className="text-lg font-semibold mb-4">{resultText}</p>
            <button
              onClick={() => setShowResult(false)}
              className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full px-6 py-2 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 bg-[#212121] rounded-[20px] p-6">
        <LiveCoinWins />
      </div>
    </div>
  );
}

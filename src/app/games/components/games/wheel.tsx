"use client";

import { Bitcoin } from "lucide-react";
import { useEffect, useState } from "react";
import LiveWinsSection from "../../../../components/live-wins";
import { TfiLocationPin } from "react-icons/tfi";
import { useWheelBet } from "../../../../lib/hooks/useWheel";
import { HARD_CODED_SEGMENTS } from "../../../../lib/api/wheel-api";
import LiveWheelsWins from "../../../../components/live-wins-wheels";
import { placeWheelBet } from "../../../../lib/api/wheel-api";


const COLOR_MAPPING = {
  purple: "#C8A2FF",
  green: "#4DFF00B5",
  red: "#FF0000B5",
  yellow: "#FFC107",
  blue: "#1976D2",
  lightgray: "#FFFFFFB5",
};

export default function StakeRingWheelGame() {
  const [betAmount, setBetAmount] = useState(0.01);
  const [activeOdds, setActiveOdds] = useState(2);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("medium");
  const [selectedSegments, setSelectedSegments] = useState(HARD_CODED_SEGMENTS.length);
  const [recentResults, setRecentResults] = useState<Array<{ multiplier: number; color: string }>>([]);
  const [fixedSegments, setFixedSegments] = useState(HARD_CODED_SEGMENTS);
   const [isBetting, setIsBetting] = useState(false);

  

  const segmentAngle = 360 / selectedSegments;

  useEffect(() => {
    const trimmed = HARD_CODED_SEGMENTS.slice(0, selectedSegments);
    setFixedSegments(trimmed);
  }, [selectedSegments]);

  const generateGradient = () => {
    return `conic-gradient(from 90deg, ${fixedSegments
      .map((segment, i) => {
        const color = COLOR_MAPPING[segment.color] || "#FFFFFFB5";
        const start = i * segmentAngle;
        const end = start + segmentAngle;
        return `${color} ${start}deg ${end}deg`;
      })
      .join(", ")})`;
  };

const handleSpin = async () => {
  if (isSpinning || !fixedSegments.length) return;

  setIsSpinning(true);
  setShowResult(false);

  try {
    // Randomly pick a color from wheel segments
    const randomColor = fixedSegments[Math.floor(Math.random() * fixedSegments.length)].color;

    // Send primitive values, not objects
    const response = await placeWheelBet({
      stake: betAmount, // ensure it's a number
      chosenColor: randomColor,
    });

    if (!response?.success) {
      throw new Error("Bet failed.");
    }

    const { resultColor, multiplier } = response.data;

    // Find result index from the wheel segments
    const resultIndex = fixedSegments.findIndex(
      (seg) => seg.color === resultColor
    );

    if (resultIndex === -1) {
      setIsSpinning(false);
      setResultText("Invalid result from server.");
      setShowResult(true);
      return;
    }

    // Spin calculation
    const SEGMENT_COUNT = fixedSegments.length;
    const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;
    const segmentCenterInGradient =
      resultIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const segmentCenterInNormal = (segmentCenterInGradient + 90) % 360;
    const rotationNeeded = (360 - segmentCenterInNormal) % 360;

    const SPIN_COUNT = 5;
    const currentBase = Math.floor(wheelRotation / 360) * 360;
    const totalRotation =
      currentBase + SPIN_COUNT * 360 + rotationNeeded;

    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);

      const winAmount = Number(betAmount) * multiplier;
      setResultText(
        multiplier > 0
          ? `🎉 Landed on ${resultColor}! Won ${winAmount.toFixed(6)} BTC (${multiplier}x)`
          : `❌ Landed on ${resultColor} - Better luck next time!`
      );

      setRecentResults((prev) => [
        { multiplier, color: resultColor },
        ...prev.slice(0, 4),
      ]);

      setShowResult(true);
    }, 4500);
  } catch (error: any) {
    setIsSpinning(false);
    setResultText(error.message || "Bet failed");
    setShowResult(true);
  }
};


  return (
    <div className="px-4 py-6">
      <div className="bg-[#212121] text-white rounded-xl flex flex-col lg:flex-row gap-6 justify-between items-center lg:items-start p-6">
        {/* Segment Cards (Left) */}
        <div className="hidden lg:flex lg:flex-col flex-wrap gap-2 justify-center">
          {fixedSegments.map((segment, idx) => (
            <div key={idx} className="w-[60px] h-[50px] rounded-[10px] border border-white/10 flex flex-col">
              <div className="flex-1 bg-[#1C1C1C] flex items-center justify-center text-sm font-semibold">
                {segment.multiplier}x
              </div>
              <div style={{ backgroundColor: COLOR_MAPPING[segment.color], height: "20%" }} />
            </div>
          ))}
        </div>

        {/* Wheel Center */}
        <div className="flex flex-col justify-center items-center w-full max-w-[360px] relative">
          <div
            className="relative w-full aspect-square max-w-[340px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#1C1C1C" }}
          >
            <div
              className="absolute inset-6 rounded-full transition-transform duration-[4.5s] ease-out"
              style={{
                background: generateGradient(),
                transform: `rotate(${wheelRotation}deg)`,
                transitionTimingFunction: "cubic-bezier(0.1, 0.7, 0.1, 1)",
              }}
            />
            <div className="w-[70%] aspect-square rounded-full bg-[#1C1C1C] z-10" />
            <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 z-20">
              <TfiLocationPin className="w-[30px] h-[25px] -mt-2 text-[#c8a2ff]" />
            </div>
          </div>

          {/* Recent Results */}
          <div className="flex gap-3 mt-6 flex-wrap justify-start self-start -ml-[100px]">
            {recentResults.map((result, idx) => (
              <div
                key={idx}
                className="w-[72px] h-[30px] rounded-full px-[18px] py-[5px] text-sm font-medium bg-[#212121] border border-white/10 text-white flex items-center justify-center gap-1"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLOR_MAPPING[result.color] || "#FFFFFFB5" }}
                />
                {result.multiplier}x
              </div>
            ))}
          </div>

          {/* Segment Cards (Mobile) */}
          <div className="flex lg:hidden flex-wrap gap-2 justify-center mt-6">
            {fixedSegments.map((segment, idx) => (
              <div key={idx} className="w-[60px] h-[50px] rounded-[10px] border border-white/10 flex flex-col">
                <div className="flex-1 bg-[#1C1C1C] flex items-center justify-center text-sm font-semibold">
                  {segment.multiplier}x
                </div>
                <div style={{ backgroundColor: COLOR_MAPPING[segment.color], height: "20%" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Betting Panel */}
        <div className="w-full lg:w-[347px] bg-[#1C1C1C] rounded-[16px] border border-white/10 p-4 flex flex-col gap-4">
          <div>
            <p className="text-sm text-white/60">Bet Amount</p>
            <div className="flex justify-between bg-[#212121] rounded-lg mt-2 px-3 py-3.5">
              <span className="text-sm text-white">{betAmount}</span>
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

          <div>
            <p className="text-sm text-white/60">Risk</p>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="mt-2 bg-[#212121] text-white rounded-[12px] p-4 w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-white/60">Segments</p>
            <select
              value={selectedSegments}
              onChange={(e) => setSelectedSegments(parseInt(e.target.value))}
              className="mt-2 bg-[#212121] text-white rounded-lg p-4 w-full"
            >
              {[6, 8, 10, 12, 14, 16, 18, 20].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || isBetting}
            className={`${
              isSpinning || isBetting ? "opacity-50 cursor-not-allowed" : ""
            } bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-[12px] py-3.5 mt-auto transition`}
          >
            {isSpinning || isBetting ? "Processing..." : "Bet"}
          </button>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1c] rounded-xl border border-white/10 p-6 text-center max-w-sm w-full text-white">
            <p className="text-lg font-semibold mb-4">{resultText}</p>
            <button
              onClick={() => setShowResult(false)}
              className="mt-2 bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full px-6 py-2 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Live Wins */}
      <div className="mt-10 bg-[#212121] rounded-[20px] p-6">
        <LiveWheelsWins />
      </div>
    </div>
  );
}

"use client";

import { Bitcoin, DollarSignIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { TfiLocationPin } from "react-icons/tfi";
import { HARD_CODED_SEGMENTS, SINGLE_CODED_SEGMENTS } from "../../../../lib/api/wheel-api";
import LiveWheelsWins from "../../../../components/live-wins-wheels";
import { placeWheelBet } from "../../../../lib/api/wheel-api";
import useIsLoggedIn from "../../../../hooks/useIsLoggedIn";
import { useUser } from "../../../../hooks/useUserData";
import { useQueryClient } from "@tanstack/react-query";
import { playWheelsSound, playWheelsWins } from "../../../../lib/sound-player";
import { delayer } from "../../../../lib/utils";
import WheelHistoryTable from "../wheel-history";
import InfoModal from "../info-modal";
import FairnessModal from "../fairness-modal";
import { FaQuestion, FaShieldAlt } from "react-icons/fa";

const COLOR_MAPPING = {
  purple: "#C8A2FF",
  green: "#4DFF00B5",
  red: "#FF0000B5",
  yellow: "#FFC107",
  blue: "#1976D2",
  lightgray: "#FFFFFFB5",
};

type Segment = { color: keyof typeof COLOR_MAPPING; multiplier: number };

const buildSegments = (count: number): Segment[] => {
  const base = HARD_CODED_SEGMENTS as Segment[];
  if (count <= base.length) return base.slice(0, count);
  const result: Segment[] = [];
  while (result.length < count) {
    result.push(...base);
  }
  return result.slice(0, count);
};

export default function StakeRingWheelGame() {
  const [betAmount, setBetAmount] = useState(0.01);
  const [activeOdds, setActiveOdds] = useState(2);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("medium");
  const [selectedSegments, setSelectedSegments] = useState(8);
  const [recentResults, setRecentResults] = useState<Array<{ multiplier: number; color: string }>>([]);
  const [fixedSegments, setFixedSegments] = useState<Segment[]>(() => buildSegments(8));
  const [isBetting, setIsBetting] = useState(false);
  const [inErr, setInErr] = useState<string | null>();

  const [autoMode, setAutoMode] = useState(false);
  const [autoPlays, setAutoPlays] = useState(5);
  const [autoPlaysLeft, setAutoPlaysLeft] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const [activeTab, setActiveTab] = useState("my-bets");
  const [howModal, setHowModal] = useState(false);
  const [openFairness, setOpenFairness] = useState(false);

  const tabs: { id: string; label: string }[] = [
    { id: "my-bets", label: "My Bets" },
    { id: "live-games", label: "Live Games" },
  ];

  const isLoggedIn = useIsLoggedIn();
  const { balance } = useUser();
  const queryClient = useQueryClient();

  const displaySegment: Segment[] = buildSegments(8);

  useEffect(() => {
    setFixedSegments(buildSegments(selectedSegments));
  }, [selectedSegments]);

  const generateGradient = () => {
    const count = fixedSegments.length || 1;
    const segmentAngle = 360 / count;
    return `conic-gradient(from 90deg, ${fixedSegments
      .map((segment, i) => {
        const color = COLOR_MAPPING[segment.color] || "#FFFFFFB5";
        const start = i * segmentAngle;
        const end = start + segmentAngle;
        return `${color} ${start}deg ${end}deg`;
      })
      .join(", ")})`;
  };

  const spinOnce = async (): Promise<boolean> => {
    if (isSpinning || !fixedSegments.length) return false;
    if (betAmount > balance) {
      setInErr("Insufficient Balance");
      return false;
    }

    setIsSpinning(true);
    setShowResult(false);
    setInErr(null);

    playWheelsSound();

    try {
      const response = await placeWheelBet({ stake: betAmount, segments: selectedSegments });

      if (!response?.success) {
        throw new Error("Bet failed.");
      }

      const { resultColor, multiplier } = response.data;

      const resultIndex = fixedSegments.findIndex((seg) => seg.color === resultColor);
      if (resultIndex === -1) {
        setIsSpinning(false);
        setResultText("Invalid result from server.");
        setShowResult(true);
        return false;
      }

      const SEGMENT_COUNT = fixedSegments.length;
      const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;
      const segmentCenterInGradient = resultIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
      const segmentCenterInNormal = (segmentCenterInGradient + 90) % 360;
      const rotationNeeded = (360 - segmentCenterInNormal) % 360;
      const SPIN_COUNT = 5;

      setWheelRotation((prev) => {
        const currentBase = Math.floor(prev / 360) * 360;
        return currentBase + SPIN_COUNT * 360 + rotationNeeded;
      });

      await delayer(4500);

      const winAmount = Number(betAmount) * multiplier;
      if (multiplier > 0) playWheelsWins();

      setRecentResults((prev) => [{ multiplier, color: resultColor }, ...prev.slice(0, 4)]);
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setIsSpinning(false);

      return true;
    } catch (error: any) {
      setIsSpinning(false);
      setResultText(error.message || "Bet failed");
      setShowResult(true);
      return false;
    }
  };

  const handleSpin = async () => {
    if (!isLoggedIn) return;

    if (!autoMode) {
      await spinOnce();
      return;
    }

    if (autoPlays <= 0) {
      setResultText("Please enter how many times to auto play");
      setShowResult(true);
      return;
    }

    setIsAutoPlaying(true);
    setAutoPlaysLeft(autoPlays);

    for (let i = 0; i < autoPlays; i++) {
      const ok = await spinOnce();
      const remaining = autoPlays - (i + 1);
      setAutoPlaysLeft(remaining);
      if (!ok) break;
    }

    setIsAutoPlaying(false);
    setAutoPlaysLeft(0);
  };

  return (
    <div className="px-4 py-6">
      <div className="lg:bg-[#212121] text-white rounded-xl flex flex-col lg:flex-row gap-6 justify-between items-center lg:items-start lg:p-6">
        <div className="hidden lg:flex lg:flex-col flex-wrap gap-2 justify-center">
          {SINGLE_CODED_SEGMENTS.map((segment, idx) => (
            <div key={idx} className="w-[60px] h-[50px] rounded-[10px] border border-white/10 flex flex-col">
              <div className="flex-1 bg-[#1C1C1C] flex items-center justify-center text-sm font-semibold">
                {segment.multiplier}x
              </div>
              <div style={{ backgroundColor: COLOR_MAPPING[segment.color] as string, height: "20%" }} />
            </div>
          ))}
        </div>

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

          <div className="flex gap-3 mt-6 flex-wrap justify-start self-start -ml-[100px]">
            {recentResults.map((result, idx) => (
              <div
                key={idx}
                className="w-[72px] h-[30px] rounded-full px-[18px] py-[5px] text-sm font-medium bg-[#212121] border border-white/10 text-white flex items-center justify-center gap-1"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLOR_MAPPING[result.color as keyof typeof COLOR_MAPPING] || "#FFFFFFB5" }}
                />
                {result.multiplier}x
              </div>
            ))}
          </div>

          <div className="flex lg:hidden flex-wrap gap-2 justify-center mt-6">
            {displaySegment.map((segment, idx) => (
              <div key={idx} className="w-[60px] h-[50px] rounded-[10px] border border-white/10 flex flex-col">
                <div className="flex-1 bg-[#1C1C1C] flex items-center justify-center text-sm font-semibold">
                  {segment.multiplier}x
                </div>
                <div style={{ backgroundColor: COLOR_MAPPING[segment.color], height: "20%" }} />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[347px] bg-[#1C1C1C] rounded-[16px] border border-white/10 p-4 flex flex-col gap-4">
          <div>
            <p className="text-xs lg:text-sm text-white/60">Bet Amount</p>
            <div className="flex justify-between bg-[#212121] rounded-lg mt-2 px-3 py-3.5">
              <input
                type="number"
                className={`ring-0 focus:ring-0 outline-0 text-sm ${inErr && "border border-red-300"}`}
                placeholder=""
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={isSpinning || isAutoPlaying}
              />
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 rounded-full w-6 h-6 flex items-center justify-center">
                  <DollarSignIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <small className="text-red-300 capitalize">{inErr}</small>
          </div>

          <div>
            <p className="text-xs lg:text-sm text-white/60">Segments</p>
            <select
              value={selectedSegments}
              onChange={(e) => setSelectedSegments(parseInt(e.target.value))}
              className="mt-2 bg-[#212121] text-white rounded-lg p-3 py-3.5 text-xs lg:text-base lg:p-4 w-full"
              disabled={isSpinning || isAutoPlaying}
            >
              {[8, 16, 32].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Automatic Mode</span>
              <button
                type="button"
                onClick={() => {
                  if (isSpinning || isAutoPlaying) return;
                  setAutoMode((prev) => !prev);
                }}
                className={`w-11 h-6 rounded-full flex items-center px-1 text-[10px] ${
                  autoMode ? "bg-[#C8A2FF] justify-end" : "bg-[#212121] justify-start"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white" />
              </button>
            </div>

            {autoMode && (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-white/60">Number of Plays</p>
                <div className="bg-[#212121] rounded-lg p-2 flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={autoPlays}
                    onChange={(e) => setAutoPlays(Number(e.target.value))}
                    className="w-full bg-transparent outline-none text-white text-xs"
                    disabled={isSpinning || isAutoPlaying}
                  />
                </div>
                {isAutoPlaying && autoPlaysLeft >= 0 && (
                  <p className="text-[11px] text-white/60">
                    Auto playing... {autoPlays - autoPlaysLeft}/{autoPlays}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || isAutoPlaying || isBetting || !isLoggedIn}
            className="w-full mt-5 rounded-[10px] p-2 text-sm lg:py-3 font-semibold bg-[#C8A2FF] text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoggedIn
              ? "Login to Play"
              : isSpinning || isAutoPlaying || isBetting
              ? "Playing..."
              : autoMode
              ? "Start Auto Play"
              : "Play"}
          </button>
        </div>
      </div>

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

      <div className="w-full mt-10 space-y-4">
        <div className="flex w-full justify-between items-center">
          <div className="inline-flex items-center rounded-full bg-black/40 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-xs md:text-sm font-semibold rounded-full transition ${
                  activeTab === tab.id ? "bg-[#1d2023] text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="wrap flex items-center gap-3">
            <button
              className="rounded-lg text-sm flex justify-center items-center gap-2 px-4 p-2 bg-black/70 hover:bg-black/30 transition text-white/50 hover:text-white"
              onClick={() => setOpenFairness(true)}
            >
              Fairness
              <FaShieldAlt size={12} />
            </button>

            <button
              className="rounded-full p-2 bg-primary/20 hover:bg-primary/30 transition text-white/50 hover:text-white"
              onClick={() => setHowModal(true)}
            >
              <FaQuestion size={14} />
            </button>
            <InfoModal
              open={howModal}
              onClose={() => setHowModal(false)}
              title="How To Play Dice"
              text={
                "Choose Roll Over or Roll Under\n" +
                "Set your target number between 1 and 99\n" +
                "Lower targets give a higher win chance but a lower multiplier; higher targets give lower win chance but bigger payouts\n\n" +
                "Enter the amount you want to bet\n" +
                "Press Play to roll a random number between 0.00 and 99.99\n\n" +
                "If you chose Roll Over and the roll is greater than your target, you win\n" +
                "If you chose Roll Under and the roll is less than your target, you win\n" +
                "Your profit on win is shown in the Profit card and equals your bet multiplied by the displayed multiplier"
              }
            />
            <FairnessModal open={openFairness} onClose={() => setOpenFairness(false)} />
          </div>
        </div>

        {activeTab === "my-bets" && <WheelHistoryTable />}

        {activeTab === "live-games" && <LiveWheelsWins />}
      </div>
    </div>
  );
}

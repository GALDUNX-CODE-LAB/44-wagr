"use client";

import { Bitcoin, DollarSignIcon, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LiveWinsSection from "../../../../components/live-wins";
import { useQueryClient } from "@tanstack/react-query";
import { placeCoinflipBet } from "../../../../lib/api";
import LiveCoinWins from "../../../../components/live-wins-coin";
import useIsLoggedIn from "../../../../hooks/useIsLoggedIn";
import { TbLoader2 } from "react-icons/tb";
import { FaCircle, FaQuestion, FaShieldAlt } from "react-icons/fa";
import { playCoinFlipSound, playCoinFlipWin } from "../../../../lib/sound-player";
import { delayer } from "../../../../lib/utils";
import CoinFlipHistoryTable from "../coin-history";
import InfoModal from "../info-modal";
import FairnessModal from "../fairness-modal";

type CoinSide = "heads" | "tails";

interface CoinHistoryItem {
  result: CoinSide;
  isWin: boolean;
}

type CoinflipTab = "my-bets" | "live-games";

export default function CoinTossGame() {
  const [betAmount, setBetAmount] = useState(0);
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [activeOdds, setActiveOdds] = useState(2);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [coinRotation, setCoinRotation] = useState(0);
  const [betHistory, setBetHistory] = useState<CoinHistoryItem[]>([]);

  const [autoMode, setAutoMode] = useState(false);
  const [autoPlays, setAutoPlays] = useState(5);
  const [autoPlaysLeft, setAutoPlaysLeft] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const [activeTab, setActiveTab] = useState<CoinflipTab>("my-bets");
  const [howModal, setHowModal] = useState(false);
  const [openFairness, setOpenFairness] = useState(false);

  const stopAutoRef = useRef(false);

  const tabs: { id: CoinflipTab; label: string }[] = [
    { id: "my-bets", label: "My Bets" },
    { id: "live-games", label: "Live Games" },
  ];

  const oddsOptions = [2, 4, 6, 8];
  const winnableAmount = betAmount * activeOdds;

  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    handleHistory();
  }, []);

  const handleRandomPick = () => {
    const sides: CoinSide[] = ["heads", "tails"];
    const randomSide = sides[Math.floor(Math.random() * sides.length)];
    setSelectedSide(randomSide);
  };

  const playSingleFlip = async (opts?: { auto?: boolean }): Promise<boolean> => {
    let sideForThisFlip = selectedSide;

    if (opts?.auto) {
      const rand: CoinSide = Math.random() < 0.5 ? "heads" : "tails";
      sideForThisFlip = rand;
      setSelectedSide(rand);
    }

    if (!sideForThisFlip) {
      setResultText("Please select a side before betting!");
      setShowResult(true);
      return false;
    }

    if (betAmount <= 0) {
      setResultText("Bet amount must be greater than 0");
      setShowResult(true);
      return false;
    }

    setIsFlipping(true);
    setShowResult(false);

    try {
      const response = await placeCoinflipBet({
        betAmount,
        choice: sideForThisFlip,
      });

      const data = (response as any).data || response;

      if (!data || !data.result) {
        setIsFlipping(false);
        setResultText("Something went wrong: Missing result.");
        setShowResult(true);
        return false;
      }

      const normalizedResult: CoinSide = String(data.result).toLowerCase() === "heads" ? "heads" : "tails";

      const spins = 4;
      const desiredAngle = normalizedResult === "heads" ? 0 : 180;
      setCoinRotation((prev) => {
        const normalizedPrev = ((prev % 360) + 360) % 360;
        const deltaToDesired = (desiredAngle - normalizedPrev + 360) % 360;
        const extraRotation = spins * 360 + deltaToDesired;
        return prev + extraRotation;
      });

      playCoinFlipSound();

      setTimeout(() => {
        setIsFlipping(false);
        if (data.isWin) playCoinFlipWin();
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
      }, 1200);

      const stored: CoinHistoryItem[] = JSON.parse(sessionStorage.getItem("coin-history") || "[]");
      const updatedHistory = [...stored, data].slice(-8);
      sessionStorage.setItem("coin-history", JSON.stringify(updatedHistory));

      await delayer(1200);
      handleHistory();

      return true;
    } catch (error: any) {
      setIsFlipping(false);
      setResultText(error?.message || "Something went wrong");
      setShowResult(true);
      return false;
    }
  };

  const handlePlaceBet = async () => {
    if (!isLoggedIn) return;

    if (!autoMode) {
      await playSingleFlip();
      return;
    }

    if (autoPlays <= 0) {
      setResultText("Please enter how many times to auto play");
      setShowResult(true);
      return;
    }

    stopAutoRef.current = false;
    setIsAutoPlaying(true);
    setAutoPlaysLeft(autoPlays);

    for (let i = 0; i < autoPlays; i++) {
      if (stopAutoRef.current) break;

      const ok = await playSingleFlip({ auto: true });
      const remaining = autoPlays - (i + 1);
      setAutoPlaysLeft(remaining);

      if (!ok) {
        break;
      }
    }

    setIsAutoPlaying(false);
    setAutoPlaysLeft(0);
  };

  const handleStopAuto = () => {
    stopAutoRef.current = true;
  };

  const handleHistory = async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const stored: CoinHistoryItem[] = JSON.parse(sessionStorage.getItem("coin-history") || "[]");
    setBetHistory(stored);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="lg:bg-[#212121] text-white rounded-xl lg:p-4 md:p-6 flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-1 flex flex-col justify-between">
          <div className="w-full flex justify-center">
            <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] flex items-center justify-center">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${coinRotation}deg)`,
                  transition: "transform 1.2s ease-in-out",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                  }}
                  className="flex items-center justify-center bg-red-500 rounded-full"
                >
                  <div className="w-[150px] h-[150px] bg-black rounded-full" />
                </div>

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: "rotateY(180deg)",
                    backfaceVisibility: "hidden",
                  }}
                  className="flex items-center justify-center bg-[#C8A2FF] rounded-full"
                >
                  <Star className="w-[150px] h-[150px] text-black fill-black" />
                </div>
              </div>
            </div>
          </div>

          <div className="wrap mt-16">
            <div className="flex flex-wrap gap-3 items-center">
              {betHistory.map((i, index) => (
                <span
                  className={`${
                    i.isWin ? "bg-primary text-secondary" : "bg-black/70 text-white/90"
                  } text-xs px-3 p-1 rounded-full`}
                  key={index}
                >
                  {i.result === "tails" ? (
                    <Star className="w-2.5 h-2.5 fill-black" />
                  ) : (
                    <FaCircle className="w-2.5 h-2.5 text-red-500" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

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
                  disabled={isFlipping || isAutoPlaying}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 rounded-full w-6 h-6 flex items-center justify-center">
                  <DollarSignIcon className="w-4 h-4 text-white" />
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
            disabled={isFlipping || isAutoPlaying}
          >
            Pick Random Side
          </button>

          <div className="flex gap-4">
            {(["heads", "tails"] as CoinSide[]).map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side)}
                disabled={isFlipping || isAutoPlaying}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border flex items-center justify-center gap-2 ${
                  selectedSide === side
                    ? "bg-[#C8A2FF] text-black"
                    : "bg-[#212121] border-white/10 text-white hover:bg-[#2A2A2A]"
                } ${isFlipping || isAutoPlaying ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {side === "heads" ? "Heads" : "Tails"}
                {side === "heads" ? (
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
                <div className="bg-emerald-600 rounded-[1000px] p-1">
                  <DollarSignIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Automatic Mode</span>
              <button
                type="button"
                onClick={() => {
                  if (isFlipping || isAutoPlaying) return;
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
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-xs text-white/60">Number of Plays</p>
                  <div className="bg-[#212121] rounded-lg p-2 flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={autoPlays}
                      onChange={(e) => setAutoPlays(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-white text-xs"
                      disabled={isFlipping || isAutoPlaying}
                    />
                  </div>
                  {isAutoPlaying && autoPlaysLeft >= 0 && (
                    <p className="text-[11px] text-white/60">
                      Auto playing... {autoPlays - autoPlaysLeft}/{autoPlays}
                    </p>
                  )}
                </div>

                {isAutoPlaying && (
                  <button
                    type="button"
                    onClick={handleStopAuto}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white self-start"
                  >
                    Stop Auto
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handlePlaceBet}
            disabled={isFlipping || isAutoPlaying || (!selectedSide && !autoMode) || !isLoggedIn}
            className={`bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-[12px] py-2 transition ${
              isFlipping || isAutoPlaying ? "opacity-50 cursor-not-allowed" : ""
            } disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center`}
          >
            {!isLoggedIn ? (
              "Login to Play"
            ) : isFlipping || isAutoPlaying ? (
              <TbLoader2 className="animate-spin" size={22} />
            ) : autoMode ? (
              "Start Auto Play"
            ) : (
              "Play"
            )}
          </button>
        </div>
      </div>

      {showResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl text-white text-center max-w-xs w-full">
            <p className="text-lg font-semibold mb-4">{resultText}</p>
            <button
              onClick={() => {
                handleHistory();
                setShowResult(false);
                queryClient.invalidateQueries({ queryKey: ["user-data"] });
              }}
              className="bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black font-semibold rounded-full px-6 py-2 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="w-full mt-10">
        <div className="flex w-full justify-between items-center">
          <div className="mb-5 inline-flex items-center rounded-full bg-black/40 p-2">
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
              className="rounded-lg flex justify-center items-center gap-2 px-4 p-2 bg-black/70 hover:bg-black/30 transition text-white/50 hover:text-white"
              onClick={() => setOpenFairness(true)}
            >
              Fairness
              <FaShieldAlt size={14} />
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
              title="How To Play Coin Flip"
              text={
                "Choose either Heads or Tails\n" +
                "Enter the amount you want to bet\n" +
                "Click Play to flip the coin and generate a provably fair result\n" +
                "If the coin lands on the side you picked, you win your bet multiplied by the displayed payout\n" +
                "If it lands on the opposite side, you lose the amount you staked\n" +
                "You can use Auto Play to run multiple flips in a row, but remember every flip is an independent game"
              }
            />
            <FairnessModal open={openFairness} onClose={() => setOpenFairness(false)} />
          </div>
        </div>

        {activeTab === "my-bets" && <CoinFlipHistoryTable />}

        {activeTab === "live-games" && <LiveCoinWins />}
      </div>
    </div>
  );
}

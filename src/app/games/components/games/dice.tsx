"use client";

import DiceRoller from "../dice-roller";
import { useState, useRef, useEffect } from "react";
import LiveDiceWins from "../../../../components/live-wins-dice";
import { placeDiceBet } from "../../../../lib/api";
import useIsLoggedIn from "../../../../hooks/useIsLoggedIn";
import { playDiceRoll } from "../../../../lib/sound-player";
import { useQueryClient } from "@tanstack/react-query";
import { FaQuestion, FaShieldAlt } from "react-icons/fa";
import InfoModal from "../info-modal";
import FairnessModal from "../fairness-modal";
import DiceHistoryTable from "../dice-history";

interface DiceHistoryItem {
  isWin: boolean;
  roll: number;
  [key: string]: any;
}

function parseNumInput(s: string): number {
  if (s === "" || s === ".") return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export default function DiceGame() {
  const [activeOdds, setActiveOdds] = useState(60.57);
  const [betAmountInput, setBetAmountInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [betType, setBetType] = useState<"over" | "under">("over");
  const [betHistory, setBetHistory] = useState<DiceHistoryItem[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isBetting, setIsBetting] = useState(false);

  const [autoMode, setAutoMode] = useState(false);
  const [autoPlaysInput, setAutoPlaysInput] = useState("");
  const betAmount = parseNumInput(betAmountInput);
  const target = Math.max(1, Math.min(99, Math.floor(parseNumInput(targetInput)) || 50));
  const autoPlays = Math.max(0, Math.min(1000, Math.floor(parseNumInput(autoPlaysInput)) || 0));
  const [autoPlaysLeft, setAutoPlaysLeft] = useState(0);
  const stopAutoRef = useRef(false);

  const [activeTab, setActiveTab] = useState("my-bets");
  const [howModal, setHowModal] = useState(false);
  const [openFairness, setOpenFairness] = useState(false);

  const tabs: { id: string; label: string }[] = [
    { id: "my-bets", label: "My Bets" },
    { id: "live-games", label: "Live Games" },
  ];

  const oddsOptions = [60.57, 30.57, 70.57, 60.7];
  const diceRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const winnableAmount = betAmount * activeOdds;

  useEffect(() => {
    handleHistory();
  }, []);

  const isLoggedIn = useIsLoggedIn();

  const handleHistory = () => {
    const stored: DiceHistoryItem[] = JSON.parse(sessionStorage.getItem("dice-history") || "[]");
    setBetHistory(stored);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runSingleBet = async (): Promise<boolean> => {
    try {
      if (diceRef.current) {
        playDiceRoll();
        diceRef.current.rollDice();
      }

      const response = await placeDiceBet({ betAmount, target, betType });
      const data = (response as any).data || response;

      setLastResult(data);

      if (diceRef.current && data && typeof data.roll === "number") {
        diceRef.current.rollToValue(data.roll, data.isWin);
      }

      const stored: DiceHistoryItem[] = JSON.parse(sessionStorage.getItem("dice-history") || "[]");
      const updatedHistory = [...stored, data].slice(-7);
      sessionStorage.setItem("dice-history", JSON.stringify(updatedHistory));
      handleHistory();
      queryClient.invalidateQueries({ queryKey: ["user-data"] });

      await sleep(1800);

      return true;
    } catch (error: any) {
      console.error("Bet Error:", error);
      alert(`Bet failed: ${error?.message || error}`);

      if (diceRef.current) {
        diceRef.current.resetDice();
      }

      return false;
    }
  };

  const handlePlaceBet = async () => {
    if (!isLoggedIn) return;

    if (!autoMode) {
      setIsBetting(true);
      await runSingleBet();
      setIsBetting(false);
      return;
    }

    if (!autoPlaysInput.trim() || autoPlays <= 0) {
      alert("Please enter how many times to auto play (1–1000)");
      return;
    }

    stopAutoRef.current = false;
    setIsBetting(true);
    setAutoPlaysLeft(autoPlays);

    for (let i = 0; i < autoPlays; i++) {
      if (stopAutoRef.current) break;

      const ok = await runSingleBet();
      const remaining = autoPlays - (i + 1);
      setAutoPlaysLeft(remaining);

      if (!ok) break;
      if (stopAutoRef.current) break;

      if (i < autoPlays - 1) {
        await sleep(2000);
      }
    }

    setIsBetting(false);
    setAutoPlaysLeft(0);
  };

  const handleStopAuto = () => {
    // Signal the loop to stop after the current bet finishes
    stopAutoRef.current = true;
  };

  useEffect(() => {
    if (diceRef.current) {
      diceRef.current.resetDice();
    }
  }, [betType]);

  return (
    <div className="p-4">
      <div className="lg:bg-[#212121] rounded-[20px] text-white flex flex-col lg:flex-row justify-between gap-8 lg:p-4 min-h-[400px]">
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex-grow flex flex-col justify-center items-center mt-5 pt-10">
            <DiceRoller
              betType={betType}
              target={target}
              ref={diceRef}
              onClick={() => {
                handleHistory();
                queryClient.invalidateQueries({ queryKey: ["user-data"] });
              }}
            />

            <div className="flex justify-center gap-4 mt-2">
              <button
                className={`px-6 py-2 rounded-lg text-xs font-medium ${
                  betType === "over"
                    ? "bg-[#C8A2FF] text-black"
                    : "bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]"
                }`}
                onClick={() => setBetType("over")}
                disabled={isBetting}
              >
                Roll Over
              </button>
              <button
                className={`px-6 py-2 rounded-lg text-xs font-medium ${
                  betType === "under"
                    ? "bg-[#C8A2FF] text-black"
                    : "bg-[#212121] border border-white/10 text-white hover:bg-[#2A2A2A]"
                }`}
                onClick={() => setBetType("under")}
                disabled={isBetting}
              >
                Roll Under
              </button>
            </div>

            <div className="wrap mt-16">
              <div className="flex flex-wrap gap-3 items-center w-full">
                {betHistory.map((i, index) => (
                  <span
                    className={`${
                      i.isWin ? "bg-primary text-secondary" : "bg-black/70 text-white/90"
                    } text-xs px-3 p-1 rounded-full`}
                    key={index}
                  >
                    {typeof i.roll === "number" ? i.roll.toFixed(2) : i.roll}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full grid grid-cols-3 bg-white/10 rounded-lg mt-3">
              <div className="p-4 rounded-lg text-center">
                <span className="text-xs text-white/60 text-center justify-center">Multiplier</span>
                <p className="bg-[#212121] h-10 flex items-center justify-center border border-white/10 rounded-lg px-3 py-2 lg:text-base text-xs font-semibold">
                  {(0.99 / ((betType === "over" ? 100 - target : target) / 100)).toFixed(3)}
                </p>
              </div>

              <div className="p-4 rounded-lg text-center">
                <span className="text-xs text-white/60 text-center">Roll {betType === "over" ? "Over" : "Under"}</span>
                <div className="bg-[#212121] h-10 flex items-center border border-white/10 rounded-lg px-3 py-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={targetInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d*$/.test(v)) setTargetInput(v);
                    }}
                    placeholder="50"
                    className="w-full bg-transparent lg:text-base text-xs font-semibold text-center outline-none"
                    disabled={isBetting}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg text-center">
                <span className="text-xs text-white/60 text-center">Win Chance</span>
                <p className="bg-[#212121] h-10 flex items-center justify-center border border-white/10 rounded-lg px-3 py-2 lg:text-base text-xs font-semibold">
                  {(betType === "over" ? 100 - target : target).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[375px] p-4 gap-6 bg-[#1c1c1c] border border-white/10 rounded-lg">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="flex flex-col">
              <p className="text-sm text-white/60 mb-1">Bet Amount</p>
              <div className="flex items-center bg-[#212121] rounded-lg p-3">
                <input
                  type="text"
                  inputMode="decimal"
                  value={betAmountInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d*$/.test(v)) setBetAmountInput(v);
                  }}
                  placeholder="0"
                  className="w-full bg-transparent outline-none text-white text-sm"
                  disabled={isBetting}
                />
              </div>
            </div>

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

          <div className="mt-4 border-t border-white/10 pt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Automatic Mode</span>
              <button
                type="button"
                onClick={() => {
                  if (isBetting) return;
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
              <div className="flex flex-col">
                <p className="text-xs text-white/60 mb-1">Number of Plays</p>
                <div className="flex items-center bg-[#212121] rounded-lg p-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={autoPlaysInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d+$/.test(v)) setAutoPlaysInput(v);
                    }}
                    placeholder="0"
                    className="w-full bg-transparent outline-none text-white text-xs"
                    disabled={isBetting}
                  />
                </div>
                {isBetting && autoPlaysLeft > 0 && (
                  <p className="text-[11px] text-white/60 mt-1">
                    Auto playing... {autoPlays! - autoPlaysLeft}/{autoPlays}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={autoMode && isBetting ? handleStopAuto : handlePlaceBet}
            disabled={!isLoggedIn || (!autoMode && isBetting)}
            className={`w-full mt-5 rounded-[10px] p-2 text-sm lg:py-3 font-semibold ${
              autoMode && isBetting ? "bg-red-500" : "bg-[#C8A2FF]"
            } text-black disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {!isLoggedIn
              ? "Login to Play"
              : autoMode && isBetting
                ? "Stop Auto"
                : isBetting
                  ? autoMode
                    ? "Auto Playing..."
                    : "Placing Bet..."
                  : autoMode
                    ? "Start Auto Play"
                    : "Play"}
          </button>
        </div>
      </div>

      <div className="w-full mt-10 space-y-4">
        <div className="flex w-full justify-between items-center">
          <div className=" inline-flex items-center rounded-full bg-black/40 p-2">
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

        {activeTab === "my-bets" && <DiceHistoryTable />}

        {activeTab === "live-games" && <LiveDiceWins />}
      </div>
    </div>
  );
}

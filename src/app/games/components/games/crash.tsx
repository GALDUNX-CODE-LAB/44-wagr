"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import LiveCrashWns from "../../../../components/live-wins-crash";
import { getCrashHistory, placeCrashBet } from "../../../../lib/api";
import useCrashSocket from "../../../../hooks/useCrashSocket";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useIsLoggedIn from "../../../../hooks/useIsLoggedIn";
import { useUser } from "../../../../hooks/useUserData";

type Round = { roundId: string; crashPoint: number } | null;
type BetStatus = "none" | "placed" | "cashed" | "lost";

interface MyBet {
  roundId: string;
  stake: number;
  autoCashout: number;
  status: BetStatus;
  cashedAt?: number;
  payout?: number;
  profit?: number;
}

function parseNumInput(s: string): number {
  if (s === "" || s === ".") return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export default function CrashGame() {
  const ROUND_DURATION = 10000;

  const [betAmountInput, setBetAmountInput] = useState("");
  const [autoCashoutInput, setAutoCashoutInput] = useState("");
  const betAmount = parseNumInput(betAmountInput);
  const autoCashout = Math.max(1, parseNumInput(autoCashoutInput) || 1);
  const [currentRound, setCurrentRound] = useState<Round>(null);
  const [displayMultiplier, setDisplayMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [betTimeLeft, setBetTimeLeft] = useState(ROUND_DURATION);
  const [bettingOpen, setBettingOpen] = useState(false);
  const [nextRoundId, setNextRoundId] = useState("");
  const [myBet, setMyBet] = useState<MyBet | null>(null);

  console.log(myBet);

  const simRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<number | null>(null);
  const refetchedForCashedRef = useRef<string | null>(null);

  const queryClient = useQueryClient();

  const onSocketMessage = (msg: any) => {
    if (msg?.event !== "crash-result" || !msg.data) return;
    const { newRound, roundId, crashPoint } = msg.data;

    if (newRound) {
      setNextRoundId(roundId ?? "");
      setBettingOpen(true);
      setCurrentRound(null);
      setBetTimeLeft(ROUND_DURATION);
    } else {
      setBettingOpen(false);
      setTimeLeft(ROUND_DURATION);
      const point = Number(crashPoint) || 1;
      setCurrentRound({ roundId: roundId ?? "", crashPoint: point });
      setDisplayMultiplier(1);
      setMyBet((prev) => {
        if (!prev || prev.roundId !== roundId || prev.status !== "placed") return prev;
        if (point < prev.autoCashout)
          return { ...prev, status: "lost", payout: 0, profit: Number((-prev.stake).toFixed(6)) };
        return prev;
      });
      queryClient.refetchQueries({ queryKey: ["user-data"] });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["crash-history"] });
      }, ROUND_DURATION);
    }
  };

  const {
    status: wsStatus,
    error: wsError,
    retries,
    manualReconnect,
  } = useCrashSocket(onSocketMessage, {
    heartbeatMs: 25000,
    maxRetries: 4,
  });

  const enableSimulation = wsStatus !== "open" && retries >= 4;
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["crash-history"],
    queryFn: getCrashHistory,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  console.log(history, "Crash Historyy");
  useEffect(() => {
    if (!currentRound || currentRound.crashPoint <= 0) return;
    const start = Date.now();
    const target = currentRound.crashPoint;

    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= ROUND_DURATION) {
        setDisplayMultiplier(target);
      } else {
        const progress = elapsed / ROUND_DURATION;
        const value = 1 + (target - 1) * progress;
        setDisplayMultiplier(parseFloat(value.toFixed(2)));
        tickRef.current = requestAnimationFrame(tick);
      }
    };

    tick();
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
    };
  }, [currentRound]);

  useEffect(() => {
    if (!currentRound) return;
    if (bettingOpen && currentRound) setMyBet(null);
    const interval = setInterval(() => {
      if (!bettingOpen) setTimeLeft((prev) => Math.max(prev - 100, 0));
      else setBetTimeLeft((prev) => Math.max(prev - 100, 0));
    }, 100);
    return () => clearInterval(interval);
  }, [currentRound, bettingOpen]);

  // Countdown when waiting for next round (no round yet, e.g. initial load)
  useEffect(() => {
    if (currentRound !== null || bettingOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? ROUND_DURATION : Math.max(prev - 100, 0)));
    }, 100);
    return () => clearInterval(interval);
  }, [currentRound, bettingOpen]);

  useEffect(() => {
    if (!enableSimulation) {
      if (simRef.current) {
        clearInterval(simRef.current);
        simRef.current = null;
      }
      return;
    }

    const newRound = () => {
      const rid = `SIM-${Date.now()}`;
      const crashPoint = Number((Math.random() * 8 + 1.15).toFixed(2));
      setBettingOpen(true);
      setNextRoundId(rid);
      setCurrentRound({ roundId: rid, crashPoint });
      setDisplayMultiplier(1);
      setBetTimeLeft(ROUND_DURATION);

      setTimeout(() => {
        setBettingOpen(false);
        setTimeLeft(ROUND_DURATION);
      }, 2500);
    };

    newRound();
    simRef.current = setInterval(newRound, ROUND_DURATION + 1500);

    return () => {
      if (simRef.current) clearInterval(simRef.current);
      simRef.current = null;
    };
  }, [enableSimulation]);

  useEffect(() => {
    if (!currentRound || !myBet) return;
    if (myBet.status !== "placed") return;
    if (currentRound.roundId !== myBet.roundId) return;

    if (displayMultiplier >= myBet.autoCashout) {
      const payout = Number((myBet.stake * myBet.autoCashout).toFixed(6));
      const profit = Number((payout - myBet.stake).toFixed(6));
      setMyBet((prev) =>
        prev
          ? {
              ...prev,
              status: "cashed",
              cashedAt: Number(displayMultiplier.toFixed(2)),
              payout,
              profit,
            }
          : prev
      );
      if (refetchedForCashedRef.current !== myBet.roundId) {
        refetchedForCashedRef.current = myBet.roundId;
        queryClient.refetchQueries({ queryKey: ["user-data"] });
      }
    }
  }, [displayMultiplier, bettingOpen, currentRound, myBet]);

  useEffect(() => {
    if (!currentRound || !myBet) return;
    if (myBet.status !== "placed") return;
    if (currentRound.roundId !== myBet.roundId) return;

    if (bettingOpen) {
      const lost = currentRound.crashPoint < myBet.autoCashout;
      if (lost) {
        setMyBet((prev) =>
          prev
            ? {
                ...prev,
                status: "lost",
                payout: 0,
                profit: Number((-prev.stake).toFixed(6)),
              }
            : prev
        );
        queryClient.refetchQueries({ queryKey: ["user-data"] });
      }
    }
  }, [bettingOpen, currentRound, myBet]);

  const hasCookie = useIsLoggedIn();
  const { id: userId } = useUser();
  const isLoggedIn = hasCookie || !!userId;

  const bettingDisabledReason = useMemo(() => {
    if (!isLoggedIn) return "Login to play";
    if (!bettingOpen) return "Betting closed";
    if (!nextRoundId) return "Waiting for next round";
    if (myBet && myBet.status === "placed" && myBet.roundId === nextRoundId) return "Bet already locked";
    return null;
  }, [isLoggedIn, bettingOpen, nextRoundId, myBet]);

  const handlePlaceBet = async () => {
    if (bettingDisabledReason) return;
    const stake = parseNumInput(betAmountInput);
    const cashout = Math.max(1, parseNumInput(autoCashoutInput) || 1);
    if (stake <= 0) {
      return; // could toast "Enter bet amount > 0"
    }
    try {
      await placeCrashBet({ stake, autoCashout: cashout });
    } catch {}
    setMyBet({
      roundId: nextRoundId,
      stake,
      autoCashout: cashout,
      status: "placed",
    });

    queryClient.refetchQueries({ queryKey: ["user-data"] });
  };

  const formatTime = (ms: number) => `${Math.ceil(ms / 1000)}s`;

  return (
    <div className="p-4 text-white">
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            wsStatus === "open" ? "bg-green-500" : wsStatus === "connecting" ? "bg-yellow-500" : "bg-red-500"
          }`}
        />

        <span className="uppercase tracking-wide">{wsStatus}</span>
        {wsError && <span className="text-red-400">• {wsError}</span>}
        {wsStatus !== "open" && (
          <button
            onClick={manualReconnect}
            className="ml-3 rounded bg-[#212121] px-2 py-1 text-white/80 hover:bg-[#2a2a2a]"
          >
            Retry
          </button>
        )}
        {enableSimulation && <span className="ml-2 rounded bg-amber-500/10 px-2 py-1 text-amber-400">Simulation</span>}

        <div className="flex gap-3 items-center">
          {history?.map((i: number, index: number) => (
            <span
              className={` ${
                index === 0 ? "bg-primary text-black" : "text-white/70 bg-black/70 "
              } rounded-2xl p-1 px-3 text-xs`}
              key={index}
            >
              {i}x
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="mb-4 font-mono text-sm lg:text-base">
            Round: {currentRound?.roundId || "--"} |{" "}
            {!bettingOpen ? <>Time Left: {formatTime(timeLeft)}</> : <>Lock window: {formatTime(betTimeLeft)}</>}
          </div>

          <div className="h-56 sm:h-64 flex flex-col items-center justify-center gap-3">
            {!bettingOpen ? (
              <>
                {!currentRound ? (
                  <>
                    <p className="text-xl sm:text-2xl animate-bounce">Waiting For Next Round</p>
                    <p className="text-[#c8a2ff] text-2xl sm:text-3xl font-mono">
                      Next round in: {formatTime(timeLeft)}
                    </p>
                  </>
                ) : (
                  <div className="text-5xl sm:text-6xl font-bold text-[#c8a2ff]">{displayMultiplier.toFixed(2)}x</div>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-xl sm:text-2xl">Lock in your bet</p>
                <p className="text-[#c8a2ff] text-2xl sm:text-3xl mt-1 font-mono">{formatTime(betTimeLeft)}</p>
              </div>
            )}
          </div>

          <div className="mt-6 bg-[#1c1c1c] rounded-xl border border-white/10 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-sm">Bet Amount</p>
                <input
                  type="text"
                  inputMode="decimal"
                  value={betAmountInput}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d*$/.test(v)) setBetAmountInput(v);
                  }}
                  placeholder="0"
                  className="mt-1 p-3 bg-[#212121] text-white rounded w-full"
                />
              </div>

              <div>
                <p className="text-white/60 text-sm">Auto Cashout</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => {
                      const n = parseNumInput(autoCashoutInput) || 1;
                      setAutoCashoutInput(String(+(n + 0.1).toFixed(1)));
                    }}
                    className="p-2 rounded bg-[#212121] hover:bg-[#2b2b2b]"
                  >
                    <ChevronUp />
                  </button>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={autoCashoutInput}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d*\.?\d*$/.test(v)) setAutoCashoutInput(v);
                    }}
                    placeholder="1"
                    className="p-3 bg-[#212121] text-white rounded w-24 text-center"
                  />
                  <button
                    onClick={() => {
                      const n = parseNumInput(autoCashoutInput) || 1;
                      setAutoCashoutInput(String(Math.max(1, +(n - 0.1).toFixed(1))));
                    }}
                    className="p-2 rounded bg-[#212121] hover:bg-[#2b2b2b]"
                  >
                    <ChevronDown />
                  </button>
                </div>
              </div>

              <div className="sm:self-end">
                <button
                  onClick={handlePlaceBet}
                  disabled={!!bettingDisabledReason}
                  className={`w-full py-3 rounded-[12px] font-semibold transition ${
                    bettingDisabledReason
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-[#C8A2FF] hover:bg-[#D5B3FF] text-black"
                  }`}
                  title={bettingDisabledReason || ""}
                >
                  {bettingDisabledReason || "Lock Bet"}
                </button>
              </div>
            </div>

            {myBet && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#212121] rounded-lg p-3">
                  <p className="text-xs text-white/60">Your Stake</p>
                  <p className="text-sm font-semibold">${myBet.stake}</p>
                </div>
                <div className="bg-[#212121] rounded-lg p-3">
                  <p className="text-xs text-white/60">Auto Cashout</p>
                  <p className="text-sm font-semibold">{myBet.autoCashout}x</p>
                </div>
                <div className="bg-[#212121] rounded-lg p-3">
                  <p className="text-xs text-white/60">Status</p>
                  <p
                    className={`text-sm font-semibold ${
                      displayMultiplier > myBet.autoCashout
                        ? "text-green-400"
                        : !bettingOpen
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {!bettingOpen && `Flying… ${displayMultiplier.toFixed(2)}x`}
                    {bettingOpen && `awaiting result`}
                  </p>
                </div>

                {(myBet.status === "cashed" || myBet.status === "lost") && (
                  <>
                    <div className="bg-[#212121] rounded-lg p-3">
                      <p className="text-xs text-white/60">Payout</p>
                      <p className={`text-sm font-semibold `}>{(myBet.stake * myBet.autoCashout).toFixed(3)} </p>
                    </div>
                    <div className="bg-[#212121] rounded-lg p-3">
                      <p className="text-xs text-white/60">Profit</p>
                      <p
                        className={`text-sm font-semibold ${
                          displayMultiplier >= myBet.autoCashout ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {bettingOpen ? "-" : myBet.autoCashout < displayMultiplier ? "Won" : "Loss"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:bg-[#212121] lg:block hidden lg:p-6 rounded-lg w-full">
          <LiveCrashWns roundId={currentRound?.roundId || null} multiplier={displayMultiplier} betEnd={bettingOpen} />
        </div>
      </div>

      <div className="lg:bg-[#212121] lg:p-6 block py-6 pb-16 lg:hidden rounded-lg w-full">
        <LiveCrashWns roundId={currentRound?.roundId || null} multiplier={displayMultiplier} betEnd={bettingOpen} />
      </div>
    </div>
  );
}

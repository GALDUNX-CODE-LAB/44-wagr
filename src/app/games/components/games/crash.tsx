"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import LiveCrashWns from "../../../../components/live-wins-crash";
import { placeCrashBet } from "../../../../lib/api";
import useCrashSocket from "../../../../hooks/useCrashSocket";

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

export default function CrashGame() {
  const ROUND_DURATION = 10000;

  const [betAmount, setBetAmount] = useState(0.025);
  const [autoCashout, setAutoCashout] = useState(2.5);
  const [currentRound, setCurrentRound] = useState<Round>(null);
  const [displayMultiplier, setDisplayMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [betTimeLeft, setBetTimeLeft] = useState(ROUND_DURATION);
  const [bettingOpen, setBettingOpen] = useState(false);
  const [nextRoundId, setNextRoundId] = useState("");
  const [myBet, setMyBet] = useState<MyBet | null>(null);

  const simRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<number | null>(null);

  const onSocketMessage = (msg: any) => {
    if (msg?.event === "crash-result") {
      setBettingOpen(!!msg.data?.newRound);
      if (msg.data?.newRound) setNextRoundId(msg.data.roundId);
      setCurrentRound({ roundId: msg.data?.roundId, crashPoint: msg.data?.crashPoint });
      setDisplayMultiplier(1);
      if (!msg.data?.newRound) setTimeLeft(ROUND_DURATION);
      else setBetTimeLeft(ROUND_DURATION);
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

  useEffect(() => {
    if (!currentRound) return;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= ROUND_DURATION) {
        if (currentRound) setDisplayMultiplier(currentRound.crashPoint);
      } else {
        const progress = elapsed / ROUND_DURATION;
        const value = 1 + ((currentRound?.crashPoint ?? 1) - 1) * progress;
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
    const interval = setInterval(() => {
      if (!bettingOpen) setTimeLeft((prev) => Math.max(prev - 100, 0));
      else setBetTimeLeft((prev) => Math.max(prev - 100, 0));
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

    if (!bettingOpen && displayMultiplier >= myBet.autoCashout) {
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
      }
    }
  }, [bettingOpen, currentRound, myBet]);

  const bettingDisabledReason = useMemo(() => {
    if (!bettingOpen) return "Betting closed";
    if (!nextRoundId) return "Waiting for next round";
    if (myBet && myBet.status === "placed" && myBet.roundId === nextRoundId) return "Bet already locked";
    return null;
  }, [bettingOpen, nextRoundId, myBet]);

  const handlePlaceBet = async () => {
    if (bettingDisabledReason) return;
    try {
      await placeCrashBet({ stake: betAmount, autoCashout });
    } catch {}
    setMyBet({
      roundId: nextRoundId,
      stake: betAmount,
      autoCashout,
      status: "placed",
    });
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="mb-4 font-mono text-sm lg:text-base">
            Round: {currentRound?.roundId || "--"} |{" "}
            {!bettingOpen ? <>Time Left: {formatTime(timeLeft)}</> : <>Lock window: {formatTime(betTimeLeft)}</>}
          </div>

          <div className="h-56 sm:h-64 flex items-center justify-center">
            {!bettingOpen ? (
              <div className="text-5xl sm:text-6xl font-bold text-[#c8a2ff]">{displayMultiplier.toFixed(2)}x</div>
            ) : (
              <div className="text-center">
                <p className="text-xl sm:text-2xl">Lock in your bet</p>
                <p className="text-[#c8a2ff] text-2xl sm:text-3xl mt-1">{formatTime(betTimeLeft)}</p>
              </div>
            )}
          </div>

          <div className="mt-6 bg-[#1c1c1c] rounded-xl border border-white/10 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-sm">Bet Amount</p>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="mt-1 p-3 bg-[#212121] text-white rounded w-full"
                />
              </div>

              <div>
                <p className="text-white/60 text-sm">Auto Cashout</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setAutoCashout((v) => +(v + 0.1).toFixed(1))}
                    className="p-2 rounded bg-[#212121] hover:bg-[#2b2b2b]"
                  >
                    <ChevronUp />
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={autoCashout}
                    onChange={(e) => setAutoCashout(Number(e.target.value))}
                    className="p-3 bg-[#212121] text-white rounded w-24 text-center"
                  />
                  <button
                    onClick={() => setAutoCashout((v) => Math.max(1, +(v - 0.1).toFixed(1)))}
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
                  <p className="text-sm font-semibold">{myBet.stake} BTC</p>
                </div>
                <div className="bg-[#212121] rounded-lg p-3">
                  <p className="text-xs text-white/60">Auto Cashout</p>
                  <p className="text-sm font-semibold">{myBet.autoCashout}x</p>
                </div>
                <div className="bg-[#212121] rounded-lg p-3">
                  <p className="text-xs text-white/60">Status</p>
                  <p
                    className={`text-sm font-semibold ${
                      myBet.status === "cashed"
                        ? "text-green-400"
                        : myBet.status === "lost"
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {myBet.status === "placed" && !bettingOpen
                      ? `Flying… ${displayMultiplier.toFixed(2)}x`
                      : myBet.status === "placed"
                      ? "Locked"
                      : myBet.status === "cashed"
                      ? `Cashed at ${myBet.cashedAt?.toFixed(2)}x`
                      : myBet.status === "lost"
                      ? "Lost"
                      : "—"}
                  </p>
                </div>

                {(myBet.status === "cashed" || myBet.status === "lost") && (
                  <>
                    <div className="bg-[#212121] rounded-lg p-3">
                      <p className="text-xs text-white/60">Payout</p>
                      <p className="text-sm font-semibold">{(myBet.payout ?? 0).toFixed(6)} BTC</p>
                    </div>
                    <div className="bg-[#212121] rounded-lg p-3">
                      <p className="text-xs text-white/60">Profit</p>
                      <p
                        className={`text-sm font-semibold ${
                          (myBet.profit ?? 0) >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {(myBet.profit ?? 0).toFixed(6)} BTC
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

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bitcoin, ChevronUp, ChevronDown } from "lucide-react";
// import LiveWatchTables from "../../../../components/live-watch";
import LiveCrashWns from "../../../../components/live-wins-crash";
import { placeCrashBet } from "../../../../lib/api";

export default function CrashGame() {
  const router = useRouter();
  const ws = useRef<WebSocket | null>(null);
  const ROUND_DURATION = 10000;

  const [betAmount, setBetAmount] = useState(0.025);
  const [autoCashout, setAutoCashout] = useState(2.5);

  const [currentRound, setCurrentRound] = useState<{ roundId: string; crashPoint: number } | null>(null);
  const [displayMultiplier, setDisplayMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [betTimeLeft, setBetTimeLeft] = useState(ROUND_DURATION);
  const [betEnd, setBetEnd] = useState(false);
  const [nextRound, setNextRound] = useState("");

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS;
    if (!wsUrl) return;
    const socket = new WebSocket(wsUrl);
    ws.current = socket;
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.event === "crash-result") {
        setBetEnd(msg.data.newRound);
        if (msg.data.newRound) setNextRound(msg.data.roundId);
        setCurrentRound({ roundId: msg.data.roundId, crashPoint: msg.data.crashPoint });
        setDisplayMultiplier(1);
        !msg.data.newRound ? setTimeLeft(ROUND_DURATION) : setBetTimeLeft(ROUND_DURATION);
      }
    };
    return () => {
      ws.current?.close();
      ws.current = null;
    };
  }, []);

  useEffect(() => {
    if (!currentRound) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= ROUND_DURATION) {
        setDisplayMultiplier(currentRound.crashPoint);
      } else {
        const progress = elapsed / ROUND_DURATION;
        const value = 1 + (currentRound.crashPoint - 1) * progress;
        setDisplayMultiplier(parseFloat(value.toFixed(2)));
        requestAnimationFrame(tick);
      }
    };
    tick();
  }, [currentRound]);

  useEffect(() => {
    if (!currentRound) return;
    const interval = setInterval(() => {
      !betEnd ? setTimeLeft((prev) => Math.max(prev - 100, 0)) : setBetTimeLeft((prev) => Math.max(prev - 100, 0));
    }, 100);
    return () => clearInterval(interval);
  }, [currentRound]);

  const handlePlaceBet = () => {
    try {
      placeCrashBet({ stake: betAmount, autoCashout });
    } catch (error) {
      console.log(error, "error in playing stake game");
    }
  };

  const formatTime = (ms: number) => `${Math.ceil(ms / 1000)}s`;

  return (
    <div className="p-4">
      <div className="grid grid-cols-3">
        <div className="wrap w-full col-span-2">
          <div className="mb-6 text-white font-mono">
            Round: {currentRound?.roundId || "--"} | Time Left: {formatTime(timeLeft)}
          </div>

          <div className="h-64 flex items-center justify-center text-6xl text-[#c8a2ff]">
            {!betEnd ? (
              `${displayMultiplier.toFixed(2)}x`
            ) : (
              <p className="animate-bounce text-2xl">
                {" "}
                Lock in your bet <span className="animate-ping">{formatTime(betTimeLeft)}</span>
              </p>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <div>
              <p className="text-white/60">Bet Amount</p>
              <input
                type="number"
                step="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="mt-1 p-2 bg-[#212121] text-white rounded"
              />
            </div>
            <div>
              <p className="text-white/60">Cashout At</p>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={() => setAutoCashout((v) => +(v + 0.1).toFixed(1))}>
                  <ChevronUp />
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(Number(e.target.value))}
                  className="p-2 bg-[#212121] text-white rounded w-20"
                />
                <button onClick={() => setAutoCashout((v) => Math.max(1, +(v - 0.1).toFixed(1)))}>
                  <ChevronDown />
                </button>
              </div>
            </div>
            <div className="mt-auto">
              <button
                onClick={handlePlaceBet}
                className={`${!betEnd ? "bg-gray-500" : "bg-[#C8A2FF]"}  text-black px-6 py-2 rounded`}
                disabled={!betEnd}
              >
                Bet
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-[#212121] p-6 rounded-lg">
          <LiveCrashWns roundId={nextRound} multiplier={displayMultiplier} betEnd={betEnd} />
        </div>
      </div>

      {/* <div className="mt-10 bg-[#212121] p-6 rounded-lg">
        <LiveCrashWns />
      </div> */}
    </div>
  );
}

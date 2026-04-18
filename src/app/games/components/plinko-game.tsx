"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Difficulty, GameMode, BetResult, MULTIPLIERS } from "../../../interfaces/interface";
import PlinkoBoard, { PlinkoBoardHandle } from "./plinko-board";
import PlinkoControls from "./plinko-controls";
import PlinkoResultToast from "./plinko-result-toast";

const STARTING_BALANCE = 1000;

export default function PlinkoGame() {
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [rows, setRows] = useState(16);
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [results, setResults] = useState<BetResult[]>([]);
  const [lastResult, setLastResult] = useState<BetResult | null>(null);
  const [activeBucketIndex, setActiveBucketIndex] = useState<number | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoCount, setAutoCount] = useState(10);
  const autoRemainingRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const boardRef = useRef<PlinkoBoardHandle>(null);

  const handleBallLand = useCallback(
    (bucketIndex: number, multiplier: number, payout: number) => {
      setActiveBucketIndex(bucketIndex);
      setTimeout(() => setActiveBucketIndex(null), 500);

      const result: BetResult = {
        id: `${Date.now()}-${Math.random()}`,
        bucketIndex,
        multiplier,
        betAmount,
        payout,
        timestamp: Date.now(),
      };

      setResults((prev) => [...prev, result]);
      setLastResult(result);
      setBalance((prev) => +(prev + payout).toFixed(2));
    },
    [betAmount],
  );

  const handleBet = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setBalance((prev) => +(prev - betAmount).toFixed(2));
    boardRef.current?.dropBall();
  }, [betAmount, balance]);

  const handleAutoToggle = useCallback(() => {
    if (isAutoRunning) {
      setIsAutoRunning(false);
      autoRemainingRef.current = 0;
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    } else {
      setIsAutoRunning(true);
      autoRemainingRef.current = autoCount;

      const runNext = () => {
        if (autoRemainingRef.current <= 0) {
          setIsAutoRunning(false);
          return;
        }
        autoRemainingRef.current--;
        setBalance((prev) => {
          const next = +(prev - betAmount).toFixed(2);
          if (next < 0) {
            setIsAutoRunning(false);
            autoRemainingRef.current = 0;
            return prev;
          }
          return next;
        });
        boardRef.current?.dropBall();
        autoTimerRef.current = setTimeout(runNext, 800);
      };
      runNext();
    }
  }, [isAutoRunning, autoCount, betAmount]);

  useEffect(() => {
    if (balance < betAmount && isAutoRunning) {
      setIsAutoRunning(false);
      autoRemainingRef.current = 0;
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    }
  }, [balance, betAmount, isAutoRunning]);

  useEffect(
    () => () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    },
    [],
  );

  return (
    <div
      className="flex w-full max-w-[1600px] mx-auto min-h-0 overflow-hidden rounded-2xl border border-white/10 font-sans max-h-[min(520px,calc(100svh-7.5rem))] h-[min(520px,calc(100svh-7.5rem))]"
      style={{
        background: "#131212",
      }}
    >
      <div
        className="flex-shrink-0 h-full min-h-0 overflow-hidden flex flex-col w-[220px] sm:w-[240px]"
        style={{
          borderRight: "1px solid rgba(200,162,255,0.12)",
        }}
      >
        <PlinkoControls
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          rows={rows}
          onRowsChange={setRows}
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          onBet={handleBet}
          isAutoRunning={isAutoRunning}
          onAutoToggle={handleAutoToggle}
          autoCount={autoCount}
          onAutoCountChange={setAutoCount}
          results={results}
        />
      </div>

      <div className="flex-1 min-h-0 min-w-0 relative overflow-hidden bg-[#1c1c1c]">
        <PlinkoBoard
          ref={boardRef}
          rows={rows}
          difficulty={difficulty}
          betAmount={betAmount}
          onBallLand={handleBallLand}
          activeBucketIndex={activeBucketIndex}
        />

        {lastResult && lastResult.multiplier >= 10 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(200,162,255,0.12) 0%, transparent 70%)",
            }}
          />
        )}
      </div>

      <PlinkoResultToast result={lastResult} />
    </div>
  );
}

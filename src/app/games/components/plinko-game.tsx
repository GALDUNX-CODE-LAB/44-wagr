"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Difficulty, GameMode, BetResult } from "../../../interfaces/interface";
import PlinkoBoard, { PlinkoBoardHandle } from "./plinko-board";
import PlinkoControls from "./plinko-controls";
import PlinkoResultToast from "./plinko-result-toast";
import { placePlinkoBet } from "../../../lib/api";
import { useUser } from "../../../hooks/useUserData";
import { useQueryClient } from "@tanstack/react-query";
import useIsLoggedIn from "../../../hooks/useIsLoggedIn";
import LoginModal from "../../../components/login-modal";
import { playPlinkoDrop, playPlinkoWin } from "../../../lib/sound-player";

export default function PlinkoGame() {
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [rows, setRows] = useState(16);
  const [lastResult, setLastResult] = useState<BetResult | null>(null);
  const [activeBucketIndex, setActiveBucketIndex] = useState<number | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoCount, setAutoCount] = useState(10);
  const [isBetting, setIsBetting] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const autoRemainingRef = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef<PlinkoBoardHandle>(null);
  // Holds the exact server-confirmed result, applied on ball land
  const pendingResultRef = useRef<{ bucketIndex: number; multiplier: number; payout: number; newBalance: number } | null>(null);

  const { balance } = useUser();
  const queryClient = useQueryClient();
  const isLoggedIn = useIsLoggedIn();

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  }, []);

  const handleBallLand = useCallback(
    (_physBucket: number, _physMult: number, _physPayout: number) => {
      // Always use the server-confirmed result — physics is visual only
      const srv = pendingResultRef.current;
      pendingResultRef.current = null;

      const bucketIndex = srv?.bucketIndex ?? _physBucket;
      const multiplier  = srv?.multiplier  ?? _physMult;
      const payout      = srv?.payout      ?? _physPayout;

      setActiveBucketIndex(bucketIndex);
      setTimeout(() => setActiveBucketIndex(null), 500);

      if (srv?.newBalance !== undefined) {
        queryClient.setQueryData(["user-data"], (old: any) => {
          if (!old) return old;
          return { ...old, balance: srv.newBalance };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["plinko-history"] });

      const result: BetResult = {
        id: `${Date.now()}-${Math.random()}`,
        bucketIndex,
        multiplier,
        betAmount,
        payout,
        timestamp: Date.now(),
        won: payout >= betAmount,
      };

      setLastResult(result);
      if (result.won) playPlinkoWin();
    },
    [betAmount, queryClient],
  );

  const handleBet = useCallback(async () => {
    if (!isLoggedIn || betAmount <= 0 || isBetting) return;
    if (betAmount > balance) {
      showError("Insufficient balance");
      return;
    }

    setIsBetting(true);
    try {
      const response: any = await placePlinkoBet({ betAmount, rows, difficulty });
      const data = response?.data ?? response;

      pendingResultRef.current = {
        bucketIndex: data?.bucketIndex ?? 0,
        multiplier:  data?.multiplier  ?? 1,
        payout:      data?.payout      ?? 0,
        newBalance:  data?.newBalance  ?? 0,
      };

      playPlinkoDrop(); // ball drop
      boardRef.current?.dropBall(data?.bucketIndex ?? 0);
    } catch (err: any) {
      showError(err?.message || "Bet failed");
    } finally {
      setIsBetting(false);
    }
  }, [isLoggedIn, betAmount, rows, difficulty, balance, isBetting, queryClient, showError]);

  const handleAutoToggle = useCallback(() => {
    if (isAutoRunning) {
      setIsAutoRunning(false);
      autoRemainingRef.current = 0;
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    } else {
      setIsAutoRunning(true);
      autoRemainingRef.current = autoCount;

      const runNext = async () => {
        if (autoRemainingRef.current <= 0) {
          setIsAutoRunning(false);
          return;
        }
        autoRemainingRef.current--;

        if (!isLoggedIn) {
          setIsAutoRunning(false);
          autoRemainingRef.current = 0;
          return;
        }

        // Read latest balance from cache each iteration
        const cached: any = queryClient.getQueryData(["user-data"]);
        const latestBalance: number = cached?.balance ?? 0;
        if (betAmount > latestBalance) {
          showError("Insufficient balance");
          setIsAutoRunning(false);
          autoRemainingRef.current = 0;
          return;
        }

        try {
          const response: any = await placePlinkoBet({ betAmount, rows, difficulty });
          const data = response?.data ?? response;

          pendingResultRef.current = {
            bucketIndex: data?.bucketIndex ?? 0,
            multiplier:  data?.multiplier  ?? 1,
            payout:      data?.payout      ?? 0,
            newBalance:  data?.newBalance  ?? 0,
          };

          playPlinkoDrop(); // ball drop
      boardRef.current?.dropBall(data?.bucketIndex ?? 0);
        } catch (err: any) {
          showError(err?.message || "Bet failed");
          setIsAutoRunning(false);
          autoRemainingRef.current = 0;
          return;
        }

        autoTimerRef.current = setTimeout(runNext, 900);
      };
      runNext();
    }
  }, [isAutoRunning, autoCount, betAmount, rows, difficulty, isLoggedIn, queryClient, showError]);

  useEffect(
    () => () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    },
    [],
  );

  return (
    <>
      <div
        className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] lg:mt-4 md:mt-10 mx-auto min-h-0 rounded-2xl border border-white/10 font-sans md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))] md:overflow-hidden"
        style={{ background: "#131212" }}
      >
        <div className="flex-1 min-h-0 md:flex-none md:h-full h-auto overflow-y-auto overflow-x-hidden flex flex-col w-full md:w-[220px] lg:w-[240px] border-t border-[rgba(200,162,255,0.12)] md:border-t-0 md:border-r md:border-r-[rgba(200,162,255,0.12)] pt-2 md:pt-0 md:overflow-hidden">
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
            isBetting={isBetting}
            isLoggedIn={isLoggedIn}
            onLoginClick={() => setLoginModalOpen(true)}
            errorMsg={errorMsg}
          />
        </div>

        <div className="flex-shrink-0 min-h-[50vh] w-full md:h-full md:min-h-0 md:flex-1 min-w-0 relative overflow-hidden bg-[#1c1c1c]">
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
      </div>
      <PlinkoResultToast result={lastResult} />
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}

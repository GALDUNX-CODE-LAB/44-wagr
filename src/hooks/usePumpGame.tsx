"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PumpDifficulty,
  GameMode,
  PumpGameState,
  PumpBetResult,
  MULTIPLIER_LADDERS,
} from "../interfaces/interface";
import { startPumpGame, pumpGameAction, cashoutPumpGame } from "../lib/api";
import { useUser } from "./useUserData";
import useIsLoggedIn from "./useIsLoggedIn";

export function usePumpGame() {
  const queryClient = useQueryClient();
  const { balance } = useUser();
  const isLoggedIn = useIsLoggedIn();

  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<PumpDifficulty>("hard");
  const [results, setResults] = useState<PumpBetResult[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPumping, setIsPumping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gameState, setGameState] = useState<PumpGameState>({
    phase: "idle",
    currentStep: 0,
    currentMultiplier: 1,
    betAmount: 0,
    profit: 0,
    bustedAtStep: null,
  });

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoPumpCount, setAutoPumpCount] = useState(5);
  const autoStateRef = useRef({ pumpsLeft: 0, running: false, gameId: null as string | null });

  const ladder = MULTIPLIER_LADDERS[difficulty];

  const startGame = useCallback(async () => {
    if (!isLoggedIn) { setError("Please login to play"); return; }
    if (betAmount <= 0) { setError("Enter a valid bet amount"); return; }
    if (betAmount > balance) { setError("Insufficient balance"); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res = await startPumpGame({ betAmount, difficulty });
      const { gameId: newGameId } = res.data;
      setGameId(newGameId);
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setGameState({
        phase: "playing",
        currentStep: 0,
        currentMultiplier: ladder[0],
        betAmount,
        profit: 0,
        bustedAtStep: null,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, betAmount, difficulty, balance, ladder, queryClient]);

  const pump = useCallback(async () => {
    if (!gameId || isPumping || gameState.phase !== "playing") return null;

    setIsPumping(true);
    setError(null);
    try {
      const res = await pumpGameAction({ gameId });
      const data = res.data;

      if (data.busted) {
        setGameState((prev) => ({
          ...prev,
          phase: "busted",
          bustedAtStep: data.currentStep,
          profit: -prev.betAmount,
        }));
        setResults((r) => [...r, { id: Date.now().toString(), multiplier: 0, payout: 0, betAmount, won: false }]);
        queryClient.invalidateQueries({ queryKey: ["pump-history"] });
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
        setGameId(null);
        return { busted: true };
      }

      if (data.autoCashedOut) {
        setGameState((prev) => ({
          ...prev,
          phase: "cashedout",
          currentStep: data.currentStep,
          currentMultiplier: data.multiplier,
          profit: +(data.payout - prev.betAmount).toFixed(2),
        }));
        setResults((r) => [
          ...r,
          { id: Date.now().toString(), multiplier: data.multiplier, payout: data.payout, betAmount, won: true },
        ]);
        queryClient.invalidateQueries({ queryKey: ["pump-history"] });
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
        setGameId(null);
        return { busted: false, autoCashedOut: true };
      }

      setGameState((prev) => ({
        ...prev,
        currentStep: data.currentStep,
        currentMultiplier: data.multiplier,
        profit: +(prev.betAmount * data.multiplier - prev.betAmount).toFixed(2),
      }));
      return { busted: false };
    } catch (err: any) {
      setError(err?.message || "Failed to pump");
      return null;
    } finally {
      setIsPumping(false);
    }
  }, [gameId, isPumping, gameState.phase, betAmount, queryClient]);

  const cashout = useCallback(async () => {
    if (!gameId || gameState.currentStep === 0 || gameState.phase !== "playing" || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await cashoutPumpGame({ gameId });
      const data = res.data;
      setGameState((prev) => ({
        ...prev,
        phase: "cashedout",
        profit: +(data.payout - prev.betAmount).toFixed(2),
        currentMultiplier: data.multiplier,
      }));
      setResults((r) => [
        ...r,
        { id: Date.now().toString(), multiplier: data.multiplier, payout: data.payout, betAmount, won: true },
      ]);
      queryClient.invalidateQueries({ queryKey: ["pump-history"] });
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setGameId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to cashout");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, gameState.currentStep, gameState.phase, isLoading, betAmount, queryClient]);

  const resetGame = useCallback(() => {
    setGameId(null);
    setError(null);
    setGameState({
      phase: "idle",
      currentStep: 0,
      currentMultiplier: ladder[0],
      betAmount: 0,
      profit: 0,
      bustedAtStep: null,
    });
  }, [ladder]);

  const startAuto = useCallback(async () => {
    if (!isLoggedIn) { setError("Please login to play"); return; }
    if (betAmount <= 0) { setError("Enter a valid bet amount"); return; }
    if (betAmount > balance) { setError("Insufficient balance"); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res = await startPumpGame({ betAmount, difficulty });
      const { gameId: newGameId } = res.data;
      setGameId(newGameId);
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setGameState({
        phase: "playing",
        currentStep: 0,
        currentMultiplier: ladder[0],
        betAmount,
        profit: 0,
        bustedAtStep: null,
      });
      setIsAutoRunning(true);
      autoStateRef.current = { pumpsLeft: autoPumpCount, running: true, gameId: newGameId };

      const tick = async () => {
        if (!autoStateRef.current.running || !autoStateRef.current.gameId) return;
        const currentGameId = autoStateRef.current.gameId;

        if (autoStateRef.current.pumpsLeft <= 0) {
          try {
            const cashoutRes = await cashoutPumpGame({ gameId: currentGameId });
            const cashoutData = cashoutRes.data;
            setGameState((prev) => ({
              ...prev,
              phase: "cashedout",
              profit: +(cashoutData.payout - prev.betAmount).toFixed(2),
              currentMultiplier: cashoutData.multiplier,
            }));
            setResults((r) => [
              ...r,
              { id: Date.now().toString(), multiplier: cashoutData.multiplier, payout: cashoutData.payout, betAmount, won: true },
            ]);
            queryClient.invalidateQueries({ queryKey: ["pump-history"] });
            queryClient.invalidateQueries({ queryKey: ["user-data"] });
          } catch (err: any) {
            setError(err?.message || "Auto cashout failed");
          }
          setGameId(null);
          autoStateRef.current.gameId = null;
          setIsAutoRunning(false);
          return;
        }

        try {
          const pumpRes = await pumpGameAction({ gameId: currentGameId });
          const data = pumpRes.data;

          if (data.busted) {
            setGameState((prev) => ({
              ...prev,
              phase: "busted",
              bustedAtStep: data.currentStep,
              profit: -prev.betAmount,
            }));
            setResults((r) => [...r, { id: Date.now().toString(), multiplier: 0, payout: 0, betAmount, won: false }]);
            queryClient.invalidateQueries({ queryKey: ["pump-history"] });
            queryClient.invalidateQueries({ queryKey: ["user-data"] });
            setGameId(null);
            autoStateRef.current.gameId = null;
            setIsAutoRunning(false);
            return;
          }

          if (data.autoCashedOut) {
            setGameState((prev) => ({
              ...prev,
              phase: "cashedout",
              currentStep: data.currentStep,
              currentMultiplier: data.multiplier,
              profit: +(data.payout - prev.betAmount).toFixed(2),
            }));
            setResults((r) => [
              ...r,
              { id: Date.now().toString(), multiplier: data.multiplier, payout: data.payout, betAmount, won: true },
            ]);
            queryClient.invalidateQueries({ queryKey: ["pump-history"] });
            queryClient.invalidateQueries({ queryKey: ["user-data"] });
            setGameId(null);
            autoStateRef.current.gameId = null;
            setIsAutoRunning(false);
            return;
          }

          setGameState((prev) => ({
            ...prev,
            currentStep: data.currentStep,
            currentMultiplier: data.multiplier,
            profit: +(prev.betAmount * data.multiplier - prev.betAmount).toFixed(2),
          }));
          autoStateRef.current.pumpsLeft--;
          autoTimerRef.current = setTimeout(tick, 900);
        } catch (err: any) {
          setError(err?.message || "Auto pump failed");
          setIsAutoRunning(false);
          autoStateRef.current.running = false;
        }
      };

      autoTimerRef.current = setTimeout(tick, 900);
    } catch (err: any) {
      setError(err?.message || "Failed to start auto game");
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, betAmount, difficulty, balance, autoPumpCount, ladder, queryClient]);

  const stopAuto = useCallback(() => {
    autoStateRef.current.running = false;
    setIsAutoRunning(false);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    cashout();
  }, [cashout]);

  return {
    gameMode,
    setGameMode,
    betAmount,
    setBetAmount,
    difficulty,
    setDifficulty,
    gameState,
    results,
    ladder,
    isLoading,
    isPumping,
    error,
    startGame,
    pump,
    cashout,
    resetGame,
    isAutoRunning,
    autoPumpCount,
    setAutoPumpCount,
    startAuto,
    stopAuto,
  };
}

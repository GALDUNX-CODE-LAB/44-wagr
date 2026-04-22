"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  RedlightDifficulty,
  GameMode,
  RLGLGameState,
  BetResult,
  PROGRESS_SPEED,
  MULT_INCREMENT,
  BASE_MULT,
  RED_LIGHT_WINDOW,
  FREEZE_GRACE_MS,
  RedlightBetResult,
} from "../interfaces/interface";

const STARTING_BALANCE = 1000;
const MULT_TICK_MS = 2000; // multiplier updates every 2s

export function useRLGLGame() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<RedlightDifficulty>("easy");
  const [results, setResults] = useState<RedlightBetResult[]>([]);
  const [gameState, setGameState] = useState<RLGLGameState>({
    phase: "idle",
    progress: 0,
    currentMultiplier: BASE_MULT,
    betAmount: 0,
    profit: 0,
    elapsedMs: 0,
    redLightAt: null,
    frozenAt: null,
    round: 0,
  });

  // Refs for RAF loop
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(gameState);
  const difficultyRef = useRef(difficulty);
  const lastTickRef = useRef<number>(0);
  const lastMultTickRef = useRef<number>(0);
  const redLightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eliminationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  stateRef.current = gameState;
  difficultyRef.current = difficulty;

  // ─── RAF game loop ────────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    lastTickRef.current = performance.now();
    lastMultTickRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;

      const s = stateRef.current;
      const diff = difficultyRef.current;

      if (s.phase !== "green") return;

      // Progress
      const speed = PROGRESS_SPEED[diff];
      const newProgress = Math.min(100, s.progress + (speed * dt) / 1000);

      // Multiplier tick every 2s
      let newMult = s.currentMultiplier;
      if (now - lastMultTickRef.current >= MULT_TICK_MS) {
        newMult = +(s.currentMultiplier + MULT_INCREMENT[diff]).toFixed(2);
        lastMultTickRef.current = now;
      }

      const newElapsed = s.elapsedMs + dt;

      setGameState((prev) => {
        if (prev.phase !== "green") return prev;
        return {
          ...prev,
          progress: newProgress,
          currentMultiplier: newMult,
          elapsedMs: newElapsed,
          profit: +(prev.betAmount * newMult - prev.betAmount).toFixed(2),
        };
      });

      // Reached 100% — auto cashout
      if (newProgress >= 100) {
        handleCashout();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── Red light scheduling ─────────────────────────────────────────────────
  const scheduleRedLight = useCallback(
    (diff: RedlightDifficulty) => {
      const [min, max] = RED_LIGHT_WINDOW[diff];
      const delay = min + Math.random() * (max - min);

      redLightTimerRef.current = setTimeout(() => {
        stopLoop();
        const grace = FREEZE_GRACE_MS[diff];

        setGameState((prev) => {
          if (prev.phase !== "green") return prev;
          return { ...prev, phase: "red", redLightAt: performance.now() };
        });

        // If player doesn't freeze within grace window → eliminated
        eliminationTimerRef.current = setTimeout(() => {
          setGameState((prev) => {
            if (prev.phase !== "red") return prev;
            // Eliminated
            setResults((r) => [
              ...r,
              {
                id: `${Date.now()}`,
                multiplier: 0,
                payout: 0,
                betAmount: prev.betAmount,
                won: false,
                round: prev.round,
              },
            ]);
            return { ...prev, phase: "eliminated", profit: -prev.betAmount };
          });
        }, grace);
      }, delay);
    },
    [stopLoop],
  );

  const clearTimers = useCallback(() => {
    if (redLightTimerRef.current) clearTimeout(redLightTimerRef.current);
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current);
    stopLoop();
  }, [stopLoop]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setBalance((prev) => +(prev - betAmount).toFixed(2));

    const initialState: RLGLGameState = {
      phase: "green",
      progress: 0,
      currentMultiplier: BASE_MULT,
      betAmount,
      profit: 0,
      elapsedMs: 0,
      redLightAt: null,
      frozenAt: null,
      round: 1,
    };

    setGameState(initialState);
    stateRef.current = initialState;

    startLoop();
    scheduleRedLight(difficulty);
  }, [betAmount, balance, difficulty, startLoop, scheduleRedLight]);

  const freeze = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "green" && s.phase !== "red") return;

    clearTimers();

    if (s.phase === "green") {
      // Froze during green light — safe, move to frozen (can cashout or continue)
      setGameState((prev) => ({
        ...prev,
        phase: "frozen",
        frozenAt: performance.now(),
      }));
    } else if (s.phase === "red") {
      // Froze in time during red light — safe! Continue to next round
      setGameState((prev) => ({
        ...prev,
        phase: "frozen",
        frozenAt: performance.now(),
      }));
    }
  }, [clearTimers]);

  const handleCashout = useCallback(() => {
    clearTimers();
    setGameState((prev) => {
      if (prev.phase === "eliminated" || prev.phase === "cashedout" || prev.phase === "idle") return prev;
      const payout = +(prev.betAmount * prev.currentMultiplier).toFixed(2);
      setBalance((b) => +(b + payout).toFixed(2));
      setResults((r) => [
        ...r,
        {
          id: `${Date.now()}`,
          multiplier: prev.currentMultiplier,
          payout,
          betAmount: prev.betAmount,
          won: true,
          round: prev.round,
        },
      ]);
      return { ...prev, phase: "cashedout", profit: +(payout - prev.betAmount).toFixed(2) };
    });
  }, [clearTimers]);

  const continueRun = useCallback(() => {
    // After a successful freeze, continue the run from current progress
    setGameState((prev) => {
      if (prev.phase !== "frozen") return prev;
      return { ...prev, phase: "green", round: prev.round + 1, redLightAt: null, frozenAt: null };
    });

    // Restart loop and schedule next red light
    setTimeout(() => {
      startLoop();
      scheduleRedLight(difficulty);
    }, 50);
  }, [startLoop, scheduleRedLight, difficulty]);

  const resetGame = useCallback(() => {
    clearTimers();
    setGameState({
      phase: "idle",
      progress: 0,
      currentMultiplier: BASE_MULT,
      betAmount: 0,
      profit: 0,
      elapsedMs: 0,
      redLightAt: null,
      frozenAt: null,
      round: 0,
    });
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    gameMode,
    setGameMode,
    betAmount,
    setBetAmount,
    difficulty,
    setDifficulty,
    gameState,
    results,
    startGame,
    freeze,
    handleCashout,
    continueRun,
    resetGame,
  };
}

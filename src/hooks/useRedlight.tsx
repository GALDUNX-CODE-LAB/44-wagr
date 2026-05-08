"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  RedlightDifficulty,
  GameMode,
  RLGLGameState,
  PROGRESS_SPEED,
  MULT_INCREMENT,
  BASE_MULT,
  RED_LIGHT_WINDOW,
  FREEZE_GRACE_MS,
  RedlightBetResult,
} from "../interfaces/interface";

const STARTING_BALANCE = 1000;
const MULT_TICK_MS = 2000;
// How long the red light is shown while the player is already frozen (safe pass-through)
const FROZEN_RED_DISPLAY_MS = 900;

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

  const rafRef = useRef<number | null>(null);
  const stateRef = useRef(gameState);
  const difficultyRef = useRef(difficulty);
  const lastTickRef = useRef<number>(0);
  const lastMultTickRef = useRef<number>(0);
  const redLightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eliminationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frozenRedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable ref so timers can always call the latest scheduleRedLight without stale closure issues
  const scheduleRedLightRef = useRef<(diff: RedlightDifficulty) => void>(() => {});

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

      const speed = PROGRESS_SPEED[diff];
      const newProgress = Math.min(100, s.progress + (speed * dt) / 1000);

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
  // Red lights fire continuously regardless of frozen state.
  // • During "green"  → player must freeze in time or they're eliminated
  // • During "frozen" → player is safe; show red briefly then reschedule
  const scheduleRedLight = useCallback(
    (diff: RedlightDifficulty) => {
      const [min, max] = RED_LIGHT_WINDOW[diff];
      const delay = min + Math.random() * (max - min);

      redLightTimerRef.current = setTimeout(() => {
        const s = stateRef.current;

        if (s.phase === "green") {
          // Player is running — stop loop and start the elimination countdown
          stopLoop();
          const grace = FREEZE_GRACE_MS[diff];

          setGameState((prev) => {
            if (prev.phase !== "green") return prev;
            return { ...prev, phase: "red", redLightAt: performance.now() };
          });

          eliminationTimerRef.current = setTimeout(() => {
            setGameState((prev) => {
              if (prev.phase !== "red") return prev;
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

        } else if (s.phase === "frozen") {
          // Player is already frozen — safe, but show the red light visually
          setGameState((prev) => {
            if (prev.phase !== "frozen") return prev;
            return { ...prev, phase: "frozen-red", redLightAt: performance.now() };
          });

          frozenRedTimerRef.current = setTimeout(() => {
            setGameState((prev) => {
              if (prev.phase !== "frozen-red") return prev;
              return { ...prev, phase: "frozen", redLightAt: null };
            });
            // Keep scheduling red lights continuously
            scheduleRedLightRef.current(diff);
          }, FROZEN_RED_DISPLAY_MS);
        }
        // Any other phase (idle, red, frozen-red, eliminated, cashedout): ignore
      }, delay);
    },
    [stopLoop],
  );

  scheduleRedLightRef.current = scheduleRedLight;

  const clearTimers = useCallback(() => {
    if (redLightTimerRef.current) clearTimeout(redLightTimerRef.current);
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current);
    if (frozenRedTimerRef.current) clearTimeout(frozenRedTimerRef.current);
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

    const savedDuringRed = s.phase === "red";

    // Only clear the elimination countdown; keep the red light scheduler alive
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current);
    stopLoop();

    setGameState((prev) => {
      if (prev.phase !== "green" && prev.phase !== "red") return prev;
      return { ...prev, phase: "frozen", frozenAt: performance.now() };
    });

    // If we froze during a red-light event (saved ourselves), reschedule the next
    // red light so the continuous stream continues while frozen
    if (savedDuringRed) {
      scheduleRedLightRef.current(difficultyRef.current);
    }
    // If we froze during green, the pending red light timer is still running —
    // it will fire and appear as "frozen-red" automatically
  }, [stopLoop]);

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
    // Transition back to running; the red light scheduler is already active
    // (was kept alive through freeze/frozen-red cycles)
    setGameState((prev) => {
      if (prev.phase !== "frozen") return prev;
      return { ...prev, phase: "green", round: prev.round + 1, redLightAt: null, frozenAt: null };
    });

    setTimeout(() => {
      startLoop();
    }, 50);
  }, [startLoop]);

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

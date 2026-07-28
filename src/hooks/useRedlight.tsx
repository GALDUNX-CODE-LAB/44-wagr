"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  RedlightDifficulty,
  GameMode,
  RLGLGameState,
  PROGRESS_SPEED,
  MULT_INCREMENT,
  BASE_MULT,
  RED_LIGHT_WINDOW,
  FREEZE_GRACE_MS,
  GAME_DURATION_MS,
  RedlightBetResult,
} from "../interfaces/interface";
import { startRedlightGame, cashoutRedlightGame, eliminateRedlightGame } from "../lib/api";

const MULT_TICK_MS = 2000;
const FROZEN_RED_DISPLAY_MS = 900;

export function useRLGLGame() {
  const queryClient = useQueryClient();
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
  const [gameId, setGameId] = useState<string | null>(null);
  const [serverSeedHash, setServerSeedHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(-1);

  const rafRef = useRef<number | null>(null);
  const clockRafRef = useRef<number | null>(null);
  const stateRef = useRef(gameState);
  const difficultyRef = useRef(difficulty);
  const gameIdRef = useRef<string | null>(null);
  const lastTickRef = useRef<number>(0);
  const lastMultTickRef = useRef<number>(0);
  const redLightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eliminationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frozenRedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameExpireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const scheduleRedLightRef = useRef<(diff: RedlightDifficulty) => void>(() => {});

  stateRef.current = gameState;
  difficultyRef.current = difficulty;
  gameIdRef.current = gameId;

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
  const scheduleRedLight = useCallback(
    (diff: RedlightDifficulty) => {
      const [min, max] = RED_LIGHT_WINDOW[diff];
      // Mix two independent randoms: one biased short, one biased long.
      // Randomly pick which shape to use, producing a highly irregular spread.
      const r1 = Math.random();
      const r2 = Math.random();
      const r3 = Math.random();
      let t: number;
      if (r3 < 0.35) {
        // Early burst — fires soon
        t = r1 * r1 * (max - min);
      } else if (r3 < 0.65) {
        // Mid range — picks anywhere
        t = r1 * (max - min);
      } else {
        // Late spike — biased toward the far end
        t = (1 - r2 * r2) * (max - min);
      }
      const delay = min + t;

      redLightTimerRef.current = setTimeout(() => {
        const s = stateRef.current;

        if (s.phase === "green") {
          stopLoop();
          const grace = FREEZE_GRACE_MS[diff];

          setGameState((prev) => {
            if (prev.phase !== "green") return prev;
            return { ...prev, phase: "red", redLightAt: performance.now() };
          });

          eliminationTimerRef.current = setTimeout(() => {
            setGameState((prev) => {
              if (prev.phase !== "red") return prev;
              const gid = gameIdRef.current;
              if (gid) eliminateRedlightGame({ gameId: gid }).catch(() => {});
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
            queryClient.invalidateQueries({ queryKey: ["user-data"] });
            queryClient.invalidateQueries({ queryKey: ["redlight-history"] });
          }, grace);
        } else if (s.phase === "frozen") {
          setGameState((prev) => {
            if (prev.phase !== "frozen") return prev;
            return { ...prev, phase: "frozen-red", redLightAt: performance.now() };
          });

          frozenRedTimerRef.current = setTimeout(() => {
            setGameState((prev) => {
              if (prev.phase !== "frozen-red") return prev;
              return { ...prev, phase: "frozen", redLightAt: null };
            });
            scheduleRedLightRef.current(diff);
          }, FROZEN_RED_DISPLAY_MS);
        }
      }, delay);
    },
    [stopLoop],
  );

  scheduleRedLightRef.current = scheduleRedLight;

  const clearGameClock = useCallback(() => {
    if (gameExpireTimerRef.current) clearTimeout(gameExpireTimerRef.current);
    if (clockRafRef.current) cancelAnimationFrame(clockRafRef.current);
    gameExpireTimerRef.current = null;
    clockRafRef.current = null;
    setGameTimeLeft(-1);
  }, []);

  const clearTimers = useCallback(() => {
    if (redLightTimerRef.current) clearTimeout(redLightTimerRef.current);
    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current);
    if (frozenRedTimerRef.current) clearTimeout(frozenRedTimerRef.current);
    if (gameExpireTimerRef.current) clearTimeout(gameExpireTimerRef.current);
    if (clockRafRef.current) cancelAnimationFrame(clockRafRef.current);
    setGameTimeLeft(-1);
    stopLoop();
  }, [stopLoop]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    if (betAmount <= 0) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await startRedlightGame({ betAmount, difficulty });
      const gid = res?.gameId ?? res?.data?.gameId;
      const seedHash = res?.serverSeedHash ?? res?.data?.serverSeedHash;
      setGameId(gid);
      setServerSeedHash(seedHash);
      gameIdRef.current = gid;

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
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      startLoop();
      scheduleRedLight(difficulty);

      // Global game clock — eliminates on expiry regardless of freeze state
      const duration = GAME_DURATION_MS[difficulty];
      gameStartTimeRef.current = performance.now();
      setGameTimeLeft(duration);

      const tickClock = (now: number) => {
        const remaining = Math.max(0, duration - (now - gameStartTimeRef.current));
        setGameTimeLeft(remaining);
        if (remaining > 0) {
          clockRafRef.current = requestAnimationFrame(tickClock);
        }
      };
      clockRafRef.current = requestAnimationFrame(tickClock);

      gameExpireTimerRef.current = setTimeout(() => {
        setGameState((prev) => {
          if (prev.phase === "eliminated" || prev.phase === "cashedout" || prev.phase === "idle") return prev;
          const gid = gameIdRef.current;
          if (gid) eliminateRedlightGame({ gameId: gid }).catch(() => {});
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
        setGameTimeLeft(-1);
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
        queryClient.invalidateQueries({ queryKey: ["redlight-history"] });
      }, duration);
    } catch (err: any) {
      setError(err?.message || "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, [betAmount, difficulty, startLoop, scheduleRedLight]);

  const freeze = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "green" && s.phase !== "red") return;

    const savedDuringRed = s.phase === "red";
    const diff = difficultyRef.current;

    if (eliminationTimerRef.current) clearTimeout(eliminationTimerRef.current);
    stopLoop();

    setGameState((prev) => {
      if (prev.phase !== "green" && prev.phase !== "red") return prev;
      return { ...prev, phase: "frozen", frozenAt: performance.now() };
    });

    if (savedDuringRed) {
      scheduleRedLightRef.current(diff);
    }
  }, [stopLoop]);

  const handleCashout = useCallback(async () => {
    clearTimers();
    const s = stateRef.current;
    if (s.phase === "eliminated" || s.phase === "cashedout" || s.phase === "idle") return;

    const multiplier = s.currentMultiplier;
    const gid = gameIdRef.current;

    setGameState((prev) => {
      if (prev.phase === "eliminated" || prev.phase === "cashedout" || prev.phase === "idle") return prev;
      const payout = +(prev.betAmount * prev.currentMultiplier).toFixed(2);
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

    if (gid) {
      try {
        await cashoutRedlightGame({ gameId: gid, multiplier });
      } catch {
        // outcome already recorded client-side; silently ignore network errors
      } finally {
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
        queryClient.invalidateQueries({ queryKey: ["redlight-history"] });
      }
    }
  }, [clearTimers]);

  const continueRun = useCallback(() => {
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
    setGameId(null);
    setServerSeedHash(null);
    setError(null);
    gameIdRef.current = null;
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
    gameId,
    serverSeedHash,
    isLoading,
    error,
    gameTimeLeft,
    startGame,
    freeze,
    handleCashout,
    continueRun,
    resetGame,
  };
}

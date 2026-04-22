"use client";

import { useState, useCallback, useRef } from "react";
import {
  PumpDifficulty,
  GameMode,
  PumpGameState,
  BetResult,
  MULTIPLIER_LADDERS,
  BUST_PROBABILITY,
  PumpBetResult,
} from "../interfaces/interface";

const STARTING_BALANCE = 1000;

export function usePumpGame() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<PumpDifficulty>("hard");
  const [results, setResults] = useState<PumpBetResult[]>([]);
  const [gameState, setGameState] = useState<PumpGameState>({
    phase: "idle",
    currentStep: 0,
    currentMultiplier: 1,
    betAmount: 0,
    profit: 0,
    bustedAtStep: null,
  });

  // Auto mode state
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoPumpCount, setAutoPumpCount] = useState(5); // pumps before auto-cashout
  const autoStateRef = useRef({ pumpsLeft: 0, running: false });

  const ladder = MULTIPLIER_LADDERS[difficulty];
  const bustProbs = BUST_PROBABILITY[difficulty];

  const startGame = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setBalance((prev) => +(prev - betAmount).toFixed(2));
    setGameState({
      phase: "playing",
      currentStep: 0,
      currentMultiplier: ladder[0],
      betAmount,
      profit: 0,
      bustedAtStep: null,
    });
  }, [betAmount, balance, ladder]);

  const pump = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== "playing") return prev;

      const nextStep = prev.currentStep + 1;
      const bustChance = bustProbs[prev.currentStep] ?? 0.95;
      const busted = Math.random() < bustChance;

      if (busted || nextStep >= ladder.length) {
        // Bust
        const result: PumpBetResult = {
          id: `${Date.now()}`,
          multiplier: 0,
          payout: 0,
          betAmount: prev.betAmount,
          won: false,
        };
        setResults((r) => [...r, result]);
        return {
          ...prev,
          phase: "busted",
          bustedAtStep: prev.currentStep,
          profit: -prev.betAmount,
        };
      }

      const mult = ladder[nextStep];
      return {
        ...prev,
        currentStep: nextStep,
        currentMultiplier: mult,
        profit: +(prev.betAmount * mult - prev.betAmount).toFixed(2),
      };
    });
  }, [ladder, bustProbs]);

  const cashout = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== "playing" || prev.currentStep === 0) return prev;
      const payout = +(prev.betAmount * prev.currentMultiplier).toFixed(2);
      setBalance((b) => +(b + payout).toFixed(2));
      const result: PumpBetResult = {
        id: `${Date.now()}`,
        multiplier: prev.currentMultiplier,
        payout,
        betAmount: prev.betAmount,
        won: true,
      };
      setResults((r) => [...r, result]);
      return {
        ...prev,
        phase: "cashedout",
        profit: +(payout - prev.betAmount).toFixed(2),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      phase: "idle",
      currentStep: 0,
      currentMultiplier: ladder[0],
      betAmount: 0,
      profit: 0,
      bustedAtStep: null,
    });
  }, [ladder]);

  // Auto mode
  const startAuto = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setIsAutoRunning(true);
    autoStateRef.current = { pumpsLeft: autoPumpCount, running: true };

    // Start a game then schedule pumps
    setBalance((prev) => +(prev - betAmount).toFixed(2));
    const currentLadder = MULTIPLIER_LADDERS[difficulty];
    setGameState({
      phase: "playing",
      currentStep: 0,
      currentMultiplier: currentLadder[0],
      betAmount,
      profit: 0,
      bustedAtStep: null,
    });

    let step = 0;
    let bet = betAmount;

    const tick = () => {
      if (!autoStateRef.current.running) return;

      if (autoStateRef.current.pumpsLeft <= 0) {
        // Auto cashout
        const mult = currentLadder[step];
        const payout = +(bet * mult).toFixed(2);
        setBalance((b) => +(b + payout).toFixed(2));
        setResults((r) => [...r, { id: `${Date.now()}`, multiplier: mult, payout, betAmount: bet, won: true }]);
        setGameState((s) => ({ ...s, phase: "cashedout", profit: +(payout - bet).toFixed(2) }));
        setIsAutoRunning(false);
        autoStateRef.current.running = false;
        return;
      }

      const bustChance = BUST_PROBABILITY[difficulty][step] ?? 0.95;
      const busted = Math.random() < bustChance;
      autoStateRef.current.pumpsLeft--;

      if (busted || step + 1 >= currentLadder.length) {
        setResults((r) => [...r, { id: `${Date.now()}`, multiplier: 0, payout: 0, betAmount: bet, won: false }]);
        setGameState((s) => ({ ...s, phase: "busted", bustedAtStep: step, profit: -bet }));
        setIsAutoRunning(false);
        autoStateRef.current.running = false;
        return;
      }

      step++;
      const mult = currentLadder[step];
      setGameState({
        phase: "playing",
        currentStep: step,
        currentMultiplier: mult,
        betAmount: bet,
        profit: +(bet * mult - bet).toFixed(2),
        bustedAtStep: null,
      });

      autoTimerRef.current = setTimeout(tick, 900);
    };

    autoTimerRef.current = setTimeout(tick, 900);
  }, [betAmount, balance, autoPumpCount, difficulty]);

  const stopAuto = useCallback(() => {
    autoStateRef.current.running = false;
    setIsAutoRunning(false);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    // Cashout current position if playing
    cashout();
  }, [cashout]);

  return {
    balance,
    gameMode,
    setGameMode,
    betAmount,
    setBetAmount,
    difficulty,
    setDifficulty,
    gameState,
    results,
    ladder,
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

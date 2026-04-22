"use client";

import { useState, useCallback } from "react";
import {
  RPSChoice,
  RPSGameState,
  BetResult,
  RPSDifficulty,
  RPSGameMode,
  ROUND_MULTIPLIERS,
  getResult,
  generateHouseChoice,
  RPSRound,
  RPSBetResult,
} from "../interfaces/interface";

const STARTING_BALANCE = 1000;
const MAX_ROUNDS = 5;

function makeEmptyRounds(): RPSRound[] {
  return Array.from({ length: MAX_ROUNDS }, (_, i) => ({
    roundIndex: i,
    playerChoice: null,
    houseChoice: null,
    result: null,
  }));
}

export function useRPSGame() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [gameMode, setGameMode] = useState<RPSGameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<RPSDifficulty>("medium");
  const [results, setResults] = useState<RPSBetResult[]>([]);
  const [gameState, setGameState] = useState<RPSGameState>({
    phase: "idle",
    currentRound: 0,
    maxRounds: MAX_ROUNDS,
    rounds: makeEmptyRounds(),
    currentMultiplier: ROUND_MULTIPLIERS[0],
    betAmount: 0,
    profit: 0,
    animating: false,
  });

  const startGame = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setBalance((prev) => +(prev - betAmount).toFixed(2));
    setGameState({
      phase: "playing",
      currentRound: 1,
      maxRounds: MAX_ROUNDS,
      rounds: makeEmptyRounds(),
      currentMultiplier: ROUND_MULTIPLIERS[0],
      betAmount,
      profit: 0,
      animating: false,
    });
  }, [betAmount, balance]);

  const play = useCallback(
    (playerChoice: RPSChoice) => {
      setGameState((prev) => {
        if (prev.phase !== "playing" || prev.animating) return prev;

        const houseChoice = generateHouseChoice(playerChoice, difficulty);
        const result = getResult(playerChoice, houseChoice);
        const roundIdx = prev.currentRound - 1;

        const newRounds = prev.rounds.map((r, i) => (i === roundIdx ? { ...r, playerChoice, houseChoice, result } : r));

        if (result === "lose") {
          // Lost
          setResults((r) => [
            ...r,
            {
              id: `${Date.now()}`,
              roundsWon: roundIdx,
              multiplier: 0,
              payout: 0,
              betAmount: prev.betAmount,
              won: false,
            },
          ]);
          return {
            ...prev,
            phase: "lost",
            rounds: newRounds,
            profit: -prev.betAmount,
            animating: true,
          };
        }

        if (result === "draw") {
          // Draw — replay same round (no advancement, no loss)
          return {
            ...prev,
            phase: "draw",
            rounds: newRounds,
            animating: true,
          };
        }

        // Win
        const nextRound = prev.currentRound + 1;
        const mult = ROUND_MULTIPLIERS[Math.min(roundIdx + 1, ROUND_MULTIPLIERS.length - 1)];

        if (nextRound > MAX_ROUNDS) {
          // All 5 rounds won — max payout
          const finalMult = ROUND_MULTIPLIERS[MAX_ROUNDS - 1];
          const payout = +(prev.betAmount * finalMult).toFixed(2);
          setBalance((b) => +(b + payout).toFixed(2));
          setResults((r) => [
            ...r,
            {
              id: `${Date.now()}`,
              roundsWon: MAX_ROUNDS,
              multiplier: finalMult,
              payout,
              betAmount: prev.betAmount,
              won: true,
            },
          ]);
          return {
            ...prev,
            phase: "won",
            rounds: newRounds,
            currentMultiplier: finalMult,
            profit: +(payout - prev.betAmount).toFixed(2),
            animating: true,
          };
        }

        return {
          ...prev,
          phase: "playing",
          currentRound: nextRound,
          rounds: newRounds,
          currentMultiplier: mult,
          profit: +(prev.betAmount * mult - prev.betAmount).toFixed(2),
          animating: true,
        };
      });

      // Clear animating flag after animation
      setTimeout(() => {
        setGameState((prev) => {
          // If draw, reset to playing to allow replay
          if (prev.phase === "draw") {
            return { ...prev, phase: "playing", animating: false };
          }
          return { ...prev, animating: false };
        });
      }, 700);
    },
    [difficulty],
  );

  const cashout = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== "playing" || prev.currentRound <= 1) return prev;
      // Cashout at current multiplier (the one earned by last win)
      const mult = prev.currentMultiplier;
      const payout = +(prev.betAmount * mult).toFixed(2);
      setBalance((b) => +(b + payout).toFixed(2));
      setResults((r) => [
        ...r,
        {
          id: `${Date.now()}`,
          roundsWon: prev.currentRound - 1,
          multiplier: mult,
          payout,
          betAmount: prev.betAmount,
          won: true,
        },
      ]);
      return {
        ...prev,
        phase: "won",
        profit: +(payout - prev.betAmount).toFixed(2),
      };
    });
  }, []);

  const randomPick = useCallback(() => {
    const choices: RPSChoice[] = ["rock", "paper", "scissors"];
    const pick = choices[Math.floor(Math.random() * 3)];
    play(pick);
  }, [play]);

  const resetGame = useCallback(() => {
    setGameState({
      phase: "idle",
      currentRound: 0,
      maxRounds: MAX_ROUNDS,
      rounds: makeEmptyRounds(),
      currentMultiplier: ROUND_MULTIPLIERS[0],
      betAmount: 0,
      profit: 0,
      animating: false,
    });
  }, []);

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
    startGame,
    play,
    cashout,
    randomPick,
    resetGame,
  };
}

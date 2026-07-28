"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  RPSChoice,
  RPSGameState,
  RPSDifficulty,
  RPSGameMode,
  ROUND_MULTIPLIERS,
  RPSRound,
  RPSBetResult,
  RoundResult,
} from "../interfaces/interface";
import { startRPSGame, playRPS, cashoutRPS } from "../lib/api";
import { playRpsRoundWin } from "../lib/sound-player";

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
  const queryClient = useQueryClient();
  const [gameMode, setGameMode] = useState<RPSGameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<RPSDifficulty>("medium");
  const [results, setResults] = useState<RPSBetResult[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [serverSeedHash, setServerSeedHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const stateRef = useRef(gameState);
  stateRef.current = gameState;
  const gameIdRef = useRef<string | null>(null);

  const startGame = useCallback(() => {
    if (betAmount <= 0) return;
    setError(null);
    setGameId(null);
    gameIdRef.current = null;
    setServerSeedHash(null);
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
  }, [betAmount]);

  const play = useCallback(
    async (playerChoice: RPSChoice) => {
      const s = stateRef.current;
      if (s.animating || s.phase !== "playing") return;

      setIsLoading(true);
      setError(null);

      try {
        let res: any;
        const isFirstPlay = !gameIdRef.current;

        if (isFirstPlay) {
          res = await startRPSGame({ betAmount, difficulty, playerChoice });
          const gid = res?.gameId ?? res?.data?.gameId;
          const seedHash = res?.serverSeedHash ?? res?.data?.serverSeedHash;
          setGameId(gid);
          setServerSeedHash(seedHash);
          gameIdRef.current = gid;
          queryClient.invalidateQueries({ queryKey: ["user-data"] });
        } else {
          res = await playRPS({ gameId: gameIdRef.current!, playerChoice });
        }

        const data = res?.data ?? res;
        const { phase: apiPhase, result, houseChoice, currentRound: roundsWon, currentMultiplier, payout } = data;

        setGameState((prev) => {
          if (prev.phase !== "playing") return prev;

          const roundIdx = prev.currentRound - 1;
          const newRounds = prev.rounds.map((r, i) =>
            i === roundIdx
              ? { ...r, playerChoice, houseChoice: houseChoice as RPSChoice, result: result as RoundResult }
              : r,
          );

          if (result === "lose") {
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
            queryClient.invalidateQueries({ queryKey: ["rps-history"] });
            return { ...prev, phase: "lost", rounds: newRounds, profit: -prev.betAmount, animating: true };
          }

          if (result === "draw") {
            return { ...prev, phase: "playing", rounds: newRounds, animating: true };
          }

          // Win
          const nextRound = prev.currentRound + 1;

          if (apiPhase === "cashed_out" || nextRound > prev.maxRounds) {
            const finalMult = currentMultiplier ?? ROUND_MULTIPLIERS[MAX_ROUNDS - 1];
            const finalPayout = payout ?? +(prev.betAmount * finalMult).toFixed(2);
            setResults((r) => [
              ...r,
              {
                id: `${Date.now()}`,
                roundsWon: prev.maxRounds,
                multiplier: finalMult,
                payout: finalPayout,
                betAmount: prev.betAmount,
                won: true,
              },
            ]);
            queryClient.invalidateQueries({ queryKey: ["user-data"] });
            queryClient.invalidateQueries({ queryKey: ["rps-history"] });
            return {
              ...prev,
              phase: "won",
              rounds: newRounds,
              currentMultiplier: finalMult,
              profit: +(finalPayout - prev.betAmount).toFixed(2),
              animating: true,
            };
          }

          const newMult = currentMultiplier ?? ROUND_MULTIPLIERS[Math.min(nextRound - 1, ROUND_MULTIPLIERS.length - 1)];
          return {
            ...prev,
            phase: "playing",
            currentRound: nextRound,
            rounds: newRounds,
            currentMultiplier: newMult,
            profit: +(prev.betAmount * newMult - prev.betAmount).toFixed(2),
            animating: true,
          };
        });

        if (result === "win") playRpsRoundWin(); // round win — draw/loss handled elsewhere

        setTimeout(() => {
          setGameState((prev) => {
            if (prev.phase === "draw") return { ...prev, phase: "playing", animating: false };
            return { ...prev, animating: false };
          });
        }, 700);
      } catch (err: any) {
        setError(err?.message || "Failed to play");
      } finally {
        setIsLoading(false);
      }
    },
    [betAmount, difficulty],
  );

  const cashout = useCallback(async () => {
    const s = stateRef.current;
    if (s.phase !== "playing" || s.currentRound <= 1) return;

    const gid = gameIdRef.current;
    if (!gid) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await cashoutRPS({ gameId: gid });
      const data = res?.data ?? res;
      const { payout, multiplier } = data;

      setGameState((prev) => {
        if (prev.phase !== "playing") return prev;
        const finalPayout = payout ?? +(prev.betAmount * prev.currentMultiplier).toFixed(2);
        const finalMult = multiplier ?? prev.currentMultiplier;
        setResults((r) => [
          ...r,
          {
            id: `${Date.now()}`,
            roundsWon: prev.currentRound - 1,
            multiplier: finalMult,
            payout: finalPayout,
            betAmount: prev.betAmount,
            won: true,
          },
        ]);
        return { ...prev, phase: "won", profit: +(finalPayout - prev.betAmount).toFixed(2) };
      });

      setGameId(null);
      gameIdRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      queryClient.invalidateQueries({ queryKey: ["rps-history"] });
    } catch (err: any) {
      setError(err?.message || "Failed to cashout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const randomPick = useCallback(() => {
    const choices: RPSChoice[] = ["rock", "paper", "scissors"];
    const pick = choices[Math.floor(Math.random() * 3)];
    play(pick);
  }, [play]);

  const resetGame = useCallback(() => {
    setGameId(null);
    gameIdRef.current = null;
    setServerSeedHash(null);
    setError(null);
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
    startGame,
    play,
    cashout,
    randomPick,
    resetGame,
  };
}

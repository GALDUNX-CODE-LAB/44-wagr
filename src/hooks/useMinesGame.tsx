"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Cell, GameMode, MineCount, MinesGameState } from "../interfaces/interface";
import { startMinesGame, revealMinesCell, cashoutMinesGame } from "../lib/api";
import { useUser } from "./useUserData";
import useIsLoggedIn from "./useIsLoggedIn";

const GRID_SIZE = 25;

function createEmptyGrid(): Cell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    index: i,
    state: "hidden" as const,
    isMine: false,
    isRevealed: false,
    animating: false,
  }));
}

export function useMinesGame() {
  const queryClient = useQueryClient();
  const { balance } = useUser();
  const isLoggedIn = useIsLoggedIn();

  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [mineCount, setMineCount] = useState<MineCount>(10);
  const [gameId, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // only for startGame / cashout
  const [error, setError] = useState<string | null>(null);
  const revealingCells = useRef<Set<number>>(new Set());
  const [results, setResults] = useState<{ multiplier: number; payout: number; bet: number; won: boolean }[]>([]);

  const [gameState, setGameState] = useState<MinesGameState>({
    phase: "idle",
    cells: createEmptyGrid(),
    mineCount: 10,
    gemsFound: 0,
    totalSafe: 15,
    currentMultiplier: 1,
    betAmount: 0,
    profit: 0,
  });

  const startGame = useCallback(async () => {
    if (!isLoggedIn) { setError("Please login to play"); return; }
    if (betAmount <= 0) { setError("Enter a valid bet amount"); return; }
    if (betAmount > balance) { setError("Insufficient balance"); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res = await startMinesGame({ betAmount, mineCount });
      const { gameId: newGameId } = res.data;
      setGameId(newGameId);
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setGameState({
        phase: "playing",
        cells: createEmptyGrid(),
        mineCount,
        gemsFound: 0,
        totalSafe: GRID_SIZE - mineCount,
        currentMultiplier: 1,
        betAmount,
        profit: 0,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, betAmount, mineCount, balance, queryClient]);

  const revealCell = useCallback(async (index: number) => {
    if (!gameId || revealingCells.current.has(index)) return;

    // Optimistic: mark cell as animating immediately (per-cell guard)
    let shouldProceed = false;
    setGameState((prev) => {
      if (prev.phase !== "playing" || prev.cells[index].isRevealed || prev.cells[index].animating) return prev;
      shouldProceed = true;
      const cells = prev.cells.map((c, i) => i === index ? { ...c, animating: true } : c);
      return { ...prev, cells };
    });

    if (!shouldProceed) return;
    revealingCells.current.add(index);

    try {
      const res = await revealMinesCell({ gameId, cellIndex: index });
      const data = res.data;

      if (data.isMine) {
        const mineSet = new Set<number>(data.minePositions);
        setGameState((prev) => {
          const cells = prev.cells.map((c, i) => {
            if (i === index) return { ...c, isMine: true, isRevealed: true, state: "mine" as const, animating: false };
            if (mineSet.has(i) && !c.isRevealed) return { ...c, isMine: true, isRevealed: true, state: "mine" as const };
            return { ...c, animating: false };
          });
          return { ...prev, phase: "lost", cells };
        });
        setResults((r) => [...r, { multiplier: 0, payout: 0, bet: betAmount, won: false }]);
        queryClient.invalidateQueries({ queryKey: ["mines-history"] });
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
        setGameId(null);
      } else if (data.autoWon) {
        const mineSet = new Set<number>(data.minePositions);
        setGameState((prev) => {
          const gemsFound = prev.gemsFound + 1;
          const mult = data.multiplier;
          const cells = prev.cells.map((c, i) => {
            if (i === index) return { ...c, isMine: false, isRevealed: true, state: "revealed-gem" as const, animating: false };
            if (mineSet.has(i) && !c.isRevealed) return { ...c, isMine: true, isRevealed: true, state: "mine" as const };
            return { ...c, animating: false };
          });
          return {
            ...prev,
            phase: "won",
            cells,
            gemsFound,
            currentMultiplier: mult,
            profit: +(prev.betAmount * mult - prev.betAmount).toFixed(2),
          };
        });
        setResults((r) => [...r, { multiplier: data.multiplier, payout: data.payout, bet: betAmount, won: true }]);
        queryClient.invalidateQueries({ queryKey: ["mines-history"] });
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
        setGameId(null);
      } else {
        setGameState((prev) => {
          const gemsFound = prev.gemsFound + 1;
          const mult = data.multiplier;
          const cells = prev.cells.map((c, i) =>
            i === index ? { ...c, isMine: false, isRevealed: true, state: "revealed-gem" as const, animating: false } : { ...c, animating: false },
          );
          return {
            ...prev,
            cells,
            gemsFound,
            currentMultiplier: mult,
            profit: +(prev.betAmount * mult - prev.betAmount).toFixed(2),
          };
        });
      }
    } catch (err: any) {
      setGameState((prev) => {
        const cells = prev.cells.map((c, i) => i === index ? { ...c, animating: false } : c);
        return { ...prev, cells };
      });
      setError(err?.message || "Failed to reveal cell");
    } finally {
      revealingCells.current.delete(index);
    }
  }, [gameId, betAmount, queryClient]);

  const cashout = useCallback(async () => {
    if (!gameId || gameState.gemsFound === 0 || gameState.phase !== "playing") return;

    setIsLoading(true);
    try {
      const res = await cashoutMinesGame({ gameId });
      const data = res.data;
      const mineSet = new Set<number>(data.minePositions);
      setGameState((prev) => {
        const cells = prev.cells.map((c, i) => {
          if (mineSet.has(i) && !c.isRevealed) return { ...c, isMine: true, isRevealed: true, state: "mine" as const };
          return c;
        });
        return {
          ...prev,
          phase: "won",
          cells,
          profit: +(data.payout - prev.betAmount).toFixed(2),
          currentMultiplier: data.multiplier,
        };
      });
      setResults((r) => [...r, { multiplier: data.multiplier, payout: data.payout, bet: betAmount, won: true }]);
      queryClient.invalidateQueries({ queryKey: ["mines-history"] });
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setGameId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to cashout");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, gameState.gemsFound, gameState.phase, betAmount, queryClient]);

  const randomPick = useCallback(() => {
    if (gameState.phase !== "playing") return;
    const hidden = gameState.cells.map((c, i) => i).filter((i) => !gameState.cells[i].isRevealed && !gameState.cells[i].animating);
    if (hidden.length === 0) return;
    const idx = hidden[Math.floor(Math.random() * hidden.length)];
    revealCell(idx);
  }, [gameState, isLoading, revealCell]);

  const resetGame = useCallback(() => {
    setGameId(null);
    setError(null);
    setGameState((prev) => ({
      phase: "idle",
      cells: createEmptyGrid(),
      mineCount: prev.mineCount,
      gemsFound: 0,
      totalSafe: GRID_SIZE - prev.mineCount,
      currentMultiplier: 1,
      betAmount: 0,
      profit: 0,
    }));
  }, []);

  return {
    gameMode,
    setGameMode,
    betAmount,
    setBetAmount,
    mineCount,
    setMineCount,
    gameState,
    results,
    isLoading,
    error,
    startGame,
    revealCell,
    cashout,
    randomPick,
    resetGame,
  };
}

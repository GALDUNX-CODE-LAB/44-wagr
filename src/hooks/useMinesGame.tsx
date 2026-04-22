"use client";

import { useState, useCallback, useRef } from "react";
import { Cell, GameMode, MineCount, MinesGameState, calcMultiplier } from "../interfaces/interface";

const GRID_SIZE = 25;
const STARTING_BALANCE = 1000;

function createEmptyGrid(): Cell[] {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    index: i,
    state: "hidden" as const,
    isMine: false,
    isRevealed: false,
    animating: false,
  }));
}

function placeMines(count: number, excludeIndex?: number): boolean[] {
  const mines = new Array(GRID_SIZE).fill(false);
  const indices = Array.from({ length: GRID_SIZE }, (_, i) => i).filter((i) => i !== excludeIndex);

  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < count; i++) {
    mines[indices[i]] = true;
  }
  return mines;
}

export function useMinesGame() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [mineCount, setMineCount] = useState<MineCount>(10);
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
  const [results, setResults] = useState<{ multiplier: number; payout: number; bet: number; won: boolean }[]>([]);
  const minesRef = useRef<boolean[]>([]);

  const startGame = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setBalance((prev) => +(prev - betAmount).toFixed(2));

    const cells = createEmptyGrid();
    setGameState({
      phase: "playing",
      cells,
      mineCount,
      gemsFound: 0,
      totalSafe: GRID_SIZE - mineCount,
      currentMultiplier: 1,
      betAmount,
      profit: 0,
    });
    // Mines are placed lazily on first click (fair play)
    minesRef.current = [];
  }, [betAmount, balance, mineCount]);

  const revealCell = useCallback((index: number) => {
    setGameState((prev) => {
      if (prev.phase !== "playing") return prev;
      if (prev.cells[index].isRevealed) return prev;

      // Lazy mine placement on first reveal
      if (minesRef.current.length === 0) {
        minesRef.current = placeMines(prev.mineCount, index);
      }

      const isMine = minesRef.current[index];
      const newCells = prev.cells.map((c, i) => {
        if (i === index) {
          return {
            ...c,
            isMine,
            isRevealed: true,
            state: isMine ? ("mine" as const) : ("revealed-gem" as const),
            animating: true,
          };
        }
        return c;
      });

      if (isMine) {
        // Reveal all mines
        const revealedCells = newCells.map((c, i) => {
          if (minesRef.current[i] && !c.isRevealed) {
            return { ...c, isMine: true, isRevealed: true, state: "mine" as const };
          }
          return c;
        });

        // Record loss
        setResults((r) => [...r, { multiplier: 0, payout: 0, bet: prev.betAmount, won: false }]);

        return { ...prev, phase: "lost", cells: revealedCells };
      }

      const gemsFound = prev.gemsFound + 1;
      const mult = calcMultiplier(prev.mineCount, gemsFound);
      const profit = +(prev.betAmount * mult - prev.betAmount).toFixed(2);

      // Win condition: found all safe cells
      if (gemsFound === prev.totalSafe) {
        const payout = +(prev.betAmount * mult).toFixed(2);
        setBalance((b) => +(b + payout).toFixed(2));
        setResults((r) => [...r, { multiplier: mult, payout, bet: prev.betAmount, won: true }]);
        return { ...prev, phase: "won", cells: newCells, gemsFound, currentMultiplier: mult, profit };
      }

      return { ...prev, cells: newCells, gemsFound, currentMultiplier: mult, profit };
    });
  }, []);

  const cashout = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== "playing" || prev.gemsFound === 0) return prev;
      const payout = +(prev.betAmount * prev.currentMultiplier).toFixed(2);
      setBalance((b) => +(b + payout).toFixed(2));
      setResults((r) => [...r, { multiplier: prev.currentMultiplier, payout, bet: prev.betAmount, won: true }]);

      // Reveal remaining mines
      const revealedCells = prev.cells.map((c, i) => {
        if (minesRef.current[i] && !c.isRevealed) {
          return { ...c, isMine: true, isRevealed: true, state: "mine" as const };
        }
        return c;
      });

      return { ...prev, phase: "won", cells: revealedCells, profit: +(payout - prev.betAmount).toFixed(2) };
    });
  }, []);

  const randomPick = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== "playing") return prev;
      const hidden = prev.cells.map((c, i) => ({ c, i })).filter(({ c }) => !c.isRevealed);
      if (hidden.length === 0) return prev;
      const pick = hidden[Math.floor(Math.random() * hidden.length)];
      return prev; // We return prev and trigger revealCell externally
    });

    // Find a random hidden cell and reveal it
    setGameState((prev) => {
      if (prev.phase !== "playing") return prev;
      const hidden = prev.cells.map((c, i) => i).filter((i) => !prev.cells[i].isRevealed);
      if (hidden.length === 0) return prev;
      const idx = hidden[Math.floor(Math.random() * hidden.length)];
      // Trigger reveal via side effect
      setTimeout(() => revealCell(idx), 0);
      return prev;
    });
  }, [revealCell]);

  const resetGame = useCallback(() => {
    minesRef.current = [];
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
    startGame,
    revealCell,
    cashout,
    randomPick,
    resetGame,
  };
}

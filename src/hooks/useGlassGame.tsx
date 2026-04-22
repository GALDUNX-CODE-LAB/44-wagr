"use client";

import { useState, useCallback } from "react";
import {
  GlassDifficulty,
  GameMode,
  GlassGameState,
  GlassBetResult,
  STEP_MULTIPLIERS,
  TOTAL_ROWS,
  buildBridge,
} from "../interfaces/interface";

const STARTING_BALANCE = 1000;

export function useGlassGame() {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<GlassDifficulty>("easy");
  const [results, setResults] = useState<GlassBetResult[]>([]);
  const [gameState, setGameState] = useState<GlassGameState>({
    phase: "idle",
    rows: [],
    currentRow: 0,
    currentMultiplier: 1,
    betAmount: 0,
    profit: 0,
    totalRows: TOTAL_ROWS,
  });

  const startGame = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;
    setBalance((prev) => +(prev - betAmount).toFixed(2));
    const rows = buildBridge(difficulty);
    setGameState({
      phase: "playing",
      rows,
      currentRow: 0,
      currentMultiplier: 1,
      betAmount,
      profit: 0,
      totalRows: TOTAL_ROWS,
    });
  }, [betAmount, balance, difficulty]);

  const pickTile = useCallback(
    (rowIndex: number, tileIndex: number) => {
      setGameState((prev) => {
        if (prev.phase !== "playing") return prev;
        if (rowIndex !== prev.currentRow) return prev;

        const row = prev.rows[rowIndex];
        const tile = row.tiles[tileIndex];
        const ladders = STEP_MULTIPLIERS[difficulty];
        const mult = ladders[rowIndex];

        if (!tile.isSafe) {
          // BROKE — reveal this tile + reveal all safe tiles
          const newRows = prev.rows.map((r, ri) => ({
            ...r,
            revealed: true,
            tiles: r.tiles.map((t, ti) => {
              if (ri === rowIndex && ti === tileIndex) return { ...t, state: "broken" as const };
              if (r.safeIndex === ti && ri >= rowIndex) return { ...t, state: "safe" as const };
              return t;
            }),
          }));

          setResults((res) => [
            ...res,
            {
              id: `${Date.now()}`,
              rowsCleared: rowIndex,
              multiplier: 0,
              payout: 0,
              betAmount: prev.betAmount,
              won: false,
            },
          ]);

          return {
            ...prev,
            phase: "lost",
            rows: newRows,
            profit: -prev.betAmount,
          };
        }

        // SAFE — mark tile, advance
        const newRows = prev.rows.map((r, ri) => ({
          ...r,
          revealed: ri <= rowIndex,
          tiles: r.tiles.map((t, ti) => {
            if (ri === rowIndex) {
              if (ti === tileIndex) return { ...t, state: "safe" as const };
              return { ...t, state: "skipped" as const };
            }
            return t;
          }),
        }));

        const nextRow = rowIndex + 1;
        const isLastRow = nextRow >= TOTAL_ROWS;

        if (isLastRow) {
          // Won all 6 rows!
          const payout = +(prev.betAmount * mult).toFixed(2);
          setBalance((b) => +(b + payout).toFixed(2));
          setResults((res) => [
            ...res,
            {
              id: `${Date.now()}`,
              rowsCleared: TOTAL_ROWS,
              multiplier: mult,
              payout,
              betAmount: prev.betAmount,
              won: true,
            },
          ]);
          return {
            ...prev,
            phase: "won",
            rows: newRows,
            currentRow: nextRow,
            currentMultiplier: mult,
            profit: +(payout - prev.betAmount).toFixed(2),
          };
        }

        return {
          ...prev,
          rows: newRows,
          currentRow: nextRow,
          currentMultiplier: mult,
          profit: +(prev.betAmount * mult - prev.betAmount).toFixed(2),
        };
      });
    },
    [difficulty],
  );

  const cashout = useCallback(() => {
    setGameState((prev) => {
      if (prev.phase !== "playing" || prev.currentRow === 0) return prev;
      const payout = +(prev.betAmount * prev.currentMultiplier).toFixed(2);
      setBalance((b) => +(b + payout).toFixed(2));
      setResults((res) => [
        ...res,
        {
          id: `${Date.now()}`,
          rowsCleared: prev.currentRow,
          multiplier: prev.currentMultiplier,
          payout,
          betAmount: prev.betAmount,
          won: true,
        },
      ]);

      // Reveal all safe tiles
      const newRows = prev.rows.map((r) => ({
        ...r,
        revealed: true,
        tiles: r.tiles.map((t, ti) => ({
          ...t,
          state: ti === r.safeIndex ? ("safe" as const) : t.state,
        })),
      }));

      return {
        ...prev,
        phase: "won",
        rows: newRows,
        profit: +(payout - prev.betAmount).toFixed(2),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      phase: "idle",
      rows: [],
      currentRow: 0,
      currentMultiplier: 1,
      betAmount: 0,
      profit: 0,
      totalRows: TOTAL_ROWS,
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
    pickTile,
    cashout,
    resetGame,
  };
}

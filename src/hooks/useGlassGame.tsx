"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  GlassDifficulty,
  GameMode,
  GlassGameState,
  GlassBetResult,
  STEP_MULTIPLIERS,
  TOTAL_ROWS,
  TILES_PER_ROW,
} from "../interfaces/interface";
import { startGlassGame, pickGlassTile, cashoutGlass } from "../lib/api";
import { playGameAction } from "../lib/sound-player";
import { useUser } from "./useUserData";
import useIsLoggedIn from "./useIsLoggedIn";

function buildEmptyRows(difficulty: GlassDifficulty) {
  const tilesPerRow = TILES_PER_ROW[difficulty];
  return Array.from({ length: TOTAL_ROWS }, (_, rowIdx) => ({
    rowIndex: rowIdx,
    safeIndex: -1,
    revealed: false,
    tiles: Array.from({ length: tilesPerRow }, (__, tileIdx) => ({
      id: `row-${rowIdx}-tile-${tileIdx}`,
      rowIndex: rowIdx,
      tileIndex: tileIdx,
      isSafe: false,
      state: "hidden" as const,
    })),
  }));
}

function revealAllSafe(rows: GlassGameState["rows"], safeIndices: number[]) {
  return rows.map((r, ri) => ({
    ...r,
    revealed: true,
    safeIndex: safeIndices[ri],
    tiles: r.tiles.map((t, ti) => {
      if (ti === safeIndices[ri] && t.state === "hidden") return { ...t, isSafe: true, state: "safe" as const };
      return t;
    }),
  }));
}

export function useGlassGame() {
  const queryClient = useQueryClient();
  const { balance } = useUser();
  const isLoggedIn = useIsLoggedIn();

  const [gameMode, setGameMode] = useState<GameMode>("manual");
  const [betAmount, setBetAmount] = useState(1);
  const [difficulty, setDifficulty] = useState<GlassDifficulty>("easy");
  const [gameId, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const startGame = useCallback(async () => {
    if (!isLoggedIn) { setError("Please login to play"); return; }
    if (betAmount <= 0) { setError("Enter a valid bet amount"); return; }
    if (betAmount > balance) { setError("Insufficient balance"); return; }

    setIsLoading(true);
    setError(null);
    try {
      const res = await startGlassGame({ betAmount, difficulty });
      const { gameId: newGameId } = res.data;
      setGameId(newGameId);
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setGameState({
        phase: "playing",
        rows: buildEmptyRows(difficulty),
        currentRow: 0,
        currentMultiplier: 1,
        betAmount,
        profit: 0,
        totalRows: TOTAL_ROWS,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to start game");
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, betAmount, balance, difficulty, queryClient]);

  const pickTile = useCallback(
    async (rowIndex: number, tileIndex: number) => {
      if (!gameId) return;
      if (gameState.phase !== "playing") return;
      if (rowIndex !== gameState.currentRow) return;

      try {
        const res = await pickGlassTile({ gameId, rowIndex, tileIndex });
        const data = res.data;

        if (!data.isSafe) {
          setGameState((prev) => {
            const newRows = prev.rows.map((r, ri) => {
              if (ri === rowIndex) {
                return {
                  ...r,
                  revealed: true,
                  safeIndex: data.safeIndices[ri],
                  tiles: r.tiles.map((t, ti) => {
                    if (ti === tileIndex) return { ...t, state: "broken" as const };
                    if (ti === data.safeIndices[ri]) return { ...t, isSafe: true, state: "safe" as const };
                    return t;
                  }),
                };
              }
              if (ri > rowIndex) {
                return {
                  ...r,
                  revealed: true,
                  safeIndex: data.safeIndices[ri],
                  tiles: r.tiles.map((t, ti) =>
                    ti === data.safeIndices[ri] ? { ...t, isSafe: true, state: "safe" as const } : t,
                  ),
                };
              }
              return r;
            });
            return { ...prev, phase: "lost", rows: newRows, profit: -prev.betAmount };
          });
          setResults((res) => [
            ...res,
            { id: `${Date.now()}`, rowsCleared: rowIndex, multiplier: 0, payout: 0, betAmount, won: false },
          ]);
          queryClient.invalidateQueries({ queryKey: ["glass-history"] });
          queryClient.invalidateQueries({ queryKey: ["user-data"] });
          setGameId(null);
          return;
        }

        // Safe tile
        const mult = data.multiplier as number;

        if (data.autoWon) {
          // Cleared all rows
          setGameState((prev) => {
            const newRows = revealAllSafe(
              prev.rows.map((r, ri) => {
                if (ri === rowIndex) {
                  return {
                    ...r,
                    revealed: true,
                    tiles: r.tiles.map((t, ti) => {
                      if (ti === tileIndex) return { ...t, isSafe: true, state: "safe" as const };
                      return { ...t, state: "skipped" as const };
                    }),
                  };
                }
                return r;
              }),
              data.safeIndices,
            );
            return {
              ...prev,
              phase: "won",
              rows: newRows,
              currentRow: rowIndex + 1,
              currentMultiplier: mult,
              profit: +(betAmount * mult - betAmount).toFixed(2),
            };
          });
          setResults((r) => [
            ...r,
            { id: `${Date.now()}`, rowsCleared: TOTAL_ROWS, multiplier: mult, payout: data.payout, betAmount, won: true },
          ]);
          queryClient.invalidateQueries({ queryKey: ["glass-history"] });
          queryClient.invalidateQueries({ queryKey: ["user-data"] });
          setGameId(null);
          return;
        }

        // Safe, not last row — advance
        playGameAction(); // safe tile
        setGameState((prev) => {
          const newRows = prev.rows.map((r, ri) => {
            if (ri === rowIndex) {
              return {
                ...r,
                revealed: true,
                tiles: r.tiles.map((t, ti) => {
                  if (ti === tileIndex) return { ...t, isSafe: true, state: "safe" as const };
                  return { ...t, state: "skipped" as const };
                }),
              };
            }
            return r;
          });
          return {
            ...prev,
            rows: newRows,
            currentRow: rowIndex + 1,
            currentMultiplier: mult,
            profit: +(prev.betAmount * mult - prev.betAmount).toFixed(2),
          };
        });
      } catch (err: any) {
        setError(err?.message || "Failed to pick tile");
      }
    },
    [gameId, gameState.phase, gameState.currentRow, betAmount, queryClient],
  );

  const cashout = useCallback(async () => {
    if (!gameId || gameState.phase !== "playing" || gameState.currentRow === 0) return;

    setIsLoading(true);
    try {
      const res = await cashoutGlass({ gameId });
      const data = res.data;
      setGameState((prev) => {
        const newRows = revealAllSafe(prev.rows, data.safeIndices);
        return {
          ...prev,
          phase: "won",
          rows: newRows,
          currentMultiplier: data.multiplier,
          profit: +(data.payout - prev.betAmount).toFixed(2),
        };
      });
      setResults((r) => [
        ...r,
        {
          id: `${Date.now()}`,
          rowsCleared: gameState.currentRow,
          multiplier: data.multiplier,
          payout: data.payout,
          betAmount,
          won: true,
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ["glass-history"] });
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      setGameId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to cashout");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, gameState.phase, gameState.currentRow, betAmount, queryClient]);

  const resetGame = useCallback(() => {
    setGameId(null);
    setError(null);
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
    isLoading,
    error,
    startGame,
    pickTile,
    cashout,
    resetGame,
  };
}

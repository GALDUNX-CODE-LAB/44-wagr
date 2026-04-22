"use client";

import { useEffect, useRef } from "react";
import { useGlassGame } from "../../../hooks/useGlassGame";
import GlassBridge from "./glass-bridge";
import GlassControls from "./glass-control";
import { TILES_PER_ROW } from "../../../interfaces/interface";

export default function GlassGame() {
  const {
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
  } = useGlassGame();

  const pickTileRef = useRef(pickTile);
  pickTileRef.current = pickTile;

  useEffect(() => {
    if (gameMode !== "auto" || gameState.phase !== "playing") return;
    const row = gameState.currentRow;
    const n = TILES_PER_ROW[difficulty];
    const delay = 480;
    const id = window.setTimeout(() => {
      const pick = Math.floor(Math.random() * n);
      pickTileRef.current(row, pick);
    }, delay);
    return () => window.clearTimeout(id);
  }, [gameMode, gameState.phase, gameState.currentRow, difficulty]);

  const handleBet = () => {
    if (gameState.phase === "won" || gameState.phase === "lost") {
      resetGame();
      setTimeout(startGame, 60);
    } else {
      startGame();
    }
  };

  const boardLocked = gameMode === "auto" && gameState.phase === "playing";

  return (
    <div
      className="flex flex-col-reverse md:flex-row w-full max-w-[1600px] mt-4 md:mt-10 mx-auto min-h-0 overflow-hidden rounded-2xl border border-white/10 font-sans h-[calc(100svh-5.5rem)] max-h-[calc(100svh-4rem)] md:h-[min(520px,calc(100svh-7.5rem))] md:max-h-[min(520px,calc(100svh-7.5rem))]"
      style={{ background: "#131212" }}
    >
      {/* Sidebar */}
      <div className="flex flex-col flex-1 min-h-0 md:flex-none md:h-full md:min-h-0 h-auto max-h-[52svh] md:max-h-none overflow-hidden w-full md:w-[220px] lg:w-[240px] border-t border-[rgba(200,162,255,0.12)] md:border-t-0 md:border-r md:border-r-[rgba(200,162,255,0.12)] pt-2 md:pt-0">
        <GlassControls
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          betAmount={betAmount}
          onBetAmountChange={setBetAmount}
          difficulty={difficulty}
          onDifficultyChange={(d) => {
            setDifficulty(d);
            resetGame();
          }}
          autoPicking={boardLocked}
          phase={gameState.phase}
          currentRow={gameState.currentRow}
          currentMultiplier={gameState.currentMultiplier}
          profit={gameState.profit}
          betAmountUsed={gameState.betAmount}
          onBet={handleBet}
          onCashout={cashout}
          results={results}
        />
      </div>

      {/* Board */}
      <div className="flex-shrink-0 min-h-[min(42svh,320px)] h-[min(48svh,360px)] md:h-full md:max-h-none md:flex-1 md:min-h-0 min-w-0 relative overflow-hidden bg-[#1c1c1c]">
        <GlassBridge
          gameState={gameState}
          difficulty={difficulty}
          onPickTile={pickTile}
          boardLocked={boardLocked}
        />
      </div>
    </div>
  );
}
